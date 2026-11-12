# Design

## Context

- **`bilan.html`** (2 788 lignes) a été écrit avant les trois derniers changements du Classement et de Parties, et n'en a rien repris :
  - `clubLabel()` rend « Nom (éq. N) », et la page n'a pas `CLUBS_ABREGES` ;
  - `nomEquipe()` ajoute les joueurs entre crochets au classement, aux trophées, à Mes équipes et au tableau final ;
  - `buildRankRow()` écrit le détail en phrase, sans colonnes ni toucher ;
  - `buildPouleCard()` pose le trait `.cut-line` sous la 4e équipe, puis les parties dans un `<details>` ;
  - `tableauQuarts()`, `chancesQuart()`, `buildSlot()`, `buildFinalesCard()` et `buildArbre()` sont des copies **anciennes** de celles du Classement. Elles ignorent les phases 10, 11 et 12 : c'est la cause du tableau en prévision seule.
- **`sortFinDePoule()`** et `FIN_DE_POULE` sont déjà dans le Bilan : les zones du Classement en viennent.
- **Le Classement** porte le modèle à reprendre :
  - `buildRankRow(team, rang, teinte, zone)` : ligne-bouton, colonnes, chevron, dépli du nom officiel, des joueurs et du détail ;
  - `buildLegende()` ;
  - les teintes `--poule*` et les liserés de zone, avec leurs valeurs sombres ;
  - `partiesFinales()`, `tableauFinal()`, `buildDuel()` et `buildArbre()` à quatre paramètres, sortis de la PR #57.
- **Parties** porte le modèle d'une partie en une ligne : « MPBA 1 vs Bravo 1 » avec des espaces insécables, score à droite.
- **Ce qui lit `t.label` aujourd'hui** : classement, trophées, Mes équipes, résultats (`p.nomA`, `p.nomB`), tableau, image et texte partagés, messages de fin de poule (`messageFinDePoule`, `partiesSuivantes`).
- **Tests concernés** : le bloc « Bilan de la phase de poules » (vers la ligne 1500). Il lit « Alpha (éq. 1) [Ane …] », `.quart-nom .joueurs`, `.cut-line`, et compare les quarts du Bilan à ceux du Classement en retirant les crochets.

## Goals / Non-Goals

**Goals:**
- Le même tableau final qu'au Classement, scores compris, et qui ne puisse plus diverger sans qu'un test le signale.
- Une poule de six au premier écran d'un Pixel 7, comme au Classement.
- Les mêmes noms, zones et légende que le Classement, pour qu'on passe d'une page à l'autre sans relire.

**Non-Goals:**
- Pas de script partagé : chaque page reste autonome (CLAUDE.md).
- Pas de simulateur ni de chemin vers les quarts au Bilan.
- Pas de changement du calcul des trophées, des chiffres de l'affiche ni du contenu des messages de fin de poule.
- Pas de clé `localStorage` nouvelle.

## Decisions

**1. Deux libellés par équipe, comme au Classement.**
- `t.label` devient le nom court (« MPBA 1 »), à partir de la même `CLUBS_ABREGES`.
- `t.nomOfficiel` garde « Nom (éq. N) ».
- Les messages de fin de poule et l'adversaire de `partiesSuivantes` passent à `nomOfficiel`. Leur texte ne change donc pas, et le test du message doit rester vert sans modification.
- *Alternative écartée* : garder `label` officiel et ajouter `labelCourt`. Il faudrait alors toucher tous les endroits sauf un, et un oubli laisserait un nom long à l'écran.

**2. Tableau final : copie à l'identique, vérifiée par un test.**
- Classement et Bilan avaient divergé parce que rien ne comparait les deux copies. Les fonctions du tableau deviennent **pures** dans les deux pages : elles reçoivent les rencontres et les parties restantes en paramètres, et ne lisent plus `lastData` ni `partiesRestantes()`. Fonctions concernées : `idClubEquipe`, `partiesFinales`, `tableauQuarts`, `tableauFinal`, `buildDuel`, `buildArbre`.
- Un test compare leur texte source entre `classement.html` et `bilan.html`, comme le test des constantes dupliquées.
- *Alternative écartée* : un `.js` partagé. Ce serait plus court, mais contraire à « chaque page est autonome ».
- *Coût* : un petit remaniement de `classement.html`, sans changement de comportement. Ses tests existants le vérifient.

**3. `buildSlot` et `chancesQuart` restent propres à chaque page.**
- Au Classement, les chances lisent la « forme » réelle, hors simulation.
- Au Bilan, il n'y a pas de simulation : la `forme` est l'équipe elle-même.
- Le test « Même tableau » compare le rendu, pas le code : mêmes équipes, mêmes %, mêmes scores.

**4. Ligne de classement : `buildRankRow` du Classement, plus la médaille.**
- La classe `or`, `argent` ou `bronze` reste sur `.rank-pos`.
- Le liseré de zone vient de `sortFinDePoule(serie, rang, taille)`, déjà dans la page.
- Pas de teinte de poule : le Bilan n'a pas de classement général.
- Le dépli reprend l'ordre du Classement : nom officiel, joueurs, détail.

**5. Parties de la poule : une ligne en grille.**
- Colonnes : date courte | « A vs B » | score.
- Le vainqueur est en gras dans le texte des équipes, et la grille aligne le score à droite.
- Pas de toucher : le Bilan récapitule, le détail est sur Parties.

**6. Mes équipes en phases finales.**
- Le verdict se lit dans `tableauFinal()` : quart, demie, finale, et le vainqueur de chaque duel.
- Sans phase finale commencée, le texte actuel ne change pas (« en quarts pour l'instant », etc.).

**7. Image partagée : noms courts.**
- Elle lit déjà `t.label` : la décision 1 suffit.
- `tronquer()` reste comme garde-fou.

## Risks / Trade-offs

- **[Page plus longue à relire pour la revue]** : environ 300 lignes recopiées depuis le Classement. → Le test des copies identiques porte la charge de la cohérence. La revue se concentre sur ce qui est propre au Bilan.
- **[Les joueurs disparaissent des trophées]** : c'était le sel du comptoir. → Ils restent à un toucher dans la poule. Choix validé par le demandeur.
- **[Remaniement de `classement.html`]** : il est en ligne et validé sur les vraies données depuis ce matin. → Le changement n'est qu'un passage de paramètres. Les 168 tests existants le couvrent, et une capture sera faite avant et après sur les mêmes données.
- **[Noms courts dans l'image]** : un groupe hors ligue ne reconnaîtrait pas « PEP ». → Choix validé par le demandeur.

## Migration Plan

- Pas de donnée ni de clé à migrer. Une mise en ligne, et un retour arrière par revert de la fusion.
- Ordre : d'abord le remaniement pur du Classement, testé seul ; ensuite le Bilan.

## Open Questions

Aucune. Le demandeur a tranché les deux questions ouvertes :
- les joueurs sont retirés des trophées ;
- l'image partagée utilise les noms courts.
