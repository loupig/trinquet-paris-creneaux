# Tasks

Vérification par `npm test` (syntaxe, puis pages dans Chromium sur les données fictives de `tests/donnees.mjs`), et par des captures sur écran de Pixel 7, en clair et en sombre.

## 1. Ligne compacte du Classement

- [x] 1.1 Prendre les captures de référence du Classement sur Pixel 7, en clair et en sombre, dans le scratchpad. Vérifier : deux captures présentes.
- [x] 1.2 Écrire d'abord les scénarios dans `tests/pages.spec.mjs` :
  - en-tête de colonnes ;
  - valeurs J, G, P, GA et Moy. d'une équipe classée et d'une équipe sans partie ;
  - dépli et repli au toucher, avec `aria-expanded`, le chevron qui tourne et le fond teinté ;
  - phrase d'aide « 👥 Touchez une équipe pour voir ses joueurs » sur la première carte seulement, y compris après un filtre qui masque la série 1 ;
  - joueurs en tête du détail déplié ;
  - joueurs invisibles sur la ligne repliée ;
  - six lignes de la première poule visibles au premier écran ;
  - pas de défilement horizontal à 320 px.

  Vérifier : les scénarios échouent sur la page actuelle.
- [x] 1.3 `classement.html` : réécrire `buildRankRow()` en bouton à grille et détail `.rank-plus` frère. Ajouter `.rank-head` dans `buildPouleCard()`, le CSS de la grille et l'ensemble `deplies`. Remplacer le commentaire CSS sur le tableau écarté. Vérifier : les scénarios de 1.2 passent, et ceux du général (pastilles, teintes), des quarts et du simulateur restent verts.
- [x] 1.4 Adapter les scénarios des joueurs (vers les lignes 1774 et 1792) pour toucher la ligne avant de lire `.rank-joueurs`. Vérifier : ils passent.
- [x] 1.5 Phrase de la règle : « (colonne Moy.) ». Lien Bilan sans sous-titre. Vérifier : scénario « lien sur une ligne » vert, et le test du Bilan qui ouvre ce lien reste vert.

## 2. Filtres repliés par défaut

- [x] 2.1 Scénarios « première visite : replié, “Tout est affiché” » sur les trois pages, et « ouvert à la main sur Classement, ouvert sur Créneaux ». Vérifier : ils échouent avant le changement.
- [x] 2.2 `programme.html`, `classement.html`, `creneaux.html` : défaut replié, ouvert seulement si la clé vaut `"1"`. Le HTML initial passe à `aria-expanded="false"` et à `hidden` sur le corps, pour éviter un saut à l'ouverture. Vérifier : 2.1 passe.
- [x] 2.3 Adapter les scénarios qui cliquent `#filtersToggle` en partant d'un bloc ouvert (vers les lignes 624 à 666). Vérifier : tous verts.

## 3. Finitions

- [x] 3.1 `Version 2026.11.11` dans le pied de page de `classement.html`, `programme.html` et `creneaux.html`. Vérifier : `grep "Version " classement.html programme.html creneaux.html`.
- [x] 3.2 README : description du Classement si elle cite les joueurs toujours affichés, et la ligne de `lidfpb_filters_open_v1` (défaut replié). Vérifier : relecture.
- [x] 3.3 `npm test` complet, sortie montrée.
- [x] 3.4 Captures Pixel 7 du Classement en clair et en sombre (par poule, général, une ligne dépliée), de Parties et Créneaux repliés, et du Classement à 1280 px. Comparer avec 1.1.
- [x] 3.5 `/code-review` sur le diff, et corriger les constats. `/security-review` si le diff touche à l'usage de `localStorage` au-delà du défaut.
- [x] 3.6 Archiver le changement dans la même PR : specs `classement` et `programme` à jour.
- [ ] 3.7 Ouvrir la PR sur le modèle du dépôt, avec les captures et la mesure avant/après (équipes visibles au premier écran). Laisser la rubrique « Décision humaine » à la personne qui décide.
