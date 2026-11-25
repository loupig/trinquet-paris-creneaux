# Spec Delta

## ADDED Requirements

### Requirement: Créneaux réservés hors championnat
Un créneau réservé hors championnat (spec `reservation-creneaux`) SHALL rester proposé par l'aide au report comme disponible pour une partie de championnat, avec la mention « réservé hors championnat : la réservation sera annulée si la ligue y place la partie ». Le nom de l'auteur de la réservation MUST NOT apparaître.

#### Scenario: Report sur un créneau réservé
- **WHEN** l'aide au report liste les créneaux disponibles, et que le dimanche 16h est réservé hors championnat
- **THEN** le dimanche 16h est proposé, avec la mention de la réservation, sans nom
