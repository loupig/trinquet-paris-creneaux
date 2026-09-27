# Spec Delta

## MODIFIED Requirements

### Requirement: Composition de l'accueil
L'accueil SHALL présenter, dans cet ordre, le bloc « Mes équipes », le bloc « D'ici dimanche » puis le bloc « Championnats » (avancement de la saison), et aucun autre bloc de contenu.

#### Scenario: Ouverture de l'accueil
- **WHEN** un visiteur ouvre l'accueil et que les données sont chargées
- **THEN** il voit « Mes équipes », « D'ici dimanche » puis « Championnats », et rien d'autre entre l'en-tête et le pied de page
