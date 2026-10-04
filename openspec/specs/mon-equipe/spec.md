# mon-equipe Specification

## Purpose

Donner à chaque équipe engagée une page qui réunit tout ce qui la concerne : ses parties, son classement de poule, son bilan, sa forme et sa composition. La page est accessible par un onglet et se partage par un lien.

## Requirements

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

### Requirement: Objectif de qualification
Quand l'équipe joue en phase de poules, la carte Bilan SHALL indiquer ce qu'il lui faut pour finir parmi les 4 premiers de sa poule, qualifiés pour les quarts. Le calcul MUST tenir compte de toutes les issues possibles (victoire ou défaite) des parties de poule restantes, celles de l'équipe comme celles des autres, avec le barème et le critère de la page Classement (points par partie jouée). Le goal average ne se prévoit pas : une égalité de moyenne avec une concurrente compte contre l'équipe pour dire qu'une qualification est assurée, et pour elle pour dire qu'elle est possible. La page indique selon le cas :
- « qualifiée quoi qu'il arrive », quand aucune issue ne la sort des 4 premiers ;
- « éliminée », quand même en gagnant toutes ses parties restantes aucune issue ne la met dans les 4 premiers ;
- sinon, le nombre de victoires sur ses parties restantes qui assure la qualification, s'il existe, et le nombre minimum de victoires qui la laisse possible.

Quand la poule est terminée, la page indique « qualifiée » ou « éliminée » d'après le classement final. Au-delà de 20 parties de poule restantes, la page indique seulement le nombre de parties restantes, le calcul étant trop long. Une équipe sans partie de poule n'a pas cette ligne.

#### Scenario: Seuils de victoires
- **WHEN** l'équipe a 3 parties de poule à jouer, et que 2 victoires la mettent dans les 4 premiers quels que soient les autres résultats, alors qu'une seule victoire ne la qualifie que pour certains résultats des autres
- **THEN** la page indique que 2 victoires sur 3 assurent la qualification et qu'avec 1 victoire elle reste possible

#### Scenario: Qualifiée quoi qu'il arrive
- **WHEN** même en perdant toutes ses parties restantes, l'équipe reste dans les 4 premiers quelle que soit l'issue des autres parties
- **THEN** la page indique « qualifiée quoi qu'il arrive »

#### Scenario: Éliminée
- **WHEN** même en gagnant toutes ses parties restantes, au moins 4 équipes finissent devant elle dans toutes les issues
- **THEN** la page indique « éliminée »

#### Scenario: Qualification jamais assurée
- **WHEN** même en gagnant toutes ses parties restantes, l'équipe peut encore finir 5e selon les autres résultats
- **THEN** la page n'annonce aucun nombre de victoires qui assure la qualification, et donne le minimum de victoires qui la laisse possible

#### Scenario: Égalité de moyenne
- **WHEN** dans une issue, l'équipe termine à égalité de moyenne avec la 4e
- **THEN** cette issue ne compte pas pour une qualification assurée, mais compte pour une qualification possible, signalée « au goal average »

#### Scenario: Poule terminée
- **WHEN** toutes les parties de la poule ont un score et que l'équipe est 3e
- **THEN** la page indique « qualifiée »

#### Scenario: Trop de parties restantes
- **WHEN** il reste 21 parties à jouer dans la poule
- **THEN** la page indique le nombre de parties restantes, sans seuil de victoires

### Requirement: Rang dans la poule
Quand l'équipe a joué ou doit jouer en phase de poules, la page SHALL donner son rang en clair dans la carte du haut (par exemple « 3e sur 6, poule 2 », ou « pas encore classée »), calculé comme sur la page Classement : même barème, même ordre, mêmes équipes non classées. La page MUST NOT afficher la table complète de la poule, que donne la page Classement. Une équipe sans partie de poule n'a pas de rang.

#### Scenario: Même rang que la page Classement
- **WHEN** le visiteur compare le rang affiché avec la position de l'équipe dans sa poule sur la page Classement, vue par poule
- **THEN** les deux rangs et la taille de la poule sont identiques

#### Scenario: Équipe pas encore classée
- **WHEN** l'équipe n'a encore joué aucune partie de poule
- **THEN** la carte du haut indique « pas encore classée »

#### Scenario: Pas de table de poule
- **WHEN** le visiteur parcourt la page d'une équipe en phase de poules
- **THEN** aucune table listant les équipes de la poule n'apparaît

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

### Requirement: Fiche de l'adversaire
Pour chaque partie sans score de l'équipe, toutes phases confondues, la page SHALL présenter une fiche de l'adversaire : son rang dans sa poule (calculé comme sur la page Classement, ou « pas encore classée »), sa forme (résultats de ses cinq dernières parties jouées, de la plus ancienne à la plus récente) et sa composition déclarée, avec les noms seuls. La fiche apparaît sous la partie dans la liste des parties, et dans la carte « Prochaine partie ». Un adversaire pas encore désigné (club fictif de la ligue, « Equipe à désigner ») n'a pas de fiche. Si les compositions ne peuvent pas être chargées, la fiche s'affiche sans elles.

#### Scenario: Prochain adversaire
- **WHEN** l'équipe joue dimanche contre une équipe 2e de sa poule, qui a gagné ses deux dernières parties
- **THEN** la carte « Prochaine partie » et la ligne de cette partie montrent « 2e sur 7, poule 2 », sa forme et ses joueurs

#### Scenario: Adversaire à désigner
- **WHEN** l'équipe a une partie de phase finale contre « Equipe à désigner »
- **THEN** cette partie n'a pas de fiche d'adversaire

#### Scenario: Partie jouée
- **WHEN** une partie de l'équipe a un score
- **THEN** elle n'a pas de fiche d'adversaire

### Requirement: Contact du responsable adverse
Sur la fiche de l'adversaire, la page SHALL proposer trois boutons pour joindre le responsable de l'équipe adverse déclaré à la ligue : Appeler, SMS et WhatsApp. WhatsApp MUST s'ouvrir sur une conversation vide, sans message prérempli. La page MUST NOT afficher le numéro ni le nom du responsable. Sans numéro exploitable, aucun bouton n'apparaît, sans message d'erreur.

#### Scenario: Responsable joignable
- **WHEN** le responsable de l'équipe adverse a un numéro déclaré à la ligue
- **THEN** la fiche porte les boutons Appeler, SMS et WhatsApp vers ce numéro, et le bouton WhatsApp ouvre une conversation sans texte

#### Scenario: Pas de numéro
- **WHEN** l'équipe adverse n'a pas de numéro de responsable exploitable
- **THEN** la fiche s'affiche sans boutons de contact

#### Scenario: Numéro non affiché
- **WHEN** le visiteur lit la fiche d'un adversaire joignable
- **THEN** ni le numéro ni le nom du responsable n'apparaissent en clair dans la page
