# Tasks

Vérification par `npm test` (syntaxe, puis pages dans Chromium sur les données fictives de `tests/donnees.mjs`), et par des captures sur Pixel 7, en clair et en sombre.

## 1. Scénarios d'abord

- [x] 1.1 Les scénarios « Équipes : message des phases finales » passent sur `equipe.html?orga`. Un scénario nouveau vérifie que sans `orga`, poules finies, il n'y a ni bloc ni avion en papier, mais toujours WhatsApp et SMS.
- [x] 1.2 Choix de la communication :
  - poules en cours : « Prochaine partie » choisie, « Phases finales » absente ;
  - poules finies : « Phases finales » choisie ;
  - changer de pastille met à jour les `href` et les `aria-label` des avions en papier.
- [x] 1.3 « Prochaine partie » :
  - le texte rempli pour Charlie 1 contre Foxtrot 1 ;
  - pas d'avion pour une équipe sans partie à venir ;
  - le lien `api.whatsapp.com/send` avec le numéro entier ;
  - dans l'aperçu, le numéro masqué `06 •• •• •• 05`, et aucun numéro entier lisible dans la page.
- [x] 1.4 « Perso » :
  - balise insérée au curseur ;
  - `{capitaine}` signalée et laissée telle quelle ;
  - une ligne `{date}` qui disparaît pour une équipe sans partie à venir ;
  - le texte toujours là après rechargement ;
  - « Rétablir l'exemple » ;
  - stockage indisponible.
- [x] 1.5 Navigation : `orga` reste dans l'adresse de la liste à une équipe (lien et pastille), et retour.
- [x] 1.6 `prenomDuResponsable` identique dans `programme.html` et `equipe.html`.

  Vérifier : les nouveaux scénarios échouent sur la page actuelle.

## 2. Mode organisateur et adresses

- [x] 2.1 `ORGA`, et `adresse(cle)`, qui sert à `mettreAJourAdresse`, `ouvrirEquipe`, `revenirALaListe`, « Voir l'équipe → » et « ← Toutes les équipes ».
- [x] 2.2 Sans `ORGA`, ni bloc ni avion en papier.

## 3. Moteur de balises

- [x] 3.1 Recopier `prenomDuResponsable` de `programme.html`.
- [x] 3.2 Le moteur :
  - `valeurs(team, { masque })` ;
  - `remplir(texte, valeurs)` (une ligne disparaît si une balise connue est vide, les lignes vides en trop sont fusionnées) ;
  - `balisesInconnues(texte)` ;
  - `masquerTel`.
- [x] 3.3 `messagePhasesFinales` renvoie aussi `parties`, pour la balise `{phases finales}`, sans changer le texte du message.

## 4. Communications et bloc

- [x] 4.1 Le registre `COMMUNICATIONS` (finales, prochaine, perso), avec `proposee`, `concerne` et `texte`, et `MODELE_PROCHAINE_PARTIE`.
- [x] 4.2 Le bloc « Communication aux équipes » :
  - pastilles `aria-pressed` et note du nombre d'équipes concernées ;
  - « Message aux équipes » qui déplie l'éditeur (pour « Perso »), le choix de l'équipe de l'aperçu, l'aperçu masqué et Partager/Copier ;
  - CSS en variables existantes, ou une variable nouvelle avec sa valeur sombre dans les deux blocs.
- [x] 4.3 L'éditeur « Perso » :
  - `textarea` en 16 px ;
  - boutons de balises ;
  - « Balise inconnue : … » ;
  - « Rétablir l'exemple » ;
  - `lidfpb_message_perso_v1` en `try/catch`.
- [x] 4.4 Le registre `envois` et `majEnvois()` : avion en papier montré ou caché, `href`, `aria-label` et `title` à chaque rendu, changement de pastille et frappe (150 ms).

## 5. Finitions

- [x] 5.1 `Version AAAA.MM.JJ` de `equipe.html`.
- [x] 5.2 README :
  - `lidfpb_message_perso_v1` dans le tableau `localStorage` ;
  - `prenomDuResponsable` dans les copies ;
  - le mode organisateur dans la description de `equipe.html`, avec « pas une protection » ;
  - la section RGPD (noms et numéros dans les communications).
- [x] 5.3 `npm test` complet, sortie montrée.
- [x] 5.4 Captures Pixel 7, en clair et en sombre : le bloc sur « Prochaine partie » avec l'aperçu, et « Perso » avec l'éditeur et une balise inconnue.
- [ ] 5.5 `/code-review` sur le diff, puis `/security-review` (texte saisi, numéros, `localStorage`). Corriger les constats.
