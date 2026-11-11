# Tasks

Vérification par `npm test` (syntaxe, puis pages dans Chromium sur les données fictives de `tests/donnees.mjs`), et par des captures sur Pixel 7 et iPhone 15 Pro, en clair et en sombre.

## 1. Scénarios d'abord

- [ ] 1.1 Dans `tests/pages.spec.mjs`, écrire :
  - la ligne en noms courts, avec un club de la table servi par les données (« MPBA 1 vs … ») ;
  - le lieu court « Trinquet Paris » ;
  - aucun crochet ni nom de joueur sur la ligne ;
  - le chevron qui tourne, le fond teinté et `aria-expanded` au toucher ;
  - le détail avec le nom officiel, les joueurs et le lieu complet ;
  - le message WhatsApp inchangé, avec les noms officiels et le lieu complet ;
  - le compteur ouvert avec les noms courts ;
  - au moins quatre parties au premier écran d'un iPhone 15 Pro ;
  - `CLUBS_ABREGES` et `lieuCourt` identiques entre `index.html` et `programme.html`.

  Vérifier : ils échouent sur la page actuelle.

## 2. Page Parties

- [ ] 2.1 `programme.html` :
  - `CLUBS_ABREGES` et `lieuCourt` recopiés ;
  - libellés courts et officiels ;
  - `equipesDe` sans crochets ;
  - détail avec les noms officiels et le lieu complet ;
  - `button.match-row` avec chevron et `aria-expanded` ;
  - CSS (centrage, padding, fond à l'ouverture, remise à zéro du bouton).

  Vérifier : 1.1 passe, et le test du message WhatsApp existant reste vert sans changement.
- [ ] 2.2 Adapter les scénarios existants de Parties qui lisent les crochets ou « Alpha (éq. 1) » sur la ligne. Vérifier : tous verts, et ceux de l'accueil et du Bilan inchangés.

## 3. Finitions

- [ ] 3.1 `Version 2026.11.11.2` dans le pied de page de `programme.html`. README : `CLUBS_ABREGES` porté aussi par Parties, et les noms de joueurs sur Parties au détail seulement. Vérifier : relecture.
- [ ] 3.2 `npm test` complet, sortie montrée. Captures iPhone 15 Pro et Pixel 7, clair et sombre : premier écran, une partie dépliée avec ses contacts. `/code-review` sur le diff, et corriger les constats. `/security-review`, puisque le changement touche à des données de l'API affichées et au message WhatsApp.
- [ ] 3.3 Archiver dans la même PR (specs `programme` et `donnees-api`), ouvrir la PR sur le modèle du dépôt, et laisser la « Décision humaine » au demandeur.
