# Proposal

## Why

Les joueurs consultent le site surtout le soir : avant une partie, dans les gradins d'un trinquet peu éclairé, ou chez eux. Beaucoup de téléphones sont réglés en sombre. Le site reste alors blanc et éblouit, alors que le compteur sait déjà passer en sombre, mais seulement en plein écran. Ce changement aligne tout le site sur le réglage du téléphone.

C'est un premier pas volontairement petit : le site suit le téléphone, sans bouton à ajouter ni réglage à retenir. On vérifie ainsi une hypothèse : **le sombre automatique suffit**. Si des joueurs demandent un choix à la main, un bouton pourra venir ensuite.

## What Changes

- **Toutes les pages passent en sombre quand le téléphone l'est** (`prefers-color-scheme: dark`), et restent claires sinon. Sont concernées : accueil, Mes équipes, Parties, Classement, Créneaux, Report, compteur hors plein écran, Découvrir et la page 404. `equipes.html` ne fait que rediriger et n'a rien à afficher.
- Fond, cartes, textes, bordures, couleurs des séries, alertes et barre d'onglets ont leur version sombre. Les couleurs de l'ikurriña (rouge, vert) restent reconnaissables, éclaircies au besoin pour rester lisibles.
- Les contrôles natifs (champs, listes, barres de défilement) et la couleur de la barre du navigateur suivent le thème.
- **Compteur** : hors plein écran, la page suit le téléphone comme les autres. Les couleurs d'équipe y sont éclaircies sur fond sombre, comme elles le sont déjà en plein écran sombre. Le bouton Clair/Sombre du plein écran ne change pas : il ne règle que le plein écran.
- Pas de bouton, pas de nouvelle clé `localStorage`, pas de script partagé : chaque page reste autonome.

## Capabilities

### New Capabilities
- `apparence` : le thème clair et sombre commun à toutes les pages, réglé par le téléphone. Cette spec accueillera plus tard ce qui touche à l'apparence de l'ensemble du site (taille du texte, contraste).

### Modified Capabilities
- `compteur` : les couleurs d'équipe s'éclaircissent sur tout fond sombre, page comprise, et plus seulement en plein écran sombre. Le thème du plein écran ne change pas : il suit le bouton, ou à défaut le téléphone.

## Impact

- **Pages** : les 9 pages affichées (`index`, `equipe`, `programme`, `classement`, `creneaux`, `report`, `compteur`, `decouvrir`, `404`). Leurs variables `:root` reçoivent une version sombre, les couleurs écrites en dur passent en variables, `color-scheme` et `<meta name="theme-color">` s'adaptent. Chaque pied de page change de version. Il reste 30 à 70 couleurs en dur par page, surtout des blancs (`#fff`) et des ombres.
- **Tests** : un scénario par page en `colorScheme: "dark"` dans `tests/pages.spec.mjs`, avec le contrôle du contraste des textes principaux.
- **Docs** : le README et la spec `apparence`. Aucun appel API, aucune clé `localStorage`, aucune donnée personnelle.
- **Hors champ** : l'image de partage `icons/og-decouvrir.png` et les icônes de l'application restent telles quelles.

## Hypothèses à valider

1. **Suivre le téléphone suffit**, sans bouton sur le site. Pour mesurer : le site n'a pas de statistiques. On demande à deux ou trois capitaines, trois semaines après la mise en ligne, s'il leur manque un choix à la main.
2. **Un seul jeu de couleurs sombres pour tout le site**, recopié dans chaque page comme les autres constantes communes. On ne crée pas de feuille de style partagée.
3. **Le plein écran du compteur garde son fond noir**. Hors plein écran, le sombre est un gris très foncé, comme dans les applications du téléphone, plus doux à l'œil pour lire des listes.
4. **Sur un vrai iPhone installé sur l'écran d'accueil**, la barre d'état prend bien la couleur sombre. C'est à vérifier sur l'appareil avant la fusion.
