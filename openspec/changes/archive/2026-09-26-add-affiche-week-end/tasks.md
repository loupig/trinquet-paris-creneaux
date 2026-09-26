# Tasks

Le projet n'a pas de suite de tests. Les vérifications se font dans le navigateur : la console pour les fonctions de calcul (en leur passant des lignes de rencontres fictives), la page ouverte à 390 px pour le rendu.

## 1. Données : classement et parties à venir sur l'accueil

- [x] 1.1 Recopier dans `index.html` la logique de classement de `classement.html` (`clubFictif`, `teamKey`, `estPhaseDePoules`, `buildStandings`, `trierClassement` et leurs constantes), avec un commentaire de renvoi dans les deux fichiers. Vérifier dans la console que les rangs obtenus pour chaque poule sont identiques à ceux de la page Classement.
- [x] 1.2 Enrichir l'objet renvoyé par `prochaines()` avec la phase brute, la poule, les codes club et les numéros d'équipe. Vérifier que la tuile « Prochaines parties » s'affiche exactement comme avant.

## 2. Sélection de l'affiche

- [x] 2.1 Écrire la sélection du week-end (premier vendredi-dimanche avec une partie à venir). Vérifier dans la console les scénarios « Week-end en cours », « Week-end vide », « Partie déjà jouée » et « Partie reportée » de la spec.
- [x] 2.2 Écrire les critères phase finale, choc de tête et qualification, avec le seuil de 1 partie jouée. Vérifier dans la console chacun de leurs scénarios, dont « Barrage », « 1er contre 3e », « Poule de 4 équipes » et « Première journée ».
- [x] 2.3 Écrire les critères derby (table `DERBYS` par nom de club) et même club (hors clubs fictifs). Vérifier les scénarios « Derby en 2e série », « Pilotari contre Chatillon », « Deux équipes d'un club » et « Deux adversaires à désigner ».
- [x] 2.4 Appliquer l'étiquette unique et le plafond de 3. Vérifier les scénarios « Derby en demi-finale » et « Cinq parties retenues ».

## 3. Tuile sur l'accueil

- [x] 3.1 Ajouter la tuile « À voir ce week-end » sous « Prochaines parties », sur deux lignes par affiche, menant à `programme.html`, absente quand rien n'est retenu. Vérifier à 390 px avec 3 affiches : pas de défilement horizontal, et le clic ouvre le Programme. Vérifier aussi qu'un week-end sans enjeu rend l'accueil identique à aujourd'hui.
- [x] 3.2 Décrire la tuile et ses critères dans la section accueil du `README.md`, et mettre à jour la version du pied de page. Vérifier que le README cite les 5 critères et que la version porte la date du jour.

## 4. Intégration

- [x] 4.1 Ouvrir l'accueil sur les données réelles et comparer chaque affiche à la page Classement et au Programme : le rang, la phase et le club annoncés doivent être vrais. Vérifier aussi que l'accueil n'ajoute aucun appel réseau (onglet Réseau : toujours `rencontres` et `clubs`, rien d'autre).
