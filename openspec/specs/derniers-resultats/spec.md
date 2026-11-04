# derniers-resultats Specification

## Purpose

Répondre sur l'accueil, du lundi au jeudi, à la première question d'un joueur après un week-end de championnat : qu'ont donné les parties ? Sans passer par Parties ni filtrer.

## Requirements

### Requirement: Jours d'affichage
Le bloc « Derniers résultats » SHALL n'apparaître sur l'accueil que du lundi au jeudi. Du vendredi au dimanche, le bloc « D'ici dimanche » (spec `affiche-week-end`) suffit.

#### Scenario: Lundi
- **WHEN** un visiteur ouvre l'accueil un lundi et que des parties ont été jouées le week-end écoulé
- **THEN** il voit le bloc « Derniers résultats »

#### Scenario: Vendredi
- **WHEN** un visiteur ouvre l'accueil un vendredi
- **THEN** le bloc « Derniers résultats » n'apparaît pas

### Requirement: Parties retenues
Le bloc SHALL lister, tous lieux et toutes séries confondus, les parties dont la date effective (la date de report si elle existe, sinon la date d'origine) va du vendredi du week-end écoulé jusqu'à aujourd'hui inclus : celles qui ont un score, et celles des jours passés qui n'en ont pas encore. Une partie du jour sans score n'y figure pas : elle est encore à venir et reste dans « D'ici dimanche ». Les parties sont rangées dans l'ordre chronologique. Quand aucune partie n'est retenue, le bloc n'apparaît pas.

#### Scenario: Week-end écoulé
- **WHEN** on est mardi et que des parties ont été jouées vendredi, samedi et dimanche
- **THEN** le bloc les liste toutes, de vendredi à dimanche

#### Scenario: Partie de semaine
- **WHEN** on est jeudi et qu'une partie a été jouée mercredi
- **THEN** elle figure dans le bloc, après celles du week-end

#### Scenario: Partie plus ancienne
- **WHEN** une partie a été jouée le jeudi qui précède le week-end écoulé
- **THEN** elle ne figure pas dans le bloc

#### Scenario: Partie reportée
- **WHEN** une partie prévue samedi a été reportée à une date ultérieure
- **THEN** elle ne figure pas dans le bloc

#### Scenario: Aucune partie le week-end écoulé
- **WHEN** aucune partie n'a eu lieu depuis vendredi
- **THEN** le bloc n'apparaît pas

### Requirement: Ligne d'un résultat
Chaque partie SHALL tenir sur une ligne : le jour, les deux équipes sous leur nom court avec le score entre elles (celui de l'équipe qui reçoit en premier), et la série. Le nom de l'équipe perdante est en retrait. Une partie passée sans score affiche « vs » à la place du score et, sur une seconde ligne, « Score pas encore publié par la ligue ».

#### Scenario: Lecture d'un résultat
- **WHEN** Alpha 1 a reçu Bravo 1 samedi et gagné 40 à 25
- **THEN** la ligne se lit « sam. 31 oct. Alpha 1 40-25 Bravo 1 », Bravo 1 en retrait, sans défilement horizontal sur un écran de 390 px

#### Scenario: Score attendu
- **WHEN** une partie de dimanche n'a pas encore de score le lundi
- **THEN** sa ligne affiche « vs » et la mention « Score pas encore publié par la ligue »

### Requirement: Parties de mes équipes repérées
Une partie jouée par l'une des équipes suivies SHALL porter le même repère en marge que dans « D'ici dimanche », sans quitter l'ordre chronologique.

#### Scenario: Mon équipe a joué samedi
- **WHEN** une équipe suivie a joué samedi
- **THEN** sa ligne porte le repère de marge

### Requirement: Accès au classement
Le bloc SHALL mener au Classement : après les résultats, le joueur veut voir ce qu'ils changent.

#### Scenario: Toucher le bloc
- **WHEN** le visiteur touche le bloc « Derniers résultats »
- **THEN** la page Classement s'ouvre
