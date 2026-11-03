# accueil Specification

## Purpose

Fixer ce que montre la page d'accueil : les blocs présents, leur ordre, et ce qui en est volontairement absent parce que la navigation y donne déjà accès.

## Requirements

### Requirement: Composition de l'accueil
L'accueil SHALL présenter, dans cet ordre, le bloc « Mes équipes », le bloc « D'ici dimanche » puis le bloc « Championnats » (avancement de la saison), et aucun autre bloc de contenu.

#### Scenario: Ouverture de l'accueil
- **WHEN** un visiteur ouvre l'accueil et que les données sont chargées
- **THEN** il voit « Mes équipes », « D'ici dimanche » puis « Championnats », et rien d'autre entre l'en-tête et le pied de page

### Requirement: Avancement des championnats
Le bloc « Championnats » SHALL donner le nombre de parties jouées sur le total, toutes phases confondues, puis, par spécialité et par série, deux lignes avec leur barre : « Poules » et « Phases finales », chacune avec ses parties jouées sur son total. Une ligne sans aucune partie dans les données n'apparaît pas. Sous chaque série, un encart rappelle les dates des 1/4, 1/2 et finale de cette série, lues dans ses parties, sans les créneaux ; il reste affiché jusqu'au jour de la dernière de ces dates inclus.

#### Scenario: Phase de poules en cours
- **WHEN** la série 1 a joué 24 de ses 30 parties de poule et aucune de ses 7 parties de phase finale
- **THEN** elle affiche « Poules 24 / 30 » et « Phases finales 0 / 7 », suivies de l'encart « Phases finales : 1/4 sam. 14/11 · 1/2 dim. 29/11 · finale dim. 6/12 »

#### Scenario: Saison terminée
- **WHEN** le jour de la finale de la série est passé
- **THEN** l'encart des phases finales de cette série n'apparaît plus

### Requirement: Créneaux et compteur hors de l'accueil
L'accueil SHALL ne plus afficher de tuile pour les créneaux libres du Trinquet Paris ni pour le compteur de points. Ces pages MUST rester accessibles depuis l'accueil : les créneaux par l'onglet Créneaux de la barre de navigation, le compteur par le bouton calculette de l'en-tête.

#### Scenario: Aller aux créneaux
- **WHEN** un visiteur veut voir les créneaux libres depuis l'accueil
- **THEN** l'onglet Créneaux l'y mène

#### Scenario: Ouvrir le compteur
- **WHEN** un visiteur veut marquer une partie depuis l'accueil
- **THEN** le bouton calculette de l'en-tête ouvre le compteur de points

### Requirement: Lien vers la présentation
Le pied de page de l'accueil SHALL porter un lien « Présenter le site à un joueur » vers la page Découvrir (spec `decouvrir`), à partager à qui ne connaît pas le site. Ce lien n'est pas un bloc de contenu : il ne change pas la composition de l'accueil.

#### Scenario: Faire connaître le site
- **WHEN** un visiteur touche « Présenter le site à un joueur » en bas de l'accueil
- **THEN** la page Découvrir s'ouvre

### Requirement: Première visite par la présentation
À l'ouverture de l'accueil, un appareil qui n'a encore aucune clé `lidfpb_` dans son stockage SHALL être renvoyé vers la page Découvrir (spec `decouvrir`), une seule fois : la clé `lidfpb_decouvert_v1` est posée avant le renvoi, et aussi par Découvrir elle-même. Un visiteur qui a déjà utilisé le site (équipe suivie, filtres, cache) n'est pas renvoyé. Si le stockage est indisponible, l'accueil s'affiche sans renvoi. Les autres pages, ouvertes par un lien direct, ne renvoient jamais.

#### Scenario: Toute première ouverture
- **WHEN** un visiteur ouvre l'accueil pour la première fois sur son appareil
- **THEN** il arrive sur la page Découvrir, et « Suivre mon équipe » le ramène à l'accueil, qui s'affiche

#### Scenario: Visiteur habitué
- **WHEN** un visiteur qui suit déjà une équipe ouvre l'accueil
- **THEN** l'accueil s'affiche directement
