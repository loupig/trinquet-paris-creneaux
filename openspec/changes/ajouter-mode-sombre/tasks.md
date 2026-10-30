# Tasks

Vérification par `npm test` (syntaxe, puis pages dans Chromium sur les données fictives de `tests/donnees.mjs`) et par des captures sur écran de Pixel 7, en clair et en sombre. Une page par commit.

## 1. Accueil, et outils de test du sombre

- [x] 1.1 Prendre les captures de référence en clair des 9 pages sur Pixel 7, dans le scratchpad, pour comparer après chaque page. Vérifier : 9 captures présentes.
- [x] 1.2 Dans `tests/pages.spec.mjs`, écrire les outils du `describe` « Thème sombre » en `colorScheme: "dark"` : luminance du fond du `body`, contraste texte/fond calculé sur les styles des cartes, titres et onglets, liste des éléments visibles à fond blanc (avec exceptions nommées). Vérifier : sur l'accueil non modifié, le test échoue sur le fond clair.
- [x] 1.3 `index.html` : ajouter au `:root` les variables de rôle (`--surface-2`, `--verre`, `--ombre`, `--sur-accent`, `--vert`, `--rouge`) avec les valeurs claires actuelles, y reporter les couleurs en dur, ajouter le bloc `@media (prefers-color-scheme: dark)` avec la palette du design, et les deux `<meta name="theme-color">` avec `media`. Vérifier : le test sombre de l'accueil passe, et la capture en clair est identique à la référence.
- [x] 1.4 Scénario « le réglage change, page ouverte » sur l'accueil (`emulateMedia` du clair vers le sombre, sans recharger). Vérifier : le fond devient sombre et la balise `theme-color` sombre s'applique.

## 2. Pages de l'application

- [x] 2.1 `equipe.html` (Mes équipes), même méthode qu'en 1.3. Vérifier : test sombre de la page vert, capture claire identique, capture sombre relue (carte « Prochaine partie », boutons, partage WhatsApp).
- [x] 2.2 `programme.html` (Parties). Vérifier : test sombre vert (dont étiquettes Série 1 et Série 2 distinctes et lisibles), capture claire identique, liste des filtres en sombre.
- [x] 2.3 `classement.html`. Vérifier : test sombre vert, capture claire identique, capture sombre du tableau, des quarts et du simulateur.
- [x] 2.4 `creneaux.html`. Vérifier : test sombre vert, capture claire identique, capture sombre.
- [x] 2.5 `report.html`. Vérifier : test sombre vert, capture claire identique, capture sombre.
- [x] 2.6 Test « palette identique » : les variables sombres ont les mêmes valeurs dans les sept pages qui les portent. Vérifier : il passe, puis échoue si l'on change une valeur dans une seule page.

## 3. Compteur

- [x] 3.1 `compteur.html` : variables et bloc sombre comme en 1.3, pour la page hors plein écran. Le plein écran garde ses règles `.fs.sombre`. Vérifier : test sombre de la page vert, plein écran clair et sombre inchangés (tests existants verts).
- [x] 3.2 `sombreActif()` devient `pleinEcran ? sombre() : systemeSombre()`, avec un écouteur `change` sur `prefers-color-scheme` qui relance `renderAll()`. `theme-color` réécrite sur la balise du thème du téléphone en plein écran, remise en sortant. Vérifier : nouveau scénario « page du compteur en sombre », où une équipe verte a son nom et son score dans le vert clair, et qui passe.

## 4. Découvrir et 404

- [x] 4.1 `decouvrir.html` : palette propre à la page (`--surface`…), variables de rôle et bloc sombre, `theme-color` double. Vérifier : test sombre vert, menu plein écran en sombre, capture claire identique.
- [x] 4.2 `404.html` : bloc sombre sur sa palette réduite, `theme-color` double. Vérifier : test sombre vert, capture.

## 5. Finitions

- [x] 5.1 Mettre `Version 2026.MM.JJ` du jour dans le pied de page des 8 pages qui en ont une (la 404 n'en a pas). Vérifier : `grep "Version " *.html`.
- [x] 5.2 README : décrire le thème sombre (dans « Choix assumés » : suit le téléphone, sans bouton) et la règle « couleur nouvelle = variable avec sa valeur sombre ». Ajouter cette règle aux conventions de CLAUDE.md. Vérifier : relecture, et aucune contradiction avec la spec `apparence`.
- [x] 5.3 `npm test` complet et sortie montrée. Captures sombres des 9 pages sur Pixel 7, y compris l'état « échec du chargement » de l'accueil.
- [x] 5.4 `/code-review` sur le diff et corriger les constats.
- [ ] 5.5 Archiver le changement (`/opsx:archive`) dans la même PR, comme pour l'agenda : spec `apparence` créée, spec `compteur` à jour. Vérifier : `openspec validate --specs --strict` passe.
- [ ] 5.6 Ouvrir la PR sur le modèle du dépôt. Laisser à la personne qui décide la vérification sur un vrai iPhone (Safari et installé : barre d'état) et sur Android, puis la rubrique « Décision humaine ».

## Workflow follow-up

- Trois semaines après la mise en ligne, demander à deux ou trois capitaines s'il leur manque un bouton Clair/Sombre.
