# Spec Delta

## ADDED Requirements

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

## REMOVED Requirements

### Requirement: Classement de la poule
**Reason**: La table complète de la poule faisait doublon avec la page Classement et allongeait la page ; le rang en clair suffit à situer l'équipe.
**Migration**: Le rang en clair est couvert par l'exigence « Rang dans la poule ». La table complète reste sur la page Classement.
