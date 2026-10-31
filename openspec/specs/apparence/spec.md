# apparence Specification

## Purpose
Fixer l'apparence commune à toutes les pages du site : le thème clair ou sombre, réglé par le téléphone du visiteur, puis la typographie, les icônes, le focus au clavier, les zones tactiles et les animations.

## Requirements

### Requirement: Thème qui suit le téléphone
Chaque page affichée du site SHALL s'afficher en sombre quand l'appareil demande un thème sombre, et en clair sinon. Cela vaut pour l'accueil, Mes équipes, Parties, Classement, Créneaux, Report, le compteur hors plein écran, Découvrir et la page 404. Le site MUST NOT proposer de bouton ni garder de choix pour ce thème : il suit le réglage de l'appareil, et change aussitôt si ce réglage change, sans recharger la page.

#### Scenario: Téléphone en sombre
- **WHEN** un visiteur dont le téléphone est réglé en sombre ouvre la page Classement
- **THEN** la page s'affiche sur fond sombre, textes clairs

#### Scenario: Téléphone en clair
- **WHEN** un visiteur dont le téléphone est réglé en clair ouvre l'accueil
- **THEN** l'accueil s'affiche comme avant ce changement, sur fond clair

#### Scenario: Réglage changé page ouverte
- **WHEN** le téléphone passe en sombre à la tombée de la nuit pendant que la page Parties est ouverte
- **THEN** la page passe en sombre sans être rechargée

#### Scenario: Pages hors navigation
- **WHEN** un visiteur au téléphone réglé en sombre ouvre la page Découvrir, puis une adresse inexistante du site
- **THEN** la présentation et la page 404 s'affichent toutes deux en sombre

### Requirement: Lisibilité en sombre
En sombre, les textes SHALL rester lisibles sur leur fond, avec un contraste d'au moins 4,5:1 pour le texte courant et les libellés de la barre d'onglets. Les couleurs qui portent un sens MUST rester reconnaissables : la couleur de chaque série, le rouge et le vert de l'ikurriña, les alertes et les erreurs. Elles peuvent être éclaircies pour rester lisibles. Aucun bloc ne garde un fond blanc éblouissant au milieu d'une page sombre.

#### Scenario: Texte courant
- **WHEN** la page Mes équipes est affichée en sombre
- **THEN** le texte des cartes contraste à au moins 4,5:1 avec le fond de la carte

#### Scenario: Séries reconnaissables
- **WHEN** la page Parties est affichée en sombre
- **THEN** les étiquettes de la Série 1 et de la Série 2 gardent chacune leur couleur, distinctes l'une de l'autre et lisibles

#### Scenario: Pas de bloc blanc
- **WHEN** une page quelconque du site est affichée en sombre
- **THEN** aucune carte, aucun bouton ni aucune barre n'y garde un fond blanc

### Requirement: Navigateur accordé au thème
En sombre, les contrôles du navigateur SHALL prendre leur apparence sombre : champs, listes déroulantes, cases et barres de défilement. La barre du navigateur, ou la barre d'état quand le site est installé sur l'écran d'accueil, MUST prendre la couleur du haut de la page.

#### Scenario: Liste déroulante des filtres
- **WHEN** un visiteur au téléphone réglé en sombre ouvre une liste des filtres de la page Classement
- **THEN** la liste s'affiche en sombre

#### Scenario: Barre du navigateur
- **WHEN** l'accueil s'ouvre en sombre
- **THEN** la barre du navigateur prend la couleur sombre du haut de la page, et non du blanc

### Requirement: Typographie commune
Les pages de l'application (accueil, Mes équipes, Parties, Classement, Créneaux, Report et compteur) SHALL employer la police Manrope, servie par le site lui-même, sans requête vers un autre domaine. Chaque texte affiché prend sa taille dans l'échelle 12, 14, 16, 18, 20 et 24 px ; seuls les grands chiffres du compteur la dépassent. Aucun texte MUST NOT s'afficher sous 12 px. Les chiffres sont à chasse fixe, pour que les scores et les colonnes restent alignés. Titres, tuiles et étiquettes s'écrivent en casse normale, sans capitales forcées.

#### Scenario: Détail d'une équipe
- **WHEN** un visiteur regarde la ligne d'une équipe sur la page Classement
- **THEN** le détail sous le nom de l'équipe s'affiche à 12 px au moins

#### Scenario: Tuiles de l'accueil
- **WHEN** un visiteur ouvre l'accueil
- **THEN** les titres des tuiles s'écrivent en casse normale, et non tout en capitales

### Requirement: Icônes d'une même famille
Les icônes dessinées des pages de l'application (barre d'onglets, en-tête, boutons) SHALL venir d'une même famille, Phosphor, inscrites dans la page sans fichier ni requête externes. Les émojis des textes n'en font pas partie. Dans la barre d'onglets, l'icône de l'onglet courant est pleine et celle des autres onglets est au trait.

#### Scenario: Onglet courant
- **WHEN** un visiteur ouvre la page Parties
- **THEN** l'icône de l'onglet « Parties » est pleine, celles des quatre autres onglets au trait

### Requirement: Focus visible au clavier
Sur les pages de l'application, tout élément atteint au clavier SHALL porter un contour de 2 px dans la couleur d'accent, visible en clair comme en sombre. Le premier arrêt de la touche Tab MUST être le lien « Aller au contenu », caché tant qu'il n'a pas le focus. Il mène au contenu de la page, dont le haut reste visible sous l'en-tête, et le Tab suivant reste dans ce contenu.

#### Scenario: Lien d'évitement
- **WHEN** un visiteur au clavier ouvre la page Créneaux et appuie sur Tab
- **THEN** le lien « Aller au contenu » apparaît, entouré d'un contour
- **WHEN** il appuie sur Entrée, puis sur Tab
- **THEN** le haut du contenu est visible et le focus est dans le contenu, et non dans l'en-tête

### Requirement: Zones tactiles et champs
Sur les pages de l'application, chaque bouton isolé SHALL offrir une zone sensible d'au moins 44 × 44 px, même quand son dessin est plus petit. Les boutons serrés en groupe, comme les puces de filtre et les icônes de contact, en sont exceptés : leur zone ne MUST NOT déborder sur le bouton voisin. Les champs de saisie et les listes déroulantes s'affichent à 16 px au moins, pour que l'iPhone ne zoome pas sur le champ touché.

#### Scenario: Petit bouton
- **WHEN** un visiteur touche à quelques pixels du bord du bouton de partage de l'accueil
- **THEN** le partage se lance comme s'il avait touché le bouton

#### Scenario: Nom d'une équipe au compteur
- **WHEN** un visiteur sur iPhone touche le champ du nom d'une équipe dans les réglages du compteur
- **THEN** le clavier s'ouvre sans que la page zoome

### Requirement: Moins d'animations
Quand l'appareil demande moins d'animations, les pages du site SHALL ne plus rien faire bouger : pas de chevron qui tourne, pas de bouton qui s'enfonce, pas de défilement animé, ni reflet sur les blocs en chargement, ni halo sur les boutons de score. Les couleurs MAY encore changer au toucher et au survol, et l'information reste la même.

#### Scenario: Filtres du Classement
- **WHEN** un visiteur dont le téléphone demande moins d'animations ouvre les filtres de la page Classement
- **THEN** les filtres s'ouvrent, le chevron change d'orientation sans tourner, et le bouton ne s'enfonce pas
