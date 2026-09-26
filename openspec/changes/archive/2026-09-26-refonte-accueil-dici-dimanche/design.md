# Design

## Context

- `index.html` rend aujourd'hui quatre tuiles dans `renderTiles` : « Prochaines parties » (`prochaines()` tronqué à `NB_PROCHAINES`), « À voir ce week-end » (`affiches()`), « Trinquet Paris » (`creneauxLibres()`) et « Championnats ». La tuile « Compteur de points » est du HTML statique sous `#tiles`.
- `affiches()` enchaîne `partiesDuWeekEnd()` (fenêtre vendredi-dimanche), les 5 `CRITERES` et le plafond `NB_AFFICHES`.
- `GRID`, `matchesTrinquetParis()` et `creneauxLibres()` ne servent qu'à la tuile « Trinquet Paris » sur cette page. Les copies de `creneaux.html` et `report.html` sont indépendantes.
- La classe `.tile-slim` ne sert qu'à la tuile compteur, et `.next-row` qu'à la tuile « Prochaines parties ».

## Goals / Non-Goals

**Goals:**
- Un seul calcul qui produit la liste complète de la fenêtre, chaque partie portant son étiquette ou rien.
- Retirer le code et le CSS que le retrait des tuiles rend inutiles, pour ne pas laisser de code mort dans la page.

**Non-Goals:**
- Pas de changement des critères ni du classement recopié.
- Pas de changement de `creneaux.html`, `compteur.html`, de l'en-tête ni de la barre d'onglets.

## Decisions

**1. `partiesDuWeekEnd()` devient `partiesDIciDimanche()`.**
On cherche la première partie à venir qui tombe un vendredi, un samedi ou un dimanche, on calcule le dimanche de ce week-end, puis on garde toutes les parties à venir jusqu'à ce dimanche inclus. Sans partie de week-end, on garde tout. La fonction renvoie aussi ce dimanche (ou rien), pour dater le titre.

**2. `affiches()` étiquette au lieu de filtrer.**
Elle renvoie toutes les parties de la fenêtre, dans l'ordre chronologique déjà donné par `prochaines()`, chacune avec `etiquette` (texte ou `null`). Le tri par force et le plafond disparaissent, et `NB_AFFICHES` avec eux. Alternative écartée : garder `affiches()` et fusionner sa sortie avec `prochaines()` au rendu. Ce serait deux sources pour une même liste, à réconcilier partie par partie.

**3. Une ligne par partie, une seconde pour les parties à voir.**
On reprend le balisage `.affiche` / `.affiche-line` / `.affiche-why` de l'affiche actuelle. `.affiche-why` n'est ajouté que si `etiquette` est renseignée. Aucun autre effet visuel : c'est la seconde ligne qui porte l'accent, comme décidé en exploration.

**4. Titre daté à partir du dimanche renvoyé.**
« D'ici dimanche » suivi du jour et du mois abrégé (tableau `MONTH_ABBR` existant), par exemple « D'ici dimanche 4 oct. ». Quand la fenêtre n'a pas de dimanche (hypothèse 2 de la proposition), le titre reste « Prochaines parties ».

**5. Suppression du code mort.**
Retrait de la tuile créneaux dans `renderTiles`, de `creneauxLibres`, `GRID`, `matchesTrinquetParis`, `NB_PROCHAINES`, `NB_AFFICHES`, du HTML de la tuile compteur et des règles CSS `.tile-slim` et `.next-row`. Chaque retrait est vérifié par une recherche qui ne doit plus rien trouver dans `index.html`.

## Risks / Trade-offs

- [Liste longue un week-end chargé, jusqu'à une douzaine de lignes avec les parties de semaine] → Les deux autres tuiles disparaissent, la place est là. À vérifier à 390 px sur le week-end le plus chargé des données réelles.
- [L'accent se dilue si beaucoup de parties sont à voir] → Connu et accepté : le resserrement du critère qualification est hors périmètre.
- [Le compteur perd sa présentation textuelle sur l'accueil] → Le bouton calculette a un `title` et un `aria-label` explicites ; c'est le seul accès, comme sur les autres pages.

## Migration Plan

Aucune migration : page statique, déploiement par push sur `main`. Retour arrière par `git revert`.
