# Créneaux libres — Trinquet Paris (75016)

Page statique qui affiche, pour chaque date à venir, les créneaux encore
libres au Trinquet Paris (75016) — lieu unique partagé par la 1ère et la
2ème série du championnat d'Île-de-France de Trinquet Pala Gomme Pleine.

Sert à replanifier rapidement une partie reportée sans recalculer les
créneaux libres à la main.

**Site en ligne :** https://loupig.github.io/trinquet-paris-creneaux/

## Pages

Quatre pages statiques indépendantes, sans build ni dépendance, chacune avec
son CSS et son JS inline. Un menu à trois entrées (« Créneaux libres » /
« Programme » / « Compteur »), en haut de chaque page, signale les destinations
principales et met en évidence celle où l'on se trouve :

- [`index.html`](index.html) — créneaux libres au Trinquet Paris, en tableau
  par week-end. C'est la page décrite en détail ci-dessous.
- [`programme.html`](programme.html) — calendrier complet des championnats,
  tous lieux et toutes séries, passées et à venir, avec compositions et
  contacts des responsables d'équipe.
- [`report.html`](report.html) — aide au choix d'une date de report. S'ouvre
  depuis le bouton « Chercher une date de report » d'une partie non jouée du
  programme (`report.html?oid=<oid de la rencontre>`), rappelle le créneau
  d'origine et affiche, jusqu'à la fin de la phase en cours, **uniquement les
  créneaux encore disponibles** de la grille du Trinquet Paris, en signalant
  les jours où l'une des deux équipes joue déjà, tous lieux confondus. Les
  créneaux pris sont barrés sans être détaillés : pour savoir qui les occupe,
  c'est `index.html`. Comme le reste du site, la page n'enregistre rien et ne
  prévient personne.
- [`compteur.html`](compteur.html) — compteur de points pour marquer une
  partie sur place : deux équipes, un grand bouton par équipe, annulation du
  dernier point, et un graphe du déroulé. **Seule page qui n'appelle pas
  l'API** : elle ne lit aucune donnée de la ligue, tout vit dans le
  `localStorage` du visiteur.

  Les couleurs d'équipe sont limitées aux couleurs de l'ikurriña (rouge, vert,
  blanc) plus le noir : palette imposée pour que deux équipes ne choisissent
  pas deux teintes voisines et ne rendent le graphe illisible. Chaque entrée
  porte une couleur de remplissage (pastille, teinte de carte à 8 %) et une
  couleur de trait (bordure, texte, courbe). Les deux diffèrent pour le blanc,
  invisible sur fond blanc, et pour le vert de l'ikurriña, trop clair pour du
  texte de 12 px : ils passent respectivement en gris et en vert foncé partout
  où la lisibilité compte.

  Le graphe a deux lectures du même déroulé. En mode « Scores », une courbe par
  équipe ; les deux scores s'additionnant toujours au nombre de points joués,
  les courbes sont symétriques et la bande grise qui les sépare vaut le double
  de l'écart — bande fine, ça s'est resserré, bande large, ça s'est décroché. En
  mode « Écart », la différence seule autour de zéro, la courbe prenant la
  couleur de l'équipe qui mène : chaque passage par zéro est un changement de
  leader. Une ligne de résumé donne le plus gros écart, à quel point du match il
  est survenu, et le nombre de changements de leader.

  En mode « Scores », une étoile marque chaque retour à égalité. Sur une partie
  très disputée elles se suivraient de trop près et redessineraient la
  diagonale en masquant les courbes : au-delà d'une douzaine, seule une étoile
  sur N est tracée — chacune reste une vraie égalité — et le résumé donne le
  compte exact en signalant que toutes ne sont pas marquées.

  Chaque point est horodaté, ce qui donne un troisième mode, « Échanges » :
  une barre par point, à la couleur de l'équipe qui l'a emporté, hauteur égale
  à la durée de l'échange. Une partie comporte des pauses entre les jeux, donc
  l'échelle est plafonnée un peu au-dessus du 90e centile — sans quoi une seule
  pause de trois minutes écraserait tous les vrais échanges au ras de l'axe — et
  le résumé donne la médiane plutôt que la moyenne, pour la même raison. Les
  rares barres au-delà du plafond touchent le haut et sont comptées à part. Une
  ligne sous le score rappelle le nombre de points, la durée de la partie et le
  temps écoulé depuis le dernier point, rafraîchie chaque seconde.

  Tout l'état tient dans la liste ordonnée des points marqués — l'équipe qui
  l'emporte et l'instant où il est tombé : les scores, les durées, le graphe et
  l'annulation en découlent, il n'y a jamais deux sources de vérité à
  resynchroniser. Les parties enregistrées avant l'horodatage se relisent sans
  durées plutôt que d'être perdues.

## Fonctionnement

Tout est dans un seul fichier autonome, [`index.html`](index.html) (HTML +
CSS + JS inline, aucune dépendance, aucun build).

Au chargement, la page :

1. Interroge l'API publique de la LIDFPB (Google Apps Script) pour récupérer
   toutes les rencontres au Trinquet Paris, toutes séries confondues — un
   créneau pris par la 1ère série n'est pas disponible pour la 2ème.
2. Applique la grille fixe du trinquet (en dur dans le code) :
   - Vendredi : 21h, 22h
   - Dimanche : 14h, 15h, 16h, 17h, 20h, 21h, 22h
3. Pour chaque date à venir, calcule créneaux libres = grille − créneaux
   occupés.
4. Affiche les créneaux sous forme de tableau par week-end (une colonne
   Vendredi, une colonne Dimanche, une ligne par heure) plutôt qu'en liste :
   les heures communes aux deux jours sont ainsi alignées visuellement.
5. Sur un créneau pris, la case affiche d'emblée la série et le niveau de
   la partie (Poule ou Qualification), pour inciter à venir la voir ; un
   clic déplie en plus la composition des deux équipes (jointure rencontres
   → engagements → licencies, noms uniquement — voir
   [RGPD et données joueurs](#rgpd-et-données-joueurs)).
6. Sur un créneau libre, un clic déplie un message de proposition
   pré-rempli, avec un bouton "Envoyer via WhatsApp" (sans numéro imposé,
   l'utilisateur choisit le destinataire) et un bouton "Copier le texte"
   pour l'envoyer autrement (SMS...). Une précision rappelle que c'est à
   l'utilisateur d'envoyer ce message à l'adversaire — la page elle-même
   ne réserve rien (retour d'expérience : plusieurs joueurs avaient cru
   qu'un message partait automatiquement vers l'auteur du site).

Le bandeau d'en-tête (fixe même au scroll) regroupe les messages
condensés : rappel que ces créneaux sont réservés au championnat (pas
à un usage libre) et que la page n'a aucun effet sur le site de la
ligue (simple lecture), source des données (site de la ligue) et date
de dernière synchronisation, et le bouton "Rafraîchir" (à droite du
titre) pour forcer un appel API immédiat — voir
[Cache et temps de chargement](#cache-et-temps-de-chargement). En haut de page : rappel de la grille fixe et
rappel que la page ne sert qu'à repérer l'occupation de ces créneaux
(pas à réserver — seul le site de la ligue fait foi). Des filtres
(jour, créneau horaire, "libre uniquement", coché par défaut)
permettent de restreindre la liste principale ; ils sont mémorisés
dans le navigateur d'une visite à l'autre. Deux boutons
flottants en bas de page : un raccourci vers le site de la ligue, et un
retour en haut de page.

Source officielle des données : https://lidfpb.euskalpilota.fr/rencontres.php

Si l'API échoue ou renvoie un résultat vide/inattendu, la page affiche un
message d'erreur explicite plutôt qu'une grille vide — une grille vide
serait interprétée à tort comme "tout est libre".

**Choix délibéré : pas de popup.** Un popup d'accueil et un popup d'info
optionnel (bouton "?") ont été essayés puis retirés — leur bouton de
fermeture restait bloqué chez au moins un utilisateur, cause jamais
identifiée malgré plusieurs mécanismes de secours (clic en dehors, touche
Échap). Tout le contenu explicatif reste affiché en permanence dans les
cartes du haut de page plutôt que dans un élément qui peut potentiellement
se bloquer.

## Mettre à jour le site

```
git add index.html
git commit -m "description du changement"
git push
```

GitHub Pages redéploie automatiquement (~30s à 2min) à chaque push sur
`main`. Penser à mettre à jour le numéro de version dans le pied de page
(`Version AAAA.MM.JJ`) à chaque changement — pas de build ici pour le
faire automatiquement.

## Configuration

Les principaux réglages sont regroupés en haut de la balise `<script>` dans
`index.html` :

| Constante | Rôle |
|---|---|
| `API_BASE` | URL de l'API Apps Script |
| `CACHE_TTL_MS` | Au-delà de cette ancienneté, une entrée de cache est revalidée |
| `API_CACHE_PREFIX` | Préfixe des clés localStorage du cache d'appels API |
| `FILTER_CACHE_KEY` | Clé localStorage pour les filtres mémorisés |
| `WEEKS_AHEAD` | Horizon d'affichage |
| `GRID` | Grille de créneaux du trinquet, par jour de semaine |
| `SERIE_LABELS` | Correspondance Catégorie → Série affichée |
| `LIEU_VARIANTS` | Libellés `lieu_renc` interrogés côté API pour ce trinquet |
| `matchesTrinquetParis()` | Filtre de sécurité (double vérification côté client) |

## Cache et temps de chargement

L'API Apps Script met environ **2 secondes** à répondre avant même de
transmettre les données : c'est le temps d'exécution du script côté Google
(démarrage à froid, lecture des fichiers sur Drive), et rien côté navigateur
ne peut le réduire. Seul un cache côté Apps Script (`CacheService`) attaquerait
ce plancher.

Le navigateur compense avec deux mécanismes :

- **Un cache indexé par URL de requête**, partagé par les trois pages
  (`lidfpb_api_v1:<url>`). Les tables communes ne sont récupérées qu'une fois :
  passer du programme au report ou aux créneaux libres ne refait pas les appels
  déjà faits. Les appels d'`index.html` filtrés par libellé de lieu gardent
  leurs propres entrées, leur URL n'étant pas la même.
- **L'affichage immédiat de ce que le cache sait déjà**, suivi d'une
  revalidation en arrière-plan si l'entrée a plus de `CACHE_TTL_MS`. La page ne
  se redessine que si les données ont réellement changé, pour ne pas refermer
  ce que l'utilisateur venait d'ouvrir. La source ne se synchronisant qu'une
  fois par nuit, ce cas est rare.

Mesuré sur l'enchaînement programme → report → créneaux libres, cache vide au
départ : environ **5 s** en tout la première fois, puis **~17 ms** par page.
Sans ce cache partagé, le même enchaînement coûtait 11,7 s, et le repayait
intégralement toutes les 5 minutes.

En cas d'échec de l'API, le comportement dépend du cache : avec un cache, la
page s'affiche et un bandeau orange daté signale que les données n'ont pas pu
être rafraîchies ; sans cache, un bandeau rouge et aucun contenu — une grille
vide serait lue comme "tout est libre".

## RGPD et données joueurs

La table `licencies` de l'API contient, à la source, des données sensibles
(date de naissance, adresse postale, y compris pour des mineurs). Le
scraper Apps Script (voir plus bas) filtre ça **avant** l'écriture sur
Drive : seuls `Numéro club`, `Licence`, `nom`, `prenom` sont conservés, et
uniquement pour les clubs du comité — jamais l'adresse ou la date de
naissance, à aucun moment exposées par l'API.

## Backend (Apps Script)

Le scraper + l'API REST tournent sur un script Google Apps Script séparé,
**volontairement non versionné** dans ce dépôt public (le fichier contient
par endroits des identifiants de connexion au site de la ligue). Il vit en
local sur la machine de développement, dans `apps-script/Code.gs` (ignoré
par `.gitignore`). À versionner séparément, dans un dépôt privé, le jour où
c'est fait proprement.

L'API REST qu'il expose est documentée dans [`API.md`](API.md), pour qui
voudrait construire autre chose avec les mêmes données.

## Limites connues

- **Libellés de lieu** : l'API ne permet qu'un filtre par égalité exacte
  (pas de "contient"). `LIEU_VARIANTS` liste les libellés `lieu_renc`
  connus pour ce trinquet. Si l'API introduit un nouveau format de libellé
  jamais vu, il faudra l'ajouter à cette liste.
- **Heures hors grille** : une rencontre dont l'heure ne tombe pas sur un
  créneau standard (ex: rencontre à 18h un dimanche) est ignorée — elle
  n'occupe aucun de nos créneaux, ça ne concerne pas cet outil.
- **Report de partie** : si `date_rep` est renseigné et différent de
  `date_renc`, c'est la nouvelle date qui compte pour l'occupation du
  créneau (l'heure d'origine est supposée conservée).
- **Compositions incomplètes** : la jointure engagements/licencies ne
  résout que les joueurs des clubs du comité — un club adverse hors
  comité, ou une équipe qui n'a pas encore déclaré sa composition à la
  ligue, affichera "composition non disponible".
- **Niveau de la partie** : le champ `Phase` de l'API (1 à 12) est traduit
  en clair via `PHASE_LABELS` dans `index.html` (Poules, Barrage,
  1/32e... jusqu'à Finale), mapping communiqué par la ligue. En phase de
  poules, "Poule N" (champ `Poule`) est affiché plutôt que "Poules".
- **Report : Trinquet Paris uniquement** : `report.html` ne connaît que la
  grille du Trinquet Paris. Aucune grille de disponibilité n'existe pour les
  autres lieux du championnat, donc une partie qui s'y joue n'a pas de bouton
  de report, et l'URL forcée à la main affiche un avertissement.
- **Report : créneaux hors grille jamais proposés** : `report.html` ne
  propose que les créneaux de la grille, alors que plusieurs reports réels
  ont visiblement été négociés en dehors (un lundi 18h, un mardi 20h...).
  Un report sur un créneau hors grille se traite hors de cet outil.
- **Report : une case barrée ne dit pas pourquoi** : un créneau déjà pris et
  une heure absente de la grille ce jour-là sont rendus à l'identique. La
  distinction n'aide pas à choisir une date, et `index.html` donne le détail
  de l'occupation pour qui en a besoin.
- **Report : horizon des phases finales** : l'horizon s'arrête à la dernière
  date programmée de la phase de la partie. Les phases finales tenant sur une
  seule journée, l'outil retombe alors sur la veille de la phase suivante.
  C'est un choix d'implémentation, pas une règle communiquée par la ligue.
