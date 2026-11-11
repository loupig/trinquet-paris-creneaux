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
- Au moins quatre parties sur le premier écran d'un iPhone 15 Pro, avec les vrais noms.
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

**2. `lieuCourt` recopiée de l'accueil.**
Même fonction, même nom, avec un commentaire qui renvoie à l'accueil. La ligne affiche `lieuCourt(match.lieu)`. Le détail ajoute une ligne « Lieu : … » avec le libellé complet, sauf si le lieu est absent (`LIEU_INCONNU`). Un test compare les deux copies, comme pour les constantes.

**3. Ligne-bouton.**
`div.match-row` devient `button.match-row` (styles de bouton remis à zéro), avec `aria-expanded` et `aria-controls` vers le détail. Le chevron est le tracé du bloc Filtres, déjà présent dans la page, inséré en constante comme au Classement.
- À l'ouverture, `.match-item` prend le fond `--accent-bg`, qui couvre la ligne et son détail. Le liseré de série reste à gauche.
- `align-items: center` remplace `baseline`, pour aligner l'heure, les équipes, le score et le chevron.
- Le padding vertical passe de 10 à 8 px.

**4. Plus de crochets sur la ligne.**
`equipesDe(match)` n'écrit plus que « A vs B ». `crochets()` disparaît. Le numéro est collé au nom par une espace insécable, comme au Classement.

**5. Le pli est un état de la page, pas de la visite.**
Comme aujourd'hui, une partie ouverte se referme au prochain rendu (filtre). Rien n'est enregistré.

## Risks / Trade-offs

- **Joueurs moins visibles.** C'est l'hypothèse 1 de la proposition, le même pari qu'au Classement.
- **Lieu court ambigu.** Deux salles au nom proche dans deux villes. → Le détail donne le lieu complet. Les lieux de la ligue diffèrent par leur nom de salle.
- **Une copie de plus de `CLUBS_ABREGES`.** → Le test compare désormais trois pages à la spec.

## Migration Plan

Pas de donnée à migrer. Retour arrière : revert de la fusion.

## Open Questions

Aucune.
