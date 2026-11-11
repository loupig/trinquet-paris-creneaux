# Design

## Context

- **`index.html`** porte `CLUBS_ABREGES`, repéré par le nom de la ligue en majuscules, et `clubCourt(clubMap, code, equipe)`, qui renvoie `court + " " + eq`. Un commentaire y dit que les noms courts « ne servent qu'à l'accueil » : ce n'est plus vrai après ce changement.
- **`classement.html`** construit `team.label` avec `clubLabel()`, sous la forme « Nom (éq. N) ». Ce libellé sert partout dans la page :
  - lignes, avec l'espace insécable de `buildRankRow` ;
  - tableau des quarts ;
  - simulateur ;
  - chemin vers les quarts ;
  - libellé lu par le lecteur d'écran.
- **`bilan.html`** porte `FIN_DE_POULE` et `sortFinDePoule(serie, rang, taille)`, qui donne `quarts`, `hors-quarts`, `maintien`, `barrage` ou `descente`. Ses couleurs de sort : `--win-*` pour les quarts, `--warn-*` pour le barrage, `--loss-*` ou `--error-*` pour la descente.
- **Couleurs dans le Classement** : il a déjà `--win-text`, `--loss-text` et `--warn-text`, avec leurs valeurs sombres. Le liseré `box-shadow: inset 3px 0 0 var(--teinte)` sert au classement général.
- **Le trait** `.cut-line` « Qualifiés pour les quarts » est inséré par `buildPouleCard`. La phrase de la règle est un `<p class="legende">` du bloc Filtres.
- **Le lien Bilan** `.bilan-lien` est en dur dans le HTML, sous le bloc Filtres. La carte des quarts sait déjà si une série a fini ses poules : c'est ce qui donne son statut « Poules terminées ».
- **Données fictives** : clubs Alpha à Lima, absents de la table, et deux parties passées sans score par poule. Aucune série n'est donc terminée par défaut.

## Goals / Non-Goals

**Goals:**
- Une seule table de noms courts, écrite dans la spec et recopiée à l'identique, avec un test qui compare les copies.
- Une poule de six visible au premier écran d'un iPhone 15 Pro, même avec les vrais noms.
- Le sens d'un rang lisible sans ouvrir le bloc Filtres ni le Bilan.

**Non-Goals:**
- Pas de noms courts sur Parties, Mes équipes ni le Bilan dans ce lot.
- Pas de script partagé : chaque page reste autonome (CLAUDE.md).
- Pas de nouvelle clé `localStorage`.

## Decisions

**1. `CLUBS_ABREGES` recopié tel quel, et un nom court calculé au chargement.**
Le Classement reçoit la même table et une fonction `nomCourt(nom)`, qui renvoie `CLUBS_ABREGES[nom.toUpperCase().trim()] || nom`. Chaque équipe porte deux libellés :
- `team.label`, le nom court + « " " » + numéro, comme `clubCourt` à l'accueil ;
- `team.nomOfficiel`, l'actuel « Nom (éq. N) ».

Tout ce qui lit `team.label` passe ainsi au nom court sans autre changement. Le détail déplié affiche `nomOfficiel`. L'espace insécable de `buildRankRow` ne sert plus à rien : on la retire.

Un test lit `CLUBS_ABREGES` dans `index.html` et `classement.html` et compare les deux objets. Il compare aussi `FIN_DE_POULE` entre `bilan.html` et `classement.html`. Il vérifie enfin que la table de la spec `noms-clubs` a les mêmes lignes : la spec est la référence.

Alternative écartée : une règle automatique (retirer « PELOTE BASQUE »). Le demandeur veut les noms d'usage validés, pas une abréviation inventée.

**2. Zones : `sortFinDePoule` recopiée, et une classe par ligne.**
`buildPouleCard`, en découpage par poule, calcule pour chaque équipe qui a joué `sortFinDePoule({ cat }, rang, taille)`. `taille` est le nombre d'équipes de la carte. La ligne reçoit la classe `zone-quarts`, `zone-barrage` ou `zone-descente`. Le liseré fait 4 px, plus large que celui des poules (3 px) pour se voir sur un écran clair :
- `--win-text` pour les quarts ;
- `--warn-text` pour le barrage ;
- `--loss-text` pour la descente.

Ces trois variables existent déjà, avec leurs valeurs sombres. Il n'y a donc pas de couleur nouvelle.

Le liseré ne passe pas sur la ligne dépliée de son détail, contrairement à la teinte de poule : la zone qualifie le rang, pas l'équipe.

Une équipe sans partie jouée n'a pas de zone. Elle serait sinon marquée « descente » parce qu'elle ferme la carte.

**3. Légende : un bloc par série, placé dans la zone de la série.**
`remplirZone` ajoute, après les cartes de poule et avant la carte des quarts, un `div.legende-classement`. Ce bloc tient toute la largeur (`flex-basis: 100%` dans la mise en page grand écran). Il liste :
- seulement les zones présentes : pas de barrage en Série 1 ;
- les rangs calculés sur la plus grande poule de la série ;
- la précision « à ce jour » tant que la série a des parties de poule sans score, avec le même compte que la carte des quarts ;
- puis la phrase des colonnes et du barème.

Le `<p class="legende">` du bloc Filtres est retiré.

**4. Lien Bilan : déplacé par le script, pas dupliqué.**
Après chaque rendu, `renderResults` décide où mettre l'unique élément `.bilan-lien`. Si une série affichée a fini ses poules, il va sous le bloc Filtres, comme dans le HTML. Sinon, il va à la fin de `#results`. Un seul élément dans la page : le test du Bilan qui le touche reste valable. Sans données (échec du chargement), il reste en haut.

**5. Phrase d'aide et lien Bilan.**
L'aide reste sur la première carte. Avec le lien Bilan en bas pendant la saison et sans trait des qualifiés, la mesure de la maquette donne une poule de six entière sur l'iPhone 15 Pro (393 × 659).

## Risks / Trade-offs

- **Sigles obscurs pour un nouveau venu** (« PPB13 »). → Nom officiel au toucher. Hypothèse 1 de la proposition, à vérifier auprès des joueurs.
- **Un club renommé par la ligue** perd son nom court sans bruit. C'est le risque déjà accepté à l'accueil ; la spec le dit.
- **Le vert « à ce jour » pris pour une qualification acquise.** → « à ce jour » dans la légende tant que des scores manquent. Le simulateur et la carte des quarts disent déjà « Prévision ».
- **Le liseré seul ne suffit pas à un daltonien.** → Le rang est écrit et la légende donne les rangs de chaque zone (« 5 Barrage ») : la couleur n'est jamais la seule information.
- **Le lien Bilan moins visible** en cours de saison. Hypothèse 3.

## Migration Plan

Pas de donnée à migrer. Retour arrière : revert de la fusion.

## Open Questions

Aucune. La table des noms courts a été validée telle quelle par le demandeur, écriture comprise.
