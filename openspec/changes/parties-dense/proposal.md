# Proposal

## Why

Sur un iPhone 15 Pro, avec les vrais noms de clubs, la page Parties ne montre **qu'une partie** au premier écran. Chaque partie prend 150 à 170 px. Trois choses font cette hauteur :

- les noms officiels, longs (« METRO PELOTE BASQUE ANTONY (éq. 1) ») ;
- les joueurs écrits entre crochets après chaque équipe ;
- le lieu complet (« PARIS (Trinquet Paris - 75016) »).

Le Classement vient de passer en noms courts, avec les joueurs au toucher, et le demandeur l'a validé. Une maquette jetable de Parties avec le même principe montre **4 à 5 parties** au premier écran, à 52 px chacune.

## What Changes

- **Une partie, une ligne** : « 19h30 [P2] MPBA 1 vs PEP 2 40 – 27 › ». Sur la maquette : 33 px par partie, contre 150 à 170 px aujourd'hui.
  - **Équipes en noms courts** (spec `noms-clubs`). **BREAKING** pour la spec `programme` : les noms officiels quittent la ligne.
  - **Série par la couleur** de la ligne (liseré et fond, déjà en place) au lieu de « Série 1 » écrit.
  - **Poule en pastille** « P1 », « P2 », aux teintes de poule du Classement ; une phase finale en pastille neutre (« 1/4 », « 1/2 », « Finale », « Barrage »).
  - **Lieu au détail**, puisque presque tout se joue au même endroit. Exception : une partie hors du lieu habituel garde « 📍 Trinquet … » sur sa ligne, pour éviter de se tromper de trinquet. *À valider par le demandeur.*
  - **Joueurs au toucher.** Les crochets disparaissent. **BREAKING** : les joueurs ne sont plus « toujours affichés ».
- **Légende** au-dessus des jours :
  - la couleur de chaque série, les pastilles de poule, le 📍 s'il sert ;
  - « Touchez une partie : joueurs, lieu, contacts ».
- **Le toucher se voit**, comme au Classement : chevron « › » puis « ⌄ », fond teinté, ligne-bouton qui annonce s'il est déplié et dont la phrase lue dit la série, la poule et le lieu.
- **Détail** :
  - pour chaque équipe, son nom officiel, ses joueurs et ses contacts ;
  - la série et la poule en toutes lettres ;
  - le lieu complet.
- **Ce qui ne change pas** :
  - le message WhatsApp aux responsables garde les noms officiels et le lieu complet ;
  - le compteur reçoit les noms courts, plus lisibles sur un tableau de score.
- **Recopiés dans `programme.html`**, à l'identique :
  - `CLUBS_ABREGES`, déjà comparé à la spec par un test ;
  - `lieuCourt`, de l'accueil ;
  - les teintes de poule `--poule1-*` à `--poule4-*` du Classement, avec leurs valeurs sombres.

## Capabilities

### New Capabilities
Aucune.

### Modified Capabilities
- `programme` :
  - « Ligne d'une partie » : une ligne, noms courts, pastille de poule, série par la couleur, lieu seulement s'il est inhabituel, chevron ;
  - « Légende des parties » : ajoutée ;
  - « Détail d'une partie » : nom officiel, joueurs, série et poule, lieu complet ;
  - « Joueurs des équipes entre crochets » : retirée.
- `donnees-api` : « Noms de joueurs seuls », Parties ne les donne plus qu'au détail d'une partie.

La spec `noms-clubs` ne change pas : elle ne liste pas les pages qui portent la table.

## Impact

- **Pages** : `programme.html` (rendu des lignes et du détail, CSS, `CLUBS_ABREGES`, `lieuCourt`). Pied de page `Version 2026.11.11.2`.
- **Tests** :
  - les scénarios de Parties qui lisent les crochets ou « Alpha (éq. 1) » sur la ligne sont revus ;
  - les nouveaux scénarios couvrent les noms courts, le lieu court, les joueurs au toucher, le chevron, le message WhatsApp inchangé, la pastille de poule, la légende, le 📍 d'un lieu inhabituel, et cinq parties au moins au premier écran d'un iPhone 15 Pro ;
  - le test des copies identiques ajoute `programme.html`.
- **README** (constante `CLUBS_ABREGES`, liste des endroits où s'affichent les noms de joueurs) et **spec `donnees-api`** (noms de joueurs sur Parties : au détail seulement).
- **Hors champ** :
  - Mes équipes, les crochets de l'accueil et du Bilan ;
  - la page Créneaux et l'en-tête de page.

## Hypothèses à valider

1. **Personne ne venait sur Parties pour lire les joueurs d'un coup d'œil.** Le Classement a fait le même pari. Si des joueurs le regrettent, les joueurs de l'équipe suivie pourraient revenir sur la ligne.
2. **La couleur suffit à dire la série**, avec la légende en haut de page. Le liseré de série existe déjà ; seul le mot disparaît.
3. **Le lieu habituel n'a pas besoin d'être répété.** Seule une partie ailleurs le dit sur sa ligne. L'adresse complète reste au toucher et dans le message WhatsApp.
