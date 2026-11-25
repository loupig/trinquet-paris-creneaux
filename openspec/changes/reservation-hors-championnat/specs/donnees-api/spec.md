# Spec Delta

## MODIFIED Requirements

### Requirement: Préférences gardées sur l'appareil
Ce que le site retient d'une visite à l'autre (équipes suivies, filtres, état des blocs repliables, partie du compteur, texte de la communication « Perso », données de la ligue) SHALL rester dans le navigateur du visiteur. Rien de tout cela n'est envoyé, et ces préférences ne suivent pas le visiteur d'un appareil à l'autre, même connecté : le compte (spec `compte-joueur`) ne sert qu'à réserver un créneau, et le serveur ne connaît de lui que son e-mail, sa licence, son nom et ses réservations.

#### Scenario: Autre appareil
- **WHEN** un visiteur qui suit deux équipes sur son téléphone ouvre le site sur un ordinateur
- **THEN** l'ordinateur ne connaît pas ses équipes suivies

#### Scenario: Joueur connecté
- **WHEN** un joueur connecté suit deux équipes, puis se connecte sur un ordinateur
- **THEN** l'ordinateur ne connaît toujours pas ses équipes suivies, et aucune requête vers le serveur du site ne les contient
