# Spec Delta

## MODIFIED Requirements

### Requirement: Occupation tous championnats confondus
La page SHALL compter comme occupé un créneau pris par n'importe quelle partie de championnat jouée au Trinquet Paris (75016), toutes séries confondues, parce que la 1re et la 2e série se partagent ce seul lieu. Les parties des autres trinquets de Paris MUST NOT occuper de créneau. Un créneau réservé hors championnat (spec `reservation-creneaux`) SHALL aussi être compté comme occupé, sauf quand une partie de championnat y est programmée : c'est alors la partie qui l'occupe.

#### Scenario: Créneau pris par l'autre série
- **WHEN** une partie de série 1 est programmée au Trinquet Paris un dimanche à 15h
- **THEN** le créneau du dimanche 15h est occupé, y compris pour un joueur de série 2

#### Scenario: Autre trinquet parisien
- **WHEN** une partie est programmée dans un autre trinquet de Paris un dimanche à 15h
- **THEN** elle n'occupe pas le créneau du dimanche 15h du Trinquet Paris

#### Scenario: Créneau réservé hors championnat
- **WHEN** un licencié a réservé le dimanche 16h, sans partie de championnat à cette heure
- **THEN** le créneau du dimanche 16h est occupé

### Requirement: Grille fixe du trinquet
Les créneaux de championnat SHALL être, chaque vendredi, 21h et 22h et, chaque dimanche, 14h, 15h, 16h, 17h, 20h, 21h et 22h. La page MUST rappeler cette grille en tête, avec la mention que ces créneaux sont réservés par la ligue, en priorité aux parties de championnat, et qu'un licencié peut réserver un créneau resté libre dans les 14 jours qui viennent, pour jouer hors championnat. Une partie programmée un autre jour, ou à une heure absente de la grille de son jour, n'occupe aucun créneau.

#### Scenario: Partie hors grille
- **WHEN** une partie est programmée au Trinquet Paris un dimanche à 18h
- **THEN** aucun créneau n'est marqué occupé à cause d'elle

#### Scenario: Rappel en tête
- **WHEN** un visiteur ouvre la page
- **THEN** l'en-tête rappelle la grille, la priorité du championnat et la possibilité de réserver un créneau libre dans les 14 jours

### Requirement: Proposer un créneau libre
Toucher une case libre SHALL déplier un message prérempli de la forme « Le créneau du dimanche 11 octobre 2026 à 14h est disponible au Trinquet Paris, ça vous convient ? », avec un bouton « Envoyer via WhatsApp », qui ouvre WhatsApp sans destinataire imposé, et un bouton « Copier le texte ». La page MUST préciser que le message est à envoyer soi-même à l'adversaire et que l'envoyer ne réserve rien, parce que des joueurs ont cru qu'un message partait automatiquement.

#### Scenario: Envoi par WhatsApp
- **WHEN** le visiteur touche une case libre puis « Envoyer via WhatsApp »
- **THEN** WhatsApp s'ouvre avec le message prérempli, et le visiteur choisit lui-même le destinataire

#### Scenario: Copie du texte
- **WHEN** le visiteur touche « Copier le texte »
- **THEN** le message est copié et le bouton affiche brièvement « Texte copié », ou « Échec de la copie » si le navigateur refuse

### Requirement: Lecture seule
La page SHALL indiquer en permanence qu'elle n'a aucun effet sur le site de la ligue : les réservations hors championnat ne sont connues que de ce site, et ne modifient ni le calendrier ni les données de la ligue.

#### Scenario: En-tête
- **WHEN** un visiteur ouvre la page
- **THEN** l'en-tête indique que la page n'a aucun effet sur le site de la ligue

### Requirement: Pas de grille fausse
Quand les données ne peuvent pas être obtenues, ou qu'aucune partie n'est reçue pour le Trinquet Paris, la page MUST NOT afficher une grille entièrement libre, parce qu'elle serait lue comme « tout est libre ». Sans données en cache, elle affiche à la place un message d'erreur et aucune grille. Zéro partie reçue est traité comme une erreur.

#### Scenario: Aucune partie reçue
- **WHEN** la ligue ne renvoie aucune partie pour le Trinquet Paris et qu'aucune donnée n'est en cache
- **THEN** la page affiche un message d'erreur et aucune grille

## ADDED Requirements

### Requirement: Case réservée hors championnat
Une case réservée hors championnat (spec `reservation-creneaux`) SHALL afficher « Réservé · hors championnat », ou « Votre réservation » pour son auteur connecté, dans une couleur distincte de « Occupé ».

#### Scenario: Sa propre réservation
- **WHEN** le joueur connecté qui a réservé le dimanche 16h ouvre la page
- **THEN** la case du dimanche 16h affiche « Votre réservation », et les autres visiteurs y lisent « Réservé · hors championnat »

### Requirement: Bouton « Réserver ce créneau »
Quand le créneau d'une case libre est réservable (spec `reservation-creneaux`), son dépli SHALL porter, au-dessus du message à l'adversaire, un bouton « Réserver ce créneau ». Non connecté, le visiteur qui le touche voit le formulaire de connexion dans le dépli, avec le créneau choisi rappelé (spec `compte-joueur`).

#### Scenario: Réserver sans être connecté
- **WHEN** un visiteur non connecté touche une case libre de la semaine qui vient, puis « Réserver ce créneau »
- **THEN** le formulaire de connexion se déplie sous la case, sans fenêtre surgissante, et le créneau choisi est rappelé

#### Scenario: Réserver connecté
- **WHEN** un joueur connecté sans réservation à venir touche une case libre de la semaine qui vient, puis « Réserver ce créneau »
- **THEN** la case passe à « Votre réservation », et le créneau apparaît dans « Mes réservations »

### Requirement: Réservations indisponibles
Quand les réservations ne peuvent pas être obtenues, la page SHALL afficher la grille du championnat avec un bandeau « Réservations indisponibles pour l'instant », et MUST NOT proposer de réserver.

#### Scenario: Réservations indisponibles
- **WHEN** les parties de la ligue sont reçues, mais pas les réservations
- **THEN** la grille du championnat s'affiche avec le bandeau « Réservations indisponibles pour l'instant », et aucune case ne propose « Réserver ce créneau »

### Requirement: Mes réservations
Un joueur connecté SHALL voir en tête de la page un bloc « Mes réservations » : sa réservation à venir (jour, heure, bouton « Annuler »), ou « Aucune réservation à venir », puis son nom tel que la ligue le connaît, « Se déconnecter » et « Supprimer mon compte ». Un visiteur non connecté ne voit pas ce bloc.

#### Scenario: Joueur avec une réservation
- **WHEN** un joueur connecté qui a réservé le dimanche 16h ouvre la page
- **THEN** le bloc « Mes réservations » montre le dimanche 16h avec un bouton « Annuler »

#### Scenario: Visiteur non connecté
- **WHEN** un visiteur non connecté ouvre la page
- **THEN** la page ne montre pas de bloc « Mes réservations »
