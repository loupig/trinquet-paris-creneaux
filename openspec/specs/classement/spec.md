# classement Specification

## Purpose

Afficher le classement de chaque poule des championnats, ou un classement général par série, selon la règle commune de classement du site.

## Requirements

### Requirement: Règle rappelée en tête
La page SHALL rappeler en tête qu'elle ne classe que la phase de poules, avec le barème (victoire 3 points, défaite 1 point) et le critère (total de points divisé par le nombre de parties jouées, puis goal average moyen). Le classement suit la spec `calcul-classement`. Les phases finales n'apparaissent pas sur la page.

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
La page SHALL proposer, dans un bloc repliable, un filtre par spécialité et un filtre par série (Série 1, Série 2), tous actifs par défaut. Ces filtres masquent des cartes entières et ne changent jamais le rang d'une équipe. Le choix de spécialité et de série MUST être retrouvé d'une visite à l'autre sur le même navigateur, sans être envoyé nulle part. Quand aucune carte ne reste, la page affiche « Aucune équipe ne correspond aux filtres. ».

#### Scenario: Une seule série
- **WHEN** le visiteur désactive « Série 1 »
- **THEN** seules les cartes de série 2 restent, avec les mêmes rangs qu'avant

#### Scenario: Retour sur la page
- **WHEN** le visiteur a désactivé « Série 1 » puis revient le lendemain
- **THEN** la série 1 est toujours masquée
