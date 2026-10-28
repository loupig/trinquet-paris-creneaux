# decouvrir Specification

## Purpose

Présenter le site à un joueur ou un capitaine qui ne le connaît pas encore, par une page à partager (groupe WhatsApp du club, message de la ligue), et l'amener à une seule action : ouvrir l'accueil pour choisir son équipe.

## Requirements

### Requirement: Une seule action
La page `decouvrir.html` SHALL n'avoir qu'une action principale, « Suivre mon équipe », qui ouvre l'accueil, où un visiteur sans équipe suivie trouve « Suivre une équipe », qui mène à la page Mes équipes. Le bouton « Ouvrir le site » de la barre du haut et le bouton du menu mènent au même endroit. La page MUST NOT proposer d'autre appel concurrent au premier écran.

#### Scenario: Nouveau visiteur
- **WHEN** un visiteur arrivé par un lien partagé touche « Suivre mon équipe »
- **THEN** l'accueil s'ouvre

### Requirement: Contenu de la présentation
La page SHALL rester courte et présenter, dans cet ordre : l'accroche avec l'aperçu d'un téléphone, une phrase d'accroche en grand, les cinq fonctions en une phrase chacune avec l'onglet où les trouver, les trois étapes pour commencer, six questions fréquentes, puis l'appel final identique à celui du haut. Les questions se déplient dans la page, sans fenêtre (spec `navigation`). La page MUST NOT afficher d'avis inventés : seuls de vrais avis de joueurs, avec leur accord, pourront y figurer. L'aperçu du téléphone est signalé comme données d'exemple.

#### Scenario: Question fréquente
- **WHEN** un visiteur touche une question
- **THEN** la réponse se déplie sous la question

### Requirement: Hors navigation de l'application
La page SHALL rester hors de la barre d'onglets : elle porte sa propre barre du haut, qui marque la section en cours de lecture, et n'appelle pas l'API de la ligue. Elle charge sa police depuis le site, sans requête vers un tiers. Elle est indexable par les moteurs de recherche, avec titre, description, image de partage (`icons/og-decouvrir.png`, 1200 × 630) et questions fréquentes balisées.

### Requirement: Menu plein écran
Sur un écran étroit, un bouton de la barre du haut SHALL ouvrir un menu plein écran vers les sections de la page, par exception à la règle « Pas de fenêtre surgissante » de la spec `navigation`. Le bouton qui l'ouvre MUST rester visible au-dessus du menu et le refermer ; toucher un lien ou la touche Échap le referment aussi.

#### Scenario: Aller aux questions
- **WHEN** un visiteur ouvre le menu puis touche « Questions »
- **THEN** le menu se referme et la page défile jusqu'aux questions

#### Scenario: Chargement
- **WHEN** la page s'ouvre
- **THEN** aucune donnée de la ligue n'est demandée et aucune barre d'onglets n'apparaît

### Requirement: Mouvement mesuré
Les sections SHALL apparaître une seule fois en montant légèrement à leur arrivée à l'écran, et la phrase d'accroche s'allumer mot à mot dans l'ordre de lecture. Quand l'appareil demande moins d'animations, seuls les fondus restent. Sans JavaScript, tout le contenu MUST rester visible.

#### Scenario: Moins d'animations
- **WHEN** l'appareil demande de réduire les animations
- **THEN** les sections apparaissent en fondu, sans déplacement
