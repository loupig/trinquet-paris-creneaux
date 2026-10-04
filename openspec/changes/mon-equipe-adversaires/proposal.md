# Proposal

## Why

La page « Mon équipe » dit où en est l'équipe, mais pas ce qui l'attend. Les joueurs veulent savoir ce qu'il leur faut gagner pour sortir des poules, à quoi ressemblent leurs prochains adversaires, et pouvoir joindre le responsable adverse sans passer par la page Parties. La table complète de la poule fait doublon avec la page Classement et allonge la page : le rang en clair suffit.

## What Changes

- **Objectif de qualification** : la carte Bilan indique ce qu'il faut pour finir dans les 4 premiers de la poule, calculé sur toutes les issues possibles des parties de poule restantes. Selon le cas : « qualifiée quoi qu'il arrive », « éliminée », ou le nombre de victoires qui assure la qualification et celui qui la laisse possible. Une fois la poule terminée : « qualifiée » ou « éliminée ».
- **Adversaires à venir** : sous chaque partie à venir de l'équipe, une fiche de l'adversaire : son rang dans sa poule, sa forme (5 dernières parties) et sa composition (noms seuls).
- **Contact du responsable adverse** : sur cette fiche, trois boutons (Appeler, SMS, WhatsApp) vers le responsable de l'équipe adverse déclaré à la ligue. WhatsApp s'ouvre sur une conversation vide, sans message prérempli.
- **Retrait de la table de poule** : la carte qui listait toute la poule disparaît. Le rang en clair (« 3e sur 6, poule 2 ») reste dans la carte du haut, calculé comme sur la page Classement.

## Capabilities

### New Capabilities
<!-- Aucune : tout se passe dans la page Mon équipe. -->

### Modified Capabilities
- `mon-equipe` : ajout de l'objectif de qualification, de la fiche adversaire et du contact du responsable adverse ; la table de poule disparaît, seul le rang en clair reste.

## Impact

- `equipe.html` seulement, plus `README.md`. Aucun nouvel appel API : le contact du responsable vient de la table `engagements`, déjà chargée pour les compositions.
- Le calcul du classement reste copié de `classement.html` : il sert au rang, à l'objectif de qualification et au rang des adversaires. Le code d'affichage de la table, devenu inutile, est retiré.
- Le calcul de qualification teste toutes les combinaisons de résultats des parties restantes. C'est rapide en cours de saison, mais trop lent en début de saison, quand il reste beaucoup de parties : il faut un plafond, avec un repli (voir le design).
- RGPD :
  - Les numéros des responsables sont des données personnelles. Ils sont déjà publiés sur le site de la ligue et derrière les boutons de la page Parties : cette page ajoute un nouvel accès, pas une nouvelle donnée.
  - Pour limiter l'exposition, la page n'affiche ni le numéro ni le nom du responsable : seulement les boutons.
  - Les compositions des adversaires sont des noms seuls, déjà visibles sur la page Parties.
  - Je ne sais pas si la ligue dispose d'une base légale couvrant ces affichages. Le point reste ouvert.

## Hypothèses à valider

1. **« X victoires assurent la qualification »** : l'équipe finit dans les 4 premiers dès qu'elle gagne au moins X de ses parties de poule restantes, quels que soient l'adversaire battu et les autres résultats. « Z la laissent possible » : Z est le plus petit nombre de victoires pour lequel au moins une combinaison des autres résultats la qualifie.
2. **Égalités** : le goal average ne se prévoit pas. Une égalité de moyenne avec une équipe concurrente compte comme défavorable dans le calcul « assurée », et favorable dans le calcul « possible », avec la mention « au goal average ».
3. **Place de l'objectif** : une ligne « Pour sortir des poules » dans la carte Bilan, sous la forme. Rien pour une équipe sans partie de poule.
4. **Adversaires concernés** : ceux des parties sans score de l'équipe, toutes phases confondues. Une partie contre « Equipe à désigner » n'a pas de fiche.
5. **Fiche aussi dans la prochaine partie** : la carte « Prochaine partie » porte la fiche de son adversaire, en plus de la liste des parties. La prochaine partie apparaît donc deux fois avec sa fiche.
6. **Sans numéro exploitable** : pas de boutons, sans message, comme sur la page Parties.
7. **Plafond de calcul** : au-delà de 20 parties de poule restantes, la ligne indique le nombre de parties restantes et que le calcul viendra plus tard dans la saison. Une poule compte au plus 21 parties (7 équipes) : le repli ne concerne que le tout début de saison. Aujourd'hui, il reste au plus 15 parties dans une poule.
