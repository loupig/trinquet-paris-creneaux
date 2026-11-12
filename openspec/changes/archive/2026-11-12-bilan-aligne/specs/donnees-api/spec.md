# Spec Delta

## MODIFIED Requirements

### Requirement: Noms de joueurs seuls
Les noms de joueurs SHALL n'apparaître qu'aux endroits suivants, sous la forme « Prénom Nom » :
- sur l'accueil, entre crochets après chaque équipe ;
- sur Mes équipes, sous chaque équipe ;
- sur le Classement et le Bilan, au toucher de la ligne d'une équipe dans le classement d'une poule ;
- sur Parties et Créneaux, au détail d'une partie.

Ils MUST NOT entrer dans un texte ou une image à partager. Une page MUST NOT afficher de numéro de licence, d'adresse, de date de naissance ni aucune autre coordonnée d'un joueur. Le nom du responsable d'une équipe, qui n'est pas un joueur à ce titre, peut apparaître : en clair sur Report, en info-bulle sur Parties et Report, et dans le message WhatsApp prérempli de Parties et du Bilan ; ces deux messages donnent aussi le nom et le numéro du responsable adverse.

#### Scenario: Détail d'une partie
- **WHEN** un visiteur déplie une partie dont les équipes ont déclaré leurs joueurs
- **THEN** il voit les noms et prénoms des joueurs, et aucun autre renseignement sur eux

#### Scenario: Pages sans joueurs
- **WHEN** un visiteur consulte le Report ou le Compteur, ou partage les parties de l'accueil
- **THEN** aucun nom de joueur issu des données de la ligue n'y apparaît

#### Scenario: Bilan sans crochets
- **WHEN** un visiteur ouvre le Bilan
- **THEN** aucun nom de joueur ne s'affiche, ni aux trophées, ni au bloc Mes équipes, ni au tableau final, tant qu'il n'a pas touché une ligne de classement
