# Proposal

## Why

Sur un téléphone, le Classement montre **une équipe et demie** au premier écran (Pixel 7, données fictives). Le site de la ligue en montre une quinzaine. Ce n'est pas la taille du texte qui coûte la place, ce sont :

- le bloc Filtres, ouvert par défaut : environ 330 px ;
- le lien « Bilan » sur deux lignes : environ 70 px ;
- chaque ligne d'équipe : environ 90 px. Le détail y est écrit en phrase (« 3 parties · 3 G · 0 P · 9 pts · 120–69 · GA +51 (+17,00) ») et les noms des joueurs sont toujours affichés.

Un joueur qui ouvre le Classement veut savoir où en est sa poule et qui est devant. Il doit pouvoir comparer les équipes d'un coup d'œil, comme sur le site de la ligue, sans perdre la lisibilité du nôtre.

Une maquette jetable (CSS injecté, rien de mis en ligne) a montré qu'une poule de six tient en entier sur le premier écran, en clair comme en sombre.

## What Changes

- **Classement : une ligne par équipe, en colonnes.** On garde le rang, l'équipe, puis J (parties jouées), G, P, GA (goal average total) et Moy. (moyenne de points par partie, le critère de tri, en gras). Un en-tête de colonnes ouvre chaque carte. La ligne fait environ 40 px au lieu de 90.
- **Détail et joueurs au toucher.** Toucher une ligne déplie le détail actuel (points, points marqués et encaissés, goal average moyen, nuls) et les noms des joueurs. La toucher à nouveau le replie, comme une partie sur la page Parties. **BREAKING** pour la spec `classement` : les noms ne sont plus « toujours affichés ».
- **Bloc Filtres replié par défaut** sur Parties, Classement et Créneaux, avec son résumé (« Tout est affiché »). Le pli reste commun aux trois pages et retenu sur l'appareil. Un visiteur qui l'a déjà ouvert à la main le retrouve ouvert.
- **Lien Bilan sur une ligne.** Le sous-titre « Chiffres, trophées, résultats et tableau final » disparaît.

## Capabilities

### New Capabilities
Aucune.

### Modified Capabilities
- `classement` : « Ligne d'une équipe » (colonnes, détail au toucher), « Joueurs des équipes » (au toucher), « Lien vers le bilan » (une ligne).
- `programme` : « Filtres du calendrier » (le bloc n'est plus « ouvert par défaut »), « Filtres mémorisés sur l'appareil » (replié par défaut sur les trois pages, ouvert seulement par un geste du visiteur).

## Impact

- **Pages** : `classement.html` (rendu des lignes, CSS, lien Bilan, pli des filtres), `programme.html` et `creneaux.html` (pli des filtres seulement). Le pied de page de chaque page change de version.
- **`localStorage`** : pas de clé nouvelle. `lidfpb_filters_open_v1` garde son sens : `"1"` veut dire ouvert à la main, `"0"` replié à la main. Seule change la valeur quand la clé est absente : replié au lieu d'ouvert.
- **Tests** : les scénarios qui lisent `.rank-joueurs` ou cliquent sur `#filtersToggle` sont revus. On ajoute des scénarios pour la ligne compacte, le dépli au toucher, le repli par défaut et la mesure « une poule de six au premier écran ».
- **Hors champ**, candidats pour la suite si l'essai plaît :
  - en-tête de page plus court (commun à toutes les pages) ;
  - même densité pour Parties, Mes équipes et les poules du Bilan ;
  - ligne de l'équipe suivie mise en évidence dans le Classement.

## Hypothèses à valider

1. **Les colonnes se lisent mieux que les phrases.** Pour le mesurer : le site n'a pas de statistiques. On demande à deux ou trois joueurs du club, une semaine après la mise en ligne, « tu trouves ta poule plus vite ? ».
2. **Les noms des joueurs peuvent passer derrière un toucher.** Ils servaient à reconnaître une équipe, mais le nom du club et le numéro suffisent le plus souvent. Si on nous les redemande, on pourra les remettre sur la ligne pour la seule équipe suivie.
3. **Un bloc Filtres replié ne cache pas les filtres.** Son résumé dit ce qui est filtré, et le titre « Filtres » reste à l'écran.
