# Design

## Context

Après `migration-hebergement` :
- le site est servi par Cloudflare sous `<domaine>`, sans build ;
- les données de la ligue viennent toujours de l'API Apps Script (`GET`, CORS ouvert), dont la table `licencies` donne `Numéro club`, `Licence`, `nom`, `prenom` pour les clubs du comité, et pour les joueurs d'autres clubs déclarés dans une composition ;
- `creneaux.html` et `report.html` calculent l'occupation dans le navigateur, avec `GRID`, `LIEU_VARIANTS`, `matchesTrinquetParis()` et la règle des reports (nouvelle date, heure d'origine) ;
- aucune page n'écrit nulle part ailleurs que dans `localStorage`.

Ce changement ajoute le premier serveur du projet. Contraintes à tenir :
- pages autonomes, sans build ni dépendance ;
- pas de fenêtre surgissante ;
- dépôt public : aucun secret, aucune donnée réelle dans les tests ;
- RGPD : e-mail et rattachement à une licence sont des données personnelles nouvelles.

## Goals / Non-Goals

**Goals :**
- Réserver un créneau libre en moins d'une minute la première fois (lien e-mail compris), en trois touchers ensuite.
- Faire respecter les règles par le serveur, jamais par la seule page.
- Ne jamais laisser une réservation bloquer une partie de championnat.
- Mesurer l'usage (réservations, liens envoyés et utilisés), sans traceur dans les pages.

**Non-Goals :**
- Paiement, liste d'attente, invitation de partenaires, autres trinquets, créneaux hors grille.
- Synchroniser les préférences (équipes suivies…) avec le compte.
- Écrire quoi que ce soit sur le site de la ligue.
- Remplacer le « mode organisateur » d'affichage des pages Équipes et Parties.

## Decisions

### 1. Architecture

```
Navigateur (pages statiques)
  ├── GET  API Apps Script ───────────────► données de la ligue (inchangé)
  └── fetch /api/* (même origine, cookie) ─► Worker
                                              ├── D1 (UE) : comptes, jetons, sessions, réservations
                                              ├── GET API Apps Script (licenciés, rencontres du Trinquet Paris, cache 5 min)
                                              └── API d'envoi d'e-mails
Tâche planifiée (toutes les heures) ─────────► Worker : priorité du championnat, purges
```

Le code serveur est dans `serveur/` :
- des modules JavaScript sans dépendance à l'exécution (`fetch`, `crypto.subtle`, D1) ;
- un fichier par sujet : `connexion`, `reservations`, `championnat`, `emails`, `purge` ;
- un module `regles.js` qui porte `GRID`, la fenêtre de 14 jours et le quota, seuls endroits où ces règles sont écrites côté serveur.

L'outil de développement de l'hébergeur entre en dépendance de développement, pour la base locale et les tests.

### 2. Données (D1)

```
comptes      (id, email UNIQUE, licence UNIQUE, nom, prenom, club, organisateur BOOL, cree_le, vu_le)
jetons       (empreinte PK, email, licence, nom, creneau_vise, expire_le, utilise_le)
sessions     (empreinte PK, compte_id, expire_le)
reservations (id, compte_id NULL, date, heure, statut, cree_le, annulee_le, annulee_par, motif)
             UNIQUE (date, heure) WHERE statut = 'active'
compteurs    (jour, liens_envoyes, liens_utilises, reservations, annulations_championnat)
```

- **Unicité d'un créneau** : l'index unique partiel règle la course de deux réservations simultanées sans verrou.
- **Quota** : vérifié dans la même transaction que l'insertion.
- **Jetons et sessions** : seule leur empreinte SHA-256 est gardée. Une fuite de la base ne donne ni lien ni session utilisable.
- **Statut** : `active`, `annulee_joueur`, `annulee_championnat`, `annulee_orga`.
- **Suppression d'un compte** : `compte_id` est mis à `NULL` sur les réservations passées.
- **Heures** : `date` (AAAA-MM-JJ) et `heure` (entier) en heure de Paris, comme la grille ; les instants se calculent avec `Intl` en `Europe/Paris`.

### 3. Connexion par lien e-mail rattaché à la licence

1. `POST /api/connexion` `{email, licence, nom, creneau_vise}`.
   - Le serveur normalise : zéros de tête, casse, accents.
   - Il vérifie licence + nom dans `licencies`, et le club dans la ligue.
   - Il vérifie qu'aucun autre e-mail n'a cette licence, ni aucune autre licence cet e-mail.
   - Si tout va, il crée un jeton aléatoire de 32 octets, valable 15 minutes, et envoie le lien `https://<domaine>/connexion.html#jeton=…`.
   - Il répond **toujours** `202` avec le même corps, pour ne rien dire de l'existence d'une licence.
2. **Le jeton est dans l'ancre**. Les logiciels qui ouvrent les liens d'un e-mail pour les analyser font un `GET` de la page, sans exécuter son JavaScript, et l'ancre n'est jamais envoyée au serveur : le jeton n'est donc pas consommé. `connexion.html` lit l'ancre, l'efface, puis fait `POST /api/session {jeton}`. Le serveur marque le jeton utilisé, crée ou retrouve le compte, ouvre la session et renvoie vers `creneaux.html`, en dépliant le créneau visé.
3. **Session** : cookie `__Host-session`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`. Valable 30 jours glissants, renouvelé au plus une fois par jour.

*Écarté* :
- un code à 6 chiffres à recopier : moins de friction sur un même appareil, mais plus de friction pour qui lit ses e-mails sur un autre appareil, et un code se devine plus vite qu'un jeton ;
- un mot de passe : à oublier, à réinitialiser, à protéger ;
- la connexion Google ou Apple : une dépendance de plus, et tout le monde n'en a pas.

**Limite connue** : licence + nom n'est pas une preuve forte. Quelqu'un qui connaît les deux peut rattacher la licence d'un autre à son e-mail, le premier. Parades :
- un organisateur peut défaire un rattachement ;
- le vrai titulaire découvre le problème à sa première demande (« rien reçu ? licence déjà rattachée → organisateur ») ;
- l'enjeu est faible : une réservation d'une heure.

Voir la question ouverte 1 pour la version forte.

### 4. Règles de réservation, côté serveur

`POST /api/reservations` `{date, heure}`, avec session. Dans l'ordre :
1. Le créneau est dans `GRID`, commence après maintenant et au plus tard dans 14 jours.
2. Aucune partie de championnat n'y est programmée. Le serveur interroge `rencontres` pour les `LIEU_VARIANTS` du Trinquet Paris, avec la même règle des reports que les pages, en cache 5 minutes. **Si l'API de la ligue ne répond pas, la réservation est refusée** (« réessayez dans quelques minutes ») plutôt que prise à l'aveugle.
3. Une transaction vérifie le quota (aucune réservation `active` à venir du compte) et insère. L'index unique tranche entre deux réservations simultanées.
4. L'e-mail de confirmation part ensuite. S'il échoue, la réservation reste, et la page l'affiche dans « Mes réservations ».

`DELETE /api/reservations/:id` : l'auteur, avant le début ; un organisateur, à tout moment, avec un motif obligatoire.

`GET /api/reservations?du=…&au=…`, public, pour la grille :
- `[{date, heure, a_moi}]` pour un visiteur ou un joueur ;
- avec en plus `prenom`, `nom` et `cree_le` pour un organisateur.

L'appel ne renvoie jamais d'e-mail ni de licence.

### 5. Priorité du championnat : tâche horaire

Toutes les heures, et à chaque `GET /api/reservations` dont le cache des rencontres a expiré, le serveur compare les réservations `active` à venir aux parties de championnat du Trinquet Paris. Une collision passe la réservation en `annulee_championnat` et envoie l'e-mail. La synchro Apps Script avec la ligue est elle-même périodique : la spec promet l'annulation « dans l'heure qui suit la publication par la ligue », pas l'heure qui suit la décision de la ligue.

La page Créneaux, de son côté, affiche la partie et pas la réservation dès qu'elle voit la collision, sans attendre la tâche.

### 6. Pages

- **`creneaux.html`** :
  - un second appel, `GET /api/reservations`, en parallèle de l'API de la ligue, non mis en cache dans `localStorage` (il change à chaque réservation) ;
  - le dépli d'une case libre gagne « Réserver ce créneau », ou le formulaire de connexion dans le dépli quand le visiteur n'est pas connecté ;
  - le bloc « Mes réservations » vient de `GET /api/moi` ;
  - tout le reste de la page est inchangé.
- **`connexion.html`** : une page courte, hors barre d'onglets, qui ne sert qu'à recevoir le lien. Elle affiche « Connexion… », puis renvoie vers Créneaux, ou affiche un message pour un lien expiré ou déjà utilisé.
- **`report.html`** : un appel `GET /api/reservations` pour la mention « réservé hors championnat » ; en cas d'échec, la page reste telle qu'aujourd'hui.
- **Couleurs** : un état « réservé » distinct de « occupé » demande une variable `--reserve` (et son fond), avec sa valeur sombre dans les deux blocs (spec `apparence`).
- **Clés `localStorage`** : aucune nouvelle. Rien de la connexion n'y est écrit.

### 7. Sécurité

- **CSRF** : `SameSite=Lax` ; toute requête qui modifie exige `Content-Type: application/json` et un en-tête `Origin` égal au domaine (sinon `403`).
- **CSP**, ajoutée sur tout le site :
  - `default-src 'self'` ;
  - `script-src 'self' 'unsafe-inline'`, imposé par les scripts inline des pages ;
  - `connect-src 'self'` et les domaines de l'API Apps Script ;
  - `img-src 'self' data: blob:` ;
  - `frame-ancestors 'none'`.

  Les hachages des scripts inline remplaceraient `unsafe-inline`, mais devraient être recalculés à chaque changement de page : une étape de build déguisée, écartée.
- **XSS** : les données de la ligue et les noms sont déjà insérés par `textContent` ; à vérifier dans `/security-review` pour les nouveaux blocs.
- **Limites de débit** (dans D1, par fenêtre glissante) :
  - 5 demandes de lien par e-mail et par heure ;
  - 20 par adresse IP et par heure ;
  - 10 réservations ou annulations par compte et par jour.
- **Secrets** : clé de l'API d'envoi d'e-mails dans les secrets de l'hébergeur, jamais dans le dépôt ; SPF, DKIM et DMARC sur le domaine.
- **Journaux** : ni e-mail ni jeton dans les journaux ; un identifiant de compte suffit.

### 8. E-mails

Fournisseur transactionnel européen : **Brevo**, société française, offre gratuite de 300 e-mails par jour, largement au-dessus du besoin. L'appel passe par `fetch` vers son API, ce qui le rend remplaçable. Quatre modèles texte, en français, sans image ni pixel de suivi :
- lien de connexion ;
- réservation confirmée ;
- réservation annulée (championnat, ou organisateur avec motif) ;
- compte supprimé.

### 9. RGPD

- **Responsable de traitement** : la ligue. **Finalité** : gérer la réservation des créneaux de la ligue par ses licenciés. **Base légale** : intérêt légitime de la ligue, à confirmer par la ligue (question ouverte 3).
- **Données** : e-mail, licence, nom, prénom, club (repris de la ligue), réservations. Rien d'autre.
- **Durées** : réservations 12 mois après leur créneau ; comptes 24 mois après la dernière connexion ; jetons et sessions expirés purgés chaque nuit.
- **Information** : une note courte sous le formulaire de connexion, et une section « Réservations » dans la note « Données personnelles » liée en pied de page.
- **Droits** : suppression du compte en libre-service ; accès et rectification par un organisateur.
- **Sous-traitants** : Cloudflare (D1 en juridiction UE) et Brevo, à inscrire au registre de la ligue.

### 10. Tests

- **Pages** (Playwright, comme aujourd'hui) : `/api/*` est simulé par `page.route`, comme l'API Apps Script. Scénarios des specs `creneaux` et `reservation-creneaux` vus de la page :
  - réserver non connecté, puis connecté ;
  - quota ;
  - case prise entre-temps ;
  - annulation ;
  - vue d'un autre joueur, vue d'un organisateur ;
  - bandeau « Réservations indisponibles » ;
  - mention dans Report ;
  - `connexion.html` (jeton effacé de l'ancre, lien expiré).
- **Serveur** (`node --test`, avec la base locale de l'outil de l'hébergeur et un faux serveur d'e-mails et d'API de la ligue) : chaque exigence de `compte-joueur` et de `reservation-creneaux`, dont :
  - la course de deux réservations ;
  - la réponse identique d'une demande de lien ;
  - le refus quand l'API de la ligue ne répond pas ;
  - la tâche horaire ;
  - les purges.
- **Cohérence** : `GRID` identique dans `creneaux.html`, `report.html` et `serveur/regles.js`.
- La CI lance les deux suites. Données fictives seulement (clubs et licences inventés).

## Risks / Trade-offs

- **[La ligue ou le Trinquet Paris n'ouvrent pas les créneaux]** → décision 1 du proposal, préalable à tout code.
- **[Licence rattachée par un tiers]** → limite connue (décision 3) ; organisateur et version forte en question ouverte 1.
- **[Réservation acceptée sur un créneau que la ligue vient de prendre]** → le serveur lit la ligue à 5 minutes près, la ligue publie avec le délai de sa synchro. La réservation est annulée et l'auteur prévenu ; c'est le sens de « championnat prioritaire ».
- **[E-mail en courrier indésirable]** → SPF, DKIM et DMARC, expéditeur au domaine de la ligue, texte simple ; la page dit où chercher.
- **[Premier code serveur d'un projet sans build]** → un dossier, sans dépendance à l'exécution, couvert par ses propres tests, avec `/security-review` obligatoire sur tout changement de `serveur/` (CLAUDE.md).
- **[Coût]** → 0 € au volume prévu ; au-delà des offres gratuites, quelques euros par mois.

## Migration Plan

1. Accord de la ligue (proposal, décisions 1 à 5).
2. Base, serveur et tests livrés **sans que les pages appellent `/api/`** ; essai du parcours complet sur une prévisualisation, avec des comptes d'organisateurs.
3. **Ouverture aux organisateurs seuls** pendant deux semaines. Le bouton « Réserver » n'apparaît qu'aux comptes organisateurs, réglage serveur.
4. **Ouverture à tous**, annoncée par la communication « Perso » de la page Équipes.
5. **Point à deux mois** sur les hypothèses du proposal.

Retour arrière : le réglage serveur masque le bouton « Réserver » pour tous. Les réservations en cours restent visibles et annulables.

## Open Questions

1. **L'e-mail des licenciés est-il connu de la ligue ?** Si le scraper peut le lire, le serveur enverrait le lien à l'e-mail de la ligue pour la licence saisie, sans demander d'e-mail ni de nom. La preuve serait forte et le formulaire plus court. Cela demande d'exposer cet e-mail au serveur seul, jamais à l'API publique, et l'accord de la ligue.
2. **Accès à la salle** : le Trinquet Paris doit-il recevoir la liste des réservations, et sous quelle forme (e-mail quotidien, page organisateur) ?
3. **Base légale et note d'information** : à valider par la ligue, idéalement avec son référent RGPD.
4. **Fenêtre et quota** : 14 jours et une réservation, à ajuster après le point à deux mois.
