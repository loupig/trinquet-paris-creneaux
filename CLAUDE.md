# CLAUDE.md

Site statique des championnats d'Île-de-France de Trinquet Pala Gomme Pleine
(LIDFPB), servi tel quel par GitHub Pages : chaque push sur `main` part en
production en deux minutes, sans build pour attraper une erreur avant.
Le [README](README.md) décrit les pages et la configuration, les specs de
[`openspec/specs/`](openspec/specs/) le comportement de chaque page.

## Vérifier avant de dire « fini »

- `npm test` : syntaxe du JS de chaque page, puis les pages dans Chromium
  sur données fictives. Montrer la sortie, pas seulement le résultat.
- Une fonctionnalité nouvelle ajoute son scénario dans `tests/pages.spec.mjs`.
- Un changement visible : capture sur écran de téléphone (Pixel 7, comme les
  tests), thème clair et sombre.
- Avant d'ouvrir la PR : `/code-review` sur le diff, `/security-review` si
  le changement touche aux données de l'API, au `localStorage` ou à la CI.

## Conventions

- Tout en français : interface, commentaires, commits, specs.
- Chaque page est autonome (CSS et JS inline), sans dépendance ni build.
  Les constantes dupliquées (`PTS_VICTOIRE`, `PHASE_POULES`,
  `QUALIFIES_PAR_POULE`…) restent identiques dans les pages qui les portent.
- Page modifiée : mettre à jour `Version AAAA.MM.JJ` dans son pied de page
  (`.2`, `.3`… pour une deuxième mise en ligne le même jour).
- `fetes.js` modifié : changer son `?v=` dans chaque page qui le charge.
- Comportement modifié : mettre la spec à jour dans le même changement
  (OpenSpec, `/opsx:propose` pour un changement qui mérite d'être cadré).
- Clé `localStorage` nouvelle ou changée : préfixe `lidfpb_`, suffixe de
  version `_v1`, et le tableau du README à jour.

## Non-objectifs

- Pas de build, de framework ni de dépendance côté pages.
- Pas de service worker, de fenêtre surgissante ni de compte : voir
  « Choix assumés » dans le README.
- Le dépôt est public : jamais de numéro de licence, de téléphone, d'adresse
  ou de date de naissance dans le code, les tests ou les captures.
  `tests/donnees.mjs` n'utilise que des clubs et joueurs inventés.
