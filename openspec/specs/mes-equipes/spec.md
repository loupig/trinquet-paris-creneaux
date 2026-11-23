# mes-equipes Specification

## Purpose

Permettre au visiteur de désigner les équipes qu'il suit, sans compte, depuis la page de l'équipe elle-même (onglet « Équipes »), pour que l'accueil lui montre d'abord leur prochaine partie et leur rang. Le choix a d'abord vécu dans un panneau à cases de l'accueil : il a été déplacé parce que son principe restait difficile à comprendre loin de l'équipe concernée.

## Requirements

### Requirement: Suivre l'équipe affichée
Sur la page Équipes, l'en-tête de l'équipe affichée SHALL porter un bouton « ☆ Suivre » qui ajoute l'équipe aux équipes suivies et devient « ★ Suivie » ; le toucher à nouveau cesse de la suivre. Tant que l'équipe n'est pas suivie, une phrase sous l'en-tête dit ce que le suivi apporte : l'équipe s'affiche en tête de l'accueil, avec sa prochaine partie et son rang, et ressort sur le Classement. C'est le seul endroit du site où l'on choisit ses équipes, et le choix se fait dans la page, jamais dans un popup. Les clubs fictifs de la ligue (dont « Equipe à désigner ») ne peuvent pas être suivis, la page ne les proposant pas.

#### Scenario: Suivre son équipe
- **WHEN** le visiteur affiche Charlie (éq. 1) sur la page Équipes et touche « ☆ Suivre »
- **THEN** le bouton devient « ★ Suivie », la phrase d'explication disparaît, et l'accueil montre Charlie (éq. 1) dans son bloc « Mes équipes »

#### Scenario: Ne plus suivre
- **WHEN** le visiteur touche « ★ Suivie » sur une équipe suivie
- **THEN** elle n'est plus suivie : elle disparaît du bloc « Mes équipes » de l'accueil et n'est plus repérée dans « D'ici dimanche »

### Requirement: Passer d'une équipe suivie à l'autre
En tête de la page Équipes, au-dessus de la liste de toutes les équipes comme au-dessus d'une équipe affichée, la page SHALL montrer une pastille par équipe suivie, dans l'ordre où elles ont été suivies, avec son nom et sa série ; la pastille de l'équipe affichée est mise en évidence, et toucher une autre pastille affiche cette équipe sans recharger les données. Les pastilles n'apparaissent pas quand aucune équipe n'est suivie, ni quand la seule équipe suivie est celle affichée.

#### Scenario: Deux équipes suivies
- **WHEN** le visiteur suit deux équipes et touche la pastille de la seconde
- **THEN** la page montre la seconde équipe, et sa pastille est mise en évidence

#### Scenario: Pastilles au-dessus de la liste
- **WHEN** le visiteur suit une équipe et ouvre la page Équipes par l'onglet
- **THEN** la pastille de son équipe est en tête de la page, au-dessus de la liste, et la toucher affiche son équipe

### Requirement: Choix mémorisé sur l'appareil
Le choix SHALL être conservé dans le navigateur du visiteur d'une visite à l'autre, sans compte, et lu par l'accueil et le Classement. Il MUST ne jamais être transmis à un serveur. Si le stockage du navigateur est indisponible, le site fonctionne sans équipe suivie, sans message d'erreur.

#### Scenario: Retour sur le site
- **WHEN** le visiteur revient sur l'accueil le lendemain, sur le même navigateur
- **THEN** ses équipes suivies sont toujours là

#### Scenario: Stockage indisponible
- **WHEN** le navigateur refuse le stockage local (navigation privée stricte)
- **THEN** l'accueil s'affiche normalement, avec l'invitation à suivre son équipe

#### Scenario: Aucune donnée envoyée
- **WHEN** le visiteur suit ou cesse de suivre une équipe
- **THEN** aucun appel réseau n'est émis à cette occasion

### Requirement: Bloc Mes équipes de l'accueil
Pour chaque équipe suivie, le bloc « Mes équipes » de l'accueil SHALL tenir sur une ligne à la façon du Classement : son rang de poule dans un rond, aux couleurs du podium pour les trois premiers (« – » sans rang), son nom court, puis son rang en clair (par exemple « 3e sur 6, poule 2 »), calculé comme sur la page Classement, et sa prochaine partie à venir (jour, heure, adversaire), même au-delà de dimanche, enfin sa série en pastille et un chevron. Une équipe sans partie jouée est indiquée « pas encore classée ». Une équipe sans partie à venir est indiquée « plus de partie programmée ». Toucher la ligne déplie, sur un fond teinté, les joueurs déclarés à la ligue pour l'équipe (« Composition non déclarée à la ligue » sans composition) et le lien « Voir l'équipe → », qui ouvre la page Équipes sur cette équipe ; un second toucher replie. Un lien « Gérer → » ouvre la page Équipes pour suivre ou retirer des équipes. Le bloc ne permet pas de choisir ses équipes lui-même.

#### Scenario: Équipe en cours de saison
- **WHEN** une équipe suivie est 3e de sa poule de 6 et joue dimanche à 16h
- **THEN** le bloc affiche « 3 » dans un rond couleur bronze, son rang « 3e sur 6, poule 2 » et sa prochaine partie « dim. 11 oct. 16h » avec l'adversaire

#### Scenario: Ouvrir une équipe suivie
- **WHEN** le visiteur touche la ligne d'une équipe suivie sur l'accueil, puis « Voir l'équipe → »
- **THEN** la ligne déplie d'abord les joueurs de l'équipe, puis la page Équipes s'ouvre sur cette équipe

#### Scenario: Équipe pas encore classée
- **WHEN** une équipe suivie n'a encore joué aucune partie
- **THEN** le bloc indique « pas encore classée » à la place du rang

#### Scenario: Plus de partie
- **WHEN** une équipe suivie n'a plus aucune partie à venir
- **THEN** le bloc indique « plus de partie programmée »

#### Scenario: Équipe disparue des données
- **WHEN** une équipe suivie n'existe plus dans les rencontres publiées
- **THEN** elle n'apparaît ni dans le bloc ni dans les pastilles, sans message d'erreur

### Requirement: Invitation sans équipe suivie
Tant qu'aucune équipe n'est suivie, le bloc « Mes équipes » de l'accueil SHALL se réduire à une tuile « Suivre une équipe → » qui ouvre la page Équipes, avec une phrase qui dit comment faire : choisir son équipe, puis toucher « ☆ Suivre ».

#### Scenario: Première visite
- **WHEN** un visiteur ouvre l'accueil pour la première fois
- **THEN** il voit la tuile « Suivre une équipe → », et la toucher ouvre la page Équipes
