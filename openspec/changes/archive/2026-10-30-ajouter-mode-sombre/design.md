# Design

## Context

- Chaque page porte ses couleurs dans un bloc `:root` en tête de son `<style>`, avec `color-scheme: light`. Les sept pages de l'application partagent les mêmes noms et les mêmes valeurs (`--bg`, `--card-bg`, `--text`, `--muted`, `--border`, `--serie1-*`, `--serie2-*`, `--accent*`, `--warn-*`, `--error-*`). Découvrir a sa propre palette (`--surface` au lieu de `--card-bg`, `--muted` plus foncé) et la 404 une palette réduite sur une ligne.
- Hors `:root`, il reste par page 30 à 70 couleurs écrites en dur : surtout `#fff` (fonds de cartes, de boutons, texte sur bouton coloré), le verre de la barre d'onglets et des boutons flottants (`rgba(255,255,255,.55)`), des ombres (`rgba(26,26,46,…)`), le vert du bouton compteur (`#009B48`) et quelques teintes isolées (`#ececef`, `#f6f6f8`, `#e3f4ea`…).
- Aucune page ne pose de couleur depuis son JavaScript, sauf le compteur : couleurs d'équipe (`trait`, `sombre`, `surCouleur()`), confettis, graphe. Il bascule déjà ces couleurs avec `sombreActif()`, qui vaut aujourd'hui `pleinEcran && sombre()`.
- `<meta name="theme-color">` vaut `#ffffff` (ou `#f4f5f7` pour Découvrir et la 404). Le compteur la réécrit en JS à l'ouverture et à la fermeture du plein écran. `apple-mobile-web-app-status-bar-style` vaut `default`.
- Les tests tournent sur Pixel 7 dans Chromium, et `page.emulateMedia({ colorScheme })` est déjà utilisé une fois (test du plein écran du compteur).

## Goals / Non-Goals

**Goals:**
- Une seule palette sombre, identique dans chaque page qui porte les mêmes variables.
- En clair, un rendu identique pixel pour pixel à celui d'aujourd'hui.
- Une vérification automatique : contraste des textes principaux et absence de fond blanc en sombre, page par page.

**Non-Goals:**
- Pas de bouton ni de clé `localStorage` (voir la proposition).
- Pas de feuille de style ni de script partagés : chaque page reste autonome.
- Pas de refonte des couleurs du thème clair.

## Decisions

**1. Redéfinir les variables sous `@media (prefers-color-scheme: dark)`, rien d'autre.**
Chaque page ajoute, juste après son `:root`, un bloc `@media (prefers-color-scheme: dark) { :root { color-scheme: dark; … } }` qui ne redéfinit que des variables. Les règles de la page ne changent pas, et le navigateur bascule tout seul quand le réglage change, sans JavaScript.
Alternative écartée : une classe `.sombre` posée par un script. Elle demande du JS, provoque un flash blanc au chargement, et ne sert qu'à un bouton qu'on ne fait pas.

**2. Les couleurs en dur deviennent des variables, ajoutées au `:root` clair avec leur valeur actuelle.**
On ajoute un petit nombre de variables nommées par rôle, et non par couleur :
- `--surface-2` pour les fonds légèrement teintés (`#f6f6f8`, `#ececef`) ;
- `--verre` pour le fond translucide de la barre d'onglets et des boutons flottants ;
- `--ombre` pour la teinte des ombres ;
- `--sur-accent` pour le texte posé sur un bouton plein (blanc dans les deux thèmes, gardé pour la lisibilité) ;
- `--vert` et `--rouge` pour l'ikurriña.

Un `#fff` qui sert de fond devient `var(--card-bg)` ; un `#fff` posé sur un fond coloré reste blanc. On trie au cas par cas, page par page. En clair, chaque variable reprend exactement l'ancienne valeur : le rendu clair ne bouge pas.

**3. La palette sombre.**
Les valeurs de départ, à ajuster pendant la mise en œuvre jusqu'à passer le contrôle de contraste :
- `--bg` `#121318`, `--card-bg` `#1c1d24`, `--surface-2` `#24252e`, `--border` `#2e303a` ;
- `--text` `#e8e9ee`, `--muted` `#a0a3b0` ;
- séries : `--serie1-text` `#5eead4` sur `#10302c`, `--serie2-text` `#fbbf6a` sur `#33240f` ;
- `--accent` `#8ba6ff` sur `--accent-bg` `#1c2440` ;
- alertes : texte `#f3d27a` sur `#2e2610`, erreurs : texte `#ff9a94` sur `#3a1517` ;
- `--vert` `#2fd17a`, `--rouge` `#ff4d5e`, ceux du plein écran sombre du compteur ;
- `--verre` `rgba(28,29,36,.6)`, `--ombre` `rgba(0,0,0,.5)`.

On a préféré un gris très foncé au noir pur : moins de halo autour du texte clair sur les écrans OLED, et des ombres qui restent visibles. Le plein écran du compteur garde son noir, choisi pour un usage différent : un tableau de score à distance.

**4. Deux `<meta name="theme-color">` avec `media`.**
`<meta name="theme-color" media="(prefers-color-scheme: light)" content="…">` et la même en `dark`, avec la couleur du haut de la page. Le navigateur choisit la bonne. Le compteur réécrit aujourd'hui une seule balise : il réécrira celle qui correspond au thème du téléphone, en plein écran, et la remettra à sa valeur en sortant. `apple-mobile-web-app-status-bar-style` reste `default`, qui suit le thème de la page sur iOS récent.

**5. Compteur : `sombreActif()` suit le fond réellement affiché.**
`sombreActif()` devient `pleinEcran ? sombre() : systemeSombre()`, où `systemeSombre()` lit `matchMedia("(prefers-color-scheme: dark)")`. Un écouteur `change` sur cette requête relance `renderAll()`. Ainsi les couleurs d'équipe, le graphe et les confettis s'éclaircissent sur la page sombre comme sur le plein écran sombre. Le bouton Clair/Sombre et `state.sombre` ne règlent toujours que le plein écran.

**6. Tests : une boucle sur les pages, en sombre.**
Dans `tests/pages.spec.mjs`, un `describe` en `colorScheme: "dark"` ouvre chaque page sur les données fictives, puis vérifie trois choses dans la page :
- le fond du `body` est sombre (luminance relative < 0,1) ;
- le contraste du texte des cartes, des titres et des onglets est d'au moins 4,5:1, calculé à partir des styles calculés ;
- aucun élément visible n'a un fond blanc, en dehors d'une courte liste d'exceptions nommées (la pastille « blanc » d'une équipe du compteur).

Un scénario passe la page du clair au sombre avec `emulateMedia` sans la recharger. Un scénario du compteur vérifie la couleur éclaircie d'une équipe verte hors plein écran.

## Risks / Trade-offs

- [Une couleur en dur oubliée laisse un bloc blanc] → Le test « aucun fond blanc » la trouve sur les données fictives. Les états rares (erreur de l'API, chargement) se vérifient sur des captures.
- [La palette dupliquée dérive d'une page à l'autre] → Même règle que les autres constantes dupliquées : identique partout. Un test compare les valeurs des variables sombres des sept pages.
- [Le rendu clair change par erreur pendant la reprise des couleurs] → Captures en clair avant et après, comparées page par page.
- [La barre d'état de l'iPhone installé reste claire] → À vérifier sur un vrai iPhone avant la fusion, décision humaine. Au pire, c'est cosmétique et la page reste lisible.
- [Volume du diff, 9 pages] → Une page par commit, testée à chaque fois, pour une revue lisible.

## Migration Plan

Aucune migration : site statique, déploiement par push sur `main`. Retour arrière par `git revert`. Aucune clé `localStorage` n'est créée.

## Écarts constatés à la mise en œuvre

- **Variables de rôle** : `--surface-2` et `--surface-3` (squelettes de chargement), `--verre` et `--verre-bord` (le fond et le bord du verre n'ont pas la même valeur en sombre), `--ombre-rgb` (pour garder l'opacité de chaque ombre), `--sur-accent` (texte posé sur une couleur pleine : blanc en clair, quasi noir en sombre, car ces couleurs s'éclaircissent), `--vert-wa` (bouton WhatsApp, foncé en sombre pour un contraste de 4,5:1). Le Classement et Découvrir ont leurs propres variables pour leurs couleurs propres (médailles, blocs foncés `--fort-*`, voile du menu, titre en dégradé).
- **Compteur** : la palette claire s'écrit pour `:root, .fs:not(.sombre)`, et `.fs.sombre` reprend la palette sombre. Ainsi le plein écran suit son bouton quel que soit le réglage du téléphone.
- **Test d'audit** : Chromium rend un `color-mix()` en `color(srgb …)`, que l'audit lit aussi. Découvrir est parcourue avant l'audit, car ses sections n'apparaissent qu'au défilement.
- **Hors d'atteinte** : l'écran de lancement de l'application installée sur Android prend la couleur `background_color` du manifeste, qui ne peut pas dépendre du thème. Il reste clair un instant.
