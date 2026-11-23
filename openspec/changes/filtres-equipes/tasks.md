# Tasks

À appliquer après la fusion de la PR #63 (`communications-equipes`), sur une branche repartie de `main`. Vérification par `npm test` et par des captures sur Pixel 7, en clair et en sombre.

## 1. Scénarios d'abord

- [ ] 1.1 Bloc Filtres de la liste :
  - replié par défaut, avec « Tout est affiché » (ajouter `equipe.html` à la boucle « Filtres repliés par défaut ») ;
  - « Série 1 » désactivée : seules les cartes de série 2 restent, avec les mêmes rangs, et le résumé dit « Série 2 » ;
  - après rechargement, la série 1 est toujours masquée ;
  - les deux séries désactivées : « Aucune équipe ne correspond aux filtres. » ;
  - pas de bloc sur la page d'une équipe ;
  - le pli est partagé avec le Classement.
- [ ] 1.2 Le test « le script du pli et du résumé est le même » passe à quatre pages.
- [ ] 1.3 Deux spécialités (série 1 recopiée en spécialité « 3 ») : l'en-tête des cartes et la liste « Aperçu pour » nomment la spécialité. Avec une seule spécialité, rien ne change.
- [ ] 1.4 Organisateur, « Série 1 » désactivée : pas d'avion pour Alpha 1, l'aperçu ne propose que la série 2, et la note ne compte que la série 2.

  Vérifier : les nouveaux scénarios échouent sur la page actuelle.

## 2. Bloc et état

- [ ] 2.1 Recopier du Classement :
  - HTML de la `.recap-card`, sans « Découpage » ;
  - CSS des filtres, avec ses variables existantes, et `.empty-state` ;
  - script du pli et du résumé, à l'identique ;
  - `SPEC_LABELS`.
- [ ] 2.2 Écrire l'état des filtres :
  - `FILTER_CACHE_KEY = "lidfpb_equipes_filters_v1"` ;
  - `filterState`, `loadFilterState`, `saveFilterState`, `renderSpecChips` et `setupFilters` ;
  - le bloc montré par `renderListe`, caché par `renderEquipe`.

## 3. Filtrage

- [ ] 3.1 `equipeAffichee(t)`. `groupesDeLaListe()` filtre après le classement de chaque poule, et `renderListe()` affiche le message quand rien ne reste.
- [ ] 3.2 Communications : `equipesDeLApercu` et la note de « Prochaine partie » ne retiennent que les équipes affichées. L'aperçu sans équipe dit « Aucune équipe affichée n'est concernée ».
- [ ] 3.3 Plusieurs spécialités : `poule-sub` dans l'en-tête des cartes, et la spécialité dans le libellé de « Aperçu pour ».

## 4. Finitions

- [ ] 4.1 `Version AAAA.MM.JJ` de `equipe.html`.
- [ ] 4.2 README : `lidfpb_equipes_filters_v1` et `lidfpb_filters_open_v1` (quatre pages) dans le tableau `localStorage`, `SPEC_LABELS` (avec la page Équipes) dans les constantes.
- [ ] 4.3 `npm test` complet, sortie montrée.
- [ ] 4.4 Captures Pixel 7, en clair et en sombre : le bloc replié avec son résumé, puis déplié.
- [ ] 4.5 `/code-review`, et `/security-review` pour le `localStorage`. Corriger les constats.
