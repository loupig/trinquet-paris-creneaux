# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Trait des qualifiés
**Reason**: Le liseré vert des quatre premiers (« Zones de fin de poule ») dit la même chose, avec en plus le barrage et la descente, sans prendre une ligne de plus par carte.
**Migration**: Aucune donnée. La légende explique les couleurs.
