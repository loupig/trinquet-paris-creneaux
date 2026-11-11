# Spec Delta

## MODIFIED Requirements

### Requirement: Ligne d'une partie
Chaque partie SHALL tenir sur une seule ligne, colorée selon sa série (liseré à gauche et fond teinté, déjà en place), qui donne :
- l'heure (« 14h » ou « 14h30 ») ;
- une pastille de poule, « P1 », « P2 »…, dans la teinte de sa poule, la même qu'au Classement en classement général et au tableau des quarts. Pour une partie hors poule, la pastille porte le libellé court de la phase (« 1/4 », « 1/2 », « Finale », « Barrage »), dans une teinte neutre ;
- les deux équipes sous leur nom court suivi de leur numéro (spec `noms-clubs`), l'équipe qui reçoit en premier : « MPBA 1 vs PEP 2 » (sans numéro quand la ligue n'en donne pas). Un nom long passe à la ligne, et un numéro d'équipe ne s'y retrouve jamais seul ;
- le score à droite quand la partie a été jouée ;
- au bout, un chevron « › », celui du bloc Filtres replié, qui passe en « ⌄ » quand la partie est dépliée.

La série ne s'écrit plus en toutes lettres : sa couleur suffit, expliquée par la légende de la page. Le lieu ne figure pas sur la ligne, sauf quand la partie se joue ailleurs que dans le lieu habituel (le plus fréquent du calendrier) : la ligne porte alors « 📍 » suivi du nom court du lieu (la partie entre parenthèses sans le code postal, comme à l'accueil). Les noms des joueurs ne figurent pas sur la ligne. La ligne est un bouton qui annonce s'il est déplié, et sa phrase lue par un lecteur d'écran dit la série, la poule ou la phase, et le lieu. Dépliée, la partie et son détail partagent un fond teinté. Un club inconnu de la ligue s'affiche « Club <code> ». Sur un iPhone 15 Pro dans Safari (393 × 659 px), le bloc Filtres replié, au moins cinq parties MUST tenir sur le premier écran, au-dessus de la barre d'onglets.

#### Scenario: Partie de poule à venir
- **WHEN** une partie de la poule 2 de série 1, entre « METRO PELOTE BASQUE ANTONY » (éq. 1) et « PARIS EUSKAL PILOTA » (éq. 2), au lieu habituel, n'a pas encore de score
- **THEN** sa ligne donne l'heure, la pastille « P2 », « MPBA 1 vs PEP 2 », sans score, sans lieu, sans « Série 1 » écrit, ni nom de joueur, dans la couleur de la série 1

#### Scenario: Partie de phase finale jouée
- **WHEN** une demi-finale a été jouée
- **THEN** sa ligne porte la pastille « 1/2 » à la place de la poule, et le score à droite

#### Scenario: Partie dans un autre lieu
- **WHEN** la plupart des parties se jouent au « PARIS (Trinquet Paris - 75016) » et l'une se joue au « PARIS (Trinquet Mail - 75006) »
- **THEN** seule cette partie porte « 📍 Trinquet Mail » sur sa ligne

#### Scenario: Le toucher se devine
- **WHEN** un visiteur ouvre Parties
- **THEN** chaque partie finit par un chevron « › »
- **AND** une partie touchée passe en « ⌄ » sur fond teinté, et annonce qu'elle est dépliée

#### Scenario: Premier écran
- **WHEN** un visiteur ouvre Parties sur un iPhone 15 Pro, le bloc Filtres replié
- **THEN** au moins cinq parties sont visibles sans défiler

### Requirement: Détail d'une partie
Toucher la ligne d'une partie SHALL déplier son détail, et la toucher à nouveau le replier. Le détail donne :
- pour l'équipe qui reçoit, puis pour l'équipe visiteuse, son nom officiel tel que la ligue l'écrit (« METRO PELOTE BASQUE ANTONY (éq. 1) ») et les noms des joueurs déclarés à la ligue, sous la forme « Prénom Nom », ou « composition non disponible » quand aucun joueur n'est connu ;
- la série et la poule ou la phase, en toutes lettres (« Série 1 · Poule 2 ») ;
- le lieu complet, tel que la ligue l'écrit, ou « Lieu non précisé ».

C'est le seul endroit de la page où figurent les joueurs. Si les compositions ne peuvent pas être chargées, le calendrier s'affiche quand même, avec « composition non disponible ».

#### Scenario: Composition connue
- **WHEN** le visiteur touche une partie dont les deux équipes ont déclaré leurs joueurs
- **THEN** le détail donne, pour chaque équipe, son nom officiel et ses joueurs, sans numéro de licence, puis la série, la poule et le lieu complet

#### Scenario: Composition inconnue
- **WHEN** une équipe n'a déclaré aucun joueur connu de la ligue
- **THEN** sa ligne de détail indique son nom officiel et « composition non disponible »

#### Scenario: Message aux responsables inchangé
- **WHEN** le visiteur touche l'icône WhatsApp d'une équipe dans le détail
- **THEN** le message prérempli nomme les équipes par leur nom officiel et le lieu en entier, comme avant ce changement

## ADDED Requirements

### Requirement: Légende des parties
Au-dessus des cartes de jour, la page SHALL afficher une légende sur une ou deux lignes : la couleur de chaque série affichée (« Série 1 », « Série 2 »), les pastilles de poule présentes (« P1 », « P2 » : poule), « 📍 lieu inhabituel » quand une partie affichée en porte un, et « Touchez une partie : joueurs, lieu, contacts ». Elle suit les filtres : une série masquée n'y figure plus. Quand aucune partie ne correspond aux filtres, elle n'est pas affichée. Les couleurs ont leur version sombre (spec `apparence`).

#### Scenario: Légende par défaut
- **WHEN** un visiteur ouvre Parties avec toutes les séries
- **THEN** la légende donne la couleur de la Série 1 et de la Série 2, les pastilles « P1 » et « P2 », et dit qu'on touche une partie pour voir joueurs, lieu et contacts

#### Scenario: Série masquée
- **WHEN** le visiteur masque la Série 2
- **THEN** la légende ne cite plus la Série 2

## REMOVED Requirements

### Requirement: Joueurs des équipes entre crochets
**Reason**: Les joueurs entre crochets faisaient passer chaque partie sur trois à quatre lignes : une seule partie tenait sur le premier écran d'un iPhone. Le détail au toucher les donne déjà, avec les contacts, et la ligne annonce désormais qu'elle se déplie.
**Migration**: Aucune donnée. Les joueurs restent au détail de chaque partie. L'accueil et le Bilan gardent leurs crochets.
