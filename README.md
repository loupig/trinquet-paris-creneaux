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
   occupés, et affiche qui occupe chaque créneau pris (série, équipes).
4. Source officielle des données : https://lidfpb.euskalpilota.fr/rencontres.php

Les données sont mises en cache dans le navigateur ~5 minutes pour éviter
un appel API à chaque rechargement (bouton "Rafraîchir" pour forcer un
appel immédiat). Si l'API échoue ou renvoie un résultat vide/inattendu, la
page affiche un message d'erreur explicite plutôt qu'une grille vide — une
grille vide serait interprétée à tort comme "tout est libre".

## Mettre à jour le site

```
git add index.html
git commit -m "description du changement"
git push
```

GitHub Pages redéploie automatiquement (~30s à 2min) à chaque push sur
`main`.

## Configuration

Les principaux réglages sont regroupés en haut de la balise `<script>` dans
`index.html` :

| Constante | Rôle |
|---|---|
| `API_BASE` | URL de l'API Apps Script |
| `CACHE_TTL_MS` | Durée du cache navigateur |
| `WEEKS_AHEAD` | Horizon d'affichage (12 semaines par défaut) |
| `GRID` | Grille de créneaux du trinquet, par jour de semaine |
| `SERIE_LABELS` | Correspondance Catégorie → Série affichée |
| `LIEU_VARIANTS` | Libellés `lieu_renc` interrogés côté API pour ce trinquet |
| `matchesTrinquetParis()` | Filtre de sécurité (double vérification côté client) |

## Limites connues

- **Libellés de lieu** : l'API ne permet qu'un filtre par égalité exacte
  (pas de "contient"). `LIEU_VARIANTS` liste les libellés `lieu_renc`
  connus pour ce trinquet (vérifiés en clair sur l'ensemble des données au
  30/08/2026). Si l'API introduit un nouveau format de libellé jamais vu,
  il faudra l'ajouter à cette liste.
- **Heures hors grille** : une rencontre dont l'heure ne tombe pas sur un
  créneau standard (ex: rencontre à 18h un dimanche) n'est pas assignée à
  un créneau automatiquement — elle est signalée sous forme de note
  "à vérifier manuellement" sur la date concernée.
- **Report de partie** : si `date_rep` est renseigné et différent de
  `date_renc`, c'est la nouvelle date qui compte pour l'occupation du
  créneau (l'heure d'origine est supposée conservée).
