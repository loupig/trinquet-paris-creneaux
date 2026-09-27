# Design

## Context

- `renderTiles(data, today)` reconstruit tout `#tiles` à chaque rendu. Il dispose déjà de `clubMap`, `prochaines()` (toutes les parties à venir, avec codes club et numéros d'équipe), `buildStandings()` et `rangsParPoule()`.
- Les tuiles existantes sont des `<a class="tile">` entièrement cliquables : on ne peut pas y placer de cases à cocher.
- Le projet refuse les popups (README, « Choix délibéré : pas de popup »). Les pages mémorisent déjà leurs filtres dans `localStorage`, toujours dans un `try/catch`.
- L'identité d'une équipe est, par convention du projet, catégorie + club + numéro (README, page Équipes). `teamKey()` y ajoute la spécialité et la poule.

## Goals / Non-Goals

**Goals:**
- Tout calculer à partir des données déjà chargées, sans appel réseau, y compris lors d'une modification du choix.
- Le même rang que la page Classement, via le classement déjà recopié.

**Non-Goals:**
- Pas de pré-filtrage des autres pages.
- Pas de partage du choix entre appareils, ni de lien partageable.

## Decisions

**1. Clé d'équipe suivie : spécialité + catégorie + club + numéro, sans la poule.**
La poule n'est renseignée qu'en phase de poules : une équipe qualifiée garderait sinon une clé qui ne correspond plus à ses parties de phase finale. La spécialité est ajoutée par prudence, pour le jour où une seconde spécialité réutiliserait les mêmes numéros. Stockage : un tableau de clés, en JSON, sous `lidfpb_mes_equipes_v1`.

**2. Le bloc « Mes équipes » est un `<div class="tile">`, pas un lien.**
Son en-tête porte le titre et un bouton « Modifier ». Le panneau de choix est un `<details>` natif dans le bloc : il se déplie dans la page, fonctionne sans script de fermeture, et ne peut pas rester bloqué ouvert, contrairement aux popups écartés par le passé. Sans équipe suivie, le bloc se réduit au `<summary>` « Choisir mes équipes ».

**3. Liste proposée : les équipes de `buildStandings()`, hors clubs fictifs.**
Toutes les équipes engagées y figurent, y compris celles qui n'ont rien joué. Elles sont regroupées par série, puis par club, puis par numéro, avec les libellés `SERIE_LABELS` et les noms courts de `clubCourt()`.

**4. Prochaine partie : la première ligne de `prochaines()` où l'équipe figure, d'un côté ou de l'autre.**
L'adversaire est l'autre côté, en nom court. Pas de limite à dimanche.

**5. Rang : `rangsParPoule()` sur la poule de l'équipe.**
On retrouve la poule par l'entrée de `buildStandings()` de l'équipe. On affiche « 1er » ou « Ne », « sur » la taille de la poule, puis « poule N ». Un rang `null` donne « pas encore classée ».

**6. Repère dans « D'ici dimanche » : une classe `mine` sur `.affiche`.**
Elle ajoute un trait `inset` de 3 px en marge gauche, à la couleur d'accent. Ça ne touche ni à l'étiquette, ni à l'ordre, ni à la hauteur de ligne.

**7. Modifier le choix redessine l'accueil depuis les données en mémoire, panneau conservé ouvert.**
Chaque case cochée enregistre la liste puis rappelle `renderTiles` avec les dernières données reçues. Un indicateur remet le `<details>` ouvert après le rendu, pour qu'on puisse cocher plusieurs équipes d'affilée.

## Risks / Trade-offs

- [Liste de choix longue : 26 équipes] → Groupée par série et par club, dans un panneau replié par défaut. Elle n'occupe l'écran que pendant le choix.
- [Stockage effacé par le navigateur] → Le visiteur retombe sur l'invitation. Rien n'est cassé, il suffit de rechoisir.
- [Nouvelle saison : numéros d'équipe réattribués] → Une clé qui ne correspond plus à rien est ignorée. Une clé réattribuée à une autre composition suivrait la nouvelle équipe, ce qui est acceptable : c'est le même club et le même numéro.

## Migration Plan

Aucune migration : page statique, déploiement par push sur `main`. Retour arrière par `git revert`. La clé `localStorage` orpheline est sans effet.
