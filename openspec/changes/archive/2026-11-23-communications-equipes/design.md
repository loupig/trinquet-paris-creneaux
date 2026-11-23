# Design

## Context

Depuis `page-equipes-liste`, `equipe.html` fait ceci :
- `renderListe()` calcule `messagePhasesFinales(...)` et le texte obtenu va à deux endroits :
  - au bloc `buildMessageEquipes` (bouton « Message aux équipes » qui déplie un aperçu `<pre>` et Partager/Copier, état `messageOuvert`) ;
  - à chaque ligne, par `buildLigneEquipe(..., message)` → `buildActions(team, court, message)`, qui pose l'avion en papier (`lienWhatsappAvecTexte`, `api.whatsapp.com/send`).
- La navigation entre la liste et une équipe passe par `afficherSelonAdresse`, `ouvrirEquipe`, `revenirALaListe` et `mettreAJourAdresse`, qui écrivent l'adresse sans autre paramètre que `equipe`.
- La page a déjà ce qu'il faut pour remplir les balises :
  - `prochainePartie(team, today)`, et la fiche de l'adversaire via `etat.index[teamKey(...)]` ;
  - `team.contact` (responsable, téléphone), `telLisible`, `joueursDuMessage`, `nomCourt`, `clubLabel` ;
  - `pouleDe` et `rangEnClair`, `lienDuSite`, `avisEnCours` ;
  - `boutonPartager`.
- `programme.html` a `prenomDuResponsable(raw)`, qui isole le prénom d'un responsable saisi librement.

Contraintes : page autonome, pas de fenêtre surgissante, numéro de responsable jamais écrit dans la page, clé `localStorage` en `lidfpb_…_v1`, champ de saisie en 16 px (un test l'exige, sinon iOS zoome).

## Goals / Non-Goals

**Goals :**
- Un seul moteur de balises, qui sert aussi à « Prochaine partie » : le modèle est écrit avec les balises, ce qui fait de ce message intégré le premier utilisateur du moteur.
- L'avion en papier toujours juste : changer de communication ou taper dans « Perso » met à jour les liens sans redessiner la liste, donc sans perdre le curseur ni les lignes dépliées.
- Aucun numéro entier dans la page.

**Non-Goals :**
- Réécrire « Phases finales » avec des balises. Son texte, ses en-têtes par phase et par jour et ses tests restent tels quels. Elle fournit seulement la balise `{phases finales}`.
- Plusieurs textes perso, un partage de modèle, des communications par partie.
- Toucher « Prévenir l'équipe » ou Parties.

## Decisions

### 1. Le mode organisateur, porté par l'adresse

`var ORGA = new URLSearchParams(location.search).has("orga")`, lu une fois au chargement.

Une fonction `adresse(cle)` construit toutes les adresses de la page : `equipe.html`, avec `?equipe=…` s'il y a une équipe et `orga` si le mode est actif (`?orga` ou `?equipe=…&orga`). Elle sert à :
- `mettreAJourAdresse`, `ouvrirEquipe` et `revenirALaListe` ;
- le `href` de « Voir l'équipe → » et de « ← Toutes les équipes ».

`equipeDansLAdresse` ne change pas.

*Écarté* : garder le mode sur l'appareil (`localStorage`). C'est plus pratique depuis l'application installée, mais un joueur qui ouvrirait une fois l'adresse resterait organisateur. On y reviendra si le favori ne suffit pas (hypothèse 2 de la proposition).

### 2. Les communications, un petit registre

```js
var COMMUNICATIONS = [
  { id: "finales",  nom: "Phases finales",   ... },
  { id: "prochaine", nom: "Prochaine partie", ... },
  { id: "perso",    nom: "Perso",            ... }
];
```

Chaque communication a deux fonctions :
- `concerne(team, ctx)` dit si une équipe la reçoit ;
- `texte(team, ctx)` donne le message rempli.

`ctx` est calculé une fois par rendu : `aujourdHui`, le résultat de `messagePhasesFinales` et le lien du site.

| id | proposée si | concerne | texte |
|---|---|---|---|
| `finales` | `messagePhasesFinales` ≠ null | toute équipe | le message actuel, identique pour toutes |
| `prochaine` | au moins une équipe a une partie à venir | équipe avec `prochainePartie` | `remplir(MODELE_PROCHAINE_PARTIE, valeurs(team))` |
| `perso` | toujours | toute équipe | `remplir(textePerso, valeurs(team))` |

La communication choisie vit dans une variable en mémoire, `communicationChoisie`. Si elle n'est plus proposée (rafraîchissement), on retombe sur le choix par défaut.

Ajouter « Fin de poule » plus tard, c'est ajouter une entrée au registre.

### 3. Le moteur de balises

`valeurs(team)` construit un objet `{ "responsable": …, "equipe": …, … }` pour l'équipe :
- `responsable` : `prenomDuResponsable(team.contact.responsable)`, recopiée de Parties à l'identique, avec un test qui compare les deux sources ;
- `equipe` : `nomCourt`. `equipe officielle` : `clubLabel`. `serie`, `poule` ;
- `rang` : `rangEnClair(pouleDe(...))` ;
- `joueurs` : `joueursDuMessage(team.roster)` ;
- `date` et `heure` de `prochainePartie`, la date en long (« jeudi 26 novembre »). `lieu` : `lieuMessage`. `adversaire` : nom court ;
- `joueurs adversaire`, `responsable adversaire` (nom tel que saisi à la ligue) et `tel adversaire` (`telLisible`) ;
- `lien site` : `lienDuSite()`. `lien questionnaire` : `AVIS.url` si `avisEnCours`, sinon vide ;
- `phases finales` : les parties du message des phases finales. `messagePhasesFinales` renvoie en plus un champ `parties`, les lignes entre l'en-tête de la première phase et la ligne `📍` comprise.

`remplir(texte, valeurs)` fonctionne ainsi :
- **Nom de la balise** : mis en minuscules, sans accents (NFD) et avec des espaces simples. `{Équipe}` vaut donc `{equipe}`.
- **Ligne par ligne** : une ligne dont une balise connue est vide disparaît. Une balise inconnue reste écrite telle quelle, et `balisesInconnues(texte)` la signale sous le champ.
- **Fin** : `\n{3,}` devient `\n\n`, puis le texte est rogné.

`MODELE_PROCHAINE_PARTIE` :

```
Bonjour {responsable},

Prochaine partie de *{equipe}* ({serie}) :
*{date} à {heure}*
Contre {adversaire}
Joueurs : {joueurs adversaire}
📍 {lieu}
Responsable de {adversaire} : {responsable adversaire}, {tel adversaire}

Bon match ! 💪
```

Le texte d'exemple de « Perso » part du même modèle, avec en plus une ligne `{lien site}`. Il est montré tant que l'organisateur n'a rien écrit, et rétabli par le bouton.

### 4. Le bloc, sans fenêtre

Le bloc est une `section` intitulée « Communication aux équipes », qui contient dans l'ordre :
1. **Pastilles** : des `button aria-pressed`, une par communication proposée.
2. **Une note** : à qui elle s'adresse (« 21 équipes ont une partie à venir »).
3. **Le bouton « Message aux équipes »** (`aria-expanded`, état `messageOuvert` gardé comme aujourd'hui). Il déplie :
   - pour « Perso » seulement, le champ `textarea` en 16 px avec les boutons de balises (`setRangeText` au curseur), la ligne « Balise inconnue : … » et « Rétablir l'exemple » ;
   - un `select` « Aperçu pour » avec les équipes concernées, par nom court, l'équipe suivie d'abord ;
   - l'aperçu `<pre>` ;
   - Partager/Copier (`boutonPartager`, qui partage le texte de l'équipe de l'aperçu, en entier).

Le nom du bouton « Message aux équipes » est gardé, pour que les scénarios existants restent vrais.

Changer de pastille redessine seulement le bloc et met à jour les liens d'envoi (décision 5). Taper dans le champ met à jour l'aperçu, les liens et `localStorage`, mais ne redessine rien d'autre : le curseur ne bouge pas.

### 5. Les liens d'envoi, tenus à jour sans redessiner

`buildActions` pose les icônes WhatsApp et SMS comme aujourd'hui. En mode organisateur, il pose aussi un `a.contact-message`, toujours créé puis montré ou caché, et l'inscrit dans un registre `envois = [{ a, team, court }]`.

`majEnvois()` parcourt le registre. Pour chaque lien :
- si la communication choisie concerne l'équipe, il donne au lien son `href` (`lienWhatsappAvecTexte(numero, texte(team))`), son `aria-label` et son `title` (« Envoyer « Prochaine partie » au responsable de PEP 2 »), et le montre ;
- sinon, il le cache (`hidden`).

`majEnvois()` est appelée après chaque rendu de la liste, à chaque changement de pastille et à chaque frappe dans « Perso », avec un délai de 150 ms pour les frappes.

### 6. Le numéro masqué dans l'aperçu

L'aperçu remplit le texte avec un jeu de valeurs dont `tel adversaire` est masqué : `masquerTel("06 12 34 56 78")` donne `06 •• •• •• 78`. Le texte partagé et les liens d'envoi utilisent les valeurs entières.

On masque par la valeur, pas par une expression régulière sur le texte rendu : c'est plus sûr, et un numéro que l'organisateur tape lui-même dans « Perso » reste le sien.

### 7. Le texte perso sur l'appareil

Il est lu au chargement dans `lidfpb_message_perso_v1`, puis écrit à chaque frappe. Lecture et écriture sont dans un `try/catch` : sans stockage, la page fonctionne pour la visite. « Rétablir l'exemple » efface la clé. La clé entre dans le tableau du README.

### 8. Les tests

- **Les scénarios « Équipes : message des phases finales »** ouvrent `equipe.html?orga`. Un scénario nouveau vérifie qu'ils n'ont rien sans `orga`.
- **« Prochaine partie »** se teste sur les données fictives ordinaires : Charlie 1 reçoit Foxtrot 1 à 19h30 dans quelques jours (`tests/donnees.mjs`). Le scénario vérifie :
  - le texte rempli ;
  - l'icône absente pour une équipe sans partie à venir ;
  - le lien `api.whatsapp.com` ;
  - `06 •• •• •• 05` dans l'aperçu et aucun `0600000105` dans la page.
- **« Perso »** :
  - on tape un texte qui contient `{capitaine}`, `{adversaire}` et une ligne `{date}` ;
  - on recharge la page, le texte est toujours là ;
  - « Rétablir l'exemple » le remplace ;
  - le stockage indisponible ne bloque rien.
- **`orga` reste dans l'adresse** de la liste à une équipe, et retour.
- **`prenomDuResponsable`** est identique dans Parties et sur la page Équipes.

## Risks / Trade-offs

- **N'importe qui peut taper `?orga`.** → Ce mode n'ouvre aucun accès nouveau : les numéros sont déjà dans les liens WhatsApp de chaque ligne, et rien n'est envoyé sans WhatsApp. Ça reste écrit comme « pas une protection » dans la proposition et le README.
- **Un texte perso abîmé par une balise mal tapée.** → La balise inconnue est signalée sous le champ et laissée telle quelle. L'organisateur la voit dans l'aperçu avant d'envoyer.
- **« Ligne vide, ligne supprimée » peut couper plus que voulu** (une phrase avec `{joueurs adversaire}` disparaît si l'adversaire n'a pas déclaré sa composition). → La règle est simple et visible dans l'aperçu. Le modèle intégré met les éléments facultatifs sur leur propre ligne.
- **Les noms de responsables dans un message de groupe.** → C'est déjà le cas dans Parties. L'exception de la spec `donnees-api` le dit maintenant pour ces communications.
- **Plus de code dans une page déjà longue** (`equipe.html` dépasse 2 800 lignes). → Le registre et le moteur restent de petites fonctions pures. On regardera un découpage si « Fin de poule » et « Début de championnat » l'alourdissent encore.
