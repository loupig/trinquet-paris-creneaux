# Créneaux libres — Trinquet Paris (75016)

Page statique qui affiche, pour chaque date à venir, les créneaux encore
libres au Trinquet Paris (75016) — lieu unique partagé par la 1ère et la
2ème série du championnat d'Île-de-France de Trinquet Pala Gomme Pleine.

Sert à replanifier rapidement une partie reportée sans recalculer les
créneaux libres à la main.

**Site en ligne :** https://loupig.github.io/trinquet-paris-creneaux/

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
   pour l'envoyer autrement (SMS...).

En haut de page : rappel de la grille fixe et rappel que la page ne sert
qu'à repérer l'occupation de ces créneaux (pas à réserver — seul le site
de la ligue fait foi), ainsi qu'un rappel de la procédure de report
(accord avec l'adversaire, puis déclaration à l'organisateur au plus
tard 7 jours avant la date initiale). Des filtres (jour, créneau
horaire, "libre uniquement", coché par défaut) permettent de
restreindre la liste principale ; ils sont mémorisés dans le navigateur
d'une visite à l'autre. Deux boutons flottants
en bas de page : un raccourci vers le site de la ligue, et un retour en
haut de page.

Source officielle des données : https://lidfpb.euskalpilota.fr/rencontres.php

Les données sont mises en cache dans le navigateur ~5 minutes pour éviter
un appel API à chaque rechargement (bouton "Rafraîchir" pour forcer un
appel immédiat). La page affiche aussi la date de dernière synchronisation
de l'API avec le site de la ligue (distincte de l'heure de consultation).
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
| `CACHE_TTL_MS` | Durée du cache navigateur pour les données |
| `FILTER_CACHE_KEY` | Clé localStorage pour les filtres mémorisés |
| `WEEKS_AHEAD` | Horizon d'affichage |
| `GRID` | Grille de créneaux du trinquet, par jour de semaine |
| `SERIE_LABELS` | Correspondance Catégorie → Série affichée |
| `LIEU_VARIANTS` | Libellés `lieu_renc` interrogés côté API pour ce trinquet |
| `matchesTrinquetParis()` | Filtre de sécurité (double vérification côté client) |

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
