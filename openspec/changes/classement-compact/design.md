# Design

## Context

- `classement.html` construit chaque ligne dans `buildRankRow(team, rang, teinte)`. C'est un `div.rank-row` en flex avec trois blocs :
  - `.rank-pos` : le rang ;
  - `.rank-main` : le nom, `.rank-detail` en phrase, `.rank-joueurs` ;
  - `.rank-values` : la moyenne.
- Un commentaire CSS justifie l'abandon d'un tableau : « sur 390px un tableau obligerait à défiler horizontalement, ou à des colonnes de 22px ». La maquette contredit ce constat. Avec cinq colonnes de nombres (3 × 22 px, 38 px, 44 px) et 6 px d'écart, il reste environ 160 px au nom sur 412 px, et environ 140 px sur 390 px.
- `buildPouleCard()` sert au découpage par poule comme au général : il ajoute `.cut-line` après la 4e ligne et la pastille `P1`/`P2` dans le nom en général.
- Le pli du bloc Filtres est un script identique dans `programme.html`, `classement.html` et `creneaux.html`. Il utilise la clé `lidfpb_filters_open_v1`, lit `"0"` pour replié, et sinon reste ouvert.
- Le Bilan a ses propres lignes de classement (`.rank-row`, avec les joueurs entre crochets). Il n'est pas touché ici.
- Tests concernés dans `tests/pages.spec.mjs` :
  - `.rank-joueurs` lu directement (vers les lignes 1774 et 1792) ;
  - `#filtersToggle` cliqué en partant d'un bloc ouvert (vers les lignes 624 à 666).

## Goals / Non-Goals

**Goals:**
- Une poule de six visible en entier au premier écran d'un Pixel 7, filtres repliés.
- Aucune information perdue : tout le détail actuel reste à un toucher.
- Même rendu des teintes de poule, du podium et du trait des qualifiés.

**Non-Goals:**
- Pas de changement de l'en-tête de page, de Parties (hors pli), de Mes équipes ni du Bilan.
- Pas de tri par colonne : le classement reste celui de `calcul-classement`.
- Pas de clé `localStorage` nouvelle.

## Decisions

**1. Une grille CSS par ligne, pas un `<table>`.**
La ligne devient un `button.rank-row` en `display: grid` avec `grid-template-columns: 22px minmax(0,1fr) 22px 22px 22px 38px 44px`. L'en-tête `.rank-head` utilise la même grille. Le détail déplié `.rank-plus` est un frère qui suit la ligne. Il commence sous la colonne du nom, avec le même retrait.
Alternative écartée : un `<table>`. La sémantique serait meilleure pour un lecteur d'écran, mais une ligne de tableau ne peut pas être un bouton, et le dépli demanderait une ligne `colspan` insérée. Le bouton avec `aria-expanded` et `aria-controls` annonce le dépli. L'en-tête porte `aria-hidden="true"`, et chaque nombre a un libellé lisible (`aria-label` « 3 parties jouées », etc.) pour que la ligne se lise en entier.

**2. Le bouton garde l'allure d'une ligne.**
Il remet à zéro les styles du bouton (`font: inherit`, `background: none`, `border: 0`, `text-align: inherit`, `width: 100%`) et garde le liseré de teinte (`box-shadow` inset) et le trait du haut. Un chevron discret n'est pas ajouté : la colonne Moy. est déjà la plus à droite, et la place manque. Le dépli s'annonce par l'état `aria-expanded` et par un léger fond `--surface-2` sur la ligne dépliée.

**3. Le nom passe à la ligne.**
`overflow-wrap: anywhere` sur le nom, et pas de `text-overflow: ellipsis`. Un club au nom long prend deux lignes plutôt que de perdre son numéro d'équipe (« (éq. 2) »), qui est souvent ce qui distingue deux équipes d'un même club.

**4. Valeurs d'une équipe sans partie.**
J vaut « 0 ». G, P, GA et Moy. valent « – ». Le détail reste « aucune partie jouée ».

**5. Dépli : état en mémoire seulement.**
Un ensemble `deplies` des clés d'équipe (`spec|cat|club|numero`) survit à un nouveau rendu (filtre, simulation, rafraîchissement) dans la même visite, pour qu'une simulation n'en replie pas tout. Il n'est pas enregistré.

**6. Pli des filtres : défaut inversé, même clé.**
Dans les trois pages, `var ouvert = false`, et `ouvert = true` seulement si la clé vaut `"1"`. Le sens des valeurs ne change pas : `"1"` (ouvert à la main) et `"0"` (replié à la main). La clé garde son suffixe `_v1`. Un visiteur qui l'avait ouvert à la main le garde ouvert. Celui qui n'y a jamais touché le trouve replié.

**7. Règle rappelée.**
La phrase du bloc Filtres dit « (colonne Moy.) » au lieu de « (chiffre de droite) ». Elle reste dans le bloc Filtres, donc repliée par défaut. Le détail au toucher, qui donne points et parties en toutes lettres, suffit à comprendre la colonne Moy.

**8. Lien Bilan.**
On retire le `<small>` du lien et on réduit le padding vertical. La spec `bilan` ne dépend pas du sous-titre.

## Risks / Trade-offs

- **Noms des joueurs moins visibles.** Certains reconnaissaient une équipe à ses joueurs. → Mitigation : un toucher, et l'hypothèse 2 de la proposition, à vérifier auprès des joueurs.
- **Écrans de 320 px.** Il reste environ 70 px au nom : tous les noms passent sur deux ou trois lignes. → Le test de la barre d'onglets à 320 px existe déjà. On ajoute un contrôle « pas de défilement horizontal » du Classement à 320 px.
- **Grand écran (≥ 1000 px).** Les cartes se rangent côte à côte. La grille s'élargit sans changer, avec le nom qui prend la place libre. À vérifier à la capture.
- **Chiffres en sombre.** Les nombres en `--muted` doivent garder 4,5:1 en sombre. Le test de contraste existant couvre les cartes.

## Migration Plan

Pas de donnée à migrer. Mise en ligne par fusion sur `main`. Retour arrière : revert de la fusion. Aucune clé ni cache touchés.

## Open Questions

Aucune bloquante. L'en-tête de page plus court et la ligne de l'équipe suivie mise en évidence restent des candidats pour un changement suivant.
