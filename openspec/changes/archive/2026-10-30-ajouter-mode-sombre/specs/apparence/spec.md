# Spec Delta

## Purpose

Fixer l'apparence commune à toutes les pages du site, à commencer par le thème clair ou sombre, réglé par le téléphone du visiteur.

## ADDED Requirements

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
