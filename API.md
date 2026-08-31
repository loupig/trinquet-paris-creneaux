# API LIDFPB (non officielle)

Documentation de l'API utilisée par ce site, pour qui voudrait construire
autre chose dessus. C'est l'API d'un projet personnel (script Google Apps
Script), pas une API officielle de la ligue — pas de garantie de stabilité
dans le temps.

**Base URL :** voir la constante `API_BASE` dans [`index.html`](index.html).

- Méthode : `GET` uniquement
- Authentification : aucune
- CORS : ouvert (`Access-Control-Allow-Origin: *`), utilisable depuis
  n'importe quel site
- Réponse : JSON

## Format de réponse

```json
{
  "table": "rencontres",
  "count": 79,
  "filtres": { "Compétition": "20270301" },
  "lastSync": "2026-08-31T10:49:19.374Z",
  "data": [ { "...": "..." } ]
}
```

- `lastSync` : date de dernière synchronisation réussie avec le site de la
  ligue (indépendante de l'heure de l'appel API).
- En cas d'erreur : `{ "error": "message" }` (pas de champ `data`).

## Paramètres de requête

- `table` (obligatoire) : `rencontres`, `engagements` ou `licencies`.
- N'importe quel autre paramètre filtre sur la colonne du même nom, en
  égalité stricte, insensible à la casse (pas de "contient"). Ex :
  `?table=rencontres&lieu_renc=PARIS%20(Trinquet%20Paris%20-%2075016)`.
- Pour éviter les accents dans les query strings, quelques alias existent :
  `no_compet` → `Compétition`, `no_spec` → `Spécialité`, `no_cat` →
  `Catégorie`, `phase` → `Phase`, `poule` → `Poule`.
- Sur `rencontres` et `engagements`, si `no_compet` n'est pas fourni,
  l'API filtre automatiquement sur la compétition en cours (configurée
  côté script) — pour tout récupérer, il faut donc l'omettre ou le
  préciser explicitement.

## Tables disponibles

### `rencontres`

Calendrier des rencontres. Champs utiles :

| Champ | Description |
|---|---|
| `Compétition`, `Catégorie`, `Poule` | Identifiants de compétition/série/poule |
| `club_rec`, `equip_rec` | Club/équipe recevant — code club **concaténé** `ligue+comité+club` (ex: `"3750030"`) |
| `club_vis`, `equip_vis` | Idem pour le club/équipe visiteur |
| `lieu_renc` | Libellé du lieu (texte libre, plusieurs variantes possibles pour un même lieu) |
| `date_renc` | Date au format `JMMAAAA`/`JJMMAAAA` — le mois est toujours sur 2 chiffres, seul le jour peut être sur 1 chiffre |
| `heure_renc` | Heure au format `H` à `HHMM` (pas toujours une heure ronde) |
| `report`, `date_rep` | Si `date_rep` est renseigné et différent de `date_renc`, la rencontre a été reportée à cette nouvelle date |
| `score_cr`, `score_cv` | Scores (vides tant que non joué) |
| `oid` | Identifiant unique de la ligne |

### `engagements`

Compositions d'équipes déclarées à la ligue. Champs utiles :

| Champ | Description |
|---|---|
| `Numéro club` | Code club au format **avec tirets** (ex: `"03-750-030"`) — différent du format de `rencontres` (voir plus bas) |
| `Catégorie`, `Equipe`, `Poule` | Pour rattacher à une équipe précise |
| `Licence 1` … `Licence 10` | Numéros de licence des joueurs de l'équipe. ⚠️ Les clés réelles contiennent l'entité HTML `&nbsp;` non décodée (ex. la clé JSON est littéralement `"Licence&nbsp;1"`, pas `"Licence 1"`) |
| `Responsable`, `Tél1. Resp.`, `Tél2. Resp.` | Contact de l'équipe — données personnelles, à ne pas republier sans réflexion |

### `licencies`

Lien numéro de licence → nom du joueur. **Volontairement réduit** par le
script à 4 colonnes avant d'être exposé :

| Champ | Description |
|---|---|
| `Numéro club` | Même format avec tirets que `engagements` |
| `Licence` | Numéro de licence |
| `nom`, `prenom` | Nom et prénom |

La table source contient bien plus (date de naissance, adresse postale,
y compris pour des mineurs) — jamais exposé par cette API. Voir la section
RGPD du [README](README.md#rgpd-et-données-joueurs).

⚠️ Les numéros de licence ne sont **pas** formatés pareil entre les tables
(`"58863"` dans `engagements`, `"058863"` dans `licencies`) — comparer après
avoir retiré les zéros de tête.

## Codes club : deux formats à connaître

- `rencontres` (`club_rec`/`club_vis`) : code concaténé `ligue(1)+comité(3)+club(3)`,
  ex. `"3750030"`.
- `engagements`/`licencies` (`Numéro club`) : format avec tirets
  `LL-CCC-CCC`, ex. `"03-750-030"`.

Pour faire le lien entre les deux, il faut passer par la table `clubs`
(non documentée ici) ou reconstruire soi-même la correspondance.
