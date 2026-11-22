# Tasks

Vérification par `npm test` (syntaxe, puis pages dans Chromium sur les données fictives de `tests/donnees.mjs`), et par des captures sur Pixel 7, en clair et en sombre.

## 1. Scénarios d'abord

- [ ] 1.1 Dans `tests/pages.spec.mjs`, une fonction de données « fin de poules » :
  - toutes les poules avec un score ;
  - deux demies désignées par série, à 14h, 15h, 16h et 17h dans 7 jours ;
  - deux finales à désigner dans 14 jours ;
  - un club renommé « PARIS EUSKAL PILOTA » ;
  - un joueur au nom composé en capitales ;
  - rien que des noms inventés.
- [ ] 1.2 Scénarios de la liste :
  - l'onglet ouvre la liste, une carte par poule, sans « Equipe à désigner » ;
  - ordre du classement, podium, nom court ;
  - dépli (nom officiel, joueurs, « Voir l'équipe → », chevron, `aria-expanded`) ;
  - aucun nom de joueur visible tant qu'on n'a rien touché ;
  - pastilles des équipes suivies au-dessus.
- [ ] 1.3 Navigation :
  - « Voir l'équipe → » met l'adresse à jour sans appel réseau, et Retour ramène à la liste ;
  - « ← Toutes les équipes » depuis un lien partagé ;
  - une équipe inconnue dans l'adresse donne la liste ;
  - l'ancienne mémoire `lidfpb_equipe_vue_v1` est ignorée.
- [ ] 1.4 Icônes :
  - WhatsApp sans texte et SMS vers le bon numéro ;
  - pas d'icône sans numéro ;
  - aucun numéro ni nom de responsable lisible ;
  - `aria-label` au nom court.
- [ ] 1.5 Message :
  - absent poules en cours (ni bouton ni troisième icône) ;
  - présent en fin de poules ;
  - texte exact des demies (heure, série, noms courts, joueurs en « Prénom Nom », « & ») ;
  - « • 17h : finale Série 1 » ;
  - un seul « 📍 Trinquet Paris (75016) » ;
  - lien du questionnaire avant `jusquAu` et absent après (`page.clock`) ;
  - lien `decouvrir.html` avec la mention non officielle ;
  - ni licence ni responsable dans le texte ;
  - la troisième icône ouvre `wa.me/<n>?text=` avec ce message ;
  - le bouton déplie l'aperçu et Partager/Copier.
- [ ] 1.6 Mettre à jour les scénarios existants :
  - libellé d'onglet « Équipes » ;
  - redirection `equipes.html` ;
  - « Suivre ses équipes depuis Mes équipes » si besoin ;
  - `CLUBS_ABREGES` et `AVIS` identiques d'une page à l'autre.

  Vérifier : les nouveaux scénarios échouent sur la page actuelle.

## 2. Page Équipes : vues et navigation

- [ ] 2.1 `equipe.html` :
  - retirer `#choixEquipe`, `renderChoix`, `lireEquipeVue`/`ecrireEquipeVue` et `EQUIPE_VUE_KEY` ;
  - `choisirEquipe` ne garde que l'adresse.
- [ ] 2.2 `afficherSelonAdresse()` :
  - liste ou équipe selon l'adresse ;
  - appelée au chargement, au rafraîchissement et sur `popstate` ;
  - `pushState` de la liste vers une équipe, `replaceState` d'une équipe à l'autre.
- [ ] 2.3 Lien « ← Toutes les équipes » en tête de la page d'une équipe : `history.back()` si l'on vient de la liste, sinon `pushState` vers la liste.
- [ ] 2.4 Les pastilles des équipes suivies s'affichent aussi au-dessus de la liste.

## 3. Page Équipes : la liste

- [ ] 3.1 Recopier `CLUBS_ABREGES` et la fonction de nom court du Classement, à l'identique.
- [ ] 3.2 Recopier le CSS `.poule-card`, `.poule-head`, `.badge` et `.rank-*`, ainsi que les variables du podium, avec leurs valeurs sombres dans les deux blocs (spec `apparence`).
- [ ] 3.3 `buildListe()` :
  - une carte par série et par poule (`buildStandings` et `trierClassement`), plus « Hors poule » ;
  - la ligne : bouton (rang, nom court, chevron) et actions ;
  - le dépli : nom officiel, joueurs ou « Composition non déclarée à la ligue », « Voir l'équipe → » ;
  - les dépliés gardés en mémoire le temps de la visite.
- [ ] 3.4 Les icônes WhatsApp (vide) et SMS, avec `aria-label` et `title` au nom court, sans numéro ni nom de responsable.

## 4. Page Équipes : le message des phases finales

- [ ] 4.1 Recopier `AVIS` de l'accueil.
- [ ] 4.2 Écrire les aides et la fonction pure :
  - `PHASES_AU_PLURIEL`, `lieuMessage`, `nomPropre` et `joueursDuMessage` ;
  - `messagePhasesFinales(...)` (design, décision 4), qui renvoie `null` sans partie retenue.
- [ ] 4.3 Sortir `boutonPartager(texte)` de `buildPrevenir`, sans changer « Prévenir l'équipe ».
- [ ] 4.4 Le bloc « Message aux équipes » (note, bouton `aria-expanded`, aperçu `<pre>`, Partager/Copier), en tête de la liste, seulement si le message existe.
- [ ] 4.5 La troisième icône (paper-plane-tilt), qui ouvre `wa.me/<n>?text=<message>`, seulement si le message existe.

## 5. Onglet « Équipes » et finitions

- [ ] 5.1 Libellé de l'onglet dans les sept pages. `<title>` et `<h1>` de `equipe.html`. Mentions de la page dans `decouvrir.html` et `equipes.html`.
- [ ] 5.2 `Version AAAA.MM.JJ` de chaque page touchée.
- [ ] 5.3 README :
  - la description de `equipe.html` ;
  - `lidfpb_equipe_vue_v1` retirée du tableau `localStorage` ;
  - `CLUBS_ABREGES` et `AVIS` dans le tableau des constantes dupliquées ;
  - l'endroit où paraissent les noms de joueurs.
- [ ] 5.4 `npm test` complet, sortie montrée.
- [ ] 5.5 Captures Pixel 7, en clair et en sombre : la liste, une ligne dépliée, le message déplié, la page d'une équipe avec « ← Toutes les équipes ».
- [ ] 5.6 `/code-review` sur le diff, puis `/security-review` (données de l'API, noms de joueurs dans un texte partagé, `localStorage`). Corriger les constats.
- [ ] 5.7 À l'archivage, passe de vocabulaire dans les specs principales : « page Mes équipes » devient « page Équipes », et l'onglet « Mes équipes » devient « Équipes ». Le bloc de l'accueil n'est pas touché.
