# Tasks

Le projet n'a pas de suite de tests. Les calculs se vérifient dans Node, en chargeant le script de `equipe.html` avec des rencontres fictives (harnais jetable, non versionné), et le rendu dans le navigateur à 390 px, sur les données réelles. Les captures envoyées à l'utilisateur ont les noms de joueurs remplacés.

## 1. Objectif de qualification

- [x] 1.1 Écrire le calcul : parties de poule restantes, énumération des issues, tableaux `sure` et `possible` par nombre de victoires (avec le cas « au goal average »), plafond à 20 parties. Vérifier dans Node les scénarios « Seuils de victoires », « Qualifiée quoi qu'il arrive », « Éliminée », « Qualification jamais assurée », « Égalité de moyenne », « Poule terminée » et « Trop de parties restantes ». Vérifier aussi qu'une poule de 4 équipes donne « qualifiée quoi qu'il arrive ».
- [x] 1.2 Afficher la ligne « Pour sortir des poules » dans la carte Bilan, sous la forme, avec les messages du design. Vérifier dans le navigateur, sur les 26 équipes réelles, qu'aucune erreur n'apparaît et que chaque équipe de poule a une ligne. Mesurer le temps de calcul sur la poule qui a le plus de parties restantes, en limitant le processeur à 6x dans le navigateur : il doit rester sous 300 ms.

## 2. Adversaires et contact

- [x] 2.1 Enrichir l'index des engagements du responsable et du téléphone, et ajouter `getContact()`, `normalizePhoneForWhatsapp()` et les icônes, depuis `programme.html`. Garder sur chaque partie de `buildTeams()` le code club et le numéro de l'adversaire. Vérifier dans Node que les compositions sont inchangées et que `getContact()` renvoie le numéro normalisé d'une équipe déclarée dans des engagements inventés pour le test.
- [x] 2.2 Construire la fiche adversaire (rang, forme, composition, boutons de contact sans message) et la poser sous chaque partie sans score et dans la carte « Prochaine partie ». Vérifier dans le navigateur les scénarios « Prochain adversaire », « Adversaire à désigner », « Partie jouée », « Responsable joignable » (liens `tel:`, `sms:`, `https://wa.me/` sans `text=`), « Pas de numéro » et « Numéro non affiché ». Pour ce dernier, rechercher le numéro dans le texte visible de la page.
- [x] 2.3 Vérifier que la fiche s'affiche sans composition quand le chargement des compositions échoue (requête `engagements` bloquée), et sans boutons dans ce cas.

## 3. Retrait de la table de poule

- [x] 3.1 Supprimer la table de poule et son code d'affichage (`buildClassement()`, `buildRankRow()`, fonctions de format, `PODIUM`, styles `.poule-card`, `.rank-*` et `.cut-line`), en gardant le calcul. Vérifier les scénarios « Pas de table de poule », « Même rang que la page Classement » (une équipe par série, comparée à la page Classement) et « Équipe pas encore classée », et vérifier qu'aucune fonction supprimée n'est encore appelée (pas d'erreur dans la console, sur les 26 équipes).

## 4. Documentation et intégration

- [x] 4.1 Mettre à jour la description de `equipe.html` dans le `README.md` : objectif de qualification et sa règle d'égalité, fiche adversaire, contacts sans nom ni numéro affichés, plus de table de poule. Mettre à jour la section RGPD (numéros de responsables derrière les boutons de deux pages). Mettre la version du pied de page de `equipe.html` à la date du jour. Vérifier que le README ne parle plus de la table de poule de Mon équipe.
- [x] 4.2 Sur les données réelles, à 390 px, parcourir une équipe de chaque série : vérifier l'ordre des cartes, l'absence de défilement horizontal, le bon fonctionnement des boutons de contact (bons liens, sans les ouvrir), et qu'aucun nouvel appel API n'est fait (seulement `rencontres`, `clubs`, `engagements` et `licencies`).
