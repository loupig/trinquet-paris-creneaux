# classement Specification

## Purpose

Afficher le classement de chaque poule des championnats, ou un classement général par série, selon la règle commune de classement du site.

## Requirements

### Requirement: Règle rappelée en tête
La page SHALL rappeler en tête qu'elle classe la phase de poules, avec le barème (victoire 3 points, défaite 1 point) et le critère (total de points divisé par le nombre de parties jouées, puis goal average moyen). Le classement suit la spec `calcul-classement`. Les résultats des phases finales n'apparaissent pas sur la page : seule la prévision des quarts, déduite du classement des poules, y figure.

#### Scenario: Ouverture de la page
- **WHEN** un visiteur ouvre la page Classement
- **THEN** l'en-tête rappelle le barème et le critère de classement

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
Sous les cartes de chaque série, la page SHALL afficher une carte « Phases finales · 1/4 de finale » qui déduit les quarts du classement des poules, réel ou simulé : le 1er de la poule 1 contre le 4e de la poule 2, le 2e de la poule 1 contre le 3e de la poule 2, le 3e de la poule 1 contre le 2e de la poule 2, le 4e de la poule 1 contre le 1er de la poule 2. Chaque place donne l'équipe et son rang de poule, ou « À déterminer » quand ce rang n'est occupé par aucune équipe ayant joué. La carte porte « Prévision » tant qu'une partie de poule de la série reste sans score, « Simulation » quand toutes les parties restantes sont simulées, et « Poules terminées » sinon, en rappelant que le tableau officiel reste celui de la ligue. Une équipe suivie depuis l'accueil y est mise en évidence. Une série qui n'a pas exactement deux poules n'a pas de tableau, seulement une note qui le dit.

#### Scenario: Poules en cours
- **WHEN** la série 1 a deux poules et des parties de poule sans score
- **THEN** sa carte des quarts, marquée « Prévision », oppose le 1er de la poule 1 au 4e de la poule 2 selon le classement actuel, et dit combien de parties restent

### Requirement: Simulation des parties restantes
Sous la prévision des quarts, la page SHALL proposer, replié par défaut, la liste des parties de poule de la série encore sans score. Pour chacune, le visiteur peut toucher le vainqueur, ce qui simule 40–30, ou saisir les deux scores. Toucher à nouveau le vainqueur choisi annule la simulation de la partie. Chaque résultat simulé complet MUST être pris en compte aussitôt dans le classement des poules et dans les quarts, sans faire perdre le champ en cours de saisie. Un bandeau signale qu'une simulation est en cours et permet de l'effacer. La simulation MUST NOT remplacer un score réel, et elle n'est ni enregistrée ni envoyée : elle disparaît au rechargement de la page.

#### Scenario: Simuler une victoire
- **WHEN** le visiteur touche une équipe dans une partie restante
- **THEN** la partie compte comme gagnée 40–30 par cette équipe, le classement de sa poule et les quarts sont recalculés, et le bandeau « Simulation en cours » apparaît

#### Scenario: Rechargement
- **WHEN** le visiteur a simulé des résultats puis recharge la page
- **THEN** le classement et les quarts ne reposent plus que sur les scores réels
