# Proposal

## Why

Les phases finales arrivent, et le demandeur doit prévenir toutes les équipes : dates, heures, joueurs des demies, lien du questionnaire d'avis, lien du site. Aujourd'hui, il rédige ce message à la main, puis cherche le responsable de chaque équipe sur Parties, une partie à la fois. Rien sur le site ne montre toutes les équipes d'un coup avec de quoi les joindre.

La page Mes équipes est déjà celle des équipes : elle a les compositions, les numéros des responsables et le bouton WhatsApp prérempli de « Prévenir l'équipe ». Mais elle ne montre qu'une équipe à la fois, choisie dans une liste déroulante. C'est là qu'il faut agir, pas sur une nouvelle page : la barre d'onglets est pleine (spec `navigation`).

## What Changes

- **L'onglet « Mes équipes » devient « Équipes »**, sur les sept pages, dans le titre de la page et dans la présentation. Le bloc « Mes équipes » de l'accueil garde son nom : il parle bien des équipes suivies.
- **La page s'ouvre sur la liste de toutes les équipes**, au format du Classement :
  - une carte par série et par poule ;
  - une ligne par équipe, dans l'ordre du classement : son rang et son nom court (« PEP 2 ») ;
  - au toucher, la ligne déplie le nom officiel, les joueurs et un lien « Voir l'équipe → ».
  - Les équipes suivies restent en pastilles au-dessus de la liste.
  - **BREAKING** : sans équipe dans l'adresse, la page ne rouvre plus la dernière équipe consultée. La liste déroulante disparaît, et avec elle la mémoire de la dernière équipe vue (clé `lidfpb_equipe_vue_v1`).
- **Sur chaque ligne, de quoi joindre le responsable** de l'équipe déclaré à la ligue : une icône WhatsApp (conversation vide) et une icône SMS, sans que son numéro ni son nom s'affichent. Une troisième icône lui envoie le message des phases finales sur WhatsApp, déjà écrit.
- **Un bouton « Message aux équipes »** en tête de liste déplie, dans la page, le message des phases finales, avec un bouton Partager (ou Copier). Le message est construit à partir des données de la ligue, sur le modèle validé par le demandeur :
  - un remerciement pour la saison ;
  - les parties de phases finales à venir, par phase et par jour, avec l'heure et la série ;
  - les deux équipes en noms courts et leurs joueurs, ou « finale Série 2 » tant qu'elles sont à désigner ;
  - le lieu ;
  - le lien du questionnaire d'avis de l'accueil, tant que sa campagne dure ;
  - le lien de la page Découvrir, présentée comme non officielle, en bêta, en complément du site de la ligue.

  Le bouton et la troisième icône n'apparaissent que si des phases finales restent à jouer et que les poules de leur série sont finies. Après les demies, les finalistes s'ajoutent seuls au message.
- **Exception à la règle des joueurs** (spec `donnees-api`), validée par le demandeur : leurs noms peuvent entrer dans ce seul message, adressé aux équipes du championnat. Ce sont les compositions publiées par la ligue. Les autres textes partagés n'en contiennent toujours aucun.
- **Ce qui ne change pas** : la page d'une équipe (en-tête, suivi, bilan, prochaine partie, parties, Prévenir l'équipe, fiche de l'adversaire), ses liens partagés `equipe.html?equipe=…` et le lien de l'accueil vers une équipe suivie.

## Capabilities

### New Capabilities
- `liste-equipes` : la vue de toutes les équipes de la page Équipes, le contact de leur responsable et le message des phases finales.

### Modified Capabilities
- `mon-equipe` :
  - « Équipe affichée » : seulement celle de l'adresse, sinon la liste ;
  - « Choix de l'équipe » et « Dernière équipe mémorisée sur l'appareil » sont retirées ;
  - ajout d'un retour à la liste.
- `mes-equipes` : « Passer d'une équipe suivie à l'autre », pour que les pastilles s'affichent aussi au-dessus de la liste.
- `navigation` : « Barre d'onglets », avec le libellé « Équipes ».
- `donnees-api` : « Noms de joueurs seuls », qui ajoute le dépli de la liste et l'exception du message des phases finales.

## Impact

- **Pages** :
  - `equipe.html` : nouvelle vue liste, navigation entre la liste et une équipe, message, recopie de `CLUBS_ABREGES` et de `AVIS` ;
  - les sept pages à onglets : libellé de l'onglet et `Version AAAA.MM.JJ` ;
  - `decouvrir.html` et `equipes.html` : le nom de la page.
- **Constantes dupliquées** : `CLUBS_ABREGES` (spec `noms-clubs`) et `AVIS` (lien et fin de campagne du questionnaire, aujourd'hui dans l'accueil seul). README à jour.
- **`localStorage`** : `lidfpb_equipe_vue_v1` n'est plus lue ni écrite. Elle sort du tableau du README. Aucune clé nouvelle.
- **Tests** : de nouveaux scénarios dans `tests/pages.spec.mjs` (liste, icônes, message construit, exception des joueurs, retour à la liste) et le libellé d'onglet. Pour avoir des demies désignées, il faut des données de poules finies, servies par une route propre au scénario, comme pour « Classement : phases finales jouées ».
- **Revue** : `/code-review`, et `/security-review`, car le changement touche aux données de l'API (noms et numéros) et au `localStorage`.
- **Hors champ** :
  - un envoi groupé par le site : le site ne fait qu'ouvrir WhatsApp ou la feuille de partage, une équipe à la fois ;
  - un message par SMS prérempli, que les téléphones gèrent mal ;
  - un nouvel onglet.

## Hypothèses à valider

1. **Prévenir toutes les équipes prend moins de cinq minutes** depuis la liste : pour 24 équipes, une icône par équipe, sans recopier de message ni chercher de numéro. On le vérifie en l'utilisant pour la finale du 6 décembre.
2. **Une liste vaut mieux que la dernière équipe vue** pour qui ouvre l'onglet. Un joueur qui suit son équipe la retrouve en une touche, dans les pastilles. Si des joueurs se plaignent de devoir toucher une fois de plus, on rouvrira l'équipe suivie quand il n'y en a qu'une.
3. **Les joueurs nommés font venir du monde.** On ne pourra pas le mesurer, faute de statistiques sur le site, sauf par le retour des équipes au bord du trinquet le 29 novembre et le 6 décembre.
