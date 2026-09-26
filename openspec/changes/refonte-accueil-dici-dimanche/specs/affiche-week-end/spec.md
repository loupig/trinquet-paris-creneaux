# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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

### Requirement: Contenu d'une affiche
Chaque partie du bloc SHALL indiquer, sur une première ligne, le jour et l'heure, les deux équipes sous leur nom court et la série. Une partie à voir SHALL avoir en plus une seconde ligne avec l'étiquette qui explique sa sélection et le lieu. Une partie ordinaire n'a pas de seconde ligne.

#### Scenario: Lecture d'une affiche
- **WHEN** un visiteur ouvre l'accueil et qu'une partie de la fenêtre répond à un critère
- **THEN** il voit dans la même entrée quand, qui, où, et pourquoi elle est à voir, sans défilement horizontal sur un écran de 390 px

#### Scenario: Lecture d'une partie ordinaire
- **WHEN** une partie de la fenêtre ne répond à aucun critère
- **THEN** elle tient sur une seule ligne, sans étiquette ni lieu

## REMOVED Requirements

### Requirement: Trois affiches au maximum
**Reason**: Le bloc liste désormais toutes les parties de la fenêtre ; un plafond sur les parties à voir cacherait une mise en avant sans rien retirer de la liste.
**Migration**: Aucune. Toutes les parties à voir de la fenêtre portent leur étiquette.

### Requirement: Tuile absente sans affiche
**Reason**: Le bloc remplace « Prochaines parties » et doit donc toujours être là, même sans partie à voir.
**Migration**: Remplacé par l'exigence « Bloc toujours présent ».
