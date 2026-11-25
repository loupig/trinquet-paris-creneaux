# Spec Delta

## Purpose

Permettre à un licencié connecté de réserver lui-même, hors championnat, un créneau de la ligue au Trinquet Paris resté libre, selon des règles automatiques qui laissent toujours la priorité au championnat.

## ADDED Requirements

### Requirement: Créneau réservable
Un créneau SHALL être réservable quand il appartient à la grille de la ligue (spec `creneaux`, « Grille fixe du trinquet »), qu'il commence plus tard qu'à l'instant présent et au plus tard dans 14 jours, et qu'aucune partie de championnat ni aucune réservation ne l'occupe. Le serveur MUST vérifier chacune de ces conditions au moment de la réservation, quoi que la page ait affiché.

#### Scenario: Créneau libre dans la fenêtre
- **WHEN** un joueur connecté réserve le dimanche qui vient à 16h, libre de toute partie et de toute réservation
- **THEN** la réservation est enregistrée et la case affiche « Votre réservation »

#### Scenario: Créneau au-delà de 14 jours
- **WHEN** un joueur touche une case libre dans trois semaines
- **THEN** la case propose le message à l'adversaire, sans bouton « Réserver ce créneau », avec la mention « Réservable à partir du » et la date d'ouverture

#### Scenario: Créneau pris entre-temps
- **WHEN** deux joueurs réservent le même créneau à quelques secondes d'écart
- **THEN** une seule réservation est enregistrée, et l'autre joueur lit « Ce créneau vient d'être réservé » sur la case, qui passe à « Réservé »

### Requirement: Une réservation à venir à la fois
Un licencié SHALL avoir au plus une réservation à venir. Tant qu'il en a une, le bouton « Réserver ce créneau » est remplacé, sur les autres cases libres, par « Vous avez déjà une réservation », avec le lien vers « Mes réservations ».

#### Scenario: Seconde réservation
- **WHEN** un joueur qui a une réservation dimanche à 15h touche une autre case libre
- **THEN** la case n'offre pas de bouton de réservation et renvoie à sa réservation existante

### Requirement: Annulation par le joueur
L'auteur d'une réservation SHALL pouvoir l'annuler depuis « Mes réservations », ou en touchant sa case, jusqu'à l'heure de début du créneau. Le créneau redevient libre aussitôt.

#### Scenario: Annuler la veille
- **WHEN** le joueur annule sa réservation du dimanche 16h le samedi
- **THEN** la case du dimanche 16h redevient « Libre » pour tous, et il peut réserver un autre créneau

### Requirement: Priorité du championnat
Quand une partie de championnat est programmée, ou reportée, sur un créneau réservé, la réservation SHALL être annulée dans l'heure qui suit la publication de la partie par la ligue, et son auteur prévenu par e-mail, avec la date, l'heure et la raison. Il n'est pas compté de réservation à venir pour lui après l'annulation.

#### Scenario: Report sur un créneau réservé
- **WHEN** une partie de série 2 est reportée par la ligue au dimanche 16h, réservé par un joueur
- **THEN** sa réservation est annulée, il reçoit un e-mail qui l'explique, et la case affiche la partie de championnat

### Requirement: Confirmation par e-mail
Chaque réservation, et chaque annulation qui n'est pas faite par le joueur lui-même, SHALL être confirmée à son auteur par un e-mail qui donne le jour, l'heure, le lieu et le lien vers la page Créneaux. L'e-mail MUST NOT contenir le nom d'un autre joueur.

#### Scenario: Réservation confirmée
- **WHEN** un joueur réserve le vendredi à 21h
- **THEN** il reçoit un e-mail « Réservation confirmée : vendredi … à 21h au Trinquet Paris »

### Requirement: Vue des autres joueurs
Une case réservée SHALL afficher « Réservé · hors championnat » à tout visiteur autre que son auteur et les organisateurs, sans nom ni autre information sur l'auteur. Elle MUST NOT proposer de bouton de réservation.

#### Scenario: Visiteur non connecté
- **WHEN** un visiteur non connecté regarde un créneau réservé
- **THEN** la case affiche « Réservé · hors championnat », et le toucher n'affiche aucun nom

### Requirement: Vue des organisateurs
Pour un organisateur connecté, une case réservée SHALL afficher, au toucher, le prénom et le nom de l'auteur et la date de la réservation, avec un bouton « Annuler la réservation » qui demande un motif. L'auteur reçoit le motif par e-mail.

#### Scenario: Annulation par un organisateur
- **WHEN** un organisateur annule une réservation avec le motif « Trinquet fermé ce jour-là »
- **THEN** le créneau redevient libre et l'auteur reçoit un e-mail qui donne ce motif

### Requirement: Données de réservation limitées
Une réservation SHALL ne retenir que son créneau, son auteur, sa date de création et, si elle est annulée, la date, l'auteur et le motif de l'annulation. Les réservations passées MUST être effacées 12 mois après leur créneau, et un compte sans connexion depuis 24 mois supprimé.

#### Scenario: Réservation ancienne
- **WHEN** le créneau d'une réservation date de plus de 12 mois
- **THEN** la réservation n'existe plus dans les données du site
