# Design

## Context

`equipe.html` montre aujourd'hui une seule équipe, choisie dans l'ordre suivant : celle de l'adresse (`?equipe=spec|cat|club|num`), sinon la dernière vue (`lidfpb_equipe_vue_v1`), sinon la première suivie. Une liste déroulante `#choixEquipe` change d'équipe, et `montrer()` passe par `history.replaceState`.

La page a déjà tout ce qu'il faut pour la liste et le message :
- les équipes (`buildTeams` + `equipesChoisissables`), avec `roster` (« Prénom NOM ») et `contact` (responsable, téléphone) ;
- le classement des poules (`buildStandings`, `trierClassement`, copies identiques de celles du Classement) ;
- `normalizePhoneForWhatsapp`, les icônes WhatsApp et SMS, et le bloc « Prévenir l'équipe », avec ses boutons WhatsApp prérempli et Partager/Copier ;
- `masquerFinalesPrematurees`, qui met les phases finales « à désigner » tant que les poules de leur série ne sont pas finies.

Il lui manque trois choses : les noms courts (`CLUBS_ABREGES` n'est que dans l'accueil, Parties et le Classement), le CSS des lignes `.rank-*` du Classement, et le lien du questionnaire (`AVIS`, dans l'accueil seul).

Contraintes du dépôt :
- chaque page est autonome, sans build, et les constantes dupliquées restent identiques ;
- pas de fenêtre surgissante ;
- pas de numéro de responsable écrit dans une page ;
- dépôt public, donc des données fictives dans les tests.

## Goals / Non-Goals

**Goals :**
- Ouvrir l'onglet sur toutes les équipes, au format du Classement, avec WhatsApp, SMS et l'envoi du message sur chaque ligne.
- Construire le message des phases finales à partir des données, au mot près du modèle validé le 22 novembre.
- Garder la page d'une équipe telle quelle, avec ses liens.

**Non-Goals :**
- Un envoi groupé ou automatique : le site ouvre WhatsApp, et le visiteur envoie lui-même.
- Un SMS prérempli. `sms:` avec `body` se comporte différemment sur iOS et Android.
- Passer le reste de la page d'une équipe en noms courts.
- Factoriser du code entre pages.

## Decisions

### 1. Une page, deux vues, routées par l'adresse

`?equipe=` présent et connu : la vue équipe. Sinon : la vue liste. Une fonction `afficherSelonAdresse()` lit l'adresse et rend la bonne vue. Elle sert au chargement, au rafraîchissement et à `popstate`.

- **Liste → équipe** (« Voir l'équipe → », ou une pastille au-dessus de la liste) : `history.pushState({ depuisListe: true }, "", "?equipe=…")`. Retour ramène alors à la liste, ce qu'attend un visiteur qui vient de la parcourir.
- **Équipe → équipe** (pastille sur la page d'une équipe) : `replaceState`, comme aujourd'hui.
- **« ← Toutes les équipes »** : un vrai lien `equipe.html`, intercepté au clic. Si l'état dit `depuisListe`, on fait `history.back()`. Sinon (arrivée par un lien partagé), on fait `pushState` vers `equipe.html` et on rend la liste. Sans JavaScript, le lien marche tout de même.

*Écarté* : deux pages (`equipes.html` pour la liste), qui dupliquerait tout le chargement des données ; une navigation par lien plein, qui relit le cache à chaque passage et perd la position dans la liste.

La liste déroulante, `renderChoix`, `lireEquipeVue`/`ecrireEquipeVue` et `EQUIPE_VUE_KEY` sont supprimés. `choisirEquipe` ne garde que l'adresse.

### 2. La ligne de la liste, recopiée du Classement et adaptée

Le CSS `.poule-card`, `.poule-head`, `.badge`, `.rank-*` et les variables du podium (`--or-*`, `--argent-*`, `--bronze-*`) sont recopiés du Classement. Leurs valeurs sombres vont dans les deux blocs (spec `apparence`), pour les variables que la page n'a pas déjà.

La ligne ne peut pas être un seul `<button>`, comme au Classement, parce qu'elle porte des liens et que des éléments interactifs ne s'imbriquent pas :

```
.rank-item
├── .rank-ligne (grid : 1fr auto)
│   ├── button.rank-row  (grid : 22px 1fr 14px → rang, nom, chevron ; aria-expanded)
│   └── .rank-actions    (0 à 3 liens de 36 × 36 px : WhatsApp, SMS, message)
└── .rank-plus           (nom officiel, joueurs, « Voir l'équipe → »)
```

Le chevron reste collé au nom, dans le bouton, pour qu'on voie ce qui se déplie. À 320 px, il reste environ 110 px pour le nom avec trois icônes, ce qui suffit pour « Chatillon 3 ». Un nom plus long passe à la ligne, sans être tronqué.

Les lignes sont dans l'ordre de `trierClassement` pour chaque poule de `buildStandings`, sans les clubs fictifs. Une équipe de l'index absente de toute poule va dans une carte « Hors poule » de sa série. Les dépliés sont gardés dans un objet en mémoire, le temps de la visite, comme au Classement.

*Écarté* : les colonnes J, G, P, GA et Moy. Elles ne tiennent pas avec trois icônes à 390 px, et le Classement les donne déjà (choix du demandeur).

### 3. Noms courts : recopie de `CLUBS_ABREGES`

On recopie la table et la fonction de nom court du Classement à l'identique. Le test « noms courts identiques d'une page à l'autre, et à la spec » s'étend à `equipe.html`. Les noms courts ne servent qu'à la liste et au message : le reste de la page garde `clubLabel` (noms officiels), qui n'est pas dans le champ.

### 4. Le message, une fonction pure

`messagePhasesFinales(rencontres, ctx, aujourdHui, liens)` renvoie le texte, ou `null` :

- **Parties retenues** : phase 7 à 12, sans score, datées d'aujourd'hui ou plus tard (date de report comprise, `effectiveDate`). Leur série (spécialité et catégorie) n'a plus aucune partie de poule sans score. Rien de retenu : `null`.
- **Ordre** : par date, puis par heure.
- **Groupes** : par phase et par jour, avec un en-tête `🏟️ *1/2 finales, dimanche 29 novembre*`, ou `🏆 *Finales, …*` pour la phase 12. Les libellés au pluriel sont dans une table `PHASES_AU_PLURIEL` (« 1/4 de finale », « 1/2 finales », « Finales »…). La date s'écrit avec `toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })`.
- **Une partie dont au moins une équipe est désignée** :

  ```
  *14h · Série 2*
  PEP 2 (Ane Etxeberri & Peio Larralde)
  vs Chatillon 3 (… & …)
  ```

  Un côté inconnu s'écrit « à désigner ».
- **Une partie dont les deux équipes sont à désigner** : `• 16h : finale Série 2`, avec le libellé singulier de la phase en minuscules.
- **Lieu** : `lieuMessage("PARIS (Trinquet Paris - 75016)")` donne `Trinquet Paris (75016)`. Un seul lieu pour toutes les parties : une ligne `📍` après les parties. Sinon, le lieu va sur chaque ligne d'heure (`*14h · Série 2 · Trinquet Paris (75016)*`).
- **Joueurs** : `getRoster`, puis `nomPropre()` : chaque mot et chaque partie de nom composé en minuscules avec une majuscule initiale (`toLocaleLowerCase("fr")`). Deux noms sont reliés par « & », plus de deux par des virgules puis « & ».
- **Liens** :
  - `AVIS` est recopié de l'accueil (`url`, `jusquAu`) : on garde le questionnaire si `aujourdHui <= jusquAu 23:59:59` et que l'URL commence par `https://` ;
  - le site : `new URL("decouvrir.html", location.href).href`, qui vaut l'adresse GitHub Pages en ligne et `127.0.0.1` dans les tests.
- **Textes fixes** : ceux du message validé, en constantes (remerciement, « Votre avis compte », « site non officiel, en bêta, en complément de celui de la ligue », fin).

Le message ne contient ni licence, ni nom ou numéro de responsable. Les joueurs n'y figurent qu'avec la forme « Prénom Nom » de `licencies`.

*Écarté* : un texte figé dans la page, à réécrire après chaque tour et à chaque saison (choix du demandeur).

### 5. Le bloc « Message aux équipes », sans fenêtre

C'est un bloc au style de « Prévenir l'équipe », en tête de la liste, sous les pastilles. Il porte une note (« Phases finales du dim. 29 nov. au dim. 6 déc. ») et un bouton `aria-expanded` « Message aux équipes ». Celui-ci déplie un aperçu `<pre class="message-apercu">` (`white-space: pre-wrap`) et le bouton Partager/Copier.

La logique de Partager/Copier de `buildPrevenir` est sortie dans `boutonPartager(texte)`, que les deux blocs utilisent. Le comportement de « Prévenir l'équipe » ne change pas.

### 6. Les trois icônes de la ligne

On calcule `normalizePhoneForWhatsapp(team.contact.tel)` une fois par ligne. Sans numéro, il n'y a pas d'icône.

- **WhatsApp** : `https://wa.me/<n>`, sans texte (comme la fiche de l'adversaire).
- **SMS** : `sms:+<n>`.
- **Message** : `https://wa.me/<n>?text=<message encodé>`, avec l'icône Phosphor « paper-plane-tilt », seulement si le message existe.

Chaque icône a un `aria-label` et un `title` qui nomment l'équipe par son nom court (« Envoyer le message des phases finales au responsable de PEP 2 »), jamais le responsable. Les liens WhatsApp s'ouvrent avec `target="_blank" rel="noopener"`.

### 7. L'onglet renommé

On change le libellé de l'onglet dans les sept pages, ainsi que le `<title>` et le `<h1>` de `equipe.html` (« Équipes »), et les mentions de l'onglet dans `decouvrir.html` et `equipes.html`. Le bloc « Mes équipes » de l'accueil garde son nom. Chaque page touchée change de `Version AAAA.MM.JJ`.

Dans les specs principales, une passe de rédaction au moment de l'archivage remplace « page Mes équipes » et « onglet « Mes équipes » » par « page Équipes » et « onglet « Équipes » ». C'est une passe de vocabulaire, sans comportement nouveau. Le bloc de l'accueil n'est pas touché.

### 8. Les tests, sur des données de fin de poules

Un scénario sert ses propres données par une route, comme « Classement : phases finales jouées » :
- toutes les parties de poule de `tables.rencontres` reçoivent un score ;
- on ajoute deux demies désignées par série (dans 7 jours, à 14h, 15h, 16h et 17h) et deux finales « à désigner » (dans 14 jours) ;
- on renomme un club en « PARIS EUSKAL PILOTA », pour vérifier le nom court ;
- on met à un joueur un nom composé en capitales, pour vérifier `nomPropre` ;
- tous les noms restent inventés.

Les données ordinaires servent aux scénarios « pas de message » et « liste ». La date du questionnaire est forcée par `page.clock`, avant ou après `jusquAu`.

## Risks / Trade-offs

- **Le site publie des noms de joueurs dans un texte à partager.** → Exception limitée au seul message des phases finales, validée par le demandeur et écrite dans la spec `donnees-api`. Les noms sont ceux que la ligue publie déjà pour ces parties. Aucune autre donnée du joueur n'y entre, et un scénario le vérifie.
- **Un visiteur quelconque peut écrire aux responsables.** → C'est déjà possible depuis Parties et la fiche de l'adversaire. Le site ouvre WhatsApp, mais n'envoie rien, et le numéro ne s'affiche pas.
- **Un joueur habitué à retrouver son équipe en ouvrant l'onglet doit toucher une fois de plus.** → Les pastilles de ses équipes suivies sont en tête de la liste, et l'accueil ouvre directement l'équipe suivie. On mesure par les retours (hypothèse 2 de la proposition).
- **`nomPropre` abîme certains noms** (« McDonald », particules « de »). → Les noms basques et français courants passent bien. Un nom abîmé reste lisible, et le visiteur peut corriger dans WhatsApp avant d'envoyer.
- **Des copies de plus** (`CLUBS_ABREGES`, CSS `.rank-*`, `AVIS`). → Ce sont des copies identiques, vérifiées par test pour `CLUBS_ABREGES` et `AVIS`, comme pour les autres constantes dupliquées. Le README en tient la liste.
- **Le message peut dépasser ce qu'accepte une URL `wa.me`** s'il y a beaucoup de parties (des 1/8 avec 16 équipes). → Une vingtaine de lignes encodées fait environ 4 ko, loin des limites des navigateurs. À revoir si la ligue ajoute des tours.
