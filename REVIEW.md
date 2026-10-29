# REVIEW.md

Consignes pour la revue automatique des PR. Les conventions du projet sont
dans [CLAUDE.md](CLAUDE.md) : signaler ce qui les enfreint, et une ligne de
CLAUDE.md ou du README que le changement rend fausse.

## Ce qu'est un échec ici

Le site part en production dès la fusion, sur le téléphone de joueurs, au
bord du trinquet. Par ordre de gravité :

1. **Une page cassée** : erreur JavaScript, page blanche, bandeau d'échec,
   barre d'onglets inutilisable ou masquée sur iPhone en mode installé.
2. **Une donnée fausse** : un classement, un score, une date ou un créneau
   qui ment. Le calcul du classement doit rester le même dans l'accueil,
   Mes équipes et le Classement (spec `calcul-classement`).
3. **Une donnée personnelle exposée** : numéro de licence, téléphone écrit
   dans la page, adresse, date de naissance, ou donnée réelle dans les tests
   ou une capture. Le dépôt est public.
4. **Un oubli de mise en ligne** : version du pied de page non changée,
   `?v=` de `fetes.js` non changé, spec ou README contredit par le code.

## Comment rapporter

- Chaque constat cite un fichier et une ligne, et le scénario qui casse.
  Pas de supposition tirée d'un nom de fonction.
- Au plus trois remarques de style par PR : le reste ne vaut pas un tour
  de correction de plus.
- Un bug antérieur à la PR est marqué comme tel, pas imputé à l'auteur.
- Signaler la classe de bug (« les trois pages qui portent `PTS_VICTOIRE` »),
  pas une seule ligne, pour tout corriger en une fois.
- Ne pas répéter un constat déjà posté.
- Le résumé commence par le nombre de constats bloquants, et dit
  clairement « rien à corriger » quand c'est le cas.

## À ignorer

- `node_modules/`, `package-lock.json`
- `fonts/`, `icons/` (binaires)
- `openspec/changes/archive/` (historique figé)
- `.claude/` (skills et commandes OpenSpec générés)
