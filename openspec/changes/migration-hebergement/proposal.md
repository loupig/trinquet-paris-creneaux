# Proposal

> **Statut : documenté, mise en œuvre non planifiée.** On reprendra ce changement quand la ligue sera prête ; rien n'est construit d'ici là.

## Why

La suite prévue est de permettre aux licenciés de la ligue de réserver un créneau de ligue du Trinquet Paris hors championnat (changement `reservation-hors-championnat`). Réserver demande ce que GitHub Pages ne sait pas faire : un serveur qui enregistre les réservations, envoie un lien de connexion par e-mail et garde une session. Le choix retenu par le demandeur est une **migration complète** vers un hébergeur qui sert les pages et ce serveur sous une même adresse.

Ce changement-ci est la **première marche, sans rien de visible pour les joueurs** : déplacer le site tel quel, sous un domaine à la ligue, sans perdre les joueurs qui l'ont installé ni leurs équipes suivies. Il ne livre pas de valeur directe aux joueurs ; il en livre deux à l'équipe :

- **une adresse de prévisualisation par PR**, à ouvrir sur un téléphone avant de fusionner, là où aujourd'hui on ne voit le résultat qu'une fois en production ;
- **la même origine pour les pages et le futur serveur**, condition d'une session par cookie sans jeton dans `localStorage`.

Pour rester lean, la migration se fait **à périmètre constant** : aucune page ne change de comportement, l'API Apps Script reste la source des données.

## What Changes

- **Nouvel hébergement** : les pages, la police, les icônes et le manifeste sont servis tels quels, sans build, depuis `main`, sous un domaine choisi par la ligue (noté `<domaine>` ici). Chaque branche poussée obtient son adresse de prévisualisation.
- **Chemins** : la page 404 passe des chemins absolus `/trinquet-paris-creneaux/…` à la racine `/…` ; les adresses absolues `og:image` et `canonical` passent sur `<domaine>`.
- **Ancienne adresse** (`loupig.github.io/trinquet-paris-creneaux/`) : chaque page devient une redirection vers la même page, même requête et même ancre, sur `<domaine>`. Gardée au moins jusqu'à la fin de la saison 2027-2028.
- **Préférences emportées** : le `localStorage` dépend de l'adresse du site. Sans précaution, un joueur perdrait au passage ses équipes suivies, son thème, ses filtres, la partie en cours du compteur et, pour l'organisateur, son texte « Perso » et son mode. La redirection les transmet une fois au nouveau domaine, qui les reprend s'il ne les a pas déjà. Le cache des données de la ligue n'est pas transmis : il se recharge.
- **Application installée** : un téléphone qui a installé l'ancienne adresse ouvre la redirection, puis le nouveau site dans le navigateur ; la page invite une fois à réinstaller depuis la nouvelle adresse (bandeau dans la page, pas de fenêtre surgissante).
- **Ce qui ne change pas** : le comportement des huit pages, l'API, les clés `localStorage`, l'absence de service worker et de compte, les tests sur données fictives.

## Capabilities

### New Capabilities
- `hebergement` : l'adresse du site, la prévisualisation par branche, la redirection de l'ancienne adresse et le transfert des préférences.

### Modified Capabilities
- `navigation` : ajout de « Réinstallation depuis la nouvelle adresse », le bandeau qui invite à réinstaller l'application.

## Impact

- **Pages** : `404.html` (chemins), les huit pages (`og:image`, `canonical` de Découvrir, chargement du script de reprise des préférences, `Version AAAA.MM.JJ`).
- **Nouveaux fichiers** : un script partagé `reprise.js` (lecture unique de l'ancre de transfert), le dossier `redirection/` (pages publiées à l'ancienne adresse), la configuration de l'hébergeur (en-têtes de sécurité, 404).
- **CI** : `tests.yml` inchangé ; un workflow publie `redirection/` sur GitHub Pages ; le déploiement sur le nouvel hébergeur passe par son intégration GitHub, sans secret dans le dépôt.
- **Réglages hors dépôt** : compte de l'hébergeur (au nom de la ligue, pas d'une personne), domaine et DNS, source de GitHub Pages.
- **Docs** : README (adresse, « Mettre à jour le site », installation PWA, tableau `localStorage` pour la reprise), CLAUDE.md (production = nouvel hébergeur).
- **Revue** : `/code-review`, et `/security-review` (transfert de `localStorage` entre origines, CI).
- **Hors champ** : toute réservation, tout compte, tout code serveur. Le scraper Apps Script ne bouge pas.

## Décisions à prendre par la ligue avant de commencer

1. **Le domaine** et qui le paie (~12 €/an) : sous-domaine du site de la ligue, ou nouveau domaine.
2. **Le titulaire du compte d'hébergement** : la ligue, avec au moins deux administrateurs, pour ne pas dépendre d'une personne.
3. **L'hébergeur**, sur la recommandation de `design.md` (Cloudflare, données en UE), ou une alternative française si la ligue la préfère.

## Hypothèses à valider

1. **Aucun joueur ne perd ses équipes suivies** : vérifié sur trois téléphones réels (Android installé, iPhone installé, navigateur seul) avant d'activer la redirection.
2. **La prévisualisation par PR sert vraiment** : sur les trois premières PR après migration, la décision humaine a été prise après ouverture de la prévisualisation sur téléphone. Sinon, elle n'était pas un argument.
3. **La migration coûte moins d'une semaine** de travail ; au-delà, on la met en pause et on rediscute du besoin de réservation.
