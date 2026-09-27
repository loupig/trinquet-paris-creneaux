# Proposal

## Why

Un joueur qui ouvre l'accueil cherche d'abord sa propre partie et sa place au classement. Aujourd'hui il doit la repérer dans la liste « D'ici dimanche », ou passer par Équipes et Classement et y refiltrer. Le site ne sait pas qui il est : il n'a pas de compte, et ne doit pas en avoir pour ça. Il suffit que le visiteur désigne une fois ses équipes, et que son navigateur s'en souvienne.

## What Changes

- Le visiteur peut désigner **une ou plusieurs équipes** qu'il suit (par exemple ses deux équipes, ou celles de ses enfants). Ce choix est mémorisé dans son navigateur uniquement, sans compte ni envoi à un serveur.
- Un nouveau bloc « Mes équipes » en tête de l'accueil donne, pour chaque équipe suivie, sa prochaine partie et son rang dans sa poule.
- Tant qu'aucune équipe n'est choisie, ce bloc se réduit à une invitation à en choisir.
- Dans « D'ici dimanche », les parties de mes équipes sont repérables d'un coup d'œil, sans changer l'étiquette « à voir ».
- Le choix se fait dans la page, par un panneau qui se déplie, jamais par un popup.
- Hors périmètre : pré-filtrer Programme, Équipes et Classement sur mes équipes, qui viendra dans un changement suivant si le besoin se confirme.

## Capabilities

### New Capabilities
- `mes-equipes`: choix des équipes suivies, leur mémorisation locale, et le bloc qui en donne la prochaine partie et le rang.

### Modified Capabilities
- `accueil`: la composition passe de deux à trois blocs, « Mes équipes » s'ajoutant en tête.
- `affiche-week-end`: les parties des équipes suivies se distinguent dans la liste.

## Impact

- `index.html` uniquement, plus `README.md`. Pas de nouvel appel API : les équipes, les rangs et les parties se déduisent de `rencontres` et `clubs`, déjà chargés.
- Nouvelle clé `localStorage` pour la liste des équipes suivies.
- RGPD : la liste des équipes suivies ne quitte pas le navigateur. Le site ne collecte rien de plus qu'aujourd'hui. C'est à mon sens hors du champ d'une collecte de données personnelles, mais je ne suis pas en mesure de l'affirmer avec certitude.

## Hypothèses à valider

1. **Rang affiché** : le rang en phase de poules, par exemple « 3e sur 6, poule 2 ». Une équipe qui n'a encore rien joué est indiquée « pas encore classée ».
2. **Prochaine partie** : la prochaine partie à venir de l'équipe, même au-delà de dimanche. S'il n'y en a plus, « plus de partie programmée ».
3. **Repérage dans « D'ici dimanche »** : un trait de couleur en marge gauche de la ligne. L'étiquette « à voir » reste la seule étiquette.
4. **Choix proposé** : toutes les équipes engagées, regroupées par série puis par club, hors clubs fictifs (« Equipe à désigner »).
5. **Équipe disparue** : une équipe suivie qui n'existe plus dans les données (nouvelle saison) est ignorée sans message, et retirée du choix à la prochaine modification.
