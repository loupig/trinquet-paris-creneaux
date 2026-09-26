# Tasks

Le projet n'a pas de suite de tests. Les fonctions de calcul se vérifient dans Node, en chargeant le script de `index.html` avec des rencontres fictives (harnais jetable, non versionné). Le rendu se vérifie dans le navigateur à 390 px.

## 1. Calcul de la liste « D'ici dimanche »

- [x] 1.1 Remplacer `partiesDuWeekEnd()` par `partiesDIciDimanche()`, qui renvoie les parties jusqu'au dimanche du premier week-end joué et ce dimanche. Vérifier les scénarios « Week-end en cours », « Partie en semaine avant le week-end », « Week-end vide », « Plus de week-end joué », « Partie déjà jouée » et « Partie reportée ».
- [x] 1.2 Faire renvoyer à `affiches()` toutes les parties de la fenêtre avec leur étiquette ou `null`, sans tri par force ni plafond, et supprimer `NB_AFFICHES`. Vérifier les scénarios « Week-end mêlant parties ordinaires et parties à voir » et « Aucune partie à voir », et que les scénarios des 5 critères et « Derby en demi-finale » donnent toujours la même étiquette.

## 2. Rendu de l'accueil

- [x] 2.1 Remplacer les tuiles « Prochaines parties » et « À voir ce week-end » par le bloc « D'ici dimanche » : titre daté, une ligne par partie, une seconde ligne (étiquette et lieu) pour les parties à voir, message de fin de calendrier si la liste est vide, lien vers `programme.html`. Vérifier à 390 px sur les données réelles : pas de défilement horizontal, les parties à voir sont les seules sur deux lignes, et le clic ouvre le Programme.
- [x] 2.2 Retirer la tuile « Trinquet Paris » et la tuile « Compteur de points », ainsi que le code et le CSS devenus inutiles (`creneauxLibres`, `GRID`, `matchesTrinquetParis`, `NB_PROCHAINES`, `.tile-slim`, `.next-row`). Vérifier qu'une recherche de ces noms dans `index.html` ne trouve plus rien, qu'il n'y a aucune erreur console, et que l'accueil ne montre plus que « D'ici dimanche » puis « Championnats ».
- [x] 2.3 Réécrire la description de l'accueil dans `README.md` (bloc unique, plus de créneaux ni de compteur sur l'accueil, accès par l'onglet et le bouton calculette) et mettre à jour la version du pied de page. Vérifier que le README ne parle plus de créneaux libres ni de la tuile « À voir ce week-end » dans la section accueil, et que la version porte la date du jour.

## 3. Intégration

- [x] 3.1 Sur les données réelles, vérifier le week-end le plus chargé du calendrier (liste complète et lisible à 390 px), puis vérifier depuis l'accueil que l'onglet Créneaux et le bouton calculette mènent bien à leurs pages. Vérifier aussi que l'accueil n'appelle toujours que `rencontres` et `clubs`.
