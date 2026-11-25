# Spec Delta

## Purpose

Servir le site sous une adresse à la ligue, capable d'accueillir plus tard un serveur sur la même origine, sans perdre les joueurs de l'ancienne adresse ni leurs préférences.

## ADDED Requirements

### Requirement: Pages servies telles quelles
Le site SHALL être servi sous le domaine de la ligue à partir des fichiers de la branche `main`, sans étape de construction : une page publiée est octet pour octet celle du dépôt. Le site MUST être servi en HTTPS uniquement.

#### Scenario: Mise en ligne
- **WHEN** un changement d'une page est fusionné sur `main`
- **THEN** la page servie sous le domaine de la ligue est celle du dépôt, en moins de cinq minutes

#### Scenario: Adresse en HTTP
- **WHEN** un visiteur ouvre une page du site en `http://`
- **THEN** il est renvoyé vers la même page en `https://`

### Requirement: Prévisualisation par branche
Chaque branche poussée SHALL être servie à sa propre adresse de prévisualisation, distincte de la production, pour être ouverte sur un téléphone avant la fusion. Une prévisualisation MUST NOT être indexée par les moteurs de recherche.

#### Scenario: Revue d'une PR sur téléphone
- **WHEN** une branche est poussée et sa PR ouverte
- **THEN** une adresse de prévisualisation sert les pages de cette branche, et la production reste inchangée

### Requirement: Page introuvable
Une adresse inconnue sous le domaine SHALL afficher la page « introuvable » du site, avec ses liens vers l'accueil et la présentation, qui pointent vers la racine du domaine.

#### Scenario: Lien cassé
- **WHEN** un visiteur ouvre une adresse inconnue du site
- **THEN** la page « introuvable » s'affiche, et « Revenir à l'accueil » ouvre l'accueil du domaine

### Requirement: Redirection de l'ancienne adresse
Chaque page de l'ancienne adresse (`loupig.github.io/trinquet-paris-creneaux/`) SHALL renvoyer aussitôt vers la même page du domaine de la ligue, en gardant la requête et l'ancre, sans s'inscrire dans l'historique. Une adresse inconnue de l'ancien site renvoie vers la page « introuvable » du nouveau. Cette redirection MUST rester en place au moins jusqu'à la fin de la saison 2027-2028.

#### Scenario: Lien partagé d'une équipe
- **WHEN** un joueur ouvre un ancien lien `…/trinquet-paris-creneaux/equipe.html?equipe=X`
- **THEN** la page de l'équipe X s'ouvre sous le domaine de la ligue, et le bouton Retour ne ramène pas à l'ancienne adresse

### Requirement: Préférences emportées
À la redirection, les préférences gardées sur l'appareil à l'ancienne adresse (équipes suivies, thème, filtres, pli des filtres, partie du compteur, présentation vue, carte d'avis fermée, texte « Perso » et mode organisateur) SHALL être transmises une fois au nouveau domaine. Une préférence déjà présente sur le nouveau domaine MUST NOT être écrasée. Le cache des données de la ligue MUST NOT être transmis.

#### Scenario: Joueur qui suit deux équipes
- **WHEN** un joueur qui suit deux équipes à l'ancienne adresse l'ouvre pour la première fois depuis la migration
- **THEN** l'accueil du nouveau domaine montre ses deux équipes suivies, sans qu'il ait rien refait

#### Scenario: Préférence déjà choisie
- **WHEN** un joueur a déjà choisi le thème sombre sur le nouveau domaine, puis ouvre un ancien favori où le thème était clair
- **THEN** le nouveau domaine reste en sombre

### Requirement: Transfert sans trace
Les préférences transmises SHALL ne passer que par l'ancre de l'adresse, jamais par la requête, pour ne pas être envoyées au serveur ni journalisées. Elles MUST être effacées de l'adresse dès leur reprise, avant toute autre action de la page, et MUST NOT être reprises si leur contenu n'a pas la forme attendue d'une clé connue.

#### Scenario: Adresse après reprise
- **WHEN** la page du nouveau domaine a repris des préférences transmises
- **THEN** son adresse ne porte plus l'ancre de transfert, et un favori ou un partage fait ensuite ne la contient pas

#### Scenario: Contenu inattendu
- **WHEN** l'ancre de transfert contient une clé inconnue ou une valeur mal formée
- **THEN** cette clé n'est pas écrite sur l'appareil, la page s'affiche normalement, et l'ancre est effacée
