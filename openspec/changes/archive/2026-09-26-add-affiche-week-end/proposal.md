# Proposal

## Why

Un visiteur qui veut aller voir une partie trouve aujourd'hui *qui* joue ce week-end, mais rien ne lui dit *laquelle* vaut le déplacement. Or l'accueil charge déjà les rencontres et les clubs, et le classement sait déjà calculer le rang de chaque équipe. Il reste à croiser les deux pour signaler les parties à enjeu.

## What Changes

- Une nouvelle tuile « À voir ce week-end » sur l'accueil (`index.html`), placée juste sous « Prochaines parties ».
- Elle liste les parties du prochain week-end qui répondent à au moins un des critères suivants, chacune avec une étiquette courte qui dit pourquoi :
  - **Phase finale** : de la 1/32e de finale à la finale.
  - **Choc de tête** : le 1er contre le 2e d'une même poule.
  - **Qualification** : une partie de poule entre deux équipes proches du trait de qualification, de part et d'autre de celui-ci.
  - **Derby** : Paris Euskal Pilota contre Pilotari, Pilotari contre Chatillon.
  - **Même club** : deux équipes d'un même club face à face.
- La tuile disparaît quand aucune partie du week-end ne répond à un critère, pour ne pas allonger l'accueil sans rien dire.
- Aucun appel API supplémentaire : la tuile réutilise les données déjà chargées par l'accueil.

## Capabilities

### New Capabilities
- `affiche-week-end`: sélection et affichage, sur l'accueil, des parties à enjeu du prochain week-end, avec la raison de chaque sélection.

### Modified Capabilities
<!-- Aucune : openspec/specs/ est vide, rien n'est encore spécifié. -->

## Impact

- `index.html` : une tuile en plus, et la logique de classement recopiée depuis `classement.html` (le projet n'a pas de code partagé entre pages).
- L'accueil a été condensé pour tenir sur un écran (commit `59e722a`). Une tuile de plus peut casser ce point : à vérifier sur un écran de 390 px.
- `README.md` : décrire la tuile et ses critères dans la section de l'accueil.
- Pas de changement d'API ni de backend Apps Script.

## Hypothèses à valider

Choix faits par défaut pendant l'exploration. Chacun est traduit en exigence dans la spec : à corriger avant `/opsx:apply` si l'un ne convient pas.

1. **Phase finale** = phases 7 à 12 (1/32e à finale). Les barrages (phases 2 à 6) sont exclus.
2. **Qualification** = les deux équipes sont classées entre le 3e et le 6e de leur poule, l'une qualifiée (rang 4 ou mieux), l'autre non.
3. **Début de saison** : les critères qui s'appuient sur le classement (choc de tête, qualification) ne s'appliquent qu'une fois que chaque équipe de la partie a joué au moins 1 partie de poule.
4. **Une seule étiquette par partie**, la plus forte, dans cet ordre : phase finale, choc de tête, qualification, derby, même club.
5. **3 affiches au maximum**, les plus fortes, présentées dans l'ordre chronologique.
6. **Week-end** = du vendredi au dimanche. Le premier week-end, à partir d'aujourd'hui, qui compte au moins une partie à venir.
7. **Derby** : deux rivalités, Paris Euskal Pilota contre Pilotari et Pilotari contre Chatillon, toutes séries confondues. La liste est écrite en dur et pourra s'allonger.
