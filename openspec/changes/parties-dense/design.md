# Design

## Context

- **`programme.html`** construit chaque partie dans `buildMatchRow(match)` :
  - un `div.match-item` coloré par série ;
  - un `div.match-row` cliquable (heure, `equipesDe(match)` avec les crochets `.joueurs`, ligne `.match-row-meta`, score) ;
  - un `div.match-detail` replié.

  La ligne n'est pas un bouton : aucun `aria-expanded`, aucun indice visuel.
- **Libellés** : `clubLabel()` rend « Nom (éq. N) ». `match.labelRec` et `match.labelVis` servent à quatre endroits :
  - la ligne ;
  - le détail (`side.label`), où le message WhatsApp (`buildWhatsappMessage`) les reprend ;
  - le lien du compteur (`lienCompteur`) ;
  - `match.teams`, qui n'est pas lu.
- **Lieu** : `match.lieu` est le libellé de la ligue (« PARIS (Trinquet Paris - 75016) »). Le message WhatsApp l'emploie en entier. L'accueil a déjà `lieuCourt(lieu)`.
- **Le Classement** (#54, #55) a posé le modèle : ligne-bouton, chevron Phosphor du bloc Filtres tourné de −90°, fond `--accent-bg` à l'ouverture, `CLUBS_ABREGES` et numéro collé par une espace insécable.
- **Tests concernés** :
  - « Parties : les joueurs entre crochets… » (vers la ligne 2098) ;
  - les lectures de `.match-row-teams` en « Alpha (éq. 1) » ;
  - le test des copies identiques de `CLUBS_ABREGES` ;
  - le test du message WhatsApp, qui doit rester vert sans changement.

## Goals / Non-Goals

**Goals:**
- Une partie par ligne, au moins cinq sur le premier écran d'un iPhone 15 Pro, avec les vrais noms.
- Le même geste qu'au Classement pour voir les joueurs, et un indice visible.
- Aucun changement du message envoyé aux responsables.

**Non-Goals:**
- Pas de changement des filtres, des cartes par jour, ni des contacts.
- Pas de noms courts sur Mes équipes, l'accueil (déjà courts) ou le Bilan.
- Pas de clé `localStorage` nouvelle.

## Decisions

**1. Deux libellés par partie.**
- `match.labelRec` et `match.labelVis` deviennent le nom court + « " " » + numéro, calculé comme au Classement avec la même table.
- `match.officielRec` et `match.officielVis` gardent « Nom (éq. N) ».

Le détail construit ses `sides` avec les libellés officiels. Ainsi `buildWhatsappMessage` reçoit exactement ce qu'il recevait avant, sans être modifié. Le compteur reçoit les noms courts (`lienCompteur(match.labelRec, …)`), plus lisibles sur un tableau de score.

**2. Le lieu au détail, sauf lieu inhabituel.**
- À chaque rendu, `lieuHabituel` est le lieu le plus fréquent de toutes les rencontres reçues, avant tout filtre, pour qu'il ne change pas en filtrant. Le recalcul à chaque filtre coûte peu : quelques centaines de parties. Il est comparé sur le libellé normalisé, comme les doublons de l'accueil : sans casse, accents ni ponctuation.
- Une partie dont le lieu est connu et diffère du lieu habituel porte sur sa ligne `📍 ` + `lieuCourt(match.lieu)`.
- `lieuCourt` est recopiée de l'accueil, avec son nom et un commentaire qui y renvoie. Un test compare les deux copies.
- Le détail donne toujours le lieu complet, ou « Lieu non précisé ».

Alternative écartée : ne jamais mettre le lieu sur la ligne. Un joueur qui ne déplie pas la partie irait au mauvais trinquet.

**2 bis. La poule en pastille, la série par la couleur.**
- La pastille reprend le style `.poule-tag` du Classement et ses teintes `--poule1-*` à `--poule4-*`, recopiées dans le `:root` de `programme.html` avec leurs valeurs sombres, à l'identique dans les deux blocs sombres (spec `apparence`).
- La teinte suit le rang de la poule dans son groupe, spécialité et série (poule 1 → teinte 1), comme `teintesPoules` au Classement. La légende montre une pastille par couple poule et teinte, pour ne jamais contredire les lignes.
- Un club fictif (« Equipe à désigner ») n'a pas de numéro d'équipe, comme sur Mes équipes.
- Hors poule, la pastille porte le libellé court de la phase (« 1/4 de finale » → « 1/4 », « Barrage maintien » → « Barrage »), en `--accent` sur `--accent-bg`.
- La ligne `.match-row-meta` disparaît. Série, poule et lieu passent dans le détail et dans l'`aria-label` de la ligne.

**2 ter. Légende.**
Un `div.legende-parties`, au début de `#results` à chaque rendu, construit d'après les parties affichées :
- une pastille de couleur par série présente ;
- les pastilles de poule présentes, puis « poule » ;
- « 📍 lieu inhabituel » si une partie affichée en porte un ;
- « Touchez une partie : joueurs, lieu, contacts ».

Elle prend le style de la légende du Classement.

**3. Ligne-bouton.**
`div.match-row` devient `button.match-row` (styles de bouton remis à zéro), avec `aria-expanded` et `aria-controls` vers le détail. Le chevron est le tracé du bloc Filtres, déjà présent dans la page, inséré en constante comme au Classement.
- À l'ouverture, `.match-item` prend le fond `--accent-bg`, qui couvre la ligne et son détail. Le liseré de série reste à gauche.
- `align-items: center` remplace `baseline`, pour aligner l'heure, la pastille, les équipes, le score et le chevron.
- Le padding vertical passe de 10 à 7 px.

**4. Plus de crochets sur la ligne.**
`equipesDe(match)` n'écrit plus que « A vs B ». `crochets()` disparaît. Le numéro est collé au nom par une espace insécable, comme au Classement.

**5. Le pli est un état de la page, pas de la visite.**
Comme aujourd'hui, une partie ouverte se referme au prochain rendu (filtre). Rien n'est enregistré.

## Risks / Trade-offs

- **Joueurs moins visibles.** C'est l'hypothèse 1 de la proposition, le même pari qu'au Classement.
- **Lieu habituel faux en début de saison**, si les premières parties publiées se jouent surtout ailleurs. → Le lieu le plus fréquent se recalcule à chaque chargement, et le détail donne toujours le lieu complet.
- **Série par la couleur seule** : moins lisible pour un daltonien. → La légende, le détail et la phrase lue la disent en mots. Le filtre Série reste disponible.
- **Une copie de plus de `CLUBS_ABREGES`.** → Le test compare désormais trois pages à la spec.

## Migration Plan

Pas de donnée à migrer. Retour arrière : revert de la fusion.

## Open Questions

Aucune.
