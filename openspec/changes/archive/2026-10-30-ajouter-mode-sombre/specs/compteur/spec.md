# Spec Delta

## MODIFIED Requirements

### Requirement: Couleurs d'équipe
Chaque équipe SHALL prendre le rouge ou le vert de l'ikurriña, ou, en dernier choix, une couleur libre prise au sélecteur du téléphone. Seules ces trois pastilles sont proposées ; une partie enregistrée avec le blanc ou le noir, proposés auparavant, les garde, sous la pastille de couleur libre. Par défaut, la première équipe est rouge et la seconde verte. Choisir le rouge ou le vert de l'autre équipe MUST échanger les couleurs des deux équipes, et une couleur libre identique à celle de l'autre équipe fait changer l'autre, pour que deux équipes n'aient jamais la même couleur. Une couleur libre trop proche de celle de l'autre équipe n'est pas interdite, mais un avertissement le signale. Pour le texte, les bordures et les courbes, le blanc s'affiche en gris et le vert en vert foncé, et une couleur libre trop claire est foncée jusqu'à rester lisible sur fond blanc. Sur fond sombre, celui du plein écran sombre comme celui de la page quand le téléphone est réglé en sombre, ces couleurs MUST être éclaircies pour rester lisibles, et le noir devient gris clair.

#### Scenario: Choisir la couleur de l'adversaire
- **WHEN** l'équipe 1 est rouge, l'équipe 2 verte, et le visiteur choisit le vert pour l'équipe 1
- **THEN** l'équipe 1 devient verte et l'équipe 2 rouge

#### Scenario: Équipe en blanc
- **WHEN** une équipe a la couleur blanche, prise au sélecteur
- **THEN** son nom, son score et sa courbe sont tracés en gris

#### Scenario: Couleur du club
- **WHEN** le visiteur choisit un jaune vif au sélecteur pour l'équipe 2
- **THEN** sa pastille et le fond de son bouton prennent ce jaune, et son nom et son score s'écrivent dans un jaune foncé lisible

#### Scenario: Couleurs voisines
- **WHEN** les deux équipes ont deux violets très proches
- **THEN** un avertissement signale que le score et le graphe seront difficiles à distinguer

#### Scenario: Page du compteur en sombre
- **WHEN** le téléphone est réglé en sombre et le compteur est ouvert hors plein écran, avec une équipe en vert
- **THEN** le nom, le score et la courbe de cette équipe sont tracés dans un vert clair lisible sur le fond sombre de la page
