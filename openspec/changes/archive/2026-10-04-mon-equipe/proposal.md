# Proposal

## Why

Les joueurs demandent une page qui ne parle que de leur équipe. Aujourd'hui, ces informations sont réparties sur trois pages. Les parties et la composition sont dans Parties (vue Par équipe, une fois filtrée par club), le classement de la poule dans Classement, et l'accueil n'en donne qu'un résumé d'une ligne. Une page dédiée regroupe tout au même endroit, pour n'importe quelle équipe, et se partage par un lien.

## What Changes

- Nouvelle page `equipe.html`, « Mon équipe ». Elle porte sur une seule équipe, désignée dans l'URL (`?equipe=<clé>`), et montre :
  - la prochaine partie, mise en avant, avec le bouton de report quand elle se joue au Trinquet Paris ;
  - toutes les parties de l'équipe, passées avec leur score et à venir ;
  - le classement de sa poule, avec la ligne de l'équipe mise en évidence et le trait des qualifiés ;
  - son bilan (jouées, gagnées, perdues, points marqués et encaissés) et sa forme (résultats des dernières parties) ;
  - sa composition déclarée à la ligue, avec les noms des joueurs seulement ;
  - les autres parties de sa poule qui restent à jouer.
- Toute équipe engagée peut être consultée, qu'elle soit suivie ou non. On change d'équipe par une liste déroulante en tête de page.
- Ouverte sans équipe dans l'URL, la page reprend la dernière équipe consultée, mémorisée dans le navigateur.
- La barre d'onglets passe de 4 à 5 entrées sur toutes les pages, avec un onglet « Mon équipe ».
- Hors périmètre : rendre cliquables les noms d'équipe du Classement ou les lignes du bloc « Mes équipes » de l'accueil, et suivre ou ne plus suivre une équipe depuis cette page. Ces changements viendront plus tard si le besoin se confirme.

## Capabilities

### New Capabilities
- `mon-equipe`: la page d'une équipe (choix de l'équipe, équipe par défaut, contenu affiché) et son accès par la barre d'onglets.

### Modified Capabilities
<!-- Aucune : les specs accueil, affiche-week-end et mes-equipes restent vraies. L'onglet Créneaux, cité par la spec accueil, reste dans la barre. -->

## Impact

- Nouveau fichier `equipe.html`, autonome comme les autres pages (HTML, CSS et JS inline, sans build).
- Barre d'onglets modifiée dans les 7 pages existantes. On met à jour leur version de pied de page.
- Appels API : `rencontres`, `clubs`, `engagements` et `licencies`, comme la vue Par équipe, avec le même cache navigateur. Pas de nouvelle table, ni de changement côté Apps Script. La composition ne bloque pas l'affichage : si `engagements` ou `licencies` échoue, la page s'affiche sans elle.
- Le calcul du classement existe déjà en deux copies (`classement.html` et `index.html`). Cette page en ajoute une troisième, qui doit rester identique aux deux autres.
- `README.md` : description de la page, et correction de la barre d'onglets, que le README décrit encore avec 5 entrées aux anciens noms.
- RGPD :
  - La composition n'affiche que les noms, jamais de licence ni de contact, comme la vue Par équipe.
  - La dernière équipe consultée reste dans le navigateur et n'est envoyée nulle part.
  - Le lien partagé contient un code club et un numéro d'équipe, pas de donnée personnelle.
  - La page republie des noms de joueurs qui figurent déjà sur la vue Par équipe. Je ne sais pas si la ligue dispose d'une base légale couvrant cette republication. Le point est à vérifier, il n'est pas tranché ici.

## Hypothèses à valider

1. **Libellé et place de l'onglet** : « Mon équipe », en 2e position (Accueil / Mon équipe / Parties / Classement / Créneaux). On vérifie à 390 px que les cinq libellés tiennent sans couper. Sinon, le libellé devient « Équipe ».
2. **Équipe par défaut** : dans l'ordre, l'équipe de l'URL, puis la dernière consultée, puis la première équipe suivie. Sans aucune des trois, la page montre seulement la liste déroulante et une invitation à choisir.
3. **Liste déroulante** : les équipes suivies en tête, dans un groupe « Mes équipes », puis toutes les équipes par série et par club, hors clubs fictifs (« Equipe à désigner »). Choisir une équipe met à jour l'URL, qu'on peut alors copier et partager.
4. **Forme** : les 5 dernières parties jouées, en pastilles G ou P, de la plus ancienne à la plus récente, toutes phases confondues.
5. **Bilan** : il porte sur toutes les parties jouées, comme sur la vue Par équipe. Le classement, lui, ne compte que la phase de poules.
6. **Reste à jouer dans la poule** : seulement les parties de la poule sans score qui n'impliquent pas l'équipe, puisque les siennes sont déjà listées plus haut. La section est masquée quand il n'en reste aucune.
