# Design

## Context

- `equipes.html` contient déjà presque tout ce que la page doit montrer pour une équipe :
  - `fetchLiveData()` charge `rencontres`, `clubs`, `engagements` et `licencies`, et laisse échouer les deux derniers sans bloquer ;
  - `buildTeams()` construit, pour chaque équipe, ses parties triées, son bilan et sa composition (`getRoster()`, noms seuls) ;
  - `buildMatchRow()` affiche une partie, avec le bouton de report via `canReport()`.
- `classement.html` contient le calcul du classement (`buildStandings()`, `trierClassement()`) et sa présentation (`buildRankRow()`, trait des qualifiés après `QUALIFIES_PAR_POULE`). Le calcul est déjà recopié à l'identique dans `index.html`, avec un commentaire qui l'exige.
- Toutes les pages partagent le même cache API (`lidfpb_api_v1:` + URL) dans le même `localStorage`. Une page qui construit les mêmes URL qu'une autre profite donc de son cache.
- L'identité d'une équipe est la même partout : `spécialité|catégorie|club|numéro`. C'est `teamKey()` dans `equipes.html` et `cleEquipe()` dans `index.html`, avec la liste suivie sous `lidfpb_mes_equipes_v1`. Le classement ajoute la poule à sa propre clé.
- Le plancher de latence d'un appel Apps Script est d'environ 2,2 s. On ne peut le réduire que par le cache et les appels en parallèle.

## Goals / Non-Goals

**Goals:**
- Un seul chargement de données par visite. Changer d'équipe recalcule l'affichage à partir des données en mémoire.
- Le même rang et la même table que la page Classement, au chiffre près.
- Réutiliser telles quelles les URL d'API de `equipes.html`, pour partager son cache.

**Non-Goals:**
- Pas de factorisation des copies de code entre pages dans un fichier JS commun. Le projet reste composé de pages autonomes, et ce choix dépasse ce change.
- Pas d'historique de navigation entre équipes : le bouton Retour du navigateur ne revient pas à l'équipe précédente.

## Decisions

**1. Nouvelle page autonome `equipe.html`, construite à partir de `equipes.html`.**
On reprend son chargement de données (mêmes URL, même cache, même affichage d'abord depuis le cache puis rafraîchissement), `buildTeams()`, `getRoster()` et `buildMatchRow()`. Alternative écartée : un mode « une équipe » dans `equipes.html`. Il aurait mélangé deux pages aux filtres différents, et l'onglet Parties serait devenu ambigu.

**2. Troisième copie du calcul de classement, signalée dans les trois fichiers.**
On recopie `clubFictif()`, `teamKey()` (sous un autre nom, pour ne pas écraser celui de `equipes.html`), `estPhaseDePoules()`, `buildStandings()` et `trierClassement()` depuis `classement.html`, ainsi que `buildRankRow()` et le trait des qualifiés. Les commentaires « recopié dans » de `classement.html` et `index.html` sont mis à jour pour citer `equipe.html`. Alternative écartée : lire le classement depuis l'API. Il n'existe pas côté Apps Script, et l'ajouter coûterait un appel de plus, à 2,2 s.

**3. Clé d'URL : la clé d'équipe telle quelle, `?equipe=<spécialité|catégorie|club|numéro>` encodée.**
C'est la clé de la liste suivie et de `buildTeams()` : aucune conversion n'est nécessaire, et une équipe suivie se retrouve directement. Elle n'est pas très lisible, mais elle est stable d'un rechargement à l'autre et ne contient aucune donnée personnelle.

**4. Choix de l'équipe affichée : URL, puis dernière consultée, puis première suivie.**
La dernière équipe consultée est stockée sous `lidfpb_equipe_vue_v1` (une chaîne, dans un `try/catch`). Elle est écrite à chaque affichage d'une équipe, y compris depuis un lien partagé : l'équipe qu'on vient de regarder est celle qu'on veut retrouver. Une clé absente des équipes construites est ignorée et on passe à la suivante.

**5. Changer d'équipe met à jour l'URL par `history.replaceState`, pas `pushState`.**
L'adresse reste partageable, et Retour ramène à la page d'où l'on vient plutôt que de faire défiler les équipes consultées. Alternative écartée : `pushState`. Retour aurait alors servi à parcourir l'historique des équipes, un comportement surprenant dans une application à onglets.

**6. Liste de choix : un `<select>` natif avec des `<optgroup>`.**
Le premier groupe, « Mes équipes », n'apparaît que si le visiteur suit au moins une équipe. Viennent ensuite un groupe par série, avec les équipes triées par club puis par numéro et libellées par `clubLabel()`. Les clubs fictifs sont exclus. Le `<select>` natif suit le précédent du filtre club de `equipes.html` : sur mobile, il ouvre le sélecteur du système, ce qui convient bien à une trentaine d'équipes. Alternatives écartées : des pastilles, trop nombreuses, et le panneau `<details>` de l'accueil, prévu pour cocher plusieurs équipes, pas pour en choisir une.

**7. Prochaine partie : même définition que l'accueil.**
C'est la première partie de l'équipe sans score, avec une date ≥ aujourd'hui et une heure lisible. Le bloc « Mes équipes » de l'accueil et cette page donnent donc la même prochaine partie. Une partie passée restée sans score n'est pas « prochaine ». Elle reste dans la liste des parties, avec son bouton de report.

**8. Classement : la poule se déduit des parties de phase de poules de l'équipe.**
On filtre `buildStandings()` sur la spécialité, la catégorie et la poule de l'équipe, puis on trie avec `trierClassement()`. Le rang est la position dans la table, si l'équipe a joué. La ligne de l'équipe reçoit une classe qui la met en évidence (fond d'accent léger), sans changer sa hauteur. Le trait des qualifiés est toujours tracé, puisqu'il s'agit toujours d'une table de poule.

**9. Forme et reste à jouer : calculés à partir des données déjà construites.**
La forme reprend les 5 dernières parties avec score de `team.matches`, déjà triées. Le reste à jouer reprend les `rencontres` de phase 1 de la même poule, sans score et sans l'équipe, triées par date effective. Celles sans date lisible vont en fin de liste.

**10. Ordre des sections.**
En-tête de l'équipe (nom, série, rang en clair), puis prochaine partie, bilan et forme, classement de la poule, parties, reste à jouer dans la poule, et enfin composition. On va du plus consulté avant une partie au plus stable.

**11. Barre d'onglets : 5 entrées, onglet « Mon équipe » en 2e position.**
On ajoute un lien dans le `<nav class="tab-bar">` de chaque page, avec une icône dans le style des autres : trait de 1,7 en contour, version pleine sur l'onglet courant. Le CSS (`flex: 1 1 0`) répartit déjà la largeur, il n'y a rien à changer. On vérifie à 390 px. Si « Mon équipe » ou « Classement » est coupé, le libellé devient « Équipe ».

## Risks / Trade-offs

- [Trois copies du classement divergent] → Le commentaire de tête des trois copies cite les deux autres. La tâche de vérification compare la table de la page à celle de la page Classement sur les données réelles.
- [Une seconde spécialité réutilise les mêmes numéros] → La spécialité fait partie de la clé, les équipes restent distinctes.
- [Nouvelle saison : les clés de la dernière équipe et des liens partagés ne correspondent plus] → Une clé inconnue est ignorée sans message (spec, « Équipe introuvable »).
- [Cinq onglets à 390 px] → Vérification visuelle prévue en tâche, et repli sur le libellé « Équipe ».
- [Composition republiée sur une page de plus] → Noms seuls, comme aujourd'hui. Le point RGPD ouvert est signalé dans la proposition.

## Migration Plan

Aucune migration : site statique, déploiement par push sur `main`. Retour arrière par `git revert`. La clé `lidfpb_equipe_vue_v1` orpheline est sans effet.
