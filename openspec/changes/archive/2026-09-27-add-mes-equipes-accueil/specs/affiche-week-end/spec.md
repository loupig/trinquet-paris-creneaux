# Spec Delta

## ADDED Requirements

### Requirement: Parties de mes équipes repérées
Dans le bloc « D'ici dimanche », une partie jouée par l'une des équipes suivies SHALL se distinguer des autres par un repère visuel en marge, sans ajouter d'étiquette ni changer l'étiquette « à voir », et sans quitter l'ordre chronologique.

#### Scenario: Ma partie ce dimanche
- **WHEN** une équipe suivie joue dimanche et que cette partie n'est pas à voir
- **THEN** sa ligne porte le repère de marge, sans étiquette

#### Scenario: Ma partie est aussi à voir
- **WHEN** une partie d'une équipe suivie est aussi un derby
- **THEN** elle porte à la fois le repère de marge et l'étiquette « Derby »

#### Scenario: Sans équipe suivie
- **WHEN** le visiteur ne suit aucune équipe
- **THEN** aucune ligne ne porte de repère, et le bloc est identique à aujourd'hui
