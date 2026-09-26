# affiche-week-end Specification

## Purpose

Signaler au visiteur de l'accueil les parties du prochain week-end qui valent le déplacement, et lui dire en quelques mots pourquoi chacune a été retenue.

## Requirements

### Requirement: Fenêtre du week-end
L'affiche SHALL porter sur un seul week-end, du vendredi au dimanche inclus : le premier, à partir d'aujourd'hui, qui compte au moins une partie à venir, tous lieux confondus. Une partie à venir est une partie sans score dont la date effective (la date de report si elle existe, sinon la date d'origine) est aujourd'hui ou plus tard. Une partie du jour reste à venir toute la journée.

#### Scenario: Week-end en cours
- **WHEN** on est un samedi et qu'une partie sans score est programmée le dimanche
- **THEN** l'affiche porte sur ce week-end-là, du vendredi précédent au dimanche

#### Scenario: Week-end vide
- **WHEN** aucune partie n'est programmée le week-end qui vient, mais que le suivant en compte
- **THEN** l'affiche porte sur le week-end suivant

#### Scenario: Partie déjà jouée
- **WHEN** une partie du week-end a déjà un score
- **THEN** elle ne figure pas dans l'affiche

#### Scenario: Partie reportée
- **WHEN** une partie prévue ce week-end a été reportée à une date ultérieure
- **THEN** elle est prise en compte à sa nouvelle date, pas à la date d'origine

### Requirement: Critère phase finale
Une partie SHALL être retenue au titre de la phase finale quand elle appartient à l'une des phases 1/32e de finale, 1/16e, 1/8e, 1/4, 1/2 ou finale. Les barrages ne sont pas retenus à ce titre. Une partie dont l'un des adversaires n'est pas encore connu reste retenue.

#### Scenario: Demi-finale
- **WHEN** une 1/2 finale est programmée ce week-end
- **THEN** elle est retenue avec l'étiquette de sa phase, par exemple « 1/2 finale »

#### Scenario: Barrage
- **WHEN** un barrage est programmé ce week-end et ne répond à aucun autre critère
- **THEN** il n'est pas retenu

#### Scenario: Adversaire à désigner
- **WHEN** une finale est programmée contre une équipe « à désigner »
- **THEN** elle est retenue

### Requirement: Critère choc de tête
Une partie de poule SHALL être retenue comme choc de tête quand elle oppose le 1er et le 2e du classement actuel de la même poule. Le classement est celui de la page Classement (points par partie jouée, puis goal average moyen).

#### Scenario: 1er contre 2e
- **WHEN** le 1er et le 2e d'une poule se rencontrent ce week-end, et que chacun a joué au moins 1 partie de poule
- **THEN** la partie est retenue avec l'étiquette « Choc pour la 1re place »

#### Scenario: 1er contre 3e
- **WHEN** le 1er et le 3e d'une poule se rencontrent
- **THEN** la partie n'est pas retenue à ce titre

### Requirement: Critère qualification
Une partie de poule SHALL être retenue pour la qualification quand les deux équipes sont classées entre le 3e et le 6e de leur poule, l'une dans les places qualificatives (4e ou mieux) et l'autre en dehors. Ce critère ne s'applique qu'aux poules de plus de 4 équipes.

#### Scenario: 4e contre 5e
- **WHEN** le 4e et le 5e d'une poule de 6 équipes se rencontrent, et que chacun a joué au moins 1 partie de poule
- **THEN** la partie est retenue avec l'étiquette « Place en quart en jeu »

#### Scenario: Les deux équipes qualifiées
- **WHEN** le 3e et le 4e d'une poule se rencontrent
- **THEN** la partie n'est pas retenue à ce titre

#### Scenario: Poule de 4 équipes
- **WHEN** une poule compte 4 équipes, toutes qualifiées
- **THEN** aucune de ses parties n'est retenue à ce titre

### Requirement: Classement trop jeune
Les critères choc de tête et qualification SHALL ne s'appliquer que lorsque chacune des deux équipes de la partie a joué au moins 1 partie de poule. En deçà, le classement n'a pas encore de sens.

#### Scenario: Première journée
- **WHEN** le 1er et le 2e d'une poule se rencontrent, mais que l'un d'eux n'a encore joué aucune partie
- **THEN** la partie n'est pas retenue comme choc de tête

### Requirement: Critère derby
Une partie SHALL être retenue comme derby quand elle oppose les deux clubs d'une rivalité reconnue, quel que soit le club qui reçoit et quelle que soit la série. Les rivalités reconnues sont : Paris Euskal Pilota contre Pilotari, et Pilotari contre Chatillon.

#### Scenario: Derby en 2e série
- **WHEN** une équipe de Pilotari reçoit une équipe de Paris Euskal Pilota en 2e série
- **THEN** la partie est retenue avec l'étiquette « Derby »

#### Scenario: Pilotari contre Chatillon
- **WHEN** une équipe de Chatillon reçoit une équipe de Pilotari, dans n'importe quelle série
- **THEN** la partie est retenue avec l'étiquette « Derby »

### Requirement: Critère même club
Une partie SHALL être retenue quand elle oppose deux équipes du même club. Les clubs fictifs de la ligue (dont « Equipe à désigner ») ne comptent pas comme un même club.

#### Scenario: Deux équipes d'un club
- **WHEN** l'équipe 1 d'un club rencontre l'équipe 2 du même club
- **THEN** la partie est retenue avec l'étiquette « Duel interne »

#### Scenario: Deux adversaires à désigner
- **WHEN** une partie oppose deux équipes « à désigner »
- **THEN** elle n'est pas retenue à ce titre

### Requirement: Une étiquette par partie
Chaque partie retenue SHALL porter une seule étiquette, celle du critère le plus fort, dans cet ordre décroissant : phase finale, choc de tête, qualification, derby, même club.

#### Scenario: Derby en demi-finale
- **WHEN** une 1/2 finale oppose Paris Euskal Pilota et Pilotari
- **THEN** la partie apparaît une seule fois, avec l'étiquette « 1/2 finale »

### Requirement: Trois affiches au maximum
L'affiche SHALL présenter au plus 3 parties. Quand plus de 3 parties sont retenues, les 3 plus fortes sont gardées, selon l'ordre des critères puis l'ordre chronologique. Les parties gardées sont présentées dans l'ordre chronologique.

#### Scenario: Cinq parties retenues
- **WHEN** une finale, un choc de tête et trois duels internes sont retenus pour le même week-end
- **THEN** l'affiche présente la finale, le choc de tête et le premier duel interne dans le temps, triés par date et heure

### Requirement: Contenu d'une affiche
Chaque partie présentée SHALL indiquer le jour et l'heure, les deux équipes sous leur nom court, la série, le lieu et l'étiquette qui explique sa sélection.

#### Scenario: Lecture d'une affiche
- **WHEN** un visiteur ouvre l'accueil et qu'une partie est retenue
- **THEN** il voit dans la même entrée quand, qui, où, et pourquoi elle est à voir, sans défilement horizontal sur un écran de 390 px

### Requirement: Tuile absente sans affiche
La tuile SHALL ne pas apparaître quand aucune partie du week-end ne répond à un critère. Elle ne remplace jamais une autre tuile de l'accueil.

#### Scenario: Week-end sans enjeu
- **WHEN** les parties du week-end ne répondent à aucun critère
- **THEN** l'accueil s'affiche sans la tuile, exactement comme aujourd'hui

#### Scenario: Fin de saison
- **WHEN** plus aucune partie n'est à venir dans le calendrier
- **THEN** la tuile n'apparaît pas

### Requirement: Accès au programme
La tuile SHALL mener au programme complet, comme les autres tuiles de l'accueil mènent à leur page.

#### Scenario: Clic sur la tuile
- **WHEN** le visiteur touche la tuile
- **THEN** la page Programme s'ouvre
