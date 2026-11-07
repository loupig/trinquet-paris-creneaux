# bilan Specification

## Purpose

Fêter la fin de la phase de poules par une page de bilan : quelques chiffres de la saison, des trophées pour chambrer au comptoir, le classement et les résultats de chaque poule, et le tableau final qui en découle. Une page qu'on parcourt et qu'on montre, ouverte depuis le Classement.

## Requirements

### Requirement: Page ouverte depuis le Classement
La page `bilan.html` SHALL n'être annoncée que par un lien « Bilan de la phase de poules » de la page Classement, et MUST NOT ajouter d'entrée à la barre d'onglets. Elle porte la barre d'onglets du site avec Classement comme onglet courant, les boutons flottants du haut (Site de la ligue, Rafraîchir, thème, compteur), le bouton « ↑ » et, en tête du contenu, un lien de retour vers le Classement. Elle porte le même aperçu de partage que les autres pages (spec `decouvrir`).

#### Scenario: Depuis le Classement
- **WHEN** un visiteur touche « Bilan de la phase de poules » sur la page Classement
- **THEN** le bilan s'ouvre, la barre d'onglets a toujours cinq entrées et l'onglet Classement est marqué courant

### Requirement: Données et classement
Le bilan SHALL lire les rencontres et les clubs comme le Classement, avec le même cache, les mêmes bandeaux d'échec et la même date de synchronisation (spec `donnees-api`), et classer chaque poule selon la spec `calcul-classement`. Il MUST NOT demander les compositions ni les licenciés et n'affiche aucun nom de joueur : il ne nomme que des équipes.

#### Scenario: Pas de joueurs
- **WHEN** un visiteur ouvre le bilan
- **THEN** seules les tables des rencontres et des clubs sont demandées, et aucun nom de joueur n'apparaît

#### Scenario: Premier chargement impossible
- **WHEN** le bilan est ouvert pour la première fois et que la source des données ne répond pas
- **THEN** la page n'affiche qu'un bandeau d'erreur « Impossible d'afficher le bilan »

### Requirement: Affiche de la phase de poules
En tête, la page SHALL afficher une affiche sur fond foncé qui dit où en sont les poules : « Les poules ont rendu leur verdict » avec le nombre de parties jouées et d'équipes qualifiées quand toutes les parties de poule ont un score, sinon « Dernière ligne droite » avec le nombre de parties restantes, la date de la dernière prévue et la mention d'un bilan provisoire. Quatre chiffres suivent, sur toutes les séries : les parties jouées et le nombre d'équipes, les points marqués et leur moyenne par partie, l'écart moyen entre vainqueur et vaincu, la part de parties serrées (gagnées de 5 points ou moins).

#### Scenario: Poules en cours
- **WHEN** des parties de poule restent sans score
- **THEN** l'affiche titre « Dernière ligne droite » et parle d'un bilan provisoire

#### Scenario: Poules terminées
- **WHEN** toutes les parties de poule ont un score
- **THEN** l'affiche titre « Les poules ont rendu leur verdict » et donne le nombre de parties jouées et d'équipes qualifiées

### Requirement: Mes équipes au bilan
Pour chaque équipe suivie (spec `mes-equipes`), la page SHALL donner sous l'affiche son rang de poule, son bilan (victoires, défaites, moyenne, goal average) et son sort : qualifiée avec son quart et son adversaire, ou non qualifiée ; « pour l'instant » tant que sa série a des parties de poule sans score. Sans équipe suivie, le bloc n'apparaît pas.

#### Scenario: Équipe suivie qualifiée
- **WHEN** l'équipe suivie est 4e de la poule 1 et que des parties restent
- **THEN** le bloc dit « 4e de la poule 1 · en quarts pour l'instant » et nomme son adversaire de quart

### Requirement: Trophées d'une série
Pour chaque série, la page SHALL décerner, d'après les seuls scores réels de poule : le meilleur bilan (première au classement de la série), la meilleure attaque (points marqués par partie), la meilleure défense (points encaissés par partie), les équipes invaincues s'il y en a, la plus longue série de victoires d'affilée (deux au moins, si elle n'est pas celle d'une invaincue), la plus large victoire, la partie la plus serrée et la partie la plus prolifique (le plus de points à deux). À égalité, l'ordre du classement départage. Un trophée qui revient à une équipe suivie est mis en évidence.

#### Scenario: Plus large victoire
- **WHEN** la plus grande différence de score d'une série est un 40–18
- **THEN** le trophée « Plus large victoire » donne la partie, vainqueur en premier, et « 22 points d'écart »

### Requirement: Poules et résultats
Pour chaque poule, la page SHALL afficher le classement, avec le trait des qualifiés sous la 4e équipe (« En quarts pour l'instant » tant que la poule n'est pas finie, « Qualifiés pour les quarts » ensuite), l'équipe suivie mise en évidence, puis les parties de la poule, repliées, dans l'ordre des dates : score avec le vainqueur en gras, « à jouer » pour une partie à venir et « sans score » pour une partie passée sans résultat publié.

#### Scenario: Déplier les résultats
- **WHEN** le visiteur touche « Les 15 parties de la poule »
- **THEN** les quinze parties de la poule se déplient dans la page, par date

### Requirement: Tableau final
Pour chaque série à deux poules, la page SHALL afficher le tableau des quarts tel que le Classement le calcule sans simulation (spec `classement`, « Prévision des quarts de finale ») : mêmes croisements, mêmes étiquettes de poule, même arbre vers les demies et la finale, mêmes chances de victoire. La carte porte « Prévision » tant qu'une partie de poule de la série reste sans score, « Poules terminées » ensuite, rappelle que le tableau officiel reste celui de la ligue, et désigne le quart le plus indécis.

#### Scenario: Même tableau qu'au Classement
- **WHEN** un visiteur compare le tableau final du bilan et les quarts du Classement sans simulation, avec les mêmes données
- **THEN** les quatre quarts opposent les mêmes équipes avec les mêmes pourcentages
