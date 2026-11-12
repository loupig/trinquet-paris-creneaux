# Proposal

## Why

Le Bilan est la page qu'on montre au comptoir. Pourtant, c'est la seule page du site restée à l'ancien format, alors que le Classement et Parties ont changé ces derniers jours, et que le demandeur a validé ces changements :

- **Noms officiels longs** : « METRO PELOTE BASQUE ANTONY (éq. 1) » prend trois lignes. Le Classement et Parties disent « MPBA 1 » (spec `noms-clubs`).
- **Joueurs entre crochets partout**, et le détail écrit en phrase : une poule de six prend environ 600 px sur un Pixel 7, soit plus d'un écran. Au Classement, une poule de six tient en entier sur le premier écran.
- **Sort du rang par un trait « En quarts pour l'instant »** : le barrage et la descente ne se lisent que dans les messages de fin de poule. Le Classement les montre déjà par un liseré et une légende, avec la même règle (`FIN_DE_POULE`).
- **Parties de la poule** à l'ancien format, en noms officiels.
- **Tableau final en prévision seule** : un 1/4 joué n'envoie personne en demie au Bilan, alors qu'au Classement le vainqueur monte en 1/2 (#57). La spec `bilan` exige pourtant le même tableau qu'au Classement.

Aujourd'hui, les phases finales ont commencé : un visiteur qui passe du Classement au Bilan voit deux tableaux différents.

## What Changes

- **Noms courts sur toute la page** (classements, trophées, Mes équipes, parties de la poule, tableau final), selon la spec `noms-clubs`. **BREAKING** pour les libellés « Club (éq. N) » de la page.
- **Poules au format du Classement** :
  - une ligne par équipe : rang, équipe, J, G, P, GA, Moy. en gras, sous un en-tête de colonnes ;
  - le podium (or, argent, bronze) est gardé : c'est le ton du Bilan ;
  - au toucher d'une ligne : son nom officiel, ses joueurs, puis son détail, avec un chevron « › » qui passe en « ⌄ » ;
  - **BREAKING** : les joueurs ne sont plus « toujours affichés ».
- **Zones de fin de poule et légende**, comme au Classement :
  - un liseré vert (quarts), orange (barrage) ou rouge (descente) remplace le trait des qualifiés ;
  - sous les poules de chaque série, la légende reprend les zones et le sens des colonnes.
- **Parties de la poule**, toujours repliées, une partie par ligne à la manière de Parties : date, « MPBA 1 vs Bravo 1 », score à droite, vainqueur en gras. Pas de toucher ni de détail : c'est un récapitulatif.
- **Tableau final du Classement, scores réels compris** :
  - le score de chaque partie jouée ;
  - sous les quarts, les demies, la finale et le champion ;
  - le statut « En cours » puis « Terminées ».

  Le Bilan garde « le quart le plus indécis », tant qu'un quart reste à jouer.
- **Trophées et Mes équipes** : les équipes y sont nommées par leur nom court, sans crochets de joueurs. Validé par le demandeur : les joueurs restent à un toucher dans la poule.
- **Mes équipes, pendant les phases finales** : le sort donne le résultat du quart (« battue en quart », « en demie contre … »), lu dans le tableau.
- **Image et texte partagés** : noms courts, plus lisibles sur une image de 1080 px. Ils ne contiennent toujours aucun nom de joueur. Validé par le demandeur.
- **Ce qui ne change pas** :
  - les messages WhatsApp de fin de poule gardent les noms officiels, comme ceux de Parties ;
  - l'affiche, les chiffres et le calcul des trophées.
- **Recopiés dans `bilan.html`, à l'identique** : `CLUBS_ABREGES`, les teintes `--poule*` et les zones, `PHASE_DEMIES` et `PHASE_FINALE`, ainsi que le code du tableau final du Classement.

## Capabilities

### New Capabilities
Aucune.

### Modified Capabilities
- `bilan` :
  - « Données et classement » : noms courts, joueurs au toucher ;
  - « Mes équipes au bilan » : noms courts, sort en phases finales ;
  - « Trophées d'une série » : noms courts ;
  - « Poules et résultats » : ligne en colonnes, zones, légende, parties en une ligne ;
  - « Tableau final » : celui du Classement, scores réels compris ;
  - « Partager le bilan » : noms courts.

- `donnees-api` : « Noms de joueurs seuls ». Le Bilan ne les donne plus qu'au toucher d'une ligne de classement, comme le Classement.

La spec `noms-clubs` ne change pas, car elle ne liste pas les pages qui portent la table.

## Impact

- **Pages** : `bilan.html` (rendu des poules, des parties, des trophées, de Mes équipes, du tableau final et de l'image partagée ; CSS ; constantes recopiées). Pied de page `Version AAAA.MM.JJ`.
- **Constantes dupliquées** : `bilan.html` rejoint les tests de copies identiques de `CLUBS_ABREGES`. README à jour (`CLUBS_ABREGES`, `PHASE_QUARTS` et les autres).
- **Tests** :
  - les scénarios « Bilan de la phase de poules » qui lisent « Alpha (éq. 1) [Ane …] » sont revus ;
  - le test « Même tableau qu'au Classement » compare maintenant les deux tableaux, demies et scores compris ;
  - un nouveau scénario vérifie qu'une poule de six tient au premier écran d'un Pixel 7 ;
  - un autre vérifie les zones et la légende ;
  - un autre vérifie un quart joué au Bilan.
- **`localStorage`** : pas de clé nouvelle.
- **Hors champ** :
  - un script partagé entre Classement et Bilan, qui contredirait « chaque page est autonome » ;
  - le simulateur et le chemin vers les quarts, qui restent au Classement ;
  - les 4 constats de revue sur Parties et l'accueil, laissés de côté à la PR #57.

## Hypothèses à valider

1. **On peut retirer les joueurs des trophées** (choix validé par le demandeur). Le nom court suffit à reconnaître l'équipe, et les joueurs restent à un toucher dans la poule. Si on nous les redemande, on pourra les remettre au seul trophée, en petit.
2. **Les noms courts suffisent sur l'image partagée** (choix validé par le demandeur). Le groupe WhatsApp de la ligue connaît les abréviations des clubs.
3. **Un Bilan plus court se lit jusqu'au bout.** Mesure simple : la hauteur de la page sur Pixel 7 passe d'environ 8 000 px à moins de 5 000 px, sur les données fictives.
