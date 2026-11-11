# Tasks

Vérification par `npm test` (syntaxe, puis pages dans Chromium sur les données fictives de `tests/donnees.mjs`), et par des captures sur Pixel 7 et iPhone 15 Pro, en clair et en sombre.

## 1. Noms courts

- [x] 1.1 Créer la spec `openspec/specs/noms-clubs/spec.md` à l'archivage (voir 4.4). En attendant, écrire le test « copies identiques » :
  - lire `CLUBS_ABREGES` dans `index.html` et `classement.html`, et les comparer ;
  - comparer `FIN_DE_POULE` entre `bilan.html` et `classement.html` ;
  - comparer la table de la spec du change avec la copie de l'accueil.

  Vérifier : le test échoue tant que le Classement n'a pas la table.
- [x] 1.2 Scénario « nom court » : servir un club fictif renommé « METRO PELOTE BASQUE ANTONY ». Ligne « MPBA 1 », détail qui commence par « METRO PELOTE BASQUE ANTONY (éq. 1) », même nom court au tableau des quarts. Vérifier : il échoue avant le code.
- [x] 1.3 `classement.html` : `CLUBS_ABREGES`, `nomCourt()`, `team.label` en nom court et `team.nomOfficiel`, nom officiel en tête du détail déplié. Retirer l'espace insécable devenue inutile. Vérifier : 1.1 et 1.2 passent.
- [x] 1.4 Adapter les scénarios qui cherchent « Alpha (éq. 1) » et ses semblables sur le Classement (« Alpha 1 »). Vérifier : tous verts.
- [x] 1.5 `index.html` : le commentaire de `CLUBS_ABREGES` renvoie à la spec `noms-clubs` et dit que le Classement porte la même table. Vérifier : relecture.

## 2. Zones et légende

- [x] 2.1 Scénarios :
  - zones en Série 1 (vert ×4, rien, rouge) et en Série 2 (vert ×4, orange, rouge) ;
  - aucune zone en général ;
  - aucune zone pour une équipe sans partie ;
  - légende de chaque série : zones présentes, « à ce jour », sens des colonnes ;
  - plus de `.cut-line` ni de phrase de règle dans le bloc Filtres.

  Vérifier : ils échouent avant le code.
- [x] 2.2 `classement.html` :
  - `FIN_DE_POULE` et `sortFinDePoule` recopiés ;
  - classes de zone et CSS du liseré (4 px, `--win-text`, `--warn-text`, `--loss-text`) ;
  - `div.legende-classement` dans `remplirZone` ;
  - retrait de `.cut-line` et du `<p class="legende">`.

  Vérifier : 2.1 passe, et le test du contraste en sombre reste vert.

## 3. Lien Bilan

- [x] 3.1 Scénarios : lien en bas de page avec les données fictives (poules en cours), et en haut quand toutes les parties de poule de la série 2 ont un score (données servies modifiées). Un seul lien dans la page. Vérifier : ils échouent avant le code.
- [x] 3.2 `renderResults` place l'unique `.bilan-lien`. Vérifier : 3.1 passe, et le scénario du Bilan ouvert depuis le Classement reste vert.

## 4. Finitions

- [x] 4.1 Scénario « poule entière au premier écran » sur iPhone 15 Pro (393 × 659), en plus du Pixel 7. Vérifier : il passe.
- [x] 4.2 `Version 2026.11.11.2` dans le pied de page de `classement.html` (et de `index.html` si 1.5 touche la page). README : `CLUBS_ABREGES` et `FIN_DE_POULE` dans le tableau des constantes, avec les pages qui les portent. CLAUDE.md : les deux constantes dans la liste des constantes dupliquées. Vérifier : relecture.
- [ ] 4.3 `npm test` complet, sortie montrée. Captures Pixel 7 et iPhone 15 Pro, clair et sombre : Série 1 et Série 2 avec zones et légende, une ligne dépliée, le général, le lien Bilan en haut quand les poules sont finies. `/code-review` sur le diff, et corriger les constats.
- [ ] 4.4 Archiver : créer `openspec/specs/noms-clubs/spec.md` et mettre à jour `classement`. Ouvrir la PR sur le modèle du dépôt, sans toucher à la « Décision humaine ».
