# Tasks

Vérification par `npm test` (syntaxe, pages dans Chromium avec `/api/*` simulé), par les tests du serveur (`node --test` sur base locale), par des captures sur Pixel 7 en clair et en sombre, et par le parcours complet sur une prévisualisation avant l'ouverture.

## 0. Préalables (bloquant)

- [ ] 0.1 `migration-hebergement` en production.
- [ ] 0.2 Décisions 1 à 5 du proposal prises par la ligue, notées dans la PR.
- [ ] 0.3 Compte Brevo de la ligue, domaine authentifié (SPF, DKIM, DMARC), clé dans les secrets de l'hébergeur.

## 1. Serveur : scénarios d'abord

- [ ] 1.1 `serveur/` : base locale, faux serveur d'e-mails, fausse API de la ligue (licences et clubs inventés), aide de test pour les sessions.
- [ ] 1.2 Tests `compte-joueur` :
  - demande de lien (licencié reconnu, autre club, informations fausses, réponse identique) ;
  - lien (15 minutes, usage unique, un simple `GET` ne le consomme pas) ;
  - rattachement unique ;
  - session de 30 jours, cookie `__Host-` ;
  - déconnexion, suppression du compte ;
  - rôle organisateur.
- [ ] 1.3 Tests `reservation-creneaux` :
  - créneau réservable (grille, maintenant, 14 jours, championnat, autre réservation) ;
  - course de deux réservations ;
  - quota ;
  - annulation par le joueur (jusqu'à l'heure) et par un organisateur de championnat (motif, jusqu'à 24 heures avant, refusée après) ;
  - refus quand l'API de la ligue ne répond pas ;
  - tâche horaire de priorité du championnat, y compris pour une partie enregistrée par la ligue à moins de 24 heures ;
  - e-mails ;
  - purges à 12 et 24 mois.
- [ ] 1.4 Tests de sécurité : CSRF (`Origin`, `Content-Type`), limites de débit, aucun e-mail ni licence dans `GET /api/reservations`, empreintes seules en base.

## 2. Serveur : code

- [ ] 2.1 Schéma D1 et migrations (design, décision 2).
- [ ] 2.2 `regles.js` (`GRID`, 14 jours, quota), `championnat.js` (rencontres du Trinquet Paris, reports, cache 5 minutes).
- [ ] 2.3 `connexion.js` : `/api/connexion`, `/api/session`, `/api/moi`, déconnexion, suppression.
- [ ] 2.4 `reservations.js` : `GET`, `POST`, `DELETE`, et le réglage d'ouverture (aucun, organisateurs, tous).
- [ ] 2.5 `emails.js` : les quatre modèles.
- [ ] 2.6 Tâche horaire et purges nocturnes, compteurs d'usage.
- [ ] 2.7 En-têtes : CSP du site (design, décision 7).

## 3. Pages : scénarios d'abord

- [ ] 3.1 Dans `tests/pages.spec.mjs`, simulation de `/api/*` (visiteur, joueur, joueur avec réservation, organisateur, indisponible).
- [ ] 3.2 Créneaux :
  - cases réservées (trois vues : visiteur, auteur, organisateur) ; bouton d'annulation de l'organisateur absent à moins de 24 heures ;
  - « Réserver ce créneau » non connecté (formulaire dans le dépli) et connecté ;
  - au-delà de 14 jours ;
  - quota ;
  - case prise entre-temps ;
  - « Mes réservations » (annuler, se déconnecter, supprimer) ;
  - bandeau « Réservations indisponibles » ;
  - en-tête mis à jour.
- [ ] 3.3 Report : mention « réservé hors championnat », sans nom ; page inchangée si `/api/` échoue.
- [ ] 3.4 `connexion.html` : jeton effacé de l'ancre, renvoi au créneau visé, lien expiré ou déjà utilisé.
- [ ] 3.5 Cohérence : `GRID` identique dans les deux pages et `serveur/regles.js` ; palette sombre avec `--reserve`.

## 4. Pages : code

- [ ] 4.1 `creneaux.html` : appel des réservations, états des cases, dépli avec réservation et connexion, « Mes réservations », textes d'en-tête.
- [ ] 4.2 `connexion.html`, aux couleurs et à la police du site, hors barre d'onglets.
- [ ] 4.3 `report.html` : mention des réservations.
- [ ] 4.4 Variable `--reserve` et son fond, en clair et dans les deux blocs sombres.
- [ ] 4.5 `Version AAAA.MM.JJ` des pages modifiées.

## 5. Docs

- [ ] 5.1 README :
  - pages (`connexion.html`) ;
  - « Serveur » (dossier, base, e-mails, tâche horaire, réglages hors dépôt, secrets) ;
  - RGPD (section Réservations) ;
  - « Choix assumés » : « Pas de compte » devient « Compte seulement pour réserver ».
- [ ] 5.2 CLAUDE.md : non-objectifs mis à jour ; `/security-review` obligatoire sur tout changement de `serveur/` ; tests du serveur dans « Vérifier avant de dire fini ».
- [ ] 5.3 Note « Données personnelles » : section Réservations, validée par la ligue.

## 6. Revue et ouverture

- [ ] 6.1 `/code-review` et `/security-review` sur le diff.
- [ ] 6.2 Parcours complet sur une prévisualisation : demande de lien, e-mail reçu (vraie boîte), réservation, annulation, collision simulée avec une partie.
- [ ] 6.3 Ouverture aux organisateurs pendant deux semaines (design, plan de migration, étape 3).
- [ ] 6.4 Ouverture à tous, annonce aux équipes.
- [ ] 6.5 Point à deux mois sur les quatre hypothèses du proposal, avec les compteurs du serveur.
