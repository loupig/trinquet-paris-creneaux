# Trinquet Paris & championnats — LIDFPB

Site statique qui suit les championnats d'Île-de-France de Trinquet Pala
Gomme Pleine : calendrier, classement des poules, page de chaque équipe,
créneaux libres au Trinquet Paris (75016), aide au report d'une partie et
compteur de points.

**Site en ligne :** https://loupig.github.io/trinquet-paris-creneaux/

## Pages

Sept pages statiques indépendantes, plus une redirection, sans build ni
dépendance, chacune avec son CSS et son JS inline. La navigation est celle
d'une application mobile plutôt que celle d'un site : une barre d'onglets en
bas, des boutons flottants en haut, là où se posent les pouces (spec
[`navigation`](openspec/specs/navigation/spec.md)).

Le comportement de chaque page est décrit par sa spec, dans
[`openspec/specs/`](openspec/specs/). Le README ne le répète pas.

- [`index.html`](index.html) — l'accueil : mes équipes suivies, les parties
  d'ici dimanche et l'avancement de la saison. Specs
  [`accueil`](openspec/specs/accueil/spec.md),
  [`mes-equipes`](openspec/specs/mes-equipes/spec.md) et
  [`affiche-week-end`](openspec/specs/affiche-week-end/spec.md).
- [`equipe.html`](equipe.html) — « Mon équipe », tout ce qui concerne une
  équipe, partageable par un lien. Spec
  [`mon-equipe`](openspec/specs/mon-equipe/spec.md).
- [`programme.html`](programme.html) — « Parties », le calendrier complet,
  avec compositions et contacts des responsables. Spec
  [`programme`](openspec/specs/programme/spec.md).
- [`classement.html`](classement.html) — le classement des poules. Specs
  [`classement`](openspec/specs/classement/spec.md) et
  [`calcul-classement`](openspec/specs/calcul-classement/spec.md), la règle
  de classement commune à l'accueil, à Mon équipe et au Classement.
- [`creneaux.html`](creneaux.html) — les créneaux libres au Trinquet Paris.
  Spec [`creneaux`](openspec/specs/creneaux/spec.md).
- [`report.html`](report.html) — l'aide au choix d'une date de report, ouverte
  depuis une partie. Spec [`report`](openspec/specs/report/spec.md).
- [`compteur.html`](compteur.html) — le compteur de points, seule page qui
  n'appelle pas l'API. Spec [`compteur`](openspec/specs/compteur/spec.md).
- [`equipes.html`](equipes.html) — simple redirection vers `equipe.html`,
  gardée pour les anciens favoris.

Chargement des données, cache partagé, bandeaux d'échec et données
personnelles affichées : spec [`donnees-api`](openspec/specs/donnees-api/spec.md).

## Installation sur l'écran d'accueil

Le site s'installe comme une application (PWA) : une icône sur l'écran
d'accueil, et une ouverture en plein écran, sans barre de navigateur. Sur
Android, Chrome propose « Installer l'application » ; sur iPhone, il n'y a
pas de bouton, il faut passer par Partager → Sur l'écran d'accueil.

- [`manifest.webmanifest`](manifest.webmanifest) donne le nom (« LIDFPB »
  sous l'icône), la page de départ (`./index.html`) et la portée (`./`) en
  chemins relatifs, le site étant servi sous `/trinquet-paris-creneaux/`.
- [`icons/`](icons/) : une ikurriña carrée, déclinée du favicon, en 192 et
  512 px (la 512 sert aussi de version « maskable », le motif supportant
  d'être recadré en rond par Android) et en 180 px pour l'iPhone
  (`apple-touch-icon`), qui ignore les icônes du manifeste.
- Chaque page porte le lien vers le manifeste, la couleur de thème, l'icône
  iPhone et `viewport-fit=cover` : sans ce dernier, `env(safe-area-inset-*)`
  vaut 0 et la barre d'onglets passerait sous la barre de geste de l'iPhone
  en mode installé. `equipes.html`, simple redirection, n'en a pas besoin.

En mode installé, il n'y a plus de bouton Retour du navigateur : la barre
d'onglets en tient lieu.

## Mettre à jour le site

```
git add <fichiers modifiés>
git commit -m "description du changement"
git push
```

GitHub Pages redéploie automatiquement (~30s à 2min) à chaque push sur
`main`. Penser à mettre à jour le numéro de version dans le pied de page
(`Version AAAA.MM.JJ`) de chaque page modifiée : pas de build ici pour le
faire automatiquement.

## Configuration

Chaque page porte ses propres réglages en tête de son `<script>`. Les
principaux :

| Constante | Pages | Rôle |
|---|---|---|
| `API_BASE` | toutes sauf le compteur | URL de l'API Apps Script |
| `CACHE_TTL_MS` | toutes sauf le compteur | Au-delà de cette ancienneté, une entrée de cache est revalidée |
| `API_CACHE_PREFIX` | toutes sauf le compteur | Préfixe des clés `localStorage` du cache d'appels API |
| `SERIE_LABELS` | toutes sauf le compteur | Correspondance Catégorie → Série affichée |
| `PHASE_LABELS` | accueil, Mon équipe, Parties, Créneaux, Report | Libellés des phases (Poules, Barrage, 1/32e… Finale), mapping communiqué par la ligue |
| `PTS_VICTOIRE`, `PHASE_POULES`, `QUALIFIES_PAR_POULE` | accueil, Mon équipe, Classement | Barème, phase classée et nombre de qualifiés : à garder identiques dans les trois pages |
| `GRID` | Créneaux, Report | Grille de créneaux du trinquet, par jour de semaine |
| `WEEKS_AHEAD` | Créneaux | Horizon d'affichage |
| `LIEU_VARIANTS` | Créneaux | Libellés `lieu_renc` interrogés côté API pour ce trinquet. L'API ne filtre que par égalité exacte : un nouveau libellé est à ajouter ici |
| `matchesTrinquetParis()` | Mon équipe, Parties, Créneaux, Report | Reconnaît le Trinquet Paris dans un libellé de lieu |
| `MAX_DATES_MESSAGE` | Report | Nombre de dates dans le message de report |
| `PALETTE` | Compteur | Couleurs d'équipe autorisées |

Clés `localStorage` :

| Clé | Page | Contenu |
|---|---|---|
| `lidfpb_api_v1:<url>` | toutes sauf le compteur | Cache d'appels API |
| `lidfpb_mes_equipes_v1` | accueil (lue aussi par Mon équipe) | Équipes suivies |
| `lidfpb_equipe_vue_v1` | Mon équipe | Dernière équipe consultée |
| `lidfpb_programme_filters_v1`, `lidfpb_parties_filters_v1` | Parties | Filtres (la seconde, héritée de l'ancienne vue par équipe) |
| `lidfpb_classement_filters_v1` | Classement | Filtres |
| `lidfpb_trinquet_paris_filters_v1` | Créneaux | Filtres |
| `lidfpb_filters_open_v1` | Parties, Classement, Créneaux | Pli du bloc Filtres, commun aux trois pages |
| `lidfpb_compteur_v1` | Compteur | Partie en cours |

## Temps de chargement

L'API Apps Script met environ **2 secondes** à répondre avant même de
transmettre les données : c'est le temps d'exécution du script côté Google
(démarrage à froid, lecture des fichiers sur Drive), et rien côté navigateur
ne peut le réduire. Seul un cache côté Apps Script (`CacheService`)
attaquerait ce plancher. Le navigateur compense par le cache partagé décrit
dans la spec `donnees-api`.

## RGPD et données joueurs

La table `licencies` de l'API contient, à la source, des données sensibles
(date de naissance, adresse postale, y compris pour des mineurs). Le
scraper Apps Script (voir plus bas) filtre ça **avant** l'écriture sur
Drive : seuls `Numéro club`, `Licence`, `nom`, `prenom` sont conservés, et
uniquement pour les clubs du comité — jamais l'adresse ou la date de
naissance, à aucun moment exposées par l'API.

- **Noms de joueurs** : sur Parties et Créneaux (au détail d'une partie) et
  sur Mon équipe. Noms seuls, sans numéro de licence ni coordonnées.
- **Contacts des responsables d'équipe** (Appeler, SMS, WhatsApp), dont les
  numéros sont déjà publiés en clair sur le site de la ligue : sur Parties,
  Mon équipe et Report. Le numéro n'est jamais écrit dans les pages. Le nom
  du responsable n'apparaît pas sur Mon équipe, figure en info-bulle sur
  Parties et en clair sur Report, et le message WhatsApp prérempli de Parties
  contient le nom et le numéro du responsable adverse.
- **Rien n'est envoyé** : ce que le site retient (équipes suivies, filtres,
  partie du compteur, cache des données) reste dans le navigateur.

Restent ouvertes : la base légale permettant de republier les noms de
joueurs, l'alignement des pages sur Mon équipe pour le nom du responsable, et
la durée de conservation du cache des données sur l'appareil.

## Backend (Apps Script)

Le scraper + l'API REST tournent sur un script Google Apps Script séparé,
**volontairement non versionné** dans ce dépôt public (le fichier contient
par endroits des identifiants de connexion au site de la ligue). Il vit en
local sur la machine de développement, dans `apps-script/Code.gs` (ignoré
par `.gitignore`). À versionner séparément, dans un dépôt privé, le jour où
c'est fait proprement.

L'API REST qu'il expose est documentée dans [`API.md`](API.md), pour qui
voudrait construire autre chose avec les mêmes données.

## Choix assumés

- **Pas de fenêtre surgissante** : un popup d'accueil et un popup d'aide ont
  été retirés, leur bouton de fermeture restant bloqué chez au moins un
  utilisateur, cause jamais identifiée.
- **Pas de service worker** : jamais de fonctionnement hors connexion, pour ne
  pas laisser un joueur bloqué sur une ancienne version mise en cache.
- **Palette imposée du compteur** (rouge, vert, blanc, noir) : deux équipes ne
  peuvent pas choisir deux teintes voisines et rendre le graphe illisible.
- **Pas de compte** : aucune connexion, rien n'est enregistré au nom d'un
  visiteur ; les préférences ne suivent pas d'un appareil à l'autre.
