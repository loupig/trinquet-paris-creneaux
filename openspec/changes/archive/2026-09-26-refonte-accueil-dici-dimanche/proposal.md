# Proposal

## Why

L'accueil empile deux blocs qui montrent en partie les mêmes parties (« Prochaines parties » et « À voir ce week-end »), plus deux tuiles qui doublent la navigation : « Trinquet Paris » double l'onglet Créneaux, « Compteur de points » double le bouton calculette de l'en-tête. Depuis l'ajout de l'affiche, l'accueil ne tient plus sur un écran de 390 px. Un seul bloc qui montre tout ce qui se joue d'ici dimanche, en faisant ressortir les parties à voir, répond aux deux questions à la fois : quand je joue, et quoi aller voir.

## What Changes

- Les tuiles « Prochaines parties » et « À voir ce week-end » sont remplacées par un seul bloc, « D'ici dimanche ».
- Ce bloc liste **toutes** les parties à venir, d'aujourd'hui jusqu'au dimanche du premier week-end qui compte une partie, parties de semaine comprises (par exemple un mardi à Antony).
- Les parties à voir (mêmes 5 critères qu'aujourd'hui, étiquette unique) prennent une seconde ligne avec leur étiquette et leur lieu. Les autres tiennent sur une seule ligne, sans lieu.
- **BREAKING** (comportement visible) : plus de plafond de 3 parties à voir, et le bloc est toujours présent, même sans partie à voir.
- Les tuiles « Trinquet Paris » et « Compteur de points » disparaissent de l'accueil. Les pages restent accessibles par l'onglet Créneaux et le bouton calculette.
- Il ne reste sur l'accueil que « D'ici dimanche » puis « Championnats », inchangée.

## Capabilities

### New Capabilities
- `accueil`: composition de la page d'accueil, c'est-à-dire les blocs présents, leur ordre, et le fait que les créneaux et le compteur n'y figurent plus.

### Modified Capabilities
- `affiche-week-end`: la fenêtre englobe les parties de semaine jusqu'au dimanche, toutes les parties de la fenêtre sont listées et non plus seulement celles à voir, le plafond de 3 et la tuile absente sans affiche disparaissent, et le contenu d'une entrée dépend de son statut à voir.

## Impact

- `index.html` : rendu du bloc unique, retrait de la tuile compteur (HTML statique) et de la tuile créneaux. Le code qui ne servait qu'à la tuile créneaux devient inutile (`GRID`, `matchesTrinquetParis`, `creneauxLibres`, `NB_PROCHAINES`).
- `README.md` : réécrire la description de l'accueil (qui cite encore le nombre de créneaux libres).
- `creneaux.html`, `compteur.html` et la barre d'onglets ne changent pas.
- Hors périmètre : resserrer le critère qualification.

## Hypothèses à valider

1. **Titre daté** : « D'ici dimanche 4 oct. » plutôt que « D'ici dimanche » seul. Quand le prochain week-end joué est dans deux semaines (trêve), « D'ici dimanche » tout court serait faux.
2. **Aucune partie un week-end** jusqu'à la fin du calendrier, mais encore des parties en semaine : le bloc liste alors toutes les parties à venir.
3. **Plus aucune partie à venir** : le bloc reste affiché avec le message « Plus aucune rencontre à venir dans le calendrier publié par la ligue. », repris de l'accueil actuel.
