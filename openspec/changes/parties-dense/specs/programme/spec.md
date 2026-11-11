# Spec Delta

## MODIFIED Requirements

### Requirement: Ligne d'une partie
Chaque partie SHALL tenir sur une ligne colorée selon sa série, qui donne :
- l'heure (« 14h » ou « 14h30 ») ;
- les deux équipes sous leur nom court suivi de leur numéro (spec `noms-clubs`), l'équipe qui reçoit en premier : « MPBA 1 vs PEP 2 » (sans numéro quand la ligue n'en donne pas). Un nom long passe à la ligne, et un numéro d'équipe ne s'y retrouve jamais seul ;
- une ligne « Série N · Poule X · lieu ». « Poule X » quand la ligue indique une poule, sinon le libellé de la phase s'il est connu. Le lieu s'écrit sous son nom court, la partie entre parenthèses sans le code postal (« Trinquet Paris » pour « PARIS (Trinquet Paris - 75016) »), comme à l'accueil, le libellé de la ligue tel quel s'il n'a pas de parenthèses, et « Lieu non précisé » à la place d'un lieu absent ;
- le score à droite quand la partie a été jouée ;
- au bout, un chevron « › », celui du bloc Filtres replié, qui passe en « ⌄ » quand la partie est dépliée.

Les noms des joueurs ne figurent pas sur la ligne. La ligne est un bouton qui annonce s'il est déplié. Dépliée, la partie et son détail partagent un fond teinté. Un club inconnu de la ligue s'affiche « Club <code> ». Sur un iPhone 15 Pro dans Safari (393 × 659 px), le bloc Filtres replié, au moins quatre parties MUST tenir sur le premier écran, au-dessus de la barre d'onglets.

#### Scenario: Partie de poule à venir
- **WHEN** une partie de poule de série 1 entre « METRO PELOTE BASQUE ANTONY » (éq. 1) et « PARIS EUSKAL PILOTA » (éq. 2), au Trinquet Paris, n'a pas encore de score
- **THEN** sa ligne donne l'heure, « MPBA 1 vs PEP 2 », « Série 1 · Poule 2 · Trinquet Paris », sans score ni nom de joueur

#### Scenario: Partie de phase finale jouée
- **WHEN** une demi-finale a été jouée
- **THEN** sa ligne porte le libellé de la phase à la place de la poule, et le score à droite

#### Scenario: Le toucher se devine
- **WHEN** un visiteur ouvre Parties
- **THEN** chaque partie finit par un chevron « › »
- **AND** une partie touchée passe en « ⌄ » sur fond teinté, et annonce qu'elle est dépliée

#### Scenario: Premier écran
- **WHEN** un visiteur ouvre Parties sur un iPhone 15 Pro, le bloc Filtres replié
- **THEN** au moins quatre parties sont visibles sans défiler

### Requirement: Détail d'une partie
Toucher la ligne d'une partie SHALL déplier son détail, et la toucher à nouveau le replier. Le détail donne :
- pour l'équipe qui reçoit, puis pour l'équipe visiteuse, son nom officiel tel que la ligue l'écrit (« METRO PELOTE BASQUE ANTONY (éq. 1) ») et les noms des joueurs déclarés à la ligue, sous la forme « Prénom Nom », ou « composition non disponible » quand aucun joueur n'est connu ;
- le lieu complet, tel que la ligue l'écrit, quand il est connu.

C'est le seul endroit de la page où figurent les joueurs. Si les compositions ne peuvent pas être chargées, le calendrier s'affiche quand même, avec « composition non disponible ».

#### Scenario: Composition connue
- **WHEN** le visiteur touche une partie dont les deux équipes ont déclaré leurs joueurs
- **THEN** le détail donne, pour chaque équipe, son nom officiel et ses joueurs, sans numéro de licence, puis le lieu complet

#### Scenario: Composition inconnue
- **WHEN** une équipe n'a déclaré aucun joueur connu de la ligue
- **THEN** sa ligne de détail indique son nom officiel et « composition non disponible »

#### Scenario: Message aux responsables inchangé
- **WHEN** le visiteur touche l'icône WhatsApp d'une équipe dans le détail
- **THEN** le message prérempli nomme les équipes par leur nom officiel et le lieu en entier, comme avant ce changement

## REMOVED Requirements

### Requirement: Joueurs des équipes entre crochets
**Reason**: Les joueurs entre crochets faisaient passer chaque partie sur trois à quatre lignes : une seule partie tenait sur le premier écran d'un iPhone. Le détail au toucher les donne déjà, avec les contacts, et la ligne annonce désormais qu'elle se déplie.
**Migration**: Aucune donnée. Les joueurs restent au détail de chaque partie. L'accueil et le Bilan gardent leurs crochets.
