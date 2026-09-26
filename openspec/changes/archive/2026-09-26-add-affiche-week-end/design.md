# Design

## Context

- `index.html` charge déjà `rencontres` et `clubs` (`fetchLiveData`), exactement comme `classement.html`. Toutes les données nécessaires sont donc en mémoire au moment du rendu des tuiles (`renderTiles`).
- Le calcul du classement (`buildStandings`, `trierClassement`, `clubFictif`, constantes `PTS_*`, `PHASE_POULES`, `QUALIFIES_PAR_POULE`) n'existe que dans `classement.html`.
- Chaque page est autonome, sans build ni fichier JS partagé. Le projet recopie déjà des fonctions d'une page à l'autre, avec un commentaire qui renvoie à l'original (par exemple `matchesTrinquetParis`, « Copie de la fonction de creneaux.html »).
- L'accueil sait déjà sélectionner les parties à venir (`prochaines`) et les noms courts des clubs (`CLUBS_ABREGES`, `clubCourt`).

## Goals / Non-Goals

**Goals:**
- Calculer l'affiche à partir des données déjà chargées, sans appel réseau supplémentaire.
- Garder exactement le même classement que la page Classement, pour qu'un « 1er contre 2e » affiché sur l'accueil soit vrai sur la page Classement.

**Non-Goals:**
- Pas de fichier JS partagé entre pages : ce serait un changement d'architecture, à traiter à part s'il devient utile.
- Pas de réglage par l'utilisateur (choix des critères, nombre d'affiches).
- Pas de page dédiée ni d'entrée dans la barre d'onglets.

## Decisions

**1. Recopier la logique de classement dans `index.html`, avec un commentaire de renvoi.**
C'est la convention actuelle du projet. Alternative écartée : extraire un `standings.js` commun. Ce serait plus propre, mais cela introduit le premier fichier partagé du site et touche `classement.html`, hors du périmètre de ce changement. Le commentaire de renvoi doit signaler que les deux copies doivent rester identiques.

**2. Réutiliser `prochaines()` comme source des parties à venir.**
Elle applique déjà la date effective (report compris), exclut les parties jouées et garde celles du jour. La fonction ne renvoie pas aujourd'hui les champs nécessaires aux critères (phase brute, poule, codes club, numéros d'équipe) : on les ajoute à l'objet qu'elle renvoie, sans rien changer à la tuile « Prochaines parties ».

**3. Identifier le derby par nom de club, pas par code.**
La table `CLUBS_ABREGES` repère déjà les clubs par leur nom en majuscules : même principe, avec une table `DERBYS` de paires de noms : `PARIS EUSKAL PILOTA` / `PILOTARI` et `PILOTARI` / `CHATILLON PELOTE BASQUE` (le nom exact déjà utilisé dans `CLUBS_ABREGES`). On l'étend en ajoutant une ligne. Alternative écartée : les codes club concaténés, illisibles et au format double (`no_club_old`).

**4. Critères évalués dans l'ordre de force, premier trouvé gagnant.**
Une fonction par critère renvoie une étiquette ou rien. On les essaie dans l'ordre de la spec, et la position du critère dans la liste sert aussi de rang pour le plafond de 3. C'est ce qui donne l'unicité de l'étiquette sans logique de fusion.

**5. Rendu sur deux lignes par affiche.**
Ligne 1 : jour et heure, équipes, pastille de série, sur le modèle de `.next-row`. Ligne 2 : l'étiquette mise en avant, puis le lieu en texte discret. Une seule ligne ne tient pas à 390 px avec le lieu et l'étiquette. Le lieu passe par un libellé court (par exemple la partie avant la parenthèse de `lieu_renc`).

**6. Emplacement : juste après la tuile « Prochaines parties ».**
Une partie de l'affiche apparaît aussi dans « Prochaines parties » quand elle est proche : doublon assumé, les deux tuiles ne répondent pas à la même question.

## Risks / Trade-offs

- [Les deux copies du classement divergent un jour] → Commentaire de renvoi dans les deux fichiers. Vérification manuelle : l'affiche et la page Classement doivent donner les mêmes rangs.
- [L'accueil ne tient plus sur un écran] → La tuile n'apparaît que s'il y a une affiche, et elle est plafonnée à 3 lignes. À vérifier à 390 px, un week-end avec 3 affiches.
- [Un club est renommé dans les données de la ligue] → Le derby cesse d'être détecté, sans erreur visible. Même risque, déjà accepté, que pour `CLUBS_ABREGES`.
- [Seuils arbitraires : 1 partie jouée, rangs 3 à 6] → Ce sont des hypothèses listées dans la proposition, faciles à changer puisque ce sont des constantes.

## Migration Plan

Aucune migration : page statique, déploiement par push sur `main` (GitHub Pages). Retour arrière par `git revert`.
