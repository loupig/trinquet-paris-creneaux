# programme Specification

## Purpose

Donner le calendrier complet des championnats, tous lieux et toutes séries, parties passées et à venir, avec pour chaque partie la composition des deux équipes, de quoi joindre leurs responsables et l'accès à l'aide au report.

## Requirements

### Requirement: Périmètre du calendrier
La page SHALL lister toutes les rencontres des séries 1 et 2 publiées par la ligue, tous lieux confondus, passées et à venir mélangées. Une rencontre dont la date ou l'heure est illisible MUST être absente de la page, sans message. Une partie reportée MUST apparaître à sa nouvelle date, à l'heure d'origine, sans mention du report.

#### Scenario: Toutes les parties de la saison
- **WHEN** un visiteur ouvre la page sans filtre restrictif
- **THEN** il voit les parties déjà jouées et les parties à venir, tous lieux confondus

#### Scenario: Partie reportée
- **WHEN** une partie prévue le 12 octobre a été reportée au 19 octobre
- **THEN** elle apparaît le 19 octobre, à l'heure d'origine, et plus le 12

#### Scenario: Heure illisible
- **WHEN** une rencontre publiée n'a pas d'heure exploitable
- **THEN** elle n'apparaît pas sur la page

### Requirement: Classement par jour
La page SHALL regrouper les parties par jour calendaire, une carte par jour titrée de sa date complète (par exemple « Dimanche 4 Octobre 2026 »), dans l'ordre chronologique, et dans chaque jour par heure. La carte du jour courant MUST être mise en évidence. La page s'ouvre en haut de la liste, sans défilement automatique jusqu'à aujourd'hui.

#### Scenario: Deux parties le même jour
- **WHEN** deux parties se jouent le même dimanche, à 14h et à 16h
- **THEN** elles figurent dans la même carte, celle de 14h en premier

#### Scenario: Aujourd'hui
- **WHEN** des parties se jouent le jour de la visite
- **THEN** la carte de ce jour se distingue des autres par sa couleur

### Requirement: Filtres du calendrier
La page SHALL proposer, dans un bloc repliable ouvert par défaut, cinq filtres combinés entre eux : spécialité, série (Série 1, Série 2), lieu, phase, et « Masquer les parties passées ». Les pastilles de spécialité, de lieu et de phase MUST être construites d'après toutes les rencontres du calendrier, pas d'après celles qui restent affichées après filtrage. Par défaut, toutes les pastilles sont actives et les parties passées sont visibles. Une valeur qui apparaît pour la première fois dans les données MUST être active. Une partie du jour n'est jamais considérée comme passée. Quand aucune partie ne correspond, la page affiche « Aucune rencontre ne correspond aux filtres. ». Filtrer ne rappelle pas l'API.

#### Scenario: Une seule série
- **WHEN** le visiteur désactive la pastille « Série 2 »
- **THEN** seules les parties de série 1 restent affichées

#### Scenario: Masquer le passé le jour d'un match
- **WHEN** le visiteur active « Masquer les parties passées » un dimanche à 20h
- **THEN** les parties de ce dimanche restent affichées, même celles de 14h

#### Scenario: Nouveau lieu dans les données
- **WHEN** un lieu jamais rencontré apparaît dans les rencontres publiées
- **THEN** sa pastille existe et est active, et ses parties sont affichées

#### Scenario: Filtres trop stricts
- **WHEN** la combinaison des filtres n'en laisse passer aucune partie
- **THEN** la page affiche « Aucune rencontre ne correspond aux filtres. »

### Requirement: Filtres mémorisés sur l'appareil
La page SHALL retrouver, d'une visite à l'autre sur le même navigateur, l'état de ses filtres et l'état ouvert ou replié du bloc Filtres, ce dernier étant commun aux pages Parties, Classement et Créneaux. Ce choix reste dans le navigateur et n'est envoyé nulle part. Si le navigateur ne peut pas le relire, les valeurs par défaut s'appliquent, sans message.

#### Scenario: Retour sur la page
- **WHEN** un visiteur a masqué la série 2 et replié le bloc Filtres, puis revient le lendemain sans avoir rouvert le bloc Filtres sur une autre page
- **THEN** la série 2 est toujours masquée et le bloc toujours replié

### Requirement: Ligne d'une partie
Chaque partie SHALL tenir sur une ligne colorée selon sa série, qui donne : l'heure (« 14h » ou « 14h30 »), les deux équipes, l'équipe qui reçoit en premier, sous la forme « Club (éq. N) vs Club (éq. M) » (sans « (éq. N) » quand la ligue ne donne pas de numéro d'équipe), une ligne « Série N · Poule X · lieu » (« Poule X » quand la ligue indique une poule, sinon le libellé de la phase s'il est connu, et « Lieu non précisé » à la place d'un lieu absent), et le score à droite quand la partie a été jouée. Un club inconnu de la ligue s'affiche « Club <code> ».

#### Scenario: Partie de poule à venir
- **WHEN** une partie de poule de série 1 n'a pas encore de score
- **THEN** sa ligne donne l'heure, les deux équipes, « Série 1 · Poule 2 · <lieu> », sans score

#### Scenario: Partie de phase finale jouée
- **WHEN** une demi-finale a été jouée
- **THEN** sa ligne porte le libellé de la phase à la place de la poule, et le score à droite

### Requirement: Détail d'une partie
Toucher la ligne d'une partie SHALL déplier son détail, et la toucher à nouveau le replier. Le détail donne, pour l'équipe qui reçoit puis pour l'équipe visiteuse, les noms des joueurs déclarés à la ligue, sous la forme « Prénom Nom », ou « composition non disponible » quand aucun joueur n'est connu. Si les compositions ne peuvent pas être chargées, le calendrier s'affiche quand même, avec « composition non disponible ».

#### Scenario: Composition connue
- **WHEN** le visiteur touche une partie dont les deux équipes ont déclaré leurs joueurs
- **THEN** le détail liste les noms des joueurs de chaque équipe, sans numéro de licence

#### Scenario: Composition inconnue
- **WHEN** une équipe n'a déclaré aucun joueur connu de la ligue
- **THEN** sa ligne de détail indique « composition non disponible »

### Requirement: Contact des responsables d'équipe
Dans le détail d'une partie, chaque équipe dont le responsable a un numéro exploitable SHALL porter trois icônes, dans l'ordre WhatsApp, SMS et Appeler, vers le numéro de son responsable. Le numéro MUST NOT apparaître dans le texte de la page. Le nom du responsable n'apparaît pas dans le texte, mais il figure dans l'info-bulle des icônes. WhatsApp s'ouvre sur un message prérempli adressé au responsable de cette équipe : salutation par son prénom quand il peut être isolé, rappel de la partie (équipes, date, heure, et lieu s'il est connu), question « Tout est bon de votre côté ? », nom et numéro du responsable adverse s'ils sont connus, et rappel de la compétition, de la série et de la poule ou de la phase. Sans numéro exploitable, l'équipe n'a pas d'icônes, sans message.

#### Scenario: Responsable joignable
- **WHEN** le visiteur déplie une partie dont le responsable de l'équipe qui reçoit a un numéro exploitable
- **THEN** cette équipe porte les icônes WhatsApp, SMS et Appeler, et aucun numéro n'est écrit dans la page

#### Scenario: Message WhatsApp
- **WHEN** le visiteur touche l'icône WhatsApp d'une équipe
- **THEN** WhatsApp s'ouvre vers son responsable avec le message de vérification de la partie prérempli

#### Scenario: Pas de numéro
- **WHEN** le responsable d'une équipe n'a pas de numéro exploitable
- **THEN** cette équipe n'a pas d'icônes de contact

### Requirement: Accès au report
Le détail d'une partie sans score qui se joue au Trinquet Paris SHALL porter le bouton « Chercher une date de report », qui ouvre l'aide au report pour cette partie. La date de la partie n'entre pas en compte : une partie passée restée sans score a aussi le bouton, pour régulariser une partie non jouée. Une partie jouée ou qui se joue ailleurs n'a pas le bouton.

#### Scenario: Partie à venir au Trinquet Paris
- **WHEN** le visiteur déplie une partie sans score prévue au Trinquet Paris
- **THEN** le bouton « Chercher une date de report » ouvre l'aide au report de cette partie

#### Scenario: Partie dans un autre lieu
- **WHEN** le visiteur déplie une partie sans score prévue dans un autre trinquet
- **THEN** le détail n'a pas de bouton de report

#### Scenario: Partie passée sans score
- **WHEN** le visiteur déplie une partie de la semaine dernière au Trinquet Paris, restée sans score
- **THEN** le bouton « Chercher une date de report » est présent
