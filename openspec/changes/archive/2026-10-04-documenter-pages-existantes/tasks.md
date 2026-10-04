# Tasks

Aucune page HTML n'est modifiée par ce change. Les specs se vérifient par relecture du code et sur le site en ligne, à 390 px de large, sur les données réelles. Aucun nom de joueur ni de responsable n'est recopié dans une issue, une capture ou un commentaire.

## 1. Vérification des specs contre le code

- [x] 1.1 Relire `specs/calcul-classement` contre les trois copies du calcul (`classement.html`, `index.html`, `equipe.html`). Vérifier sur le site, pour une équipe de chaque série, le scénario « Rang sur trois pages ».
- [x] 1.2 Relire `specs/classement` contre `classement.html`. Vérifier sur le site les scénarios « Classement général », « Poule de six » ou « Poule de quatre » selon les poules réelles, et « Retour sur la page » pour le filtre de série.
- [x] 1.3 Relire `specs/programme` contre `programme.html`. Vérifier sur le site « Partie dans un autre lieu », « Partie passée sans score » si une telle partie existe, et « Responsable joignable » : rechercher dans le texte visible qu'aucun numéro n'apparaît.
- [x] 1.4 Relire `specs/creneaux` contre `creneaux.html`. Vérifier sur le site « Vendredi seul », « Copie du texte » et « Week-end complet ».
- [x] 1.5 Relire `specs/report` contre `report.html`. Vérifier sur le site « Ouverture sans identifiant », puis ouvrir le report d'une partie à venir au Trinquet Paris pour vérifier « Rappel de la partie », « Créneaux disponibles » et « Proposer des dates à l'adversaire ».
- [x] 1.6 Relire `specs/compteur` contre `compteur.html`. Vérifier sur le site « Choisir la couleur de l'adversaire », « Erreur de saisie », « Refus de la confirmation » et « Rechargement en pleine partie », puis effacer la partie de test.
- [x] 1.7 Relire `specs/navigation` contre les sept pages et `manifest.webmanifest`. Vérifier sur le site « Page hors onglets », « Écran étroit » et « Ancien favori ».
- [x] 1.8 Relire `specs/donnees-api` contre les six pages qui appellent l'API. Vérifier sur le site « Enchaîner deux pages » (aucun nouvel appel pour les tables déjà gardées) et « Pages sans joueurs ».
- [x] 1.9 Corriger dans les specs toute exigence que la relecture contredit. Si un nouvel écart apparaît, l'ajouter à la liste de `design.md` selon la règle D2. Vérifier que `openspec validate documenter-pages-existantes --strict` passe.

## 2. Issue des écarts

- [x] 2.1 Rédiger le texte d'une issue GitHub qui reprend la liste « Écarts relevés » de `design.md`, sans aucun nom de joueur ni de responsable, et le montrer à l'utilisateur. Le livrable est un texte relu par l'utilisateur.
- [ ] 2.2 Après accord explicite de l'utilisateur, créer l'issue avec `gh issue create` sur le dépôt, puis ajouter son lien dans `design.md` (D7). Vérifier que l'issue est visible avec `gh issue view`.

## 3. Allègement du README

- [x] 3.1 Remplacer la section « Pages » par une ligne par page, accueil, Mon équipe et redirection comprises, chacune avec le lien vers sa spec dans `openspec/specs/`. Garder en tête de section les deux phrases sur la navigation façon application mobile, en renvoyant à `navigation`. Vérifier que chaque lien de spec pointe vers un fichier existant après archivage : les huit nouvelles specs, plus `accueil`, `affiche-week-end`, `mes-equipes` et `mon-equipe`.
- [x] 3.2 Retirer les sections « Fonctionnement », « Cache et temps de chargement » et « Limites connues ». Garder, de « Cache et temps de chargement », seulement le plancher d'environ deux secondes par appel Apps Script, utile à qui voudrait accélérer le site. Vérifier que tout ce qui est retiré est soit dans une spec, soit dans la liste des écarts de `design.md`.
- [x] 3.3 Mettre à jour « Mettre à jour le site » (commande `git add` générique, version du pied de page de chaque page modifiée) et « Configuration » : constantes communes aux pages, `PHASE_LABELS`, clés de stockage du navigateur. Vérifier chaque nom de constante et de clé par une recherche dans les pages.
- [x] 3.4 Réécrire « RGPD et données joueurs » en résumé exact : noms de joueurs seuls sur Parties, Créneaux et Mon équipe ; contacts des responsables sur Parties, Mon équipe et Report, avec ce que chacune affiche ; question de la base légale toujours ouverte. Vérifier chaque affirmation contre `specs/donnees-api` et le point 17 de `design.md`.
- [x] 3.5 Ajouter le paragraphe « Choix assumés » : pas de fenêtre surgissante, pas de service worker, palette imposée du compteur, pas de compte. Une ligne chacun. Ne citer aucune fréquence de synchronisation tant que la question ouverte de `design.md` n'est pas tranchée.
- [x] 3.6 Relire le README complet. Vérifier qu'il ne contredit aucune spec, que tous ses liens internes pointent vers des fichiers existants, et qu'il ne décrit plus le comportement détaillé d'aucune page.

## 4. Intégration

- [x] 4.1 Vérifier qu'aucune page HTML n'a changé (`git diff --stat` ne montre que `README.md` et `openspec/`), et que `openspec validate documenter-pages-existantes --strict` passe.
