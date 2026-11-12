# Tasks

Vérification par `npm test` (syntaxe, puis pages dans Chromium sur les données fictives de `tests/donnees.mjs`), et par des captures sur Pixel 7, en clair et en sombre, avant et après.

## 1. Classement : tableau final en fonctions pures

- [ ] 1.1 `classement.html` :
  - `partiesFinales(rencontres, spec, cat, poulesFinies)` et `tableauFinal(rencontres, spec, cat, teams, restantes)` ne lisent plus `lastData` ;
  - `buildFinalesCard` leur passe `lastData.rencontres`.

  Aucun changement visible. Vérifier : les 168 tests restent verts, et la capture de la carte des phases finales est identique avant et après.

## 2. Scénarios du Bilan d'abord

- [ ] 2.1 Dans `tests/pages.spec.mjs`, écrire ou revoir :
  - noms courts au classement, aux trophées, à Mes équipes, aux parties et au tableau, avec un club de la table (« MPBA 1 ») ;
  - aucun crochet ni nom de joueur sur la page tant qu'on n'a rien touché ;
  - toucher une ligne de poule : nom officiel, joueurs, détail, `aria-expanded`, chevron, fond teinté ; un second toucher replie ;
  - en-tête de colonnes, médailles des trois premiers ;
  - zones : Série 1 (quarts, descente), Série 2 (quarts, barrage, descente) ; plus de `.cut-line` ; légende avec « à ce jour » ;
  - parties de la poule en une ligne « A vs B », vainqueur en gras, « à jouer » et « sans score » ;
  - une poule de six au premier écran d'un Pixel 7 ;
  - « Même tableau qu'au Classement » : quarts, demies et finale identiques, scores compris, sur des données avec un quart joué ;
  - Mes équipes : une équipe suivie qui gagne son quart est dite en demie ;
  - les messages de fin de poule inchangés (noms officiels) ;
  - l'image et le texte partagés en noms courts, sans nom de joueur ;
  - le texte source de `idClubEquipe`, `partiesFinales`, `tableauQuarts`, `tableauFinal`, `buildDuel` et `buildArbre` identique dans les deux pages ;
  - `CLUBS_ABREGES` du Bilan identique aux autres pages et à la spec.

  Vérifier : ils échouent sur le Bilan actuel.

## 3. Bilan : noms et données

- [ ] 3.1 `bilan.html` : `CLUBS_ABREGES` recopié ; `t.label` en nom court et `t.nomOfficiel` en nom officiel ; `p.nomA` et `p.nomB` en noms courts.
- [ ] 3.2 Messages de fin de poule et `partiesSuivantes` : passer à `nomOfficiel`.
- [ ] 3.3 `nomEquipe()` sans crochets ; les joueurs ne restent qu'au dépli de la ligne de classement.

## 4. Bilan : poules

- [ ] 4.1 Recopier du Classement `buildRankRow` (avec la médaille sur `.rank-pos`), l'en-tête de colonnes, les zones et `buildLegende`, ainsi que les variables de couleur avec leurs valeurs sombres dans les deux blocs (spec `apparence`).
- [ ] 4.2 `buildPouleCard` : zones au lieu de `.cut-line`. Légende sous les poules de chaque série, avant le tableau final.
- [ ] 4.3 Parties de la poule en une ligne « date | A vs B | score ».

## 5. Bilan : tableau final

- [ ] 5.1 Recopier à l'identique `idClubEquipe`, `partiesFinales`, `tableauQuarts`, `tableauFinal`, `buildDuel`, `buildArbre` et le CSS du tableau. Ajouter `PHASE_DEMIES` et `PHASE_FINALE`.
- [ ] 5.2 `buildSlot` et `buildFinalesCard` du Bilan : scores, suite (demies, finale, champion), statuts, « quart le plus indécis » limité aux quarts à jouer, sans joueurs.
- [ ] 5.3 `buildMesEquipes` : verdict de phase finale lu dans le tableau.
- [ ] 5.4 Image et texte partagés : tableau des quarts en noms courts, et les scores des quarts joués s'il y en a.

## 6. Finitions

- [ ] 6.1 Pieds de page `Version AAAA.MM.JJ` de `bilan.html` et `classement.html`.
- [ ] 6.2 README : `CLUBS_ABREGES` (ajouter Bilan), `PHASE_QUARTS` et la ligne sur les fonctions du tableau final recopiées, la liste des endroits où s'affichent les noms de joueurs.
- [ ] 6.3 `npm test` complet ; captures Pixel 7 du Bilan en clair et en sombre (une poule, le tableau avec un quart joué, Mes équipes) ; hauteur de page avant et après.
- [ ] 6.4 `/code-review` sur le diff, `/security-review` (données de l'API, partage), puis PR.
