## Purpose

Aider à trouver une date de remplacement pour une partie non jouée au Trinquet Paris : montrer les créneaux de championnat encore disponibles d'ici la fin de la phase, signaler les jours où l'une des deux équipes joue déjà, et préparer le message à envoyer à l'adversaire.

## ADDED Requirements

### Requirement: Partie désignée dans l'adresse
La page SHALL porter sur la partie désignée par son identifiant dans l'adresse (`report.html?oid=<identifiant>`). Elle s'ouvre depuis le bouton de report de la page Parties ou de la page Mon équipe. Sans partie utilisable, elle MUST afficher un message à la place de toute date, dans cet ordre de vérification :
- aucun identifiant : « Aucune partie indiquée » ;
- identifiant inconnu : « Partie introuvable » ;
- partie qui a un score : « Partie déjà jouée », avec le score ;
- partie qui ne se joue pas au Trinquet Paris : « Lieu hors périmètre », parce que la page ne connaît la grille d'aucun autre lieu.

Chacun de ces messages propose de revenir à la page Parties. Une partie dont la date est passée sans score reste traitée, avec un avertissement « Date déjà passée » qui précise que les dates proposées partent d'aujourd'hui.

#### Scenario: Ouverture sans identifiant
- **WHEN** un visiteur ouvre la page sans identifiant de partie
- **THEN** la page affiche « Aucune partie indiquée » et un lien vers la page Parties, sans aucune date

#### Scenario: Partie dans un autre trinquet
- **WHEN** l'identifiant désigne une partie sans score prévue dans un autre lieu
- **THEN** la page rappelle la partie et affiche « Lieu hors périmètre », sans aucune date

#### Scenario: Partie non jouée la semaine dernière
- **WHEN** l'identifiant désigne une partie du Trinquet Paris passée sans score
- **THEN** la page avertit « Date déjà passée » et propose des dates à partir d'aujourd'hui

### Requirement: Rappel de la partie
La page SHALL rappeler la partie concernée : les deux équipes, la série et la poule ou la phase, la date et l'heure actuelles (date de report comprise), et le lieu. Quand ce créneau n'appartient pas à la grille de championnat, la page précise qu'il n'apparaît pas dans le tableau.

#### Scenario: Partie de poule
- **WHEN** la page s'ouvre pour une partie de poule prévue un dimanche à 15h
- **THEN** elle affiche les deux équipes, « Série 1 · Poule 2 » et « Actuellement le dimanche … à 15h »

### Requirement: Horizon de recherche
La page SHALL chercher les créneaux à partir d'aujourd'hui et jusqu'à la dernière date programmée de la phase de la partie, toutes séries confondues. Si cette date est déjà atteinte, la recherche s'étend jusqu'à la veille du début de la phase suivante.

#### Scenario: Partie de poule en milieu de phase
- **WHEN** la phase de poules a des parties programmées jusqu'au 15 décembre
- **THEN** la page propose des créneaux d'aujourd'hui au 15 décembre

### Requirement: Créneaux disponibles
La page SHALL présenter, en tableau par week-end, les créneaux de la grille de championnat du Trinquet Paris (vendredi 21h et 22h, dimanche 14h à 17h et 20h à 22h) qui ne sont pas déjà pris, marqués « Libre ». Le créneau actuel de la partie est marqué « Créneau actuel ». Une heure ou un week-end sans case libre ni créneau actuel n'est pas affiché. Sur une ligne affichée, un créneau pris est barré, sans dire par qui, de la même façon qu'une heure absente de la grille ce jour-là : la page Créneaux donne ce détail. Quand le tableau n'a aucune case libre ni créneau actuel à montrer, la page l'indique.

#### Scenario: Créneau pris
- **WHEN** le dimanche suivant à 21h est déjà pris par une autre partie et que le vendredi 21h du même week-end est libre
- **THEN** la case du dimanche 21h est barrée, sans nom d'équipe

#### Scenario: Heure entièrement prise
- **WHEN** le dimanche suivant à 15h est déjà pris
- **THEN** la ligne 15h de ce week-end n'apparaît pas, le vendredi n'ayant pas de créneau à 15h

#### Scenario: Aucun créneau
- **WHEN** tous les créneaux de la grille sont pris jusqu'à la fin de l'horizon, et que le créneau actuel de la partie n'y figure pas (date passée ou heure hors grille)
- **THEN** la page indique qu'aucun créneau n'est disponible, sans tableau

### Requirement: Jours où une équipe joue déjà
Un créneau libre un jour où l'une des deux équipes a déjà une autre partie, quels que soient le lieu et l'heure, SHALL être signalé en couleur d'avertissement avec la mention « une équipe joue déjà ce jour-là », sans être retiré : il reste affiché comme libre. Toucher ce créneau ou le badge de la colonne déplie la liste des parties de ce jour concernées (équipes, heure, lieu).

#### Scenario: Équipe déjà engagée le même dimanche
- **WHEN** l'équipe qui reçoit joue dans un autre trinquet le dimanche 18 à 20h
- **THEN** les créneaux libres du dimanche 18 portent l'avertissement, et les toucher montre cette partie

### Requirement: Proposer des dates à l'adversaire
Quand au moins une date a un créneau libre sans conflit pour aucune des deux équipes, la page SHALL proposer, pour chaque équipe dont le responsable a un numéro exploitable déclaré à la ligue, des liens WhatsApp et SMS portant un message de report prérempli, et un lien Appeler, avec le nom du responsable quand il est déclaré. Comme la page ne sait pas de quelle équipe est le visiteur, elle le fait pour les deux équipes. Le message liste jusqu'à six de ces dates, avec leurs heures libres, le lien vers la page, et le rappel qu'il faudra faire valider la date par la ligue. Les jours où une équipe joue déjà en sont exclus. Le numéro MUST NOT apparaître dans le texte de la page. Une équipe sans numéro exploitable est signalée « aucun responsable joignable déclaré à la ligue ».

#### Scenario: Message de report
- **WHEN** trois dates ont des créneaux libres sans conflit et qu'au moins une équipe a un numéro exploitable
- **THEN** le message prérempli des liens WhatsApp et SMS liste ces trois dates avec leurs heures libres

#### Scenario: Responsable sans numéro
- **WHEN** le responsable de l'équipe visiteuse n'a pas de numéro exploitable
- **THEN** la ligne de cette équipe indique « aucun responsable joignable déclaré à la ligue », sans lien

### Requirement: Une date repérée n'est pas actée
La page MUST rappeler en permanence qu'elle ne réserve rien, n'enregistre rien et ne prévient personne, et qu'une date repérée doit être convenue avec l'adversaire puis validée par le responsable de championnat de la ligue. Un report sur un créneau hors grille se négocie hors de cet outil.

#### Scenario: Lecture de la page
- **WHEN** un visiteur consulte les créneaux proposés
- **THEN** la carte « Avant d'acter le report » rappelle que la date doit être validée par la ligue et que le site n'enregistre rien
