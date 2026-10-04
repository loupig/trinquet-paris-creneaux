# navigation Specification

## Purpose

Fixer ce qui est commun à toutes les pages pour se déplacer dans le site, comme dans une application mobile : barre d'onglets en bas, boutons flottants en haut, retour à l'accueil, installation sur l'écran d'accueil, et redirection des anciennes adresses.

## Requirements

### Requirement: Barre d'onglets
La barre d'onglets SHALL compter cinq entrées sur les sept pages du site (la page de redirection `equipes.html` exceptée), dans cet ordre : Accueil, Mon équipe, Parties, Classement, Créneaux, chacune avec une icône et un libellé. L'onglet de la page consultée apparaît comme onglet courant. Les pages Report et Compteur, qui ne sont pas des onglets, n'ont pas d'onglet courant. Sur un écran de 390 px de large, les cinq libellés MUST tenir sans être coupés et sans défilement horizontal, ce qui exclut d'ajouter une sixième entrée.

#### Scenario: Aller sur la page Mon équipe depuis une autre page
- **WHEN** un visiteur sur la page Classement touche l'onglet « Mon équipe »
- **THEN** la page de l'équipe s'ouvre et l'onglet « Mon équipe » est marqué comme courant

#### Scenario: Page hors onglets
- **WHEN** un visiteur est sur la page Compteur ou sur la page Report
- **THEN** la barre d'onglets est présente, sans onglet marqué comme courant

#### Scenario: Écran étroit
- **WHEN** une page du site est affichée sur un écran de 390 px de large
- **THEN** les cinq onglets sont visibles, libellés entiers, sans défilement horizontal

### Requirement: Boutons flottants du haut
Chacune des sept pages SHALL porter en haut à gauche un lien « Site de la ligue », qui ouvre le site de la ligue dans un nouvel onglet, et en haut à droite le bouton du compteur de points. Les pages qui chargent les données de la ligue portent aussi, à gauche du compteur, le bouton « Rafraîchir ». Le compteur n'est pas un onglet : sur sa propre page, son bouton apparaît en vert plein, et la page n'a pas de bouton « Rafraîchir ».

#### Scenario: Ouvrir le compteur
- **WHEN** un visiteur touche le bouton calculette depuis n'importe quelle page
- **THEN** le compteur de points s'ouvre, et son bouton apparaît en vert plein

#### Scenario: Site de la ligue
- **WHEN** un visiteur touche « Site de la ligue »
- **THEN** le site de la ligue s'ouvre dans un nouvel onglet, sans quitter la page

### Requirement: Retour à l'accueil par le titre
Sur toute page autre que l'accueil, le titre de l'en-tête SHALL être un lien vers l'accueil.

#### Scenario: Titre touché
- **WHEN** un visiteur touche le titre de la page Classement
- **THEN** l'accueil s'ouvre

### Requirement: Retour en haut de page
Les pages Mon équipe, Parties, Classement, Créneaux et Report SHALL porter un bouton flottant « ↑ » qui ramène en haut de la page.

#### Scenario: Longue liste
- **WHEN** un visiteur a fait défiler la page Parties puis touche « ↑ »
- **THEN** la page revient en haut

### Requirement: Pas de fenêtre surgissante
Les pages MUST NOT ouvrir de fenêtre surgissante pour présenter du contenu ou des explications : les explications restent affichées dans la page, et les choix se déplient dans la page. Des fenêtres de ce type ont été essayées puis retirées parce que leur bouton de fermeture restait bloqué chez au moins un visiteur. Seule la demande de confirmation avant d'effacer une partie du compteur fait exception.

#### Scenario: Choisir ses équipes
- **WHEN** un visiteur ouvre le choix de ses équipes sur l'accueil
- **THEN** le choix se déplie dans la page, sans fenêtre par-dessus

### Requirement: Installation sur l'écran d'accueil
Le site SHALL pouvoir s'installer comme une application sur l'écran d'accueil d'un téléphone, sous le nom « LIDFPB », avec l'icône de l'ikurriña, en s'ouvrant sur l'accueil et en plein écran, sans barre de navigateur. Une fois installée, la barre d'onglets MUST rester au-dessus de la barre de geste du téléphone. Le site MUST NOT enregistrer de service worker ni de cache hors connexion qui lui soit propre, pour qu'un joueur ne reste pas bloqué sur une ancienne version gardée en mémoire.

#### Scenario: Installation sur iPhone
- **WHEN** un visiteur ajoute l'accueil du site à son écran d'accueil depuis le menu Partager de son iPhone
- **THEN** l'icône « LIDFPB » ouvre l'accueil en plein écran

#### Scenario: Pas de version hors connexion
- **WHEN** un visiteur a ouvert le site, installé ou non
- **THEN** aucun service worker n'est enregistré pour le site

### Requirement: Ancienne adresse de la vue par équipe
L'adresse `equipes.html`, ancienne vue « Parties par équipe » retirée, SHALL rediriger aussitôt vers la page Mon équipe sans s'inscrire dans l'historique du navigateur, pour ne pas casser les favoris et les liens déjà partagés.

#### Scenario: Ancien favori
- **WHEN** un visiteur ouvre un ancien favori vers `equipes.html`
- **THEN** la page Mon équipe s'ouvre, et le bouton Retour ne ramène pas à `equipes.html`

### Requirement: Version en pied de page
Chacune des sept pages SHALL indiquer en pied de page sa version, sous la forme « Version AAAA.MM.JJ », ainsi qu'un lien pour signaler un problème.

#### Scenario: Pied de page
- **WHEN** un visiteur fait défiler une page jusqu'en bas
- **THEN** il voit la version de la page et le lien pour signaler un problème
