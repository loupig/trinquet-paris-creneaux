# Design

## Context

- `buildProchaine()` dans `equipe.html` construit la carte « Prochaine partie » et sa rangée de boutons `.prochaine-actions` : « Compter cette partie », puis « Chercher une date de report » quand `canReport(m)`.
- `prochainePartie()` ne retient qu'une partie sans score, datée d'aujourd'hui ou plus tard, **avec une heure lisible**. La partie affichée a donc toujours `m.date` et `m.hour`.
- `m.date` vient de `effectiveDate(row)` : c'est déjà la date de report quand `date_rep` diffère de `date_renc`. L'heure vient de `heure_renc` seule (l'API n'a pas d'heure de report).
- La partie porte `m.oid` (identifiant de la ligne dans la ligue), `m.lieu`, `m.meta` (« Poule 1 » ou libellé de phase), `m.adversaire`, `m.chezSoi` ; l'équipe porte `team.serieLabel`, `team.clubNom`, `team.numero`. Le bouton du compteur nomme déjà les équipes ainsi, la recevante d'abord.
- L'adresse de la page de l'équipe est `pathname + "?equipe=" + clé` (`mettreAJourAdresse()`).

## Goals / Non-Goals

**Goals:**
- Un fichier que l'agenda de l'iPhone et celui d'Android ouvrent sans réglage.
- Une heure juste quel que soit le fuseau de l'appareil.
- Aucun appel réseau, aucune donnée personnelle, aucune dépendance.

**Non-Goals:**
- Pas d'abonnement à un agenda qui se mettrait à jour tout seul : il faudrait un serveur.
- Pas de bouton sur chaque partie de la liste, ni d'ajout de toutes les parties : étape suivante, si l'hypothèse se vérifie.
- Pas de lien « Ajouter à Google Agenda » (adresse `calendar.google.com`) : on resterait sur un seul fournisseur, et le fichier `.ics` couvre déjà Android.

## Decisions

**1. Un fichier iCalendar téléchargé, via un `Blob` et un lien `download`.**
Au toucher, on construit le texte, on en fait un `Blob` de type `text/calendar;charset=utf-8`, on crée une adresse `blob:` et on la fait télécharger par un lien `<a download="…">` temporaire. L'adresse est libérée juste après. Nom du fichier : `partie-AAAA-MM-JJ.ics`.
Alternative écartée : un lien `data:text/calendar,…` posé d'avance dans la page. Il marche aussi, mais il faut alors construire le fichier pour chaque affichage, et Safari gère moins bien les gros liens `data:`.

**2. Heure de Paris avec `TZID=Europe/Paris` et un bloc `VTIMEZONE`.**
`DTSTART;TZID=Europe/Paris:AAAAMMJJTHHMM00` et `DTEND` 1 h 30 plus tard, calculé sur les heures et minutes, sans passer par l'heure de l'appareil. La norme demande la définition du fuseau dans le fichier quand on le nomme : on y met un `VTIMEZONE` fixe (heure d'hiver UTC+1, heure d'été UTC+2, règles de l'Union européenne, dernier dimanche de mars et d'octobre).
Alternatives écartées :
- une heure « flottante », sans fuseau : juste sur un téléphone réglé sur Paris, fausse sur un téléphone resté à l'heure d'ailleurs ;
- une conversion en UTC par `Date` : elle suppose que l'appareil est à l'heure de Paris.

**3. Contenu de l'événement.**
- `SUMMARY` : « Recevant – Visiteur · Série » (ex. « Charlie 1 – Foxtrot 1 · Série 1 »).
- `LOCATION` : `m.lieu`, omis s'il est vide.
- `DESCRIPTION` : « Série 1 · Poule 1 », puis l'adresse absolue de la page Mes équipes de l'équipe affichée.
- `UID` : `partie-<oid>@lidfpb` ; `DTSTAMP` : l'heure du toucher, en UTC.
- `VALARM` : `ACTION:DISPLAY`, `TRIGGER:-P1D`, avec la même description que le titre.
- Les textes sont échappés selon la norme (`\`, `;`, `,`, retours à la ligne) et les lignes séparées par `CRLF`. Les lignes de plus de 75 octets sont repliées, l'adresse de la page pouvant dépasser.

**4. Bouton dans `.prochaine-actions`, après « Compter cette partie ».**
Même style `.report-btn`, une icône d'agenda en SVG inline, libellé « Ajouter à mon agenda ». C'est un `<button>`, pas un lien : il n'a pas d'adresse avant le toucher. Il faut donc donner à `button.report-btn` les mêmes réglages de police et de curseur qu'au lien.

**5. Fonctions pures, testables par le contenu du fichier.**
`icsPartie(team, m, maintenant, adressePage)` renvoie le texte ; le gestionnaire du bouton ne fait que le télécharger. Le test Playwright capte le téléchargement (`page.waitForEvent("download")`) et lit le fichier.

## Risks / Trade-offs

- [L'application installée sur l'écran d'accueil de l'iPhone ne laisse pas ouvrir le fichier] → À vérifier sur un vrai téléphone avant la fusion, en Safari et en mode installé. Si le mode installé bloque, on garde le bouton pour Safari et on documente la limite, ou on renonce : décision humaine.
- [Google Agenda ignore le rappel du fichier] → Assumé : il applique les rappels par défaut de l'utilisateur.
- [Doublon si la partie est reportée puis ajoutée de nouveau] → L'`UID` stable limite le cas aux agendas qui l'ignorent. Accepté pour ce premier pas.
- [Règles d'heure d'été modifiées un jour par l'Union européenne] → Le `VTIMEZONE` fixe serait à mettre à jour ; la plupart des agendas utilisent de toute façon leur propre définition de `Europe/Paris`.

## Migration Plan

Aucune migration : site statique, déploiement par push sur `main`. Retour arrière par `git revert`.
