# derniers-resultats Specification

## Purpose

Répondre sur l'accueil à la première question d'un joueur après un week-end de championnat : qu'ont donné les parties ? Sans passer par Parties ni filtrer. Les résultats forment l'une des deux vues du bloc de la semaine, l'autre étant « D'ici dimanche » (spec `affiche-week-end`).

## Requirements

### Requirement: Deux vues dans un même bloc
Le bloc de la semaine SHALL porter en tête deux onglets, « Résultats du week-end » puis « D'ici dim. » suivi de la date du dimanche (par exemple « D'ici dim. 8 nov. »), qui affichent chacun leur liste à la place de l'autre. Les deux onglets tiennent sur une ligne, de 320 à 412 px de large. Du lundi au jeudi, le bloc s'ouvre sur « Résultats du week-end » ; du vendredi au dimanche, sur « D'ici dimanche ». Le choix n'est pas gardé sur l'appareil : chaque ouverture de l'accueil repart de la vue du jour. Le pied du bloc porte le lien vers la page qui prolonge la vue ouverte : « Classement → » pour les résultats, « Tout le programme → » pour les parties à venir. Quand aucun résultat n'est à montrer, il n'y a pas d'onglets : le bloc ne montre que « D'ici dimanche », sous son titre.

#### Scenario: Lundi
- **WHEN** un visiteur ouvre l'accueil un lundi et que des parties ont été jouées le week-end écoulé
- **THEN** le bloc s'ouvre sur l'onglet « Résultats du week-end », et l'onglet « D'ici dim. 8 nov. » montre les parties à venir

#### Scenario: Vendredi
- **WHEN** un visiteur ouvre l'accueil un vendredi
- **THEN** le bloc s'ouvre sur « D'ici dimanche », et l'onglet « Résultats du week-end » montre les parties depuis le vendredi précédent

#### Scenario: Aucun résultat
- **WHEN** aucune partie n'est retenue pour les résultats
- **THEN** le bloc n'a pas d'onglets et ne montre que les parties d'ici dimanche

### Requirement: Parties retenues
Les résultats SHALL lister, tous lieux et toutes séries confondus, les parties dont la date effective (la date de report si elle existe, sinon la date d'origine) va du dernier vendredi passé, aujourd'hui exclu, jusqu'à aujourd'hui inclus : celles qui ont un score, et celles des jours passés qui n'en ont pas encore. Du lundi au jeudi, ce vendredi est celui du week-end écoulé ; le vendredi, celui de la semaine d'avant ; le samedi et le dimanche, celui du week-end en cours. Une partie du jour sans score n'y figure pas : elle est encore à venir et reste dans « D'ici dimanche ». Une partie dont un adversaire est encore à désigner n'y figure pas non plus. Les parties sont rangées dans l'ordre chronologique.

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

#### Scenario: Adversaires à désigner
- **WHEN** un quart de finale prévu samedi oppose encore deux équipes à désigner
- **THEN** il ne figure pas dans le bloc

### Requirement: Ligne d'un résultat
Chaque partie SHALL tenir sur une ligne : le jour, les deux équipes sous leur nom court avec le score entre elles (celui de l'équipe qui reçoit en premier), et la série. Le nom de l'équipe perdante est en retrait. Un score publié qui n'est pas un nombre (un forfait, par exemple) s'affiche tel que la ligue l'écrit, sans perdant en retrait. Une partie passée sans score affiche « vs » à la place du score et, sur une seconde ligne, « Score pas encore publié par la ligue ».

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
La vue « Résultats du week-end » SHALL mener au Classement par le lien de son pied : après les résultats, le joueur veut voir ce qu'ils changent.

#### Scenario: Après les résultats
- **WHEN** le visiteur touche « Classement → » sous les résultats
- **THEN** la page Classement s'ouvre

### Requirement: Partage des résultats
Le pied de la vue « Résultats du week-end » SHALL porter le bouton « Partager », qui partage ces résultats comme le bloc « D'ici dimanche » partage ses parties (spec `affiche-week-end`, « Partage des parties ») : une image et un texte. L'image reprend le titre « Résultats du week-end » et les parties regroupées sous leur jour, avec le score, le perdant en retrait, la série, et la mention du score attendu. Le texte donne, sous chaque jour, la série, les noms complets et le score, ou « (score pas encore publié) », puis le lien vers le Classement.

#### Scenario: Poster les résultats dans le groupe du club
- **WHEN** le visiteur touche « Partager » sous les résultats, sur son téléphone
- **THEN** la feuille de partage s'ouvre avec l'image des résultats et leur texte, à envoyer dans un groupe WhatsApp
