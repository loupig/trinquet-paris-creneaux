# Spec Delta

## MODIFIED Requirements

### Requirement: Noms de joueurs seuls
Les noms de joueurs SHALL n'apparaître qu'aux endroits suivants, sous la forme « Prénom Nom » :
- sur l'accueil, entre crochets après chaque équipe ;
- sur la page d'une équipe (page Équipes), sous chaque équipe ;
- sur la liste de toutes les équipes (page Équipes) et sur le Classement, au toucher de la ligne d'une équipe ;
- sur Parties et Créneaux, au détail d'une partie ;
- dans les communications du mode organisateur de la page Équipes (spec `communications-equipes`), dont le message des phases finales (spec `liste-equipes`), pour les équipes qu'elles nomment.

En dehors de ces communications, ils MUST NOT entrer dans un texte ou une image à partager. Une page MUST NOT afficher de numéro de licence, d'adresse, de date de naissance ni aucune autre coordonnée d'un joueur. Le nom du responsable d'une équipe, qui n'est pas un joueur à ce titre, peut apparaître : en clair sur Report, en info-bulle sur Parties et Report, dans le message WhatsApp prérempli de Parties, et dans les communications « Prochaine partie » et « Perso » de la page Équipes ; ces messages peuvent aussi donner le nom et le numéro du responsable adverse. Le message des phases finales ne contient ni nom ni numéro de responsable.

#### Scenario: Détail d'une partie
- **WHEN** un visiteur déplie une partie dont les équipes ont déclaré leurs joueurs
- **THEN** il voit les noms et prénoms des joueurs, et aucun autre renseignement sur eux

#### Scenario: Pages sans joueurs
- **WHEN** un visiteur consulte le Report ou le Compteur, ou partage les parties de l'accueil
- **THEN** aucun nom de joueur issu des données de la ligue n'y apparaît

#### Scenario: Message des phases finales
- **WHEN** le visiteur partage le message des phases finales d'une demie dont les équipes ont déclaré leurs joueurs
- **THEN** le message nomme ces joueurs, et ne contient ni licence, ni nom ou numéro de responsable

#### Scenario: Liste repliée
- **WHEN** un visiteur ouvre la liste de toutes les équipes sans toucher aucune ligne ni le bouton « Message aux équipes »
- **THEN** aucun nom de joueur n'est visible

#### Scenario: Communication « Prochaine partie »
- **WHEN** l'organisateur envoie « Prochaine partie » à une équipe dont l'adversaire a déclaré ses joueurs et son responsable
- **THEN** le message nomme les joueurs adverses et le responsable adverse avec son numéro, et ne contient aucune licence

### Requirement: Numéro des responsables jamais écrit
Les pages qui permettent de joindre le responsable d'une équipe SHALL le faire par des boutons ou icônes (Appeler, SMS, WhatsApp) qui ouvrent l'application correspondante. Le numéro du responsable MUST NOT être écrit dans le texte d'aucune page : l'aperçu d'une communication de la page Équipes le masque sauf ses deux derniers chiffres, et seul le message envoyé ou partagé le porte en entier. Sans numéro exploitable, la page ne propose pas ces boutons.

#### Scenario: Contacts sur une page
- **WHEN** un visiteur consulte une page qui propose de joindre un responsable
- **THEN** aucun numéro de téléphone n'est lisible dans la page

#### Scenario: Aperçu d'une communication
- **WHEN** l'organisateur affiche l'aperçu de « Prochaine partie » pour une équipe dont l'adversaire a un responsable joignable
- **THEN** le numéro de ce responsable n'est lisible dans la page que masqué, sauf ses deux derniers chiffres

### Requirement: Préférences gardées sur l'appareil
Ce que le site retient d'une visite à l'autre (équipes suivies, filtres, état des blocs repliables, partie du compteur, texte de la communication « Perso », données de la ligue) SHALL rester dans le navigateur du visiteur. Il n'y a pas de compte, rien de tout cela n'est envoyé, et ces préférences ne suivent pas le visiteur d'un appareil à l'autre.

#### Scenario: Autre appareil
- **WHEN** un visiteur qui suit deux équipes sur son téléphone ouvre le site sur un ordinateur
- **THEN** l'ordinateur ne connaît pas ses équipes suivies
