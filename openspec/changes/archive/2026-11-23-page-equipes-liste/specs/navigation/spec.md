# Spec Delta

## MODIFIED Requirements

### Requirement: Barre d'onglets
La barre d'onglets SHALL compter cinq entrées sur les sept pages du site (la page de redirection `equipes.html` exceptée), dans cet ordre : Accueil, Équipes, Parties, Classement, Créneaux, chacune avec une icône et un libellé. L'onglet de la page consultée apparaît comme onglet courant. Les pages Report et Compteur, qui ne sont pas des onglets, n'ont pas d'onglet courant. Sur un écran de 390 px de large, les cinq libellés MUST tenir sans être coupés et sans défilement horizontal, ce qui exclut d'ajouter une sixième entrée.

#### Scenario: Aller sur la page Mes équipes depuis une autre page
- **WHEN** un visiteur sur la page Classement touche l'onglet « Équipes »
- **THEN** la liste de toutes les équipes s'ouvre et l'onglet « Équipes » est marqué comme courant

#### Scenario: Page hors onglets
- **WHEN** un visiteur est sur la page Compteur ou sur la page Report
- **THEN** la barre d'onglets est présente, sans onglet marqué comme courant

#### Scenario: Écran étroit
- **WHEN** une page du site est affichée sur un écran de 390 px de large
- **THEN** les cinq onglets sont visibles, libellés entiers, sans défilement horizontal
