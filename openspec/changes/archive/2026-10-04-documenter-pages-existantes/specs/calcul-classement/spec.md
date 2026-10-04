## Purpose

Fixer la règle unique qui classe les équipes d'une poule, pour que l'accueil, la page Mon équipe et la page Classement donnent toujours le même rang de poule à une même équipe.

## ADDED Requirements

### Requirement: Parties prises en compte
Le classement SHALL ne compter que les parties de la phase de poules des séries 1 et 2 dont les deux scores sont renseignés et numériques. Les phases finales MUST NOT entrer dans le classement, parce qu'elles se jouent à élimination directe et qu'une moyenne de points par partie n'y aurait pas de sens. Une partie contre un club fictif de la ligue (« Equipe à désigner ») n'est pas comptée, et ce club n'apparaît jamais dans un classement.

#### Scenario: Partie de phase finale
- **WHEN** une équipe gagne un quart de finale
- **THEN** son classement de poule ne change pas

#### Scenario: Partie sans score
- **WHEN** une partie de poule est passée mais n'a pas de score publié
- **THEN** elle ne compte pour aucune des deux équipes

### Requirement: Barème
Une victoire SHALL rapporter 3 points et une défaite 1 point, conformément au barème de la ligue. Un match nul, qui ne devrait pas survenir puisqu'une partie se joue jusqu'à 40, rapporte 2 points.

#### Scenario: Deux victoires, une défaite
- **WHEN** une équipe a gagné deux parties de poule et en a perdu une
- **THEN** elle totalise 7 points

### Requirement: Ordre du classement
Les équipes d'une poule SHALL être classées par moyenne de points par partie jouée, décroissante, puis à égalité par goal average moyen par partie jouée, décroissant, puis par ordre alphabétique du nom d'équipe. Le classement MUST diviser par le nombre de parties jouées plutôt que totaliser, parce que les poules n'avancent pas toutes au même rythme : un total brut avantagerait l'équipe qui a joué le plus tôt.

#### Scenario: Équipe qui a moins joué
- **WHEN** l'équipe A a 7 points en 3 parties et l'équipe B 8 points en 4 parties
- **THEN** A (2,33 points par partie) est classée devant B (2,00), bien qu'elle ait moins de points

#### Scenario: Égalité de moyenne
- **WHEN** deux équipes ont la même moyenne de points par partie
- **THEN** celle qui a le meilleur goal average moyen est classée devant

### Requirement: Équipes sans partie jouée
Une équipe programmée en phase de poules qui n'a encore aucune partie comptée SHALL figurer au classement, après toutes les équipes qui ont joué, par ordre alphabétique, et sans rang, pour que la poule apparaisse complète dès le début de saison.

#### Scenario: Début de saison
- **WHEN** seules deux des six équipes d'une poule ont joué
- **THEN** la poule montre six équipes, les deux qui ont joué classées 1re et 2e, les quatre autres ensuite, sans rang

### Requirement: Rang
Le rang d'une équipe qui a joué SHALL être sa position dans l'ordre du classement de sa poule, sans ex aequo : deux équipes ne partagent jamais un rang.

#### Scenario: Égalité parfaite
- **WHEN** deux équipes ont la même moyenne et le même goal average moyen
- **THEN** l'ordre alphabétique les départage et elles ont deux rangs distincts

### Requirement: Qualifiés de poule
Le site SHALL considérer les quatre premières équipes de chaque poule comme qualifiées pour les quarts de finale.

#### Scenario: Poule de six équipes
- **WHEN** une poule compte six équipes
- **THEN** les équipes classées de la 1re à la 4e place sont les qualifiées

### Requirement: Même classement sur tout le site
Toute page qui affiche le rang actuel d'une équipe dans sa poule ou s'en sert MUST appliquer ces règles à l'identique : l'accueil (bloc Mes équipes et étiquettes de l'affiche du week-end), la page Mon équipe et la page Classement en découpage par poule. Avec les mêmes données, une équipe a le même rang de poule partout.

#### Scenario: Rang sur trois pages
- **WHEN** un visiteur compare le rang d'une équipe sur l'accueil, sur sa page Mon équipe et sur la page Classement vue par poule, avec les mêmes données chargées
- **THEN** le rang et la taille de la poule sont identiques sur les trois pages
