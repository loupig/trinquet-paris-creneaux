# Spec Delta

## Purpose

Permettre au visiteur de désigner les équipes qu'il suit, sans compte, pour que l'accueil lui montre d'abord leur prochaine partie et leur rang.

## ADDED Requirements

### Requirement: Choix des équipes suivies
Le visiteur SHALL pouvoir choisir une ou plusieurs équipes à suivre parmi les équipes engagées, regroupées par série puis par club. Les clubs fictifs de la ligue (dont « Equipe à désigner ») ne sont pas proposés. Le choix se fait dans un panneau qui se déplie dans la page, jamais dans un popup, et se modifie à tout moment.

#### Scenario: Choisir deux équipes
- **WHEN** le visiteur ouvre le panneau de choix et coche deux équipes d'un même club
- **THEN** les deux équipes sont suivies, et le bloc « Mes équipes » les affiche

#### Scenario: Retirer une équipe
- **WHEN** le visiteur décoche une équipe suivie
- **THEN** elle disparaît du bloc « Mes équipes » et n'est plus repérée dans « D'ici dimanche »

#### Scenario: Pas d'équipe fictive
- **WHEN** le visiteur parcourt les équipes proposées
- **THEN** « Equipe à désigner » n'y figure pas

### Requirement: Choix mémorisé sur l'appareil
Le choix SHALL être conservé dans le navigateur du visiteur d'une visite à l'autre, sans compte. Il MUST ne jamais être transmis à un serveur. Si le stockage du navigateur est indisponible, l'accueil fonctionne sans équipe suivie, sans message d'erreur.

#### Scenario: Retour sur le site
- **WHEN** le visiteur revient sur l'accueil le lendemain, sur le même navigateur
- **THEN** ses équipes suivies sont toujours là

#### Scenario: Stockage indisponible
- **WHEN** le navigateur refuse le stockage local (navigation privée stricte)
- **THEN** l'accueil s'affiche normalement, avec l'invitation à choisir des équipes

#### Scenario: Aucune donnée envoyée
- **WHEN** le visiteur choisit ou modifie ses équipes
- **THEN** aucun appel réseau n'est émis à cette occasion

### Requirement: Bloc Mes équipes
Pour chaque équipe suivie, le bloc « Mes équipes » SHALL indiquer son nom court et sa série, sa prochaine partie à venir (jour, heure, adversaire), même au-delà de dimanche, et son rang dans sa poule en phase de poules (par exemple « 3e sur 6, poule 2 »), calculé comme sur la page Classement. Une équipe sans partie jouée est indiquée « pas encore classée ». Une équipe sans partie à venir est indiquée « plus de partie programmée ».

#### Scenario: Équipe en cours de saison
- **WHEN** une équipe suivie est 3e de sa poule de 6 et joue dimanche à 16h
- **THEN** le bloc affiche son rang « 3e sur 6, poule 2 » et sa prochaine partie « dim. 11 oct. 16h » avec l'adversaire

#### Scenario: Équipe pas encore classée
- **WHEN** une équipe suivie n'a encore joué aucune partie
- **THEN** le bloc indique « pas encore classée » à la place du rang

#### Scenario: Plus de partie
- **WHEN** une équipe suivie n'a plus aucune partie à venir
- **THEN** le bloc indique « plus de partie programmée »

#### Scenario: Équipe disparue des données
- **WHEN** une équipe suivie n'existe plus dans les rencontres publiées
- **THEN** elle n'apparaît pas dans le bloc, sans message d'erreur

### Requirement: Invitation sans équipe suivie
Tant qu'aucune équipe n'est suivie, le bloc « Mes équipes » SHALL se réduire à une ligne qui invite à en choisir et ouvre le panneau de choix.

#### Scenario: Première visite
- **WHEN** un visiteur ouvre l'accueil pour la première fois
- **THEN** il voit une ligne l'invitant à choisir ses équipes, et rien d'autre dans ce bloc
