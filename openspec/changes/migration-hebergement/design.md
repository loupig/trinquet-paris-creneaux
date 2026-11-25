# Design

## Context

Aujourd'hui :
- GitHub Pages sert la racine de `main` sous `https://loupig.github.io/trinquet-paris-creneaux/`. Pas de build : chaque push sur `main` part en production.
- Les pages sont autonomes (CSS et JS inline) et se référencent en chemins relatifs, sauf `404.html` (chemins absolus `/trinquet-paris-creneaux/…`, parce que GitHub Pages la sert depuis n'importe quel dossier) et les `og:image` / `canonical` absolus vers `loupig.github.io`.
- Les données viennent de l'API Apps Script (CORS ouvert, `GET` seulement). Elle ne bouge pas ici.
- Toutes les préférences sont dans `localStorage`, donc **attachées à l'origine** `https://loupig.github.io`. Changer de domaine les fait disparaître si rien n'est fait.
- Il n'existe aucun script partagé à la racine pour l'instant ; la convention `?v=` du CLAUDE.md s'appliquera au premier.
- Les tests Playwright servent les fichiers locaux et réécrivent `/trinquet-paris-creneaux/` pour la 404.

Le changement suivant (`reservation-hors-championnat`) aura besoin, sur la même origine que les pages : de fonctions serveur, d'une base de données en UE, d'un envoi d'e-mails et de cookies de session.

## Goals / Non-Goals

**Goals :**
- Servir le site à l'identique sous un domaine de la ligue, sans build, avec une prévisualisation par branche.
- Choisir dès maintenant un hébergeur qui portera aussi le serveur de la réservation, pour ne migrer qu'une fois.
- Ne perdre ni les liens partagés, ni les applications installées, ni les préférences des joueurs.
- Pouvoir revenir en arrière en quelques minutes.

**Non-Goals :**
- Écrire du code serveur (changement suivant).
- Déplacer le scraper Apps Script ou l'API.
- Toucher au comportement d'une page, au-delà des adresses absolues et du bandeau de réinstallation.
- Introduire un build, un framework ou une dépendance côté pages.

## Decisions

### 1. Hébergeur : Cloudflare (fichiers statiques + Workers + D1 en juridiction UE)

| Critère | Cloudflare | Vercel / Netlify | Scaleway / Clever Cloud (FR) |
|---|---|---|---|
| Sert le dépôt sans build | oui | oui | oui (bucket ou PaaS) |
| Prévisualisation par branche | oui, native | oui, native | à construire |
| Fonctions serveur même origine | Workers | Functions | Serverless / app |
| Base de données | D1 (SQLite), juridiction UE | externe (Supabase…) | PostgreSQL managé, payant |
| Coût au volume d'une ligue | 0 € | 0 € + base externe | ~10–20 €/mois |
| Exploitation | nulle | nulle | faible à moyenne |

**Choix : Cloudflare.** Il couvre les deux changements avec un seul compte, gratuitement au volume de la ligue (quelques centaines de visiteurs, quelques réservations par semaine), avec une base stockée en UE. Le code serveur s'écrit avec les API standard du Web (`fetch`, `crypto`), sans dépendance à l'exécution.

*Alternative si la ligue exige un hébergeur français* : Scaleway (bucket statique + Serverless Functions + PostgreSQL). Plus cher et sans prévisualisation native ; le découpage des deux changements reste le même.

*Écarté* : rester sur GitHub Pages avec un backend ailleurs (Supabase, Apps Script en `POST`). C'était l'option la plus lean, écartée par le demandeur au profit d'une adresse unique ; elle reste le plan de repli si la migration dépasse son budget (proposal, hypothèse 3).

### 2. Ce qui est servi

- L'hébergeur sert la racine du dépôt, sans commande de build.
- Un fichier d'exclusion retire de la publication ce qui n'est pas du site : `tests/`, `openspec/`, `.github/`, `.claude/`, `redirection/`, `node_modules/`, `*.md`, `package*.json`, `playwright.config.mjs`. Le dépôt est public, ce n'est donc pas un secret ; c'est pour ne pas servir de pages parasites.
- Un fichier d'en-têtes :
  - `Cache-Control: no-cache` sur le HTML (revalidé à chaque visite, pour qu'un push se voie aussitôt) ;
  - cache long sur `fonts/` et `icons/` ;
  - `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictive ;
  - `X-Robots-Tag: noindex` sur les adresses de prévisualisation.

  Une politique CSP complète est reportée au changement suivant, quand des cookies de session existeront.
- `404.html` : chemins absolus `/…` à la racine du domaine. Le site n'est plus servi sous un sous-dossier, et c'est la seule page qui en dépendait.
- `og:image`, `canonical` et `og:url` de Découvrir : `https://<domaine>/…`.

### 3. Domaine

Retenu par la ligue (proposal, décision 1). Le DNS est géré chez l'hébergeur, qui fournit le certificat. Tant qu'il n'est pas choisi, tout se prépare et se teste sur l'adresse fournie par l'hébergeur : le domaine ne bloque que la bascule (étape 4).

### 4. Ancienne adresse : une page de redirection par page

GitHub Pages ne fait pas de redirection côté serveur. Sa source passe de « branche `main` » à « GitHub Actions ». Un workflow `redirection.yml` publie le dossier `redirection/`, qui contient une page par page du site (`index.html`, `equipe.html`, … `equipes.html`) et une `404.html`.

Chaque page de redirection :
- garde ses balises `og:*`, pour que l'aperçu des anciens liens dans WhatsApp reste correct (les robots d'aperçu n'exécutent pas de JavaScript) ;
- exécute un script inline unique, identique dans toutes, qui construit `https://<domaine>/<même page><même requête>` puis appelle `location.replace` (pas d'entrée d'historique) ;
- porte un `<meta http-equiv="refresh">` vers la même page, sans requête, si JavaScript est coupé.

*Écarté* : une seule `404.html` qui attrape tout. Plus simple, mais les anciens liens perdraient leur aperçu dans les messageries, et les robots verraient des 404.

Un test vérifie qu'il existe une page de redirection pour chaque page HTML de la racine.

### 5. Transfert des préférences par l'ancre

Au premier passage, le script de redirection :
1. lit dans le `localStorage` de l'ancienne origine les clés de la liste blanche (ci-dessous) ;
2. les sérialise en JSON, puis en base64url, dans l'ancre : `#lidfpb-reprise=<données>&ancre=<ancre d'origine>` ;
3. note `lidfpb_reprise_faite_v1 = 1` sur l'ancienne origine. Les passages suivants ne transmettent plus rien et portent seulement `#lidfpb-ancienne`, pour le bandeau de réinstallation.

Liste blanche, des clés du README :
- `lidfpb_mes_equipes_v1`, `lidfpb_theme_v1` ;
- les `*_filters_v1`, `lidfpb_filters_open_v1` ;
- `lidfpb_compteur_v1`, `lidfpb_decouvert_v1`, `lidfpb_avis_vu_v1` ;
- `lidfpb_message_perso_v1`, `lidfpb_orga_v1`.

Le cache `lidfpb_api_v1:*` n'en fait pas partie : il pèse lourd et se recharge.

Sur le nouveau domaine, un script partagé **`reprise.js?v=1`** est chargé en premier dans le `<head>` de chaque page, en synchrone, avant les scripts de la page qui lisent `localStorage` à leur démarrage. Il :
1. ne fait rien si l'ancre ne commence pas par `#lidfpb-` (coût nul pour une visite normale) ;
2. décode, et pour chaque entrée vérifie que la clé est dans la même liste blanche, que la valeur est une chaîne de moins de 200 ko et, pour les clés JSON, qu'elle se parse ;
3. écrit seulement les clés absentes du nouveau domaine ;
4. remet l'ancre d'origine avec `history.replaceState`, avant tout autre script ;
5. note qu'il faut proposer la réinstallation (`sessionStorage`), sauf en mode installé (`display-mode: standalone`).

L'ancre n'est jamais envoyée au serveur ni journalisée : c'est pourquoi elle est préférée à la requête. Le script tient dans un fichier pour éviter de le recopier dans huit pages. C'est le premier script partagé du site, et la convention `?v=` s'applique.

*Écarté* : un `postMessage` entre les deux origines via une iframe. Plus élégant, mais Safari partitionne le stockage des iframes tierces, et le transfert échouerait justement sur iPhone.

### 6. Bandeau de réinstallation

Affiché par `reprise.js` en tête de `<main>` quand l'indicateur de session est posé. Il utilise les variables de couleur de la page (`--card`, `--text`, `--accent`…), sans couleur nouvelle. Il donne, selon le téléphone, « Partager → Sur l'écran d'accueil » (iPhone) ou « Installer l'application » (Android), et propose de supprimer l'ancienne icône. Un bouton Fermer pose `lidfpb_reinstaller_vu_v1`. Ce n'est pas une fenêtre surgissante : c'est un bloc dans la page, qui pousse le contenu.

### 7. Bascule en quatre étapes, réversibles

1. **Hébergeur branché sur `main`**, sur son adresse technique. Ni l'ancienne adresse ni le domaine ne bougent. Les organisateurs l'utilisent une à deux semaines.
2. **Domaine branché** : le site est servi sous `<domaine>`, l'ancienne adresse sert toujours les pages.
3. **Essai du transfert** sur trois téléphones réels, sur une copie de `redirection/` publiée à une adresse de test.
4. **Bascule de GitHub Pages** sur `redirection/`.

Retour arrière : remettre la source de GitHub Pages sur `main`, en deux minutes. Les préférences reprises sur le nouveau domaine ne gênent pas, l'ancienne origine ayant gardé les siennes.

Calendrier : **après la finale du 6 décembre 2026**, hors période de phases finales, pour qu'un incident ne tombe pas un jour de match.

### 8. Tests

- Les tests existants passent toujours sur les fichiers locaux. La réécriture `/trinquet-paris-creneaux/` de la 404 disparaît, la 404 visant désormais la racine.
- Nouveaux scénarios, sur deux origines simulées par `page.route` (ancienne et nouvelle) :
  - redirection d'une page avec requête et ancre ;
  - reprise des équipes suivies ;
  - pas d'écrasement d'une clé existante ;
  - clé inconnue et valeur mal formée ignorées ;
  - ancre effacée ;
  - second passage sans données ;
  - bandeau une fois, puis plus ;
  - pas de bandeau en mode installé.
- Un test de cohérence : `redirection/` couvre toutes les pages, et la liste blanche est identique entre le script de redirection et `reprise.js`.

## Risks / Trade-offs

- **[Un joueur installé ne réinstalle jamais]** → l'ancienne application continue de marcher par la redirection, avec un saut d'une demi-seconde. On garde la redirection au moins jusqu'à la fin de la saison 2027-2028.
- **[Dépendance à un fournisseur américain]** → les données de la réservation seront stockées en juridiction UE, avec l'accord de traitement de l'hébergeur ; et le site reste un dossier de fichiers, qui se déplace ailleurs en une journée. La seule part liée au fournisseur sera la couche serveur du changement suivant, à garder mince.
- **[Compte d'hébergement personnel]** → décision 2 du proposal : un compte de la ligue, deux administrateurs.
- **[Ancre trop longue]** → une partie de compteur très longue peut peser quelques dizaines de ko. Les navigateurs mobiles acceptent des adresses de plusieurs centaines de ko ; au-delà de 200 ko, la clé est ignorée plutôt que de casser la redirection.
- **[Production déployée même si les tests échouent]** → c'est déjà le cas aujourd'hui avec GitHub Pages. La règle de `main` (PR + check `tests`) reste le garde-fou ; la prévisualisation l'améliore.

## Migration Plan

Voir la décision 7. Les réglages hors dépôt (compte, domaine, DNS, source de GitHub Pages) sont faits par un administrateur de la ligue, avec Claude pour la procédure ; ils sont notés dans le README.

## Open Questions

- Domaine et titulaire du compte (proposal, décisions 1 et 2).
- Faut-il garder `loupig.github.io` comme adresse de secours au-delà de 2028 ? À trancher à la fin de la saison 2027-2028. Ni GitHub ni le site ne mesurent le trafic de la redirection : on se fiera aux retours des clubs.
