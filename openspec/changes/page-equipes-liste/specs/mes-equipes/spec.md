# Spec Delta

## MODIFIED Requirements

### Requirement: Passer d'une équipe suivie à l'autre
En tête de la page Équipes, au-dessus de la liste de toutes les équipes comme au-dessus d'une équipe affichée, la page SHALL montrer une pastille par équipe suivie, dans l'ordre où elles ont été suivies, avec son nom et sa série ; la pastille de l'équipe affichée est mise en évidence, et toucher une autre pastille affiche cette équipe sans recharger les données. Les pastilles n'apparaissent pas quand aucune équipe n'est suivie, ni quand la seule équipe suivie est celle affichée.

#### Scenario: Deux équipes suivies
- **WHEN** le visiteur suit deux équipes et touche la pastille de la seconde
- **THEN** la page montre la seconde équipe, et sa pastille est mise en évidence

#### Scenario: Pastilles au-dessus de la liste
- **WHEN** le visiteur suit une équipe et ouvre la page Équipes par l'onglet
- **THEN** la pastille de son équipe est en tête de la page, au-dessus de la liste, et la toucher affiche son équipe
