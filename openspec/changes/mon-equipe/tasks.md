# Tasks

Le projet n'a pas de suite de tests. Les fonctions de calcul se vérifient dans Node, en chargeant le script de `equipe.html` avec des rencontres fictives (harnais jetable, non versionné). Le rendu se vérifie dans le navigateur à 390 px.

## 1. Page et choix de l'équipe

- [x] 1.1 Créer `equipe.html` à partir de `equipes.html`. Reprendre l'en-tête (titre « Mon équipe », ligne de synchro, rafraîchissement, compteur), le chargement des quatre tables avec les mêmes URL et le même cache, `buildTeams()`, `getRoster()` et `buildMatchRow()`. Retirer les filtres et le sélecteur de vue. Mettre dans la barre d'onglets de cette page les 5 entrées, « Mon équipe » marqué courant. Vérifier dans le navigateur, juste après une visite de la vue Par équipe, que la page s'affiche depuis le cache, sans attendre le réseau, et sans erreur dans la console.
- [x] 1.2 Écrire le choix de l'équipe affichée : URL `?equipe=`, puis dernière consultée (`lidfpb_equipe_vue_v1`, dans un `try/catch`), puis première équipe suivie (`lidfpb_mes_equipes_v1`), sinon l'invitation. Vérifier dans Node les scénarios « Lien partagé », « Retour par l'onglet », « Première visite d'un visiteur qui suit des équipes », « Première visite sans équipe suivie », « Équipe introuvable » et « Stockage indisponible ».
- [x] 1.3 Ajouter la liste déroulante : groupe « Mes équipes » s'il y a des équipes suivies, puis un groupe par série, avec les équipes triées par club puis par numéro, hors clubs fictifs. Un choix réaffiche l'équipe depuis les données en mémoire et met à jour l'URL par `history.replaceState`. Vérifier dans le navigateur les scénarios « Changer d'équipe » (onglet Réseau vide pendant le changement, URL à jour, lien recopié dans un nouvel onglet qui ouvre la même équipe), « Équipes suivies en tête » et « Pas d'équipe fictive ».

## 2. Contenu de la page

- [x] 2.1 Afficher l'en-tête de l'équipe (nom, série, rang en clair) et la prochaine partie (même définition que l'accueil : sans score, date ≥ aujourd'hui, heure lisible), avec le bouton de report si `canReport()`. Vérifier les scénarios « Prochaine partie au Trinquet Paris » (le bouton ouvre `report.html?oid=` de cette partie), « Prochaine partie ailleurs » et « Plus de partie ». Vérifier aussi que la prochaine partie est celle qu'affiche le bloc « Mes équipes » de l'accueil pour la même équipe.
- [x] 2.2 Afficher le bilan (jouées, gagnées, perdues, à venir, points marqués et encaissés) et la forme (5 dernières parties jouées, en G ou P, de la plus ancienne à la plus récente). Vérifier dans Node les scénarios « Équipe en cours de saison », « Moins de cinq parties jouées » et « Aucune partie jouée ».
- [x] 2.3 Recopier depuis `classement.html` le calcul du classement et la ligne de table. Afficher la table de la poule de l'équipe avec sa ligne mise en évidence et le trait des qualifiés. Mettre à jour les commentaires « recopié dans » de `classement.html` et `index.html` pour qu'ils citent `equipe.html`. Vérifier sur les données réelles, pour au moins une équipe par série, que la table est identique à celle de la page Classement en vue par poule (scénario « Même classement que la page Classement »). Vérifier aussi les scénarios « Ligne de l'équipe » et « Équipe pas encore classée ».
- [x] 2.4 Afficher la liste des parties (`buildMatchRow()`) et la composition (noms seuls). Vérifier les scénarios « Partie gagnée », « Partie sans date lisible », « Composition déclarée » et « Composition non déclarée ». Pour « Composition indisponible », bloquer la requête `engagements` dans le navigateur et vérifier que le reste de la page s'affiche.
- [x] 2.5 Afficher le reste à jouer dans la poule : parties de phase de poules de la même poule, sans score, sans l'équipe, par ordre chronologique. Vérifier dans Node les scénarios « Parties restantes dans la poule » et « Poule terminée ».
- [x] 2.6 Décrire `equipe.html` dans la liste des pages du `README.md` : contenu et ordre des sections, choix de l'équipe, lien partageable, dernière équipe mémorisée dans le navigateur uniquement, composition en noms seuls, troisième copie du classement. Mettre la version du pied de page de `equipe.html` à la date du jour. Vérifier que le README cite la clé `lidfpb_equipe_vue_v1` et la règle « noms seuls ».

## 3. Barre d'onglets

- [x] 3.1 Ajouter l'onglet « Mon équipe » en 2e position dans la barre des 7 autres pages (`index`, `creneaux`, `programme`, `equipes`, `classement`, `report`, `compteur`), avec une icône en contour. Vérifier à 390 px, sur chaque page, que les cinq libellés sont entiers et qu'il n'y a pas de défilement horizontal (scénario « Écran étroit »). Si un libellé est coupé, passer à « Équipe » partout, `equipe.html` compris. Vérifier enfin le scénario « Aller sur la page depuis une autre page ».
- [x] 3.2 Corriger dans le `README.md` la description de la barre d'onglets (5 entrées : Accueil, Mon équipe, Parties, Classement, Créneaux) et passer la version du pied de page des 7 pages à la date du jour. Vérifier par `grep` que plus aucune page ne porte l'ancienne version, et que le README ne cite plus « Programme » ni « Équipes » comme onglets.

## 4. Intégration

- [x] 4.1 Sur les données réelles, faire le parcours complet :
  - choisir une équipe depuis la liste ;
  - copier le lien et l'ouvrir dans une fenêtre de navigation privée : même équipe ;
  - revenir par l'onglet depuis une autre page : même équipe.

  Vérifier aussi que l'accueil montre toujours « Mes équipes », « D'ici dimanche » puis « Championnats », et que la page ne lit que `rencontres`, `clubs`, `engagements` et `licencies`.
