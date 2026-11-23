# Design

## Context

Le Classement a déjà ce qu'il faut à recopier :
- dans le HTML, une `.recap-card` avec le bouton `#filtersToggle` et le corps `#filtersBody`, qui contient `#filterSpecs` (rempli d'après les données) et `#filterSeries` (deux pastilles fixes `data-serie`) ;
- le CSS `.recap-card`, `.filters-toggle`, `.filters-recap`, `.filters-body`, `.filter-subtitle`, `.filter-group` et `.filter-chip`, avec ses variantes `serie-1` et `serie-2` ;
- dans le JS, `filterState { specs, series }`, `loadFilterState` et `saveFilterState`, `renderSpecChips(teams)` (les pastilles d'après toutes les équipes, une valeur inconnue démarre active) et `setupFilters()` ;
- le script séparé du pli et du résumé (`var CLE_PLI = "lidfpb_filters_open_v1"` … `</script>`), identique dans Parties, Classement et Créneaux, ce qu'un test vérifie.

Côté `equipe.html` :
- la liste vient de `groupesDeLaListe()` (cartes par `spec|cat|poule`), dessinée par `renderListe()` ;
- les communications (PR #63) s'appuient sur le registre `envois`, rempli par les lignes dessinées, sur `equipesDeLApercu(com)` et sur la note de « Prochaine partie », qui compte sur tout `etat.index`.

## Goals / Non-Goals

**Goals :**
- Le même bloc, le même geste et le même résumé que sur les trois autres pages.
- Les communications suivent ce qui est affiché, sans règle de plus à apprendre.

**Non-Goals :**
- Filtre par club, poule ou équipe suivie.
- Mettre le script commun dans un fichier partagé : la règle « chaque page autonome » tient, et le test de copie identique passe à quatre pages.

## Decisions

### 1. Le bloc, dans le HTML de la page, montré sur la liste seulement

On recopie le HTML de la `.recap-card` du Classement, moins le groupe « Découpage », en tête de `<main>`, avant `#banner-slot`. `renderListe()` la montre, `renderEquipe()` la cache (`hidden`).

Le bloc doit être dans le HTML statique, et non construit par la page, pour que le script du pli (un `<script>` à part, recopié à l'identique) le trouve au chargement, comme sur les autres pages.

### 2. L'état des filtres

`FILTER_CACHE_KEY = "lidfpb_equipes_filters_v1"`. `filterState = { specs: {}, series: { "1": true, "2": true } }`. `loadFilterState` et `saveFilterState` sont recopiées du Classement, sans `mode` ni `club`.

`renderSpecChips` est recopiée et appelée à chaque rendu de la liste, avec toutes les équipes de `etat.index`. `setupFilters()` branche les pastilles de série. Chaque changement enregistre l'état et rappelle `renderListe()`, qui garde les lignes dépliées et la communication choisie.

`SPEC_LABELS` est recopiée du Classement, de Parties et de l'accueil (`{ "2": "Trinquet / P.G Pleine Masculin" }`), puis inscrite au tableau du README.

### 3. Le filtrage

Une fonction `equipeAffichee(t)` renvoie `filterState.specs[t.spec] !== false && filterState.series[t.cat] !== false`. Une spécialité ou une série inconnue de l'état est donc affichée.

- `groupesDeLaListe()` écarte les groupes dont la spécialité ou la série est filtrée. Le classement de chaque poule est calculé avant, sur toute la poule : les rangs ne bougent pas.
- Sans groupe restant, `renderListe()` affiche `<div class="empty-state">Aucune équipe ne correspond aux filtres.</div>`, comme au Classement (la classe est à recréer dans le CSS).

### 4. Les communications suivent l'affichage

- **Avions en papier** : `envois` ne contient que les lignes dessinées, donc les équipes masquées n'ont pas d'avion. Rien à changer.
- **Aperçu** : `equipesDeLApercu(com)` garde les seules équipes que `equipeAffichee` laisse passer.
- **Note** : celle de « Prochaine partie » compte de même.
- **Proposée ou non** : une communication proposée le reste, même si les filtres ne laissent aucune équipe concernée. On évite ainsi une pastille qui disparaît quand on touche un filtre. L'aperçu dit alors « Aucune équipe affichée n'est concernée ».

### 5. Plusieurs spécialités

`var specsMultiples = Object.keys(spécialités vues dans etat.index).length > 1`, calculé à chaque rendu.
- Dans `buildCarteListe`, l'en-tête ajoute `<span class="poule-sub">` avec le libellé de la spécialité quand `specsMultiples` est vrai.
- Dans `equipesDeLApercu`, le libellé devient « PEP 1 · Série 1 · Trinquet / P.G Pleine Masculin » dans le même cas.

### 6. Les tests

- **Données à deux spécialités**, servies par route : on recopie les rencontres de la série 1 en spécialité « 3 ». Elle s'affiche « Spécialité 3 », faute de libellé, comme ailleurs sur le site.
- **Script du pli et du résumé** : le test « … est le même » passe à `equipe`. La boucle « Filtres repliés par défaut » ajoute `equipe.html`.
- **Organisateur** : on désactive la série 1, puis on vérifie l'avion absent pour Alpha 1 (série 1), l'aperçu et la note.

## Risks / Trade-offs

- **Une copie de plus du script du pli et du CSS des filtres.** → Un test garde le script identique sur les quatre pages. Le CSS reste local, comme pour les autres pages.
- **Un visiteur qui a filtré « Série 2 » ne voit plus son équipe de série 1 dans la liste.** → Le résumé replié le dit (« Série 2 »), et les pastilles de ses équipes suivies restent en tête de page, hors filtre.
- **L'organisateur peut oublier un filtre actif** et croire avoir prévenu tout le monde. → La note du bloc compte les équipes visées, et le résumé du filtre est juste au-dessus.
