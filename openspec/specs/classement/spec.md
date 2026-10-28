# classement Specification

## Purpose

Afficher le classement de chaque poule des championnats, ou un classement général par série, selon la règle commune de classement du site.

## Requirements

### Requirement: Règle rappelée sous les filtres
L'en-tête de la page SHALL être celui des pages Parties et Mes équipes : titre, ligue, source et dernière synchro. Le barème (victoire 3 points, défaite 1 point), le critère (points par partie jouée, puis goal average moyen) et les quatre qualifiés par poule sont rappelés en une phrase courte dans le bloc Filtres. Le classement suit la spec `calcul-classement`. Les résultats des phases finales n'apparaissent pas sur la page : seule la prévision des quarts, déduite du classement des poules, y figure.

#### Scenario: Ouverture de la page
- **WHEN** un visiteur ouvre la page Classement
- **THEN** l'en-tête ne donne que la source et la synchro, et le bloc Filtres rappelle le barème et le critère de classement

### Requirement: Découpage par poule ou général
La page SHALL proposer deux découpages exclusifs : « Par poule », par défaut, avec une carte par poule, et « Général », qui fusionne en une seule carte les poules d'une même spécialité et d'une même série et les classe selon la même règle. Les cartes sont rangées par spécialité, puis par série, puis par poule. Chaque carte porte la série, son titre (« Poule N » ou « Classement général ») et son nombre d'équipes.

#### Scenario: Classement général
- **WHEN** le visiteur choisit « Général »
- **THEN** chaque série de chaque spécialité n'a plus qu'une carte, « Classement général », qui réunit les équipes de toutes ses poules

### Requirement: Ligne d'une équipe
Chaque équipe SHALL tenir sur une ligne qui donne : son rang (« – » si elle n'a pas joué), les trois premiers rangs étant colorés or, argent et bronze, son nom, sous la forme « Club (éq. N) » quand l'équipe a un numéro, un détail (parties jouées, gagnées, perdues, nuls s'il y en a, points, points marqués et encaissés, goal average total et moyen), et à droite, en gros, sa moyenne de points par partie à deux décimales. Une équipe sans partie jouée a pour détail « aucune partie jouée » et « – » pour moyenne.

#### Scenario: Équipe classée
- **WHEN** une équipe a joué 3 parties, en a gagné 2, pour 7 points
- **THEN** sa ligne montre son rang, un détail qui commence par « 3 parties · 2 G · 1 P · 7 pts », et « 2,33 » à droite

#### Scenario: Équipe qui n'a pas joué
- **WHEN** une équipe de la poule n'a encore joué aucune partie
- **THEN** sa ligne figure en fin de carte, avec « – » pour rang et pour moyenne, et « aucune partie jouée »

### Requirement: Trait des qualifiés
En découpage par poule, une carte de plus de quatre équipes SHALL porter, sous la 4e ligne, un trait « Qualifiés pour les quarts ». Une poule de quatre équipes ou moins, et le classement général, n'ont pas de trait.

#### Scenario: Poule de six
- **WHEN** le visiteur regarde une poule de six équipes
- **THEN** un trait « Qualifiés pour les quarts » sépare la 4e et la 5e équipe

#### Scenario: Poule de quatre
- **WHEN** le visiteur regarde une poule de quatre équipes
- **THEN** aucun trait n'apparaît

### Requirement: Filtres du classement
La page SHALL proposer, dans un bloc repliable, un filtre par spécialité et un filtre par série (Série 1, Série 2), tous actifs par défaut. Ces filtres masquent des cartes entières et ne changent jamais le rang d'une équipe. Le choix de spécialité, de série et de découpage MUST être retrouvé d'une visite à l'autre sur le même navigateur, sans être envoyé nulle part. Quand aucune carte ne reste, la page affiche « Aucune équipe ne correspond aux filtres. ».

#### Scenario: Une seule série
- **WHEN** le visiteur désactive « Série 1 »
- **THEN** seules les cartes de série 2 restent, avec les mêmes rangs qu'avant

#### Scenario: Retour sur la page
- **WHEN** le visiteur a désactivé « Série 1 » puis revient le lendemain
- **THEN** la série 1 est toujours masquée

#### Scenario: Découpage retrouvé
- **WHEN** le visiteur a choisi « Général » puis recharge la page
- **THEN** la page s'affiche en classement général

### Requirement: Prévision des quarts de finale
Après les cartes de classement de chaque série, et avant son simulateur, la page SHALL afficher une carte « Phases finales · 1/4 de finale », habillée autrement que les classements (cadre et en-tête pleins, foncés), qui déduit les quarts du classement des poules, réel ou simulé : Q1, le 1er de la poule 1 contre le 4e de la poule 2 ; Q2, le 3e de la poule 1 contre le 2e de la poule 2 ; Q3, le 2e de la poule 1 contre le 3e de la poule 2 ; Q4, le 4e de la poule 1 contre le 1er de la poule 2. À droite des quarts, un arbre relie Q1 et Q2 à la demie D1, Q3 et Q4 à la demie D2, puis D1 et D2 à la finale ; ses traits partent du milieu de chaque quart, et le chemin d'une équipe suivie jusqu'à sa demie est surligné. Un trait plus marqué sépare les deux moitiés du tableau. Chaque quart porte son numéro et ses deux équipes l'une sous l'autre, celle de la poule 1 au-dessus, chacune précédée de son rang de poule en étiquette, ou « À déterminer » quand ce rang n'est occupé par aucune équipe ayant joué. La carte porte « Prévision » tant qu'une partie de poule de la série reste sans score, « Simulation » quand toutes les parties restantes sont simulées, et « Poules terminées » sinon, en rappelant que le tableau officiel reste celui de la ligue. Une équipe suivie y est mise en évidence sur fond coloré. En face de chaque équipe d'un quart dont les deux côtés ont joué en poule, la carte donne ses chances de le gagner, en pourcentage arrondi à 5 %, entre 5 et 95 %, les deux faisant 100 % ; elles se tirent des seuls résultats réels de poule (les simulations n'y changent rien), d'après l'écart moyen par partie de chaque équipe, ramené vers zéro en début de saison, et une note en rappelle l'origine. Une série qui n'a pas exactement deux poules n'a pas de tableau, seulement une note qui le dit.

#### Scenario: Poules en cours
- **WHEN** la série 1 a deux poules et des parties de poule sans score
- **THEN** sa carte des quarts, marquée « Prévision », oppose le 1er de la poule 1 au 4e de la poule 2 selon le classement actuel, et dit combien de parties restent

#### Scenario: Chances de victoire d'un quart
- **WHEN** les deux équipes d'un quart ont joué en poule, la première avec un meilleur écart moyen par partie
- **THEN** chacune porte un pourcentage, par exemple « 70 % » face à « 30 % », celui de la favorite en évidence
- **AND** une simulation qui change les équipes d'un quart change les pourcentages affichés, mais pas la façon de les calculer, qui ne tient compte que des résultats réels

### Requirement: Simulation des parties restantes
En bas de chaque série, la page SHALL proposer un simulateur, encadré en pointillés pour le distinguer des résultats réels, qui indique le nombre de parties simulées sur le nombre de parties restantes. Toujours visible, même replié, il donne pour chaque équipe suivie de la série son rang de poule et, si elle est qualifiée, son quart, son adversaire et la demie qui l'attend, recalculés à chaque résultat simulé ; sans équipe suivie, il invite à en suivre une depuis la page Mes équipes. Replié par défaut, il liste les parties de poule de la série encore sans score, celles des équipes suivies en premier. Pour chacune, le visiteur peut toucher le vainqueur, ce qui simule 40–30, ou saisir les deux scores. Le vainqueur simulé est marqué, le perdant grisé. Toucher à nouveau le vainqueur choisi, ou « Annuler » sur la partie, annule sa simulation. Chaque résultat simulé complet MUST être pris en compte aussitôt dans le classement des poules et dans les quarts, sans faire perdre le champ en cours de saisie. Un bandeau signale qu'une simulation est en cours et propose « Voir les quarts » et « Effacer la simulation ». Pendant une simulation, un bouton flottant « Voir les quarts » apparaît tant que la carte des quarts de la série simulée n'est pas à l'écran, et y ramène. La simulation MUST NOT remplacer un score réel, et elle n'est ni enregistrée ni envoyée : elle disparaît au rechargement de la page.

#### Scenario: Mon chemin vers les quarts
- **WHEN** le visiteur suit une équipe d'une série dont la poule a encore des parties sans score (16 au plus)
- **THEN** le haut du simulateur, sous son rang, dit ce qu'il lui faut pour finir dans les 4 premiers de sa poule, en passant en revue toutes les issues des parties restantes de la poule en victoires et défaites, d'après les seuls résultats réels (les simulations n'y changent rien) : « qualifiée quoi qu'il arrive », « qualifiée à coup sûr en gagnant N parties », « quasi fait » quand le pire cas se joue au goal average, « ça passe, mais pas sans aide » avec les résultats des autres sans lesquels ça ne passe pas (trois au plus), ou « plus de quart possible »
- **AND** une égalité de moyenne n'est jamais tranchée au hasard : le texte dit qu'elle se jouera au goal average ; au-delà de 16 parties restantes, il dit qu'il est trop tôt pour tracer le chemin

#### Scenario: Montre-moi ce scénario
- **WHEN** le chemin vers les quarts d'une équipe suivie n'est ni « qualifiée quoi qu'il arrive » ni sans issue qualifiante, et que le visiteur touche « 🗺️ Montre-moi ce scénario »
- **THEN** les parties restantes de sa poule sont simulées selon l'issue qui la qualifie à coup sûr en contredisant le moins le prono du comptoir ; les parties où elle le suit en gardent le score et l'étiquette « 🍻 Comptoir », les autres sont simulées 40–30
- **AND** le simulateur s'ouvre, le classement et les quarts sont recalculés, et un message dit combien de surprises ce scénario demande ; le visiteur peut ensuite le retoucher ou l'effacer

#### Scenario: Le prono du comptoir
- **WHEN** le visiteur touche « 🍻 Le prono du comptoir » dans le simulateur d'une série
- **THEN** chaque partie restante encore libre reçoit un pronostic tiré des seuls résultats réels de la saison : la confrontation directe si elle a déjà eu lieu, sinon l'écart moyen contre les adversaires communs, sinon la moyenne de points puis le goal average moyen ; le vainqueur pronostiqué marque 40, le perdant 40 moins l'écart attendu (au moins 1 point) ; une partie que rien ne départage reste libre
- **AND** les parties déjà simulées à la main ne changent pas, chaque partie pronostiquée porte l'étiquette « 🍻 Comptoir » jusqu'à ce qu'on la retouche, et un message sur le ton de l'humour dit combien de parties sont pronostiquées et ce que le comptoir prédit aux équipes suivies, en les invitant à lui donner tort ; un bouton « Tout effacer », à côté du prono, défait toute la simulation sans redescendre en bas de la liste

#### Scenario: Simuler une victoire
- **WHEN** le visiteur touche une équipe dans une partie restante
- **THEN** la partie compte comme gagnée 40–30 par cette équipe, le classement de sa poule et les quarts sont recalculés, et le bandeau « Simulation en cours » apparaît

#### Scenario: Rechargement
- **WHEN** le visiteur a simulé des résultats puis recharge la page
- **THEN** le classement et les quarts ne reposent plus que sur les scores réels

#### Scenario: Revenir aux quarts après une simulation
- **WHEN** le visiteur vient de simuler une partie en bas de la série, les quarts hors de l'écran
- **THEN** un bouton flottant « Voir les quarts » est affiché, et le toucher fait remonter jusqu'à la carte des quarts de cette série

#### Scenario: Mon équipe dans le simulateur
- **WHEN** le visiteur suit une équipe de la série et simule une partie qui la fait passer de la 3e à la 5e place
- **THEN** le haut du simulateur passe de « 3e poule 1 · qualifiée · Q3 contre … » à « 5e poule 1 · pas qualifiée », sans qu'il ait à remonter aux quarts
