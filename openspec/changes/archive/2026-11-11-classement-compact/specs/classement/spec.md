# Spec Delta

## MODIFIED Requirements

### Requirement: Lien vers le bilan
Sous le bloc Filtres, la page SHALL porter un lien « Bilan de la phase de poules », seul accès à la page du bilan (spec `bilan`), qui n'a pas d'onglet. Le lien tient sur une seule ligne, sans sous-titre.

#### Scenario: Ouvrir le bilan
- **WHEN** un visiteur touche « Bilan de la phase de poules »
- **THEN** la page du bilan s'ouvre

#### Scenario: Lien sur une ligne
- **WHEN** un visiteur ouvre le Classement sur un téléphone de 412 px de large
- **THEN** le lien « Bilan de la phase de poules » tient sur une ligne

### Requirement: Ligne d'une équipe
Chaque carte de classement SHALL commencer par un en-tête de colonnes : « # », « Équipe », « J », « G », « P », « GA » et « Moy. ». Chaque équipe tient ensuite sur une ligne, alignée sur ces colonnes :
- son rang (« – » si elle n'a pas joué), les trois premiers rangs étant colorés or, argent et bronze ;
- son nom, sous la forme « Club (éq. N) » quand l'équipe a un numéro. Un nom long passe à la ligne et n'est jamais tronqué ;
- ses parties jouées, gagnées et perdues ;
- son goal average total, signé ;
- en gras, sa moyenne de points par partie à deux décimales, qui est le critère de tri.

Les nombres sont alignés à droite, en chiffres de même largeur. Toucher la ligne SHALL déplier sous elle les joueurs de l'équipe, puis son détail : parties jouées, gagnées, perdues, nuls s'il y en a, points, points marqués et encaissés, goal average total et moyen. La toucher à nouveau le replie. Plusieurs lignes peuvent être dépliées en même temps. La ligne est un bouton, qui annonce si elle est dépliée.

Que la ligne se déplie MUST se voir sans l'avoir essayé :
- chaque ligne finit par un chevron « › », celui du bloc Filtres replié ;
- une ligne dépliée a un chevron « ⌄ » et un fond teinté, que partage son détail ;
- sous l'en-tête de colonnes de la première carte de la page, une phrase d'aide dit « 👥 Touchez une équipe pour voir ses joueurs ». Une équipe sans partie jouée a « 0 » parties, « – » dans les autres colonnes, et pour détail « aucune partie jouée ». Sur un téléphone de 412 px de large, une poule de six équipes MUST tenir en entier, en-tête de carte compris, sur le premier écran de la page, quand le bloc Filtres est replié.

#### Scenario: Équipe classée
- **WHEN** une équipe a joué 3 parties, en a gagné 2, pour 7 points
- **THEN** sa ligne montre son rang, « 3 », « 2 » et « 1 » dans les colonnes J, G et P, et « 2,33 » dans la colonne Moy.

#### Scenario: Déplier le détail
- **WHEN** le visiteur touche la ligne de cette équipe
- **THEN** son chevron passe de « › » à « ⌄ », et sous la ligne apparaissent ses joueurs, puis un détail qui commence par « 3 parties · 2 G · 1 P · 7 pts »
- **AND** un second toucher le replie

#### Scenario: L'action se devine
- **WHEN** un visiteur ouvre le Classement pour la première fois
- **THEN** chaque ligne porte un chevron « › », et la première carte dit « 👥 Touchez une équipe pour voir ses joueurs » sous son en-tête de colonnes
- **AND** les cartes suivantes n'ont pas cette phrase

#### Scenario: Équipe qui n'a pas joué
- **WHEN** une équipe de la poule n'a encore joué aucune partie
- **THEN** sa ligne figure en fin de carte, avec « – » pour rang et pour moyenne, et son détail dit « aucune partie jouée »

#### Scenario: Une poule d'un coup d'œil
- **WHEN** un visiteur ouvre le Classement sur un Pixel 7, avec le bloc Filtres replié
- **THEN** les six équipes de la première poule sont toutes visibles sans défiler, au-dessus de la barre d'onglets

### Requirement: Joueurs des équipes
Le détail déplié de chaque ligne d'équipe SHALL commencer par les noms de ses joueurs, en gras et précédés d'une icône de joueurs, tels que déclarés à la ligue (composition de l'engagement), ou « Composition non déclarée à la ligue ». Les noms n'apparaissent pas sur la ligne repliée. Ils ne changent aucun rang. Si les compositions ne peuvent être chargées, le détail s'affiche sans noms plutôt que de les dire non déclarés.

#### Scenario: Équipe avec composition
- **WHEN** un visiteur ouvre le Classement puis touche la ligne d'Alpha (éq. 1)
- **THEN** le détail déplié porte les noms de ses joueurs

#### Scenario: Ligne repliée
- **WHEN** un visiteur ouvre le Classement sans toucher aucune ligne
- **THEN** aucun nom de joueur n'est visible

#### Scenario: Équipe sans composition
- **WHEN** une équipe n'a déclaré aucune composition à la ligue et que le visiteur touche sa ligne
- **THEN** le détail porte « Composition non déclarée à la ligue »
