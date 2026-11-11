# classement Specification

## Purpose

Afficher le classement de chaque poule des championnats, ou un classement général par série, selon la règle commune de classement du site.

## Requirements

### Requirement: Règle rappelée sous les filtres
L'en-tête de la page SHALL être celui des pages Parties et Mes équipes : titre, ligue, source et dernière synchro. Le barème (victoire 3 points, défaite 1 point), le critère (points par partie jouée, puis goal average moyen) et les quatre qualifiés par poule sont rappelés dans la légende de chaque série (« Légende du classement »), et non plus dans le bloc Filtres. Le classement suit la spec `calcul-classement`. Les résultats des phases finales n'apparaissent pas sur la page : seule la prévision des quarts, déduite du classement des poules, y figure.

#### Scenario: Ouverture de la page
- **WHEN** un visiteur ouvre la page Classement
- **THEN** l'en-tête ne donne que la source et la synchro, et la légende sous les poules rappelle le barème et le critère de classement, sans ouvrir le bloc Filtres

### Requirement: Lien vers le bilan
La page SHALL porter un lien « Bilan de la phase de poules », seul accès à la page du bilan (spec `bilan`), qui n'a pas d'onglet. Le lien tient sur une seule ligne, sans sous-titre. Sa place dépend de l'avancement :
- tant qu'aucune série affichée n'a fini ses poules, ou qu'aucune équipe n'est affichée, il est en bas de page, après le dernier classement et son simulateur, et il y est dès l'ouverture de la page, sans sauter à l'arrivée des données ;
- dès qu'une série affichée a toutes ses parties de poule avec un score, il est en haut, sous le bloc Filtres.

#### Scenario: Ouvrir le bilan
- **WHEN** un visiteur touche « Bilan de la phase de poules »
- **THEN** la page du bilan s'ouvre

#### Scenario: Poules en cours
- **WHEN** chaque série affichée a encore des parties de poule sans score
- **THEN** le lien est en bas de page, après le dernier simulateur

#### Scenario: Poules terminées
- **WHEN** toutes les parties de poule de la série 2 ont un score
- **THEN** le lien est en haut de page, sous le bloc Filtres

#### Scenario: Lien sur une ligne
- **WHEN** un visiteur ouvre le Classement sur un téléphone de 412 px de large
- **THEN** le lien « Bilan de la phase de poules » tient sur une ligne

### Requirement: Découpage par poule ou général
La page SHALL proposer deux découpages exclusifs : « Par poule », par défaut, avec une carte par poule, et « Général », qui fusionne en une seule carte les poules d'une même spécialité et d'une même série et les classe selon la même règle. Les cartes sont rangées par spécialité, puis par série, puis par poule. Chaque carte porte la série, son titre (« Poule N » ou « Classement général ») et son nombre d'équipes.

#### Scenario: Classement général
- **WHEN** le visiteur choisit « Général »
- **THEN** chaque série de chaque spécialité n'a plus qu'une carte, « Classement général », qui réunit les équipes de toutes ses poules

### Requirement: Poule d'origine des équipes
En découpage « Général », chaque ligne d'équipe SHALL indiquer la poule d'où vient l'équipe : une pastille « P1 », « P2 »… devant son nom, et un liseré à gauche de la ligne, dans une teinte propre à chaque poule de la carte. Les teintes se distinguent de celles des séries et restent lisibles en sombre. Au-delà de quatre poules, les teintes reviennent, le numéro restant écrit. En découpage « Par poule », les lignes n'ont ni pastille ni liseré. Au tableau des phases finales, quel que soit le découpage, l'étiquette de chaque équipe (« 1er P1 », « 4e P2 »…) prend la teinte de sa poule, la même qu'au classement général.

#### Scenario: Deux poules confondues
- **WHEN** le visiteur choisit « Général » pour une série à deux poules
- **THEN** chaque équipe porte « P1 » ou « P2 » devant son nom, et les équipes de la poule 1 ont une autre teinte que celles de la poule 2

#### Scenario: Par poule
- **WHEN** le visiteur revient à « Par poule »
- **THEN** les lignes ne portent plus de pastille de poule

#### Scenario: Tableau des quarts
- **WHEN** un visiteur regarde le tableau des phases finales d'une série
- **THEN** les étiquettes « … P1 » ont toutes la même teinte, distincte de celle des étiquettes « … P2 », et ce sont les teintes des poules du classement général

### Requirement: Ligne d'une équipe
Chaque carte de classement SHALL commencer par un en-tête de colonnes : « # », « Équipe », « J », « G », « P », « GA » et « Moy. ». Chaque équipe tient ensuite sur une ligne, alignée sur ces colonnes :
- son rang (« – » si elle n'a pas joué), les trois premiers rangs étant colorés or, argent et bronze ;
- son nom court suivi de son numéro (spec `noms-clubs`, « MPBA 1 »). Un nom long passe à la ligne et n'est jamais tronqué ;
- ses parties jouées, gagnées et perdues ;
- son goal average total, signé ;
- en gras, sa moyenne de points par partie à deux décimales, qui est le critère de tri.

Les nombres sont alignés à droite, en chiffres de même largeur. Toucher la ligne SHALL déplier sous elle, dans cet ordre : le nom officiel de l'équipe (« METRO PELOTE BASQUE ANTONY (éq. 1) »), ses joueurs, puis son détail (parties jouées, gagnées, perdues, nuls s'il y en a, points, points marqués et encaissés, goal average total et moyen). La toucher à nouveau le replie. Plusieurs lignes peuvent être dépliées en même temps. La ligne est un bouton, qui annonce si elle est dépliée. Partout ailleurs sur la page (tableau des quarts, simulateur, chemin vers les quarts), les équipes sont aussi nommées par leur nom court.

Que la ligne se déplie MUST se voir sans l'avoir essayé :
- chaque ligne finit par un chevron « › », celui du bloc Filtres replié ;
- une ligne dépliée a un chevron « ⌄ » et un fond teinté, que partage son détail ;
- sous l'en-tête de colonnes de la première carte de la page, une phrase d'aide dit « 👥 Touchez une équipe pour voir ses joueurs ».

Une équipe sans partie jouée a « 0 » parties, « – » dans les autres colonnes, et pour détail « aucune partie jouée ». Sur un téléphone de 412 px de large comme sur un iPhone 15 Pro dans Safari (393 × 659 px), une poule de six équipes MUST tenir en entier, en-tête de carte compris, sur le premier écran de la page, quand le bloc Filtres est replié et que les poules sont en cours.

#### Scenario: Équipe classée
- **WHEN** une équipe a joué 3 parties, en a gagné 2, pour 7 points
- **THEN** sa ligne montre son rang, « 3 », « 2 » et « 1 » dans les colonnes J, G et P, et « 2,33 » dans la colonne Moy.

#### Scenario: Nom court sur la ligne
- **WHEN** l'équipe 1 de « METRO PELOTE BASQUE ANTONY » est classée
- **THEN** sa ligne la nomme « MPBA 1 »
- **AND** au toucher, son détail commence par « METRO PELOTE BASQUE ANTONY (éq. 1) »

#### Scenario: Déplier le détail
- **WHEN** le visiteur touche la ligne de cette équipe
- **THEN** son chevron passe de « › » à « ⌄ », et sous la ligne apparaissent son nom officiel, ses joueurs, puis un détail qui commence par « 3 parties · 2 G · 1 P · 7 pts »
- **AND** un second toucher le replie

#### Scenario: L'action se devine
- **WHEN** un visiteur ouvre le Classement pour la première fois
- **THEN** chaque ligne porte un chevron « › », et la première carte dit « 👥 Touchez une équipe pour voir ses joueurs » sous son en-tête de colonnes
- **AND** les cartes suivantes n'ont pas cette phrase

#### Scenario: Équipe qui n'a pas joué
- **WHEN** une équipe de la poule n'a encore joué aucune partie
- **THEN** sa ligne figure en fin de carte, avec « – » pour rang et pour moyenne, et son détail dit « aucune partie jouée »

#### Scenario: Une poule d'un coup d'œil
- **WHEN** un visiteur ouvre le Classement sur un Pixel 7 ou un iPhone 15 Pro, avec le bloc Filtres replié, poules en cours
- **THEN** les six équipes de la première poule sont toutes visibles sans défiler, au-dessus de la barre d'onglets

### Requirement: Zones de fin de poule
En découpage par poule, chaque ligne d'une équipe qui a joué SHALL porter à gauche un liseré qui dit ce que vaut son rang à la fin des poules :
- vert pour les quatre premiers : quarts de finale ;
- en Série 2, orange pour l'avant-dernier : barrage pour le maintien ;
- rouge pour le dernier : descente (Série 1 vers Série 2, Série 2 vers Série 3).

Les autres rangs n'ont pas de liseré. La règle est celle des messages de fin de poule du Bilan (spec `bilan`), portée par la même constante, identique dans les deux pages. Une série sans règle connue n'a que le vert des quarts. Une équipe sans partie jouée n'a pas de liseré tant que sa série a des parties de poule sans score ; poules finies, elle a la zone de son rang, comme au Bilan. Le liseré est une couleur d'appoint : la légende dit ce qu'il veut dire, le rang reste écrit, et la ligne lue par un lecteur d'écran finit par sa zone en mots (« zone des quarts », « zone de barrage », « zone de descente »). En classement général, les lignes gardent le liseré de leur poule d'origine et n'ont pas de zone.

#### Scenario: Poule de six en Série 2
- **WHEN** le visiteur regarde une poule de six équipes de Série 2
- **THEN** les quatre premières ont un liseré vert, la 5e un liseré orange, la 6e un liseré rouge

#### Scenario: Poule de six en Série 1
- **WHEN** le visiteur regarde une poule de six équipes de Série 1
- **THEN** les quatre premières ont un liseré vert, la 5e aucun, la 6e un liseré rouge

#### Scenario: Classement général
- **WHEN** le visiteur choisit « Général »
- **THEN** les lignes portent le liseré de leur poule, et aucun liseré de zone

#### Scenario: Que des forfaits, poules finies
- **WHEN** les poules de la Série 1 sont finies et une équipe n'y a aucun score chiffré
- **THEN** elle ferme sa poule avec le liseré rouge de la descente

### Requirement: Légende du classement
Sous les cartes de classement de chaque série, et avant ses phases finales, la page SHALL afficher une légende. Sur grand écran, où les poules et les quarts sont côte à côte, elle passe sous eux, sur toute la largeur. Elle donne :
- en découpage par poule, une pastille par zone présente dans la série, avec ses rangs et son sens (« 1-4 Quarts », « 5 Barrage », « 6 Descente en Série 3 »), suivie de « à ce jour » tant que la série a des parties de poule sans score ;
- dans les deux découpages, le sens des colonnes et la règle : « J jouées · G gagnées · P perdues · GA goal average · Moy. points par partie (victoire 3, défaite 1), qui fait le rang, puis le goal average moyen », complétée en classement général, sans zones, par « Les 4 premiers de chaque poule vont en quarts. ».

Les couleurs des zones ont leur version sombre (spec `apparence`).

#### Scenario: Légende de la Série 2 en cours
- **WHEN** la Série 2 a des parties de poule sans score
- **THEN** sa légende porte « 1-4 Quarts », « 5 Barrage » et « 6 Descente en Série 3 », précisés « à ce jour », puis le sens des colonnes

#### Scenario: Légende en classement général
- **WHEN** le visiteur choisit « Général »
- **THEN** la légende ne porte que le sens des colonnes, la règle et « Les 4 premiers de chaque poule vont en quarts. »

### Requirement: Joueurs des équipes
Le détail déplié de chaque ligne d'équipe SHALL porter, juste après le nom officiel de l'équipe, les noms de ses joueurs, en gras et précédés d'une icône de joueurs, tels que déclarés à la ligue (composition de l'engagement), ou « Composition non déclarée à la ligue ». Les noms n'apparaissent pas sur la ligne repliée. Ils ne changent aucun rang. Si les compositions ne peuvent être chargées, le détail s'affiche sans noms plutôt que de les dire non déclarés.

#### Scenario: Équipe avec composition
- **WHEN** un visiteur ouvre le Classement puis touche la ligne d'Alpha 1
- **THEN** le détail déplié porte les noms de ses joueurs

#### Scenario: Ligne repliée
- **WHEN** un visiteur ouvre le Classement sans toucher aucune ligne
- **THEN** aucun nom de joueur n'est visible

#### Scenario: Équipe sans composition
- **WHEN** une équipe n'a déclaré aucune composition à la ligue et que le visiteur touche sa ligne
- **THEN** le détail porte « Composition non déclarée à la ligue »

### Requirement: Filtres du classement
La page SHALL proposer, dans un bloc repliable, un filtre par spécialité et un filtre par série (Série 1, Série 2), tous actifs par défaut. Replié, le bloc résume les filtres choisis (spec `programme`, « Résumé des filtres repliés »), le découpage « Général » y compris. Ces filtres masquent des cartes entières et ne changent jamais le rang d'une équipe. Le choix de spécialité, de série et de découpage MUST être retrouvé d'une visite à l'autre sur le même navigateur, sans être envoyé nulle part. Quand aucune carte ne reste, la page affiche « Aucune équipe ne correspond aux filtres. ».

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

#### Scenario: Afficher ce scénario
- **WHEN** le chemin vers les quarts d'une équipe suivie n'est ni « qualifiée quoi qu'il arrive » ni sans issue qualifiante, et que le visiteur touche « 🗺️ Afficher ce scénario »
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
