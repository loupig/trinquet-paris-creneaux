# Spec Delta

## ADDED Requirements

### Requirement: Réinstallation depuis la nouvelle adresse
Un visiteur arrivé par la redirection de l'ancienne adresse (spec `hebergement`), hors mode installé, SHALL voir une fois, dans la page, un bandeau qui l'invite à réinstaller l'application depuis la nouvelle adresse, avec la marche à suivre de son téléphone. Le bandeau se ferme et ne revient plus.

#### Scenario: Application installée à l'ancienne adresse
- **WHEN** un joueur ouvre l'application installée depuis l'ancienne adresse, après la migration
- **THEN** le site du nouveau domaine s'ouvre, avec un bandeau dans la page qui l'invite à réinstaller l'application

#### Scenario: Bandeau fermé
- **WHEN** le joueur a fermé le bandeau de réinstallation, puis revient par l'ancienne application
- **THEN** le bandeau ne s'affiche plus
