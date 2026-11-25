# Tasks

Vérification par `npm test` (syntaxe, puis pages dans Chromium sur données fictives), par des captures sur Pixel 7 en clair et en sombre pour le bandeau, et par l'essai sur trois téléphones réels avant la bascule (design, décision 7).

## 0. Décisions de la ligue (bloquant pour la bascule, pas pour le code)

- [ ] 0.1 Domaine retenu et payé.
- [ ] 0.2 Compte d'hébergement créé au nom de la ligue, deux administrateurs.
- [ ] 0.3 Hébergeur confirmé (Cloudflare, ou l'alternative française).

## 1. Scénarios d'abord

- [ ] 1.1 Dans `tests/pages.spec.mjs`, une aide qui simule deux origines (ancienne et nouvelle) par `page.route`, sur les fichiers locaux.
- [ ] 1.2 Redirection : page, requête et ancre gardées, `location.replace` (Retour ne ramène pas à l'ancienne adresse), `meta refresh` présent.
- [ ] 1.3 Reprise :
  - équipes suivies et thème repris ;
  - clé déjà présente non écrasée ;
  - clé inconnue, valeur de plus de 200 ko ou JSON invalide ignorées ;
  - ancre effacée, ancre d'origine rendue ;
  - second passage sans données ;
  - cache `lidfpb_api_v1:*` non transmis.
- [ ] 1.4 Bandeau de réinstallation : affiché une fois après redirection, fermé pour de bon, absent en mode installé et pour une visite directe.
- [ ] 1.5 Cohérence : une page de `redirection/` par page HTML de la racine ; liste blanche identique dans le script de redirection et dans `reprise.js` ; aucune page ne pointe encore vers `loupig.github.io` (hors `redirection/`).
- [ ] 1.6 404 : liens vers `/index.html` et `/decouvrir.html` ; retirer la réécriture `/trinquet-paris-creneaux/` des tests.

## 2. Pages

- [ ] 2.1 `reprise.js` à la racine (décision 5), chargé en `?v=1` en premier dans le `<head>` des huit pages.
- [ ] 2.2 Bandeau de réinstallation (décision 6), aux couleurs de la page, sans variable nouvelle.
- [ ] 2.3 `404.html` en chemins racine.
- [ ] 2.4 `og:image`, `canonical` et `og:url` de Découvrir sur `https://<domaine>/` (adresse technique de l'hébergeur tant que le domaine n'est pas choisi).
- [ ] 2.5 `Version AAAA.MM.JJ` de chaque page modifiée.

## 3. Ancienne adresse

- [ ] 3.1 Dossier `redirection/` : une page par page du site, plus une `404.html`, avec les balises `og:*` et le script de redirection et de transfert.
- [ ] 3.2 Workflow `.github/workflows/redirection.yml` qui publie `redirection/` sur GitHub Pages, sur déclenchement manuel seulement, pour que la bascule reste un geste humain.

## 4. Hébergeur

- [ ] 4.1 Fichier d'exclusion de publication et fichier d'en-têtes (design, décision 2).
- [ ] 4.2 Liaison de l'hébergeur au dépôt : production sur `main`, prévisualisation par branche, sans commande de build (réglage hors dépôt, procédure dans le README).
- [ ] 4.3 Vérifier sur l'adresse technique : les huit pages, la 404, le manifeste, l'installation sur Android et sur iPhone, l'absence de service worker, les en-têtes.

## 5. Docs

- [ ] 5.1 README :
  - adresse du site ;
  - « Mettre à jour le site » : nouvel hébergeur et prévisualisation ;
  - installation et réinstallation ;
  - réglages hors dépôt ;
  - tableau `localStorage` : `lidfpb_reprise_faite_v1` (ancienne origine) et `lidfpb_reinstaller_vu_v1` ;
  - premier script partagé.
- [ ] 5.2 CLAUDE.md : la production est le nouvel hébergeur ; la prévisualisation de la PR fait partie des preuves à montrer.

## 6. Revue et bascule

- [ ] 6.1 `/code-review` et `/security-review` sur le diff (transfert de `localStorage`, CI).
- [ ] 6.2 Étapes 1 à 3 de la bascule (design, décision 7), essai sur trois téléphones réels, noté dans la PR.
- [ ] 6.3 Étape 4 (bascule de GitHub Pages), après le 6 décembre 2026, par un administrateur ; retour arrière vérifié une fois.
