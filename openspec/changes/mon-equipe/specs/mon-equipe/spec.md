# Spec Delta

## Purpose

Donner à chaque équipe engagée une page qui réunit tout ce qui la concerne : ses parties, son classement de poule, son bilan, sa forme et sa composition. La page est accessible par un onglet et se partage par un lien.

## ADDED Requirements

### Requirement: Onglet Mon équipe
La barre d'onglets SHALL compter cinq entrées sur toutes les pages du site, dans cet ordre : Accueil, Mon équipe, Parties, Classement, Créneaux. L'onglet « Mon équipe » ouvre la page de l'équipe et y apparaît comme onglet courant. Sur un écran de 390 px de large, les cinq libellés MUST tenir sans être coupés et sans défilement horizontal.

#### Scenario: Aller sur la page depuis une autre page
- **WHEN** un visiteur sur la page Classement touche l'onglet « Mon équipe »
- **THEN** la page de l'équipe s'ouvre et l'onglet « Mon équipe » est marqué comme courant

#### Scenario: Écran étroit
- **WHEN** une page du site est affichée sur un écran de 390 px de large
- **THEN** les cinq onglets sont visibles, libellés entiers, sans défilement horizontal

### Requirement: Équipe affichée
La page SHALL porter sur une seule équipe, choisie dans cet ordre : l'équipe désignée dans l'adresse de la page, sinon la dernière équipe consultée sur cet appareil, sinon la première équipe suivie depuis l'accueil. Sans aucune des trois, la page MUST se limiter à la liste de choix et à une invitation à choisir une équipe. Une équipe désignée qui n'existe pas dans les rencontres publiées est traitée comme absente, sans message d'erreur.

#### Scenario: Lien partagé
- **WHEN** un visiteur ouvre un lien de la page qui désigne une équipe
- **THEN** la page montre cette équipe, même s'il ne la suit pas et ne l'a jamais consultée

#### Scenario: Retour par l'onglet
- **WHEN** un visiteur a consulté une équipe, puis revient plus tard sur la page par l'onglet, sans équipe dans l'adresse
- **THEN** la page montre cette même équipe

#### Scenario: Première visite d'un visiteur qui suit des équipes
- **WHEN** un visiteur qui suit deux équipes ouvre la page pour la première fois, sans équipe dans l'adresse
- **THEN** la page montre la première de ses équipes suivies

#### Scenario: Première visite sans équipe suivie
- **WHEN** un visiteur qui ne suit aucune équipe ouvre la page pour la première fois, sans équipe dans l'adresse
- **THEN** la page montre seulement la liste de choix et une invitation à choisir une équipe

#### Scenario: Équipe introuvable
- **WHEN** l'adresse désigne une équipe absente des rencontres publiées
- **THEN** la page se comporte comme si aucune équipe n'était désignée, sans message d'erreur

### Requirement: Choix de l'équipe
La page SHALL proposer, en tête, une liste déroulante de toutes les équipes engagées, hors clubs fictifs de la ligue (dont « Equipe à désigner »). Les équipes suivies depuis l'accueil y figurent d'abord, dans un groupe « Mes équipes », puis toutes les équipes, regroupées par série et triées par club puis par numéro. Choisir une équipe MUST l'afficher sans recharger les données et mettre à jour l'adresse de la page, pour que le lien se partage tel quel.

#### Scenario: Changer d'équipe
- **WHEN** le visiteur choisit une autre équipe dans la liste
- **THEN** la page montre cette équipe, l'adresse la désigne, et aucun appel réseau n'est émis

#### Scenario: Équipes suivies en tête
- **WHEN** le visiteur suit une équipe de 2e série et ouvre la liste
- **THEN** cette équipe apparaît dans le groupe « Mes équipes », en tête de liste, et aussi à sa place dans sa série

#### Scenario: Pas d'équipe fictive
- **WHEN** le visiteur parcourt la liste
- **THEN** « Equipe à désigner » n'y figure pas

### Requirement: Dernière équipe mémorisée sur l'appareil
La dernière équipe consultée SHALL être conservée dans le navigateur du visiteur d'une visite à l'autre. Elle MUST ne jamais être transmise à un serveur. Si le stockage du navigateur est indisponible, la page fonctionne sans cette mémoire et sans message d'erreur.

#### Scenario: Stockage indisponible
- **WHEN** le navigateur refuse le stockage local et que le visiteur ouvre la page sans équipe dans l'adresse
- **THEN** la page s'affiche normalement, avec la liste de choix et l'invitation

### Requirement: Prochaine partie
La page SHALL mettre en avant la prochaine partie à venir de l'équipe, toutes phases confondues : jour, heure, adversaire et lieu. Quand cette partie n'a pas de score et se joue au Trinquet Paris, elle MUST porter le bouton « Chercher une date de report », qui mène à la page de report de cette partie. Une équipe sans partie à venir est indiquée « plus de partie programmée ».

#### Scenario: Prochaine partie au Trinquet Paris
- **WHEN** la prochaine partie de l'équipe se joue dimanche à 16h au Trinquet Paris
- **THEN** la page la met en avant avec son jour, son heure, son adversaire et son lieu, et le bouton de report ouvre la page de report de cette partie

#### Scenario: Prochaine partie ailleurs
- **WHEN** la prochaine partie de l'équipe se joue dans un autre trinquet
- **THEN** elle est mise en avant sans bouton de report

#### Scenario: Plus de partie
- **WHEN** l'équipe n'a plus aucune partie à venir
- **THEN** la page indique « plus de partie programmée » à la place de la prochaine partie

### Requirement: Parties de l'équipe
La page SHALL lister toutes les parties de l'équipe, toutes phases confondues, dans l'ordre chronologique : date et heure, adversaire, phase ou poule, lieu, et score du point de vue de l'équipe, en vert si elle l'emporte et en rouge sinon. Une partie sans score est marquée « à venir ». Les parties sans score au Trinquet Paris portent le bouton de report, comme dans la page Parties.

#### Scenario: Partie gagnée
- **WHEN** l'équipe a gagné une partie 40 à 32 en tant que visiteur
- **THEN** la ligne affiche « 40 - 32 » en vert

#### Scenario: Partie sans date lisible
- **WHEN** une partie de l'équipe n'a pas de date lisible
- **THEN** elle figure en fin de liste, avec « date à venir »

### Requirement: Bilan et forme
La page SHALL donner le bilan de l'équipe sur toutes ses parties jouées, toutes phases confondues : nombre de parties jouées, gagnées, perdues, à venir, et points marqués et encaissés. Elle SHALL aussi montrer sa forme : le résultat (G ou P) de ses cinq dernières parties jouées, de la plus ancienne à la plus récente. Une équipe qui n'a encore rien joué est indiquée « aucune partie jouée », sans forme.

#### Scenario: Équipe en cours de saison
- **WHEN** l'équipe a joué sept parties, gagné les deux dernières et perdu les trois précédentes
- **THEN** la forme affiche P, P, P, G, G

#### Scenario: Moins de cinq parties jouées
- **WHEN** l'équipe a joué deux parties
- **THEN** la forme n'affiche que ces deux résultats

#### Scenario: Aucune partie jouée
- **WHEN** l'équipe n'a encore joué aucune partie
- **THEN** le bilan indique « aucune partie jouée » et la forme n'apparaît pas

### Requirement: Classement de la poule
Quand l'équipe a joué ou doit jouer en phase de poules, la page SHALL afficher le classement complet de sa poule, calculé et présenté comme sur la page Classement : même barème, même ordre, mêmes équipes non classées en fin de table, et le trait des qualifiés après le 4e. La ligne de l'équipe MUST être mise en évidence, et son rang donné en clair au-dessus de la table (par exemple « 3e sur 6, poule 2 », ou « pas encore classée »). Une équipe sans partie de poule n'a pas cette section.

#### Scenario: Même classement que la page Classement
- **WHEN** le visiteur compare la table de la poule avec celle de la page Classement, vue par poule
- **THEN** les équipes, leur ordre et leurs chiffres sont identiques

#### Scenario: Ligne de l'équipe
- **WHEN** l'équipe est 3e de sa poule de 6
- **THEN** sa ligne est mise en évidence et la page indique « 3e sur 6, poule 2 »

#### Scenario: Équipe pas encore classée
- **WHEN** l'équipe n'a encore joué aucune partie de poule
- **THEN** la table de la poule s'affiche, l'équipe y figure sans rang et la page indique « pas encore classée »

### Requirement: Composition de l'équipe
La page SHALL afficher la composition déclarée à la ligue, avec les noms des joueurs seuls. Elle MUST ne jamais afficher de numéro de licence ni de coordonnées. Une équipe sans composition déclarée l'indique explicitement. Si la composition ne peut pas être chargée, le reste de la page s'affiche normalement.

#### Scenario: Composition déclarée
- **WHEN** l'équipe a une composition déclarée
- **THEN** la page en liste les noms de joueurs, sans licence ni contact

#### Scenario: Composition non déclarée
- **WHEN** l'équipe n'a pas de composition déclarée
- **THEN** la page indique « Composition non déclarée à la ligue »

#### Scenario: Composition indisponible
- **WHEN** le chargement des compositions échoue
- **THEN** les parties, le bilan et le classement s'affichent, sans la composition

### Requirement: Reste à jouer dans la poule
Quand la poule de l'équipe compte encore des parties sans score qui ne l'impliquent pas, la page SHALL les lister dans l'ordre chronologique : date et heure, et les deux équipes. Sinon, la section n'apparaît pas.

#### Scenario: Parties restantes dans la poule
- **WHEN** il reste trois parties de poule à jouer entre d'autres équipes de la poule
- **THEN** la page liste ces trois parties, et pas celles de l'équipe, déjà listées dans ses parties

#### Scenario: Poule terminée
- **WHEN** toutes les autres parties de la poule ont un score
- **THEN** la section n'apparaît pas
