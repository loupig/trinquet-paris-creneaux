# Spec Delta

## MODIFIED Requirements

### Requirement: Noms de joueurs seuls
Les noms de joueurs SHALL n'apparaître qu'aux endroits suivants, sous la forme « Prénom Nom » :
- sur l'accueil, entre crochets après chaque équipe ;
- sur la page d'une équipe (page Équipes), sous chaque équipe ;
- sur la liste de toutes les équipes (page Équipes) et sur le Classement, au toucher de la ligne d'une équipe ;
- sur Parties et Créneaux, au détail d'une partie ;
- dans le message des phases finales de la page Équipes (spec `liste-equipes`), pour les équipes de ses parties.

En dehors du message des phases finales, ils MUST NOT entrer dans un texte ou une image à partager. Une page MUST NOT afficher de numéro de licence, d'adresse, de date de naissance ni aucune autre coordonnée d'un joueur. Le nom du responsable d'une équipe, qui n'est pas un joueur à ce titre, peut apparaître : en clair sur Report, en info-bulle sur Parties et Report, et dans le message WhatsApp prérempli de Parties ; ce message donne aussi le nom et le numéro du responsable adverse. Le message des phases finales ne contient ni nom ni numéro de responsable.

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
