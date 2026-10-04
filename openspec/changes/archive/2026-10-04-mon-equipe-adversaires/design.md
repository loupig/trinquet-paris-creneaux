# Design

## Context

- `equipe.html` construit déjà, à partir des données chargées :
  - `buildTeams()` : toutes les équipes, avec leurs parties (score du point de vue de l'équipe), leur bilan et leur composition ;
  - `buildStandings()` / `trierClassement()` : le classement des poules, copié de `classement.html` ;
  - `pouleDe()` : la poule et le rang d'une équipe ;
  - `bilanDe()` : la forme d'une équipe.
- Son `buildEngagementsIndex()`, repris de l'ancienne vue Par équipe, ne garde que les licences. Celui de `programme.html` garde aussi `Responsable` et le premier téléphone déclaré (`Tél1. Resp.`, sinon `Tél2. Resp.`), et `programme.html` a `getContact()`, `normalizePhoneForWhatsapp()` et les icônes WhatsApp, SMS et téléphone.
- Les poules comptent 6 ou 7 équipes, soit au plus 21 parties (une rencontre entre chaque paire). Il en reste aujourd'hui au plus 15 dans une poule. Énumérer les 2^21 issues prend 185 ms dans Node sur un ordinateur ; sur un téléphone, il faut compter plusieurs fois plus.
- Le classement se fait aux points par partie jouée (3 la victoire, 1 la défaite), puis au goal average moyen, qui dépend des scores et ne se prévoit donc pas.

## Goals / Non-Goals

**Goals:**
- Un calcul de qualification exact sur les victoires et défaites, sans hypothèse sur les scores.
- Aucun appel API de plus : contact et compositions viennent de `engagements`, déjà chargé.
- Exposer le moins possible le contact : ni nom ni numéro affichés.

**Non-Goals:**
- Pas de prévision du goal average, ni de probabilités.
- Pas de message prérempli (contrairement à la page Parties), à la demande.
- Pas de calcul en tâche de fond (Web Worker) : le plafond suffit.

## Decisions

**1. Qualification : énumération exhaustive des issues des parties de poule restantes.**
On prend les parties de phase de poules de la poule de l'équipe sans score, celles de l'équipe comme les autres. Chaque issue est un masque de bits (bit à 1 : le recevant gagne). Pour chaque issue, on part des points et parties jouées actuels de chaque équipe (`buildStandings()`), on ajoute 3 ou 1 point et une partie à chaque équipe des parties restantes, puis on compte les concurrentes qui finissent strictement devant l'équipe (moyenne supérieure) et celles à égalité. L'issue est :
- **sûre** si `devant + égales < 4` ;
- **possible** si `devant < 4` ;
- **perdue** sinon.

Les résultats sont regroupés par nombre de victoires de l'équipe dans l'issue, `k` de 0 au nombre de ses parties restantes `n` : `sure[k]` vaut vrai si toutes les issues à `k` victoires sont sûres, `possible[k]` si au moins une est possible.
Alternatives écartées :
- un raisonnement au pire cas sans énumération : trop fragile avec un critère de moyenne, où une défaite rapporte quand même 1 point ;
- une simulation aléatoire : non exacte, alors que le texte affiché se veut certain.

**2. Messages tirés des tableaux `sure` et `possible`.**
- `sure[0]` vrai : « Qualifiée quoi qu'il arrive ».
- `possible[n]` faux : « Éliminée : même en gagnant ses n parties, la 4e place est hors d'atteinte ».
- Sinon, avec `X` le plus petit `k` tel que `sure[k]`, et `Z` le plus petit `k` tel que `possible[k]` :
  - si `X` existe : « X victoires sur n assurent la qualification » ;
  - si `Z < X`, ou si `X` n'existe pas : « dès Z victoire(s), elle reste possible selon les autres résultats » ;
  - si `X` n'existe pas, on remplace le premier membre par « Même en gagnant tout, la qualification dépendra des autres résultats ».
  - Quand la seule issue possible pour `Z` passe par une égalité, on ajoute « au goal average ».
- Poule terminée (aucune partie restante) : « Qualifiée » si le rang final de `pouleDe()` est ≤ 4, sinon « Éliminée ». Ici, le goal average réel départage déjà.
- Plus de 20 parties restantes : « Encore N parties de poule à jouer : le calcul arrivera après les premières rencontres. »
Une poule de 4 équipes ou moins donne « Qualifiée quoi qu'il arrive » sans calcul.

**3. Placement : une ligne « Pour sortir des poules » dans la carte Bilan, sous la forme.**
Le texte est court, sur une ou deux lignes, dans le style de `.bilan`. Une équipe sans poule (`pouleDe()` nul) n'a pas cette ligne.

**4. Index des engagements enrichi du contact, comme dans `programme.html`.**
Chaque entrée de `buildEngagementsIndex()` devient `{ licences, responsable, tel }` ; `getRoster()` lit `entry.licences`. On ajoute `getContact()`, `normalizePhoneForWhatsapp()` et les trois icônes, copiés de `programme.html`. Le nom du responsable reste en mémoire, il n'est jamais affiché. Le commentaire de tête de l'index, qui disait « cette page n'affiche aucun contact », est corrigé.

**5. Fiche adversaire : un composant unique, posé sous chaque partie à venir et dans la carte « Prochaine partie ».**
La fiche se construit à partir de la partie (club et numéro de l'adversaire, catégorie, spécialité) :
- l'équipe adverse est retrouvée dans les équipes construites ;
- son rang vient de `pouleDe()` ;
- sa forme de `bilanDe()` ;
- sa composition de son `roster`.

Elle tient sur trois lignes compactes : « 2e sur 7, poule 2 · Forme G G P », « Joueurs : … », puis les boutons de contact. On réutilise les styles `.forme-res` et `.team-roster`, en plus petit. Pour la construire, `buildTeams()` doit garder sur chaque partie le code club et le numéro de l'adversaire, qu'elle réduit aujourd'hui à un libellé.

**6. Contact : liens `tel:+33…`, `sms:+33…` et `https://wa.me/33…` sans paramètre `text`.**
Le WhatsApp s'ouvre dans un nouvel onglet, comme sur la page Parties. Les libellés accessibles disent « Appeler le responsable de <équipe> », sans le nom de la personne.

**7. Retrait de la table de poule.**
On supprime `buildClassement()`, `buildRankRow()`, `fmtMoyenne()`, `fmtSigne()`, `fmtSigneMoyen()`, `PODIUM` et les styles `.poule-card`, `.rank-*` et `.cut-line`. On garde le calcul (`buildStandings()`, `trierClassement()`, `pouleDe()`), qui sert au rang, à la qualification et aux fiches. Les commentaires « recopié dans » des trois copies restent vrais, puisque le calcul est toujours copié.

## Risks / Trade-offs

- [Calcul lent en début de saison sur un téléphone ancien] → Plafond à 20 parties restantes, soit 1 048 576 issues au plus. Le calcul est fait à l'affichage d'une équipe, et pas pour chaque adversaire. La tâche de vérification le mesure sur la poule la plus chargée.
- [Message trompeur sur une égalité] → Les égalités comptent contre l'équipe pour « assurée » et pour elle pour « possible », avec « au goal average ». Les scénarios de la spec le vérifient.
- [Le nombre de victoires ne dit pas lesquelles] → C'est assumé et dit dans le texte (« sur n »). Battre un concurrent direct compte plus, mais le seuil « assure » est valable pour n'importe quelles victoires.
- [Numéros de responsables] → Ils sont déjà publics et derrière les boutons de la page Parties, et ne sont jamais affichés ici. Le point RGPD reste ouvert dans la proposition.

## Migration Plan

Aucune migration : site statique, déploiement par push sur `main`. Retour arrière par `git revert`.
