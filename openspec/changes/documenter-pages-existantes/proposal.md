# Proposal

## Why

Quatre capacités du site ont une spec (accueil, affiche du week-end, mes équipes, mon équipe). Les cinq autres pages et tout ce qui est commun aux pages n'en ont pas : leur seul contrat est le README, un texte narratif qui a déjà pris du retard sur le code (il parle d'un cache « partagé par les trois pages » alors que six l'utilisent). Sans spec, une évolution de ces pages ne peut pas dire ce qu'elle change, et le calcul du classement, recopié dans trois pages qui doivent rester identiques, n'a aucun endroit où cette règle est écrite.

## What Changes

- Écrire la spec de chaque page qui n'en a pas : Classement, Parties (`programme.html`), Créneaux, Report, Compteur. Chaque spec décrit ce que la page fait **aujourd'hui** : le code fait foi, pas le README.
- Écrire trois specs transverses, pour ne pas répéter dans chaque page ce qui est commun :
  - `navigation` : barre d'onglets, boutons flottants du haut, retour à l'accueil par le titre, installation sur l'écran d'accueil, redirection de l'ancienne adresse `equipes.html` ;
  - `donnees-api` : cache partagé, affichage immédiat puis revalidation, bandeaux d'échec, noms de joueurs seuls et contacts sans numéro affiché ;
  - `calcul-classement` : barème, classement à la moyenne de points par partie jouée, départage, et l'obligation que les trois pages qui classent les équipes donnent le même résultat.
- Déplacer l'exigence « Onglet Mon équipe » de la spec `mon-equipe` vers `navigation` : elle fixe la barre d'onglets de toutes les pages, pas la page Mon équipe.
- Quand une règle a une raison qui la protège d'une « simplification » future, la spec la donne en une phrase.
- Alléger le README une fois les specs en place : une ligne par page avec le lien vers sa spec, les sections pratiques conservées (présentation, adresse du site, installation, mise à jour, configuration, backend et API), un résumé RGPD conservé, et un court paragraphe « Choix assumés » pour les choix sans conséquence sur le comportement.
- Les écarts trouvés entre le code et le README, et les bugs repérés pendant la rédaction (par exemple le titre d'onglet de `classement.html`, « Parties par équipe »), sont **notés, pas corrigés**. Ils sont listés dans `design.md` et reportés dans une issue GitHub.
- Aucun comportement du site ne change. Aucun fichier HTML n'est modifié.

## Capabilities

### New Capabilities
- `classement`: page Classement des poules, découpages par poule et général, équipes sans partie jouée.
- `programme`: page Parties, calendrier complet avec filtres, composition, contacts des responsables et accès au report.
- `creneaux`: page Créneaux libres du Trinquet Paris, grille fixe, occupation, filtres et message de proposition.
- `report`: page d'aide au choix d'une date de report pour une partie au Trinquet Paris.
- `compteur`: compteur de points d'une partie, son graphe et sa mémorisation sur l'appareil, sans appel à l'API.
- `navigation`: éléments communs à toutes les pages, installation sur l'écran d'accueil, redirection de l'ancienne page équipes.
- `donnees-api`: chargement des données de la ligue, cache partagé, comportement en cas d'échec, données personnelles affichées.
- `calcul-classement`: règle de classement des équipes d'une poule, commune à l'accueil, à Mon équipe et au Classement.

### Modified Capabilities
- `mon-equipe`: l'exigence « Onglet Mon équipe » est retirée de cette spec et reprise, sans changement de fond, dans `navigation`.

## Impact

- Fichiers créés : les specs des huit capacités, à l'archivage du change.
- Fichiers modifiés : `openspec/specs/mon-equipe/spec.md` (une exigence en moins), `README.md` (allégé).
- Aucune page HTML, aucun appel API, aucune donnée stockée ne change. Pas de numéro de version à monter dans les pieds de page, puisque aucune page n'est touchée.
- Une issue GitHub regroupe les écarts et bugs relevés, à corriger dans des changes séparés.
- RGPD : la spec `donnees-api` écrit pour la première fois, sous forme d'exigence, ce qui était seulement décrit : noms de joueurs seuls, jamais de licence ni de coordonnées, numéros des responsables jamais affichés. Ce change ne tranche pas la question, déjà ouverte, de la base légale de la ligue pour republier ces noms.
