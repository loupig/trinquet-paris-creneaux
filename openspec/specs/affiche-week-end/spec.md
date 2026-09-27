# affiche-week-end Specification

## Purpose

Montrer sur l'accueil toutes les parties d'ici le dimanche du prochain week-end joué, et faire ressortir celles qui valent le déplacement en disant en quelques mots pourquoi chacune a été retenue.

## Requirements

### Requirement: Fenêtre du week-end
Le bloc SHALL couvrir toutes les parties à venir d'aujourd'hui jusqu'au dimanche inclus du premier week-end (vendredi à dimanche) qui compte au moins une partie à venir, tous lieux confondus. Les parties de semaine qui précèdent ce week-end en font partie. Quand plus aucun week-end ne compte de partie mais qu'il reste des parties en semaine, la fenêtre couvre toutes les parties à venir. Une partie à venir est une partie sans score dont la date effective (la date de report si elle existe, sinon la date d'origine) est aujourd'hui ou plus tard. Une partie du jour reste à venir toute la journée.

#### Scenario: Week-end en cours
- **WHEN** on est un samedi et qu'une partie sans score est programmée le dimanche
- **THEN** la fenêtre va d'aujourd'hui à ce dimanche

#### Scenario: Partie en semaine avant le week-end
- **WHEN** on est lundi, qu'une partie est programmée mardi et d'autres le week-end suivant
- **THEN** la partie du mardi figure dans le bloc, avant celles du week-end

#### Scenario: Week-end vide
- **WHEN** aucune partie n'est programmée le week-end qui vient, mais que le suivant en compte
- **THEN** la fenêtre s'étend jusqu'au dimanche du week-end suivant, parties de semaine intermédiaires comprises

#### Scenario: Plus de week-end joué
- **WHEN** il ne reste que des parties en semaine dans le calendrier
- **THEN** la fenêtre couvre toutes ces parties

#### Scenario: Partie déjà jouée
- **WHEN** une partie de la fenêtre a déjà un score
- **THEN** elle ne figure pas dans le bloc

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

### Requirement: Contenu d'une affiche
Chaque partie du bloc SHALL indiquer, sur une première ligne, le jour et l'heure, les deux équipes sous leur nom court et la série. Une partie à voir SHALL avoir en plus une seconde ligne avec l'étiquette qui explique sa sélection et le lieu. Une partie ordinaire n'a pas de seconde ligne.

#### Scenario: Lecture d'une affiche
- **WHEN** un visiteur ouvre l'accueil et qu'une partie de la fenêtre répond à un critère
- **THEN** il voit dans la même entrée quand, qui, où, et pourquoi elle est à voir, sans défilement horizontal sur un écran de 390 px

#### Scenario: Lecture d'une partie ordinaire
- **WHEN** une partie de la fenêtre ne répond à aucun critère
- **THEN** elle tient sur une seule ligne, sans étiquette ni lieu

### Requirement: Accès au programme
La tuile SHALL mener au programme complet, comme les autres tuiles de l'accueil mènent à leur page.

#### Scenario: Clic sur la tuile
- **WHEN** le visiteur touche la tuile
- **THEN** la page Programme s'ouvre

### Requirement: Toutes les parties de la fenêtre
Le bloc SHALL lister toutes les parties à venir de la fenêtre, qu'elles soient à voir ou non, dans l'ordre chronologique. Les parties à voir restent à leur place chronologique et se distinguent par leur présentation, sans être regroupées ni remontées en tête.

#### Scenario: Week-end mêlant parties ordinaires et parties à voir
- **WHEN** la fenêtre compte 6 parties dont 2 répondent à un critère
- **THEN** le bloc liste les 6 parties par date et heure, et seules les 2 parties à voir portent une étiquette

#### Scenario: Aucune partie à voir
- **WHEN** aucune partie de la fenêtre ne répond à un critère
- **THEN** le bloc liste toutes les parties de la fenêtre, sans aucune étiquette

### Requirement: Bloc toujours présent
Le bloc « D'ici dimanche » SHALL toujours figurer sur l'accueil. Son titre SHALL porter la date du dimanche qui clôt la fenêtre, par exemple « D'ici dimanche 4 oct. ». Quand plus aucune partie n'est à venir, il affiche le message « Plus aucune rencontre à venir dans le calendrier publié par la ligue. ».

#### Scenario: Titre daté
- **WHEN** on est lundi 28 septembre et que le premier week-end joué se termine le dimanche 4 octobre
- **THEN** le titre du bloc est « D'ici dimanche 4 oct. »

#### Scenario: Fin de saison
- **WHEN** plus aucune partie n'est à venir dans le calendrier
- **THEN** le bloc reste affiché, avec le message de fin de calendrier à la place des parties

### Requirement: Parties de mes équipes repérées
Dans le bloc « D'ici dimanche », une partie jouée par l'une des équipes suivies SHALL se distinguer des autres par un repère visuel en marge, sans ajouter d'étiquette ni changer l'étiquette « à voir », et sans quitter l'ordre chronologique.

#### Scenario: Ma partie ce dimanche
- **WHEN** une équipe suivie joue dimanche et que cette partie n'est pas à voir
- **THEN** sa ligne porte le repère de marge, sans étiquette

#### Scenario: Ma partie est aussi à voir
- **WHEN** une partie d'une équipe suivie est aussi un derby
- **THEN** elle porte à la fois le repère de marge et l'étiquette « Derby »

#### Scenario: Sans équipe suivie
- **WHEN** le visiteur ne suit aucune équipe
- **THEN** aucune ligne ne porte de repère, et le bloc est identique à aujourd'hui
