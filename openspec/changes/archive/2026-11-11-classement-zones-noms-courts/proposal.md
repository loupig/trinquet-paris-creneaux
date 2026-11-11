# Proposal

## Why

Le Classement en colonnes (`classement-compact`) est en ligne. Sur le vrai site, deux choses l'empêchent encore de se lire d'un coup d'œil sur un iPhone 15 Pro :

- **Les noms officiels sont longs.** « METRO PELOTE BASQUE ANTONY (éq. 1) » tient sur trois lignes : on ne voit que quatre équipes au premier écran.
- **Le rang ne dit pas ce qu'il vaut.** Sur L'Équipe, une couleur marque les places qualificatives et la relégation, et une légende l'explique. Chez nous, seul un trait « Qualifiés pour les quarts » le dit. Le barrage et la descente n'apparaissent qu'au Bilan, une fois les poules finies. Et l'explication des colonnes reste cachée dans le bloc Filtres, replié par défaut.

L'accueil a déjà des noms courts, tels que les clubs se nomment entre eux (`CLUBS_ABREGES`), mais aucune spec ne les fixe. Ce changement en fait une référence commune, validée avec le demandeur, que d'autres pages pourront reprendre.

## What Changes

- **Nouvelle spec `noms-clubs`** : la table des noms courts, validée telle que l'accueil l'utilise, et la règle d'affichage :
  - le nom court, une espace, le numéro d'équipe (« MPBA 1 ») ;
  - un club absent de la table garde le nom de la ligue ;
  - la table est recopiée à l'identique dans chaque page qui s'en sert, et un test le vérifie.
- **Classement, sur toute la page** (lignes, tableau des quarts, simulateur) : les équipes sont nommées par leur nom court. Au toucher d'une ligne, le nom officiel complet vient en tête, avant les joueurs. **BREAKING** pour les libellés « Club (éq. N) » de la page.
- **Classement, zones de fin de poule** en découpage par poule. Un liseré à gauche de la ligne remplace le trait « Qualifiés pour les quarts » :
  - vert : de la 1re à la 4e place, quarts ;
  - orange : l'avant-dernier en Série 2, barrage ;
  - rouge : le dernier, descente.

  La règle est celle du Bilan (`FIN_DE_POULE`). Le classement général garde son liseré de poule et n'a pas de zones.
- **Classement, légende** sous les poules de chaque série :
  - les zones présentes, avec leurs rangs ;
  - le sens des colonnes et le barème (victoire 3, défaite 1, rang à la moyenne puis au goal average moyen).

  Cette phrase quitte le bloc Filtres.
- **Classement, lien Bilan** :
  - en bas de page tant que les poules sont en cours ;
  - en haut, sous les filtres, dès qu'une série affichée a fini ses poules.

## Capabilities

### New Capabilities
- `noms-clubs` : les noms courts des clubs et la façon d'écrire une équipe sous son nom court. Elle sert à l'accueil et au Classement, et pourra servir à d'autres pages.

### Modified Capabilities
- `classement` :
  - « Règle rappelée sous les filtres » : la règle passe dans la légende ;
  - « Lien vers le bilan » : en bas, puis en haut une fois les poules finies ;
  - « Ligne d'une équipe » : nom court, nom officiel au toucher ;
  - « Trait des qualifiés » : retiré, remplacé par « Zones de fin de poule » et « Légende du classement ».

## Impact

- **Pages** :
  - `classement.html` : `CLUBS_ABREGES` et `FIN_DE_POULE` recopiés, libellé court, zones, légende, place du lien Bilan ;
  - `index.html` : la table ne change pas, son commentaire renvoie à la spec.
  - Pied de page de `classement.html` (et de `index.html` si son commentaire change).
- **Constantes dupliquées** : `CLUBS_ABREGES` (accueil, Classement) et `FIN_DE_POULE` (Bilan, Classement) rejoignent `PTS_VICTOIRE` et les autres. Un test les compare d'une page à l'autre. README et CLAUDE.md à jour.
- **Tests** : les scénarios du Classement qui cherchent « Alpha (éq. 1) » lisent désormais « Alpha 1 ». Les clubs fictifs ne sont pas dans la table et gardent donc leur nom. Un scénario vérifie l'abréviation avec un club de la table servi par les données fictives.
- **Hors champ** :
  - les noms courts sur Parties, Mes équipes et le Bilan ;
  - l'en-tête de page plus court ;
  - les flèches d'évolution du rang.

## Hypothèses à valider

1. **Les sigles se comprennent** (« MPBA », « PPB13 », « LSC ») des joueurs de la ligue, puisque les clubs se nomment ainsi entre eux. Le nom officiel reste à un toucher.
2. **Des zones « à ce jour » ne trompent pas.** En cours de saison, le vert dit « dans les 4 aujourd'hui », pas « qualifié ». La légende le dit (« à ce jour ») tant que la série a des parties de poule sans score.
3. **Le lien Bilan en bas de page reste trouvé** pendant la saison. Il remonte en haut au moment où il sert le plus, à la fin des poules.
