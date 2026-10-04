## Purpose

Montrer, pour les semaines à venir, quels créneaux de championnat du Trinquet Paris (75016) sont encore libres, pour replanifier une partie sans recalculer l'occupation à la main, et aider à proposer un créneau libre à l'adversaire.

## ADDED Requirements

### Requirement: Occupation tous championnats confondus
La page SHALL compter comme occupé un créneau pris par n'importe quelle partie de championnat jouée au Trinquet Paris (75016), toutes séries confondues, parce que la 1re et la 2e série se partagent ce seul lieu. Les parties des autres trinquets de Paris MUST NOT occuper de créneau.

#### Scenario: Créneau pris par l'autre série
- **WHEN** une partie de série 1 est programmée au Trinquet Paris un dimanche à 15h
- **THEN** le créneau du dimanche 15h est occupé, y compris pour un joueur de série 2

#### Scenario: Autre trinquet parisien
- **WHEN** une partie est programmée dans un autre trinquet de Paris un dimanche à 15h
- **THEN** elle n'occupe pas le créneau du dimanche 15h du Trinquet Paris

### Requirement: Grille fixe du trinquet
Les créneaux de championnat SHALL être, chaque vendredi, 21h et 22h et, chaque dimanche, 14h, 15h, 16h, 17h, 20h, 21h et 22h. La page MUST rappeler cette grille en tête, avec la mention que ces créneaux sont réservés par la ligue aux parties de championnat, pas à un usage libre. Une partie programmée un autre jour, ou à une heure absente de la grille de son jour, n'occupe aucun créneau.

#### Scenario: Partie hors grille
- **WHEN** une partie est programmée au Trinquet Paris un dimanche à 18h
- **THEN** aucun créneau n'est marqué occupé à cause d'elle

### Requirement: Horizon affiché
La page SHALL couvrir les vendredis et dimanches compris entre aujourd'hui inclus et quinze semaines plus tard.

#### Scenario: Visite un mercredi
- **WHEN** un visiteur ouvre la page un mercredi
- **THEN** la première date couverte par la page est le vendredi qui suit, et la dernière se situe environ quinze semaines plus tard

### Requirement: Partie reportée
Pour une partie reportée, SHALL compter la nouvelle date, à l'heure d'origine. Le créneau d'origine redevient libre s'il n'est pas pris par une autre partie.

#### Scenario: Report d'une semaine
- **WHEN** une partie du dimanche 12 à 15h est reportée au dimanche 19
- **THEN** le dimanche 19 à 15h est occupé, et le dimanche 12 à 15h redevient libre

### Requirement: Tableau par week-end
La page SHALL présenter les créneaux en une carte par week-end, avec une colonne par jour (« Vendredi » ou « Dimanche » et sa date) et une ligne par heure, pour que les heures communes aux deux jours soient alignées. Une case libre affiche « Libre ». Une case occupée affiche « Occupé », la série de la partie, et son niveau : « Poule N » en phase de poules, sinon le libellé de la phase (par exemple « 1/4 de finale »). Une heure qui n'existe pas dans la grille de ce jour est barrée et ne réagit pas au toucher.

#### Scenario: Week-end complet
- **WHEN** un week-end dont le vendredi et le dimanche sont dans l'horizon est affiché, avec les filtres par défaut
- **THEN** sa carte aligne les heures des deux jours, et les cases du vendredi à 14h, 15h, 16h, 17h et 20h sont barrées

#### Scenario: Case occupée par une partie de poule
- **WHEN** un créneau est pris par une partie de la poule 2 de série 1
- **THEN** sa case affiche « Occupé », « Série 1 » et « Poule 2 »

### Requirement: Détail d'un créneau occupé
Toucher une case occupée SHALL déplier sous la ligne le détail de la partie : les deux équipes, puis les noms des joueurs déclarés à la ligue pour chacune, sans numéro de licence ni coordonnée. Toucher à nouveau la case replie le détail. Plusieurs détails peuvent être ouverts en même temps.

#### Scenario: Voir qui joue
- **WHEN** le visiteur touche une case occupée dont les équipes ont déclaré leurs joueurs
- **THEN** le détail donne les deux équipes et les noms de leurs joueurs

### Requirement: Proposer un créneau libre
Toucher une case libre SHALL déplier un message prérempli de la forme « Le créneau du dimanche 11 octobre 2026 à 14h est disponible au Trinquet Paris, ça vous convient ? », avec un bouton « Envoyer via WhatsApp », qui ouvre WhatsApp sans destinataire imposé, et un bouton « Copier le texte ». La page MUST préciser que le message est à envoyer soi-même à l'adversaire et qu'elle ne réserve rien, parce que des joueurs ont cru qu'un message partait automatiquement. Elle n'enregistre ni n'envoie rien elle-même.

#### Scenario: Envoi par WhatsApp
- **WHEN** le visiteur touche une case libre puis « Envoyer via WhatsApp »
- **THEN** WhatsApp s'ouvre avec le message prérempli, et le visiteur choisit lui-même le destinataire

#### Scenario: Copie du texte
- **WHEN** le visiteur touche « Copier le texte »
- **THEN** le message est copié et le bouton affiche brièvement « Copié ! », ou « Échec de la copie » si le navigateur refuse

### Requirement: Filtres des créneaux
La page SHALL proposer, dans un bloc repliable, un filtre par jour (Vendredi, Dimanche), un filtre par heure, et la case « Seulement les jours avec un créneau libre », cochée par défaut, qui masque les week-ends sans aucune case libre parmi les cases visibles. Seules les heures possibles pour les jours cochés sont proposées. Quand rien ne correspond, la page affiche « Aucune date ne correspond aux filtres. ». Les filtres et l'état du bloc MUST être retrouvés d'une visite à l'autre sur le même navigateur, sans être envoyés nulle part.

#### Scenario: Vendredi seul
- **WHEN** le visiteur ne garde que le vendredi
- **THEN** seules les heures 21h et 22h restent proposées et affichées

#### Scenario: Week-end complet masqué
- **WHEN** la case « Seulement les jours avec un créneau libre » est cochée et qu'un week-end n'a plus aucun créneau libre
- **THEN** ce week-end n'apparaît pas

### Requirement: Lecture seule
La page SHALL indiquer en permanence qu'elle se contente d'afficher l'occupation des créneaux et n'a aucun effet sur le site de la ligue.

#### Scenario: En-tête
- **WHEN** un visiteur ouvre la page
- **THEN** l'en-tête indique que la page n'a aucun effet sur le site de la ligue

### Requirement: Pas de grille fausse
Quand les données ne peuvent pas être obtenues, ou qu'aucune partie n'est reçue pour le Trinquet Paris, la page MUST NOT afficher une grille entièrement libre, parce qu'elle serait lue comme « tout est libre ». Sans données en cache, elle affiche à la place un message d'erreur et aucune grille. Zéro partie reçue est traité comme une erreur.

#### Scenario: Aucune partie reçue
- **WHEN** la ligue ne renvoie aucune partie pour le Trinquet Paris et qu'aucune donnée n'est en cache
- **THEN** la page affiche un message d'erreur et aucune grille
