# donnees-api Specification

## Purpose

Fixer comment les pages obtiennent les données de la ligue, comment elles réagissent quand ces données manquent, et quelles données personnelles elles peuvent montrer.

## Requirements

### Requirement: Source des données
Les pages Accueil, Mon équipe, Parties, Classement, Créneaux et Report SHALL lire, en lecture seule, une copie synchronisée des données publiées par la ligue, et indiquer dans leur en-tête la source (« site de la ligue », avec un lien) et la date de la dernière synchronisation de cette copie. Quand cette date est inconnue, l'en-tête indique « information indisponible ». La page Report ouverte sans partie désignée ne lit rien et indique « sans objet ». Aucune page ne modifie quoi que ce soit sur le site de la ligue.

#### Scenario: Date de synchronisation
- **WHEN** un visiteur ouvre la page Classement et que les données sont chargées
- **THEN** l'en-tête indique la date et l'heure de la dernière synchronisation

### Requirement: Données réutilisées d'une page à l'autre
Les données déjà obtenues SHALL être gardées dans le navigateur et réutilisées par les pages qui font la même demande (la page Créneaux fait ses propres demandes de rencontres, filtrées par lieu), pour que passer d'une page à l'autre n'impose pas d'attendre de nouveau la réponse de la ligue, qui prend environ deux secondes par appel. Une page affiche d'abord ce qu'elle a déjà, puis, si ces données ont plus de cinq minutes, les redemande en arrière-plan. Elle ne se redessine que si une nouvelle synchronisation a eu lieu depuis les données affichées ou si le nombre de lignes a changé, pour ne pas refermer ce que le visiteur vient d'ouvrir. Sinon, seule la date de l'en-tête est mise à jour. Sans données gardées, un squelette de chargement s'affiche pendant l'attente.

#### Scenario: Enchaîner deux pages
- **WHEN** un visiteur passe de la page Parties à la page Report deux minutes après avoir ouvert Parties
- **THEN** la page Report s'affiche sans attendre de nouvel appel pour les données déjà obtenues

#### Scenario: Données inchangées
- **WHEN** un visiteur a déplié une partie et que la revalidation en arrière-plan ne trouve ni nouvelle synchronisation ni changement du nombre de lignes
- **THEN** la partie reste dépliée

### Requirement: Rafraîchir
Le bouton « Rafraîchir » SHALL redemander toutes les données, quel que soit leur âge. Il obtient la copie de la dernière synchronisation, sans déclencher de nouvelle lecture du site de la ligue.

#### Scenario: Forcer la mise à jour
- **WHEN** un visiteur touche « Rafraîchir » une minute après son arrivée sur la page
- **THEN** la page redemande les données au lieu de se contenter de celles gardées

### Requirement: Échec avec des données gardées
Quand les données ne peuvent pas être obtenues, ou arrivent inexploitables, alors que la page dispose de données gardées, la page SHALL afficher ces données avec un bandeau « Données non rafraîchies » qui donne la cause de l'échec et la date à laquelle les données affichées ont été obtenues, en prévenant qu'elles peuvent être obsolètes.

#### Scenario: Source muette après une première visite
- **WHEN** un visiteur rouvre la page Parties alors que la source des données ne répond pas, après l'avoir consultée la veille
- **THEN** il voit le programme de la veille et le bandeau « Données non rafraîchies » daté

### Requirement: Échec sans données gardées
Quand les données ne peuvent pas être obtenues et que la page ne dispose d'aucune donnée gardée, la page MUST NOT afficher de contenu partiel. Elle affiche un bandeau d'erreur qui dit pourquoi rien n'est affiché, et l'en-tête indique « échec du chargement ». Afficher un calendrier, un classement ou des créneaux incomplets induirait en erreur : une grille vide serait lue comme « tout est libre ».

#### Scenario: Premier chargement impossible
- **WHEN** la page Classement est ouverte pour la première fois et que la source des données ne répond pas
- **THEN** la page n'affiche aucun classement, seulement un bandeau d'erreur

### Requirement: Compositions et contacts facultatifs
Les compositions d'équipe et les contacts des responsables SHALL être des données facultatives : si elles ne peuvent pas être obtenues, la page s'affiche sans elles, sans bandeau d'erreur.

#### Scenario: Compositions indisponibles
- **WHEN** les rencontres sont obtenues mais pas les compositions
- **THEN** la page Parties affiche le calendrier, et le détail des parties indique « composition non disponible »

### Requirement: Noms de joueurs seuls
Les noms de joueurs SHALL n'apparaître que sur les pages Parties et Créneaux (au détail d'une partie) et Mon équipe, sous la forme « Prénom Nom ». Une page MUST NOT afficher de numéro de licence, d'adresse, de date de naissance ni aucune autre coordonnée d'un joueur. Le nom du responsable d'une équipe, qui n'est pas un joueur à ce titre, peut apparaître : en clair sur Report, en info-bulle sur Parties et Report.

#### Scenario: Détail d'une partie
- **WHEN** un visiteur déplie une partie dont les équipes ont déclaré leurs joueurs
- **THEN** il voit les noms et prénoms des joueurs, et aucun autre renseignement sur eux

#### Scenario: Pages sans joueurs
- **WHEN** un visiteur consulte l'accueil, le Classement, le Report ou le Compteur
- **THEN** aucun nom de joueur issu des données de la ligue n'y apparaît

### Requirement: Numéro des responsables jamais écrit
Les pages qui permettent de joindre le responsable d'une équipe SHALL le faire par des boutons ou icônes (Appeler, SMS, WhatsApp) qui ouvrent l'application correspondante. Le numéro du responsable MUST NOT être écrit dans le texte d'aucune page. Sans numéro exploitable, la page ne propose pas ces boutons.

#### Scenario: Contacts sur une page
- **WHEN** un visiteur consulte une page qui propose de joindre un responsable
- **THEN** aucun numéro de téléphone n'est lisible dans la page

### Requirement: Préférences gardées sur l'appareil
Ce que le site retient d'une visite à l'autre (équipes suivies, dernière équipe consultée, filtres, état des blocs repliables, partie du compteur, données de la ligue) SHALL rester dans le navigateur du visiteur. Il n'y a pas de compte, rien de tout cela n'est envoyé, et ces préférences ne suivent pas le visiteur d'un appareil à l'autre.

#### Scenario: Autre appareil
- **WHEN** un visiteur qui suit deux équipes sur son téléphone ouvre le site sur un ordinateur
- **THEN** l'ordinateur ne connaît pas ses équipes suivies
