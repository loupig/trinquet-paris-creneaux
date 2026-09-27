# Tasks

Le projet n'a pas de suite de tests. Les fonctions de calcul se vérifient dans Node, en chargeant le script de `index.html` avec des rencontres fictives (harnais jetable, non versionné). Le rendu se vérifie dans le navigateur à 390 px.

## 1. Données : équipes suivies

- [x] 1.1 Ajouter la lecture et l'écriture de la liste des équipes suivies (clé spécialité + catégorie + club + numéro, sous `lidfpb_mes_equipes_v1`, dans un `try/catch`). Vérifier dans Node qu'une liste écrite se relit identique, et qu'un stockage qui lève une exception renvoie une liste vide sans erreur.
- [x] 1.2 Écrire le calcul, pour une équipe suivie, de sa prochaine partie (même au-delà de dimanche) et de son rang dans sa poule. Vérifier les scénarios « Équipe en cours de saison », « Équipe pas encore classée », « Plus de partie » et « Équipe disparue des données », et que le rang est celui de la page Classement.
- [x] 1.3 Écrire la liste des équipes proposées au choix, regroupées par série puis par club, hors clubs fictifs. Vérifier sur les données réelles qu'elle compte les 26 équipes engagées et aucune « Equipe à désigner ».

## 2. Rendu de l'accueil

- [x] 2.1 Ajouter le bloc « Mes équipes » en tête de l'accueil : un bloc non cliquable avec, par équipe, son nom court, sa série, son rang et sa prochaine partie, et un panneau de choix `<details>` avec une case par équipe. Sans équipe suivie, il se réduit à l'invitation. Vérifier à 390 px, sans défilement horizontal : la première visite montre l'invitation, cocher deux équipes les affiche sans refermer le panneau, décocher en retire une, et le choix survit à un rechargement.
- [x] 2.2 Repérer les parties des équipes suivies dans « D'ici dimanche » par un trait en marge gauche. Vérifier les scénarios « Ma partie ce dimanche », « Ma partie est aussi à voir » et « Sans équipe suivie ».
- [x] 2.3 Décrire le bloc « Mes équipes » dans la section accueil du `README.md` (choix mémorisé dans le navigateur uniquement, rien n'est envoyé) et mettre à jour la version du pied de page. Vérifier que le README mentionne le stockage local et que la version porte la date du jour.

## 3. Intégration

- [x] 3.1 Sur les données réelles, vérifier que l'accueil ne montre que « Mes équipes », « D'ici dimanche » et « Championnats », dans cet ordre. Vérifier que choisir ou modifier des équipes n'émet aucun appel réseau (onglet Réseau), et que l'accueil n'appelle toujours que `rencontres` et `clubs` au chargement.
