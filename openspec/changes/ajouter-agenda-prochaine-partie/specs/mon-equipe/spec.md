# Spec Delta

## ADDED Requirements

### Requirement: Ajouter la prochaine partie à l'agenda
La carte « Prochaine partie » SHALL porter un bouton « Ajouter à mon agenda ». Ce bouton fait télécharger un fichier agenda (format iCalendar, `.ics`), construit dans le navigateur à partir des données déjà chargées, sans appel réseau. Le fichier contient un seul événement :
- son titre nomme les deux équipes, celle qui reçoit en premier, et la série ;
- il commence au jour et à l'heure de la partie, en heure de Paris, au jour du report quand la partie a été reportée, et dure 1 h 30 ;
- son lieu est celui de la partie ;
- sa description donne la série et la poule ou la phase, et un lien vers la page Mes équipes de l'équipe affichée ;
- il porte un rappel 24 heures avant ;
- son identifiant est tiré de celui de la partie, pour qu'un nouvel ajout de la même partie remplace l'événement dans les agendas qui le permettent.

Le fichier MUST NOT contenir de nom de joueur, ni le nom ou le numéro d'un responsable. Sans prochaine partie (« plus de partie programmée »), le bouton n'apparaît pas.

#### Scenario: Ajouter la prochaine partie
- **WHEN** le visiteur touche « Ajouter à mon agenda » sur la prochaine partie de Charlie 1, qui reçoit Foxtrot 1 en poule 1 de la série 1, jeudi à 19h30 au Trinquet Paris
- **THEN** l'appareil reçoit un fichier `.ics` dont l'événement s'intitule « Charlie 1 – Foxtrot 1 · Série 1 », commence jeudi à 19h30 heure de Paris, finit à 21h, a pour lieu le Trinquet Paris et porte un rappel 24 heures avant

#### Scenario: Partie reportée
- **WHEN** la prochaine partie a été reportée du mardi au jeudi suivant, à la même heure
- **THEN** l'événement commence le jeudi

#### Scenario: Aucune donnée personnelle
- **WHEN** le visiteur ajoute à son agenda une partie dont les deux équipes ont une composition et un responsable déclarés
- **THEN** le fichier ne contient ni nom de joueur, ni nom ou numéro de responsable

#### Scenario: Pas d'appel réseau
- **WHEN** le visiteur touche « Ajouter à mon agenda »
- **THEN** aucun appel réseau n'est émis

#### Scenario: Plus de partie programmée
- **WHEN** l'équipe n'a plus aucune partie à venir
- **THEN** le bouton « Ajouter à mon agenda » n'apparaît pas
