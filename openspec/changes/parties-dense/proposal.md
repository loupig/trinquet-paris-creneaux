# Proposal

## Why

Sur un iPhone 15 Pro, avec les vrais noms de clubs, la page Parties ne montre **qu'une partie** au premier écran. Chaque partie prend 150 à 170 px. Trois choses font cette hauteur :

- les noms officiels, longs (« METRO PELOTE BASQUE ANTONY (éq. 1) ») ;
- les joueurs écrits entre crochets après chaque équipe ;
- le lieu complet (« PARIS (Trinquet Paris - 75016) »).

Le Classement vient de passer en noms courts, avec les joueurs au toucher, et le demandeur l'a validé. Une maquette jetable de Parties avec le même principe montre **4 à 5 parties** au premier écran, à 52 px chacune.

## What Changes

- **Ligne d'une partie, en noms courts** (spec `noms-clubs`) : « 19h30 MPBA 1 vs PEP 2 40 – 27 », puis « Série 1 · Poule 1 · Trinquet Paris ».
  - Le lieu passe sous son nom court, comme à l'accueil : la partie entre parenthèses, sans le code postal.
  - **BREAKING** pour la spec `programme` : les noms officiels quittent la ligne.
- **Joueurs au toucher.** Les crochets disparaissent de la ligne. **BREAKING** : les joueurs ne sont plus « toujours affichés ».
  - Le détail, qui les donnait déjà avec les contacts, devient le seul endroit où les lire, sous le nom officiel de chaque équipe.
  - Le lieu complet y figure aussi.
- **Le toucher se voit**, comme au Classement :
  - un chevron « › » au bout de chaque ligne, qui passe en « ⌄ » une fois ouverte ;
  - un fond teinté sur la partie ouverte ;
  - la ligne devient un bouton qui annonce s'il est déplié.
- **Ce qui ne change pas** :
  - le message WhatsApp aux responsables garde les noms officiels et le lieu complet : il part vers des gens qui ne lisent pas forcément le site ;
  - le lien « Compter cette partie » envoie au compteur les noms courts, plus lisibles sur un tableau de score.
- **`CLUBS_ABREGES` recopiée dans `programme.html`**, identique à l'accueil et au Classement. Le test qui compare les copies à la spec couvre la troisième page.

## Capabilities

### New Capabilities
Aucune.

### Modified Capabilities
- `programme` :
  - « Ligne d'une partie » : noms courts, lieu court, chevron ;
  - « Détail d'une partie » : nom officiel, joueurs, lieu complet ;
  - « Joueurs des équipes entre crochets » : retirée.
- `donnees-api` : « Noms de joueurs seuls », Parties ne les donne plus qu'au détail d'une partie.

La spec `noms-clubs` ne change pas : elle ne liste pas les pages qui portent la table.

## Impact

- **Pages** : `programme.html` (rendu des lignes et du détail, CSS, `CLUBS_ABREGES`, `lieuCourt`). Pied de page `Version 2026.11.11.2`.
- **Tests** :
  - les scénarios de Parties qui lisent les crochets ou « Alpha (éq. 1) » sur la ligne sont revus ;
  - les nouveaux scénarios couvrent les noms courts, le lieu court, les joueurs au toucher, le chevron, le message WhatsApp inchangé et quatre parties au moins au premier écran d'un iPhone 15 Pro ;
  - le test des copies identiques ajoute `programme.html`.
- **README** (constante `CLUBS_ABREGES`, liste des endroits où s'affichent les noms de joueurs) et **spec `donnees-api`** (noms de joueurs sur Parties : au détail seulement).
- **Hors champ** :
  - Mes équipes, les crochets de l'accueil et du Bilan ;
  - la page Créneaux et l'en-tête de page.

## Hypothèses à valider

1. **Personne ne venait sur Parties pour lire les joueurs d'un coup d'œil.** Le Classement a fait le même pari. Si des joueurs le regrettent, les joueurs de l'équipe suivie pourraient revenir sur la ligne.
2. **« Trinquet Paris » suffit à situer une partie**, comme à l'accueil. L'adresse complète reste au toucher et dans le message WhatsApp.
