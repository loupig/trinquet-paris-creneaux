# Tasks

Vérification par `npm test` (syntaxe, puis pages dans Chromium sur les données fictives de `tests/donnees.mjs`), et par des captures sur Pixel 7 et iPhone 15 Pro, en clair et en sombre.

## 1. Scénarios d'abord

- [x] 1.1 Dans `tests/pages.spec.mjs`, écrire :
  - la ligne en noms courts, avec un club de la table servi par les données : texte exact des équipes « MPBA 1 vs Bravo 1 », une espace de chaque côté de « vs » (la maquette les collait) ;
  - la pastille « P1 » ou « P2 » dans la teinte de sa poule, et « 1/4 » pour un quart ;
  - plus de « Série 1 » écrit ni de lieu sur la ligne, sauf « 📍 » pour une partie servie dans un autre lieu ;
  - la légende (séries présentes, pastilles, 📍 s'il sert, phrase d'aide), qui suit le filtre Série ;
  - aucun crochet ni nom de joueur sur la ligne ;
  - le chevron qui tourne, le fond teinté et `aria-expanded` au toucher ;
  - le détail avec le nom officiel, les joueurs et le lieu complet ;
  - le message WhatsApp inchangé, avec les noms officiels et le lieu complet ;
  - le compteur ouvert avec les noms courts ;
  - au moins cinq parties au premier écran d'un iPhone 15 Pro ;
  - la phrase lue de la ligne, avec la série, la poule et le lieu ;
  - `CLUBS_ABREGES` et `lieuCourt` identiques entre `index.html` et `programme.html`.

  Vérifier : ils échouent sur la page actuelle.

## 2. Page Parties

- [x] 2.1 `programme.html` :
  - `CLUBS_ABREGES`, `lieuCourt` et les teintes `--poule*` recopiés ;
  - `lieuHabituel`, pastille de poule ou de phase, légende ;
  - libellés courts et officiels ;
  - `equipesDe` sans crochets ;
  - détail avec les noms officiels, la série et la poule, et le lieu complet ;
  - `button.match-row` avec chevron et `aria-expanded` ;
  - CSS (centrage, padding, fond à l'ouverture, remise à zéro du bouton).

  Vérifier : 1.1 passe, et le test du message WhatsApp existant reste vert sans changement.
- [x] 2.2 Adapter les scénarios existants de Parties qui lisent les crochets ou « Alpha (éq. 1) » sur la ligne. Vérifier : tous verts, et ceux de l'accueil et du Bilan inchangés.

## 3. Finitions

- [x] 3.1 `Version 2026.11.11.2` dans le pied de page de `programme.html`. README : `CLUBS_ABREGES` porté aussi par Parties, et les noms de joueurs sur Parties au détail seulement. Vérifier : relecture.
- [x] 3.2 `npm test` complet, sortie montrée. Captures iPhone 15 Pro et Pixel 7, clair et sombre : premier écran, une partie dépliée avec ses contacts. `/code-review` sur le diff, et corriger les constats. `/security-review`, puisque le changement touche à des données de l'API affichées et au message WhatsApp.
- [x] 3.3 Archiver dans la même PR (specs `programme` et `donnees-api`), ouvrir la PR sur le modèle du dépôt, et laisser la « Décision humaine » au demandeur.
