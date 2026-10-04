## Purpose

Marquer sur place les points d'une partie entre deux équipes, suivre son déroulé sur un graphe, et retrouver la partie en cours après un rechargement, sans rien envoyer à la ligue ni ailleurs.

## ADDED Requirements

### Requirement: Équipes de la partie
La page SHALL laisser nommer librement les deux équipes, en 24 caractères au plus. Par défaut, elles s'appellent « Équipe 1 » et « Équipe 2 ». Un nom effacé est remplacé par « Équipe 1 » ou « Équipe 2 » sur le bouton de score et dans la légende du graphe. Un changement de nom se répercute aussitôt sur le score et le graphe.

#### Scenario: Nommer une équipe
- **WHEN** une partie est entamée, en mode Scores, et le visiteur tape le nom d'un club dans le champ de la première équipe
- **THEN** le bouton de score et la légende du graphe portent ce nom

#### Scenario: Nom effacé
- **WHEN** le visiteur vide le champ de la seconde équipe
- **THEN** le bouton de score affiche « Équipe 2 »

### Requirement: Couleurs d'équipe imposées
Chaque équipe SHALL prendre une couleur parmi quatre, celles de l'ikurriña plus le noir : rouge, vert, blanc et noir. Par défaut, la première équipe est rouge et la seconde verte. Choisir la couleur de l'autre équipe MUST échanger les couleurs des deux équipes, pour que deux équipes n'aient jamais la même couleur et que le graphe reste lisible. Pour le texte, les bordures et les courbes, le blanc s'affiche en gris et le vert en vert foncé, parce que le blanc est invisible sur fond blanc et le vert de l'ikurriña trop clair pour du petit texte.

#### Scenario: Choisir la couleur de l'adversaire
- **WHEN** l'équipe 1 est rouge, l'équipe 2 verte, et le visiteur choisit le vert pour l'équipe 1
- **THEN** l'équipe 1 devient verte et l'équipe 2 rouge

#### Scenario: Équipe en blanc
- **WHEN** une équipe a la couleur blanche
- **THEN** son nom, son score et sa courbe sont tracés en gris

### Requirement: Marquer un point
Chaque équipe SHALL avoir un grand bouton qui lui ajoute un point, et qui montre son nom et son score. La mention « dernier point » apparaît sous l'équipe qui a marqué le dernier point. Chaque point est horodaté.

#### Scenario: Point marqué
- **WHEN** le visiteur touche le bouton de l'équipe 2 à 1-1
- **THEN** le score passe à 1-2 et « dernier point » apparaît sous l'équipe 2

### Requirement: Annuler le dernier point
La page SHALL permettre d'annuler le dernier point marqué, sans confirmation, autant de fois qu'il y a de points. Le bouton est inactif quand aucun point n'est marqué.

#### Scenario: Erreur de saisie
- **WHEN** le visiteur a donné un point à la mauvaise équipe et touche « Annuler le dernier point »
- **THEN** ce point disparaît du score et du graphe

### Requirement: Nouvelle partie
Le bouton « Nouvelle partie » SHALL effacer les points après confirmation, en conservant les noms et les couleurs des équipes. Il est inactif quand aucun point n'est marqué.

#### Scenario: Enchaîner une partie
- **WHEN** le visiteur touche « Nouvelle partie » puis confirme
- **THEN** le score revient à 0-0, avec les mêmes noms et les mêmes couleurs

#### Scenario: Refus de la confirmation
- **WHEN** le visiteur touche « Nouvelle partie » puis annule la confirmation
- **THEN** la partie en cours reste intacte

### Requirement: Chronologie de la partie
Dès qu'un point est marqué, une ligne sous le score SHALL donner le nombre de points joués, la durée écoulée entre le premier et le dernier point dès qu'il y en a deux, et le temps écoulé depuis le dernier point. Elle se met à jour chaque seconde. Sans point, la ligne n'apparaît pas.

#### Scenario: Partie en cours
- **WHEN** 12 points ont été marqués et que le dernier remonte à 40 secondes
- **THEN** la ligne indique 12 points, la durée de la partie, et « dernier point il y a 40 s », qui avance chaque seconde

### Requirement: Graphe en mode Scores
En mode « Scores », mode par défaut, le graphe SHALL tracer une courbe par équipe, à sa couleur, et une bande grise entre les deux, dont la largeur traduit l'écart. Une étoile marque chaque retour à égalité. Au-delà de douze égalités, seule une étoile sur N est tracée pour ne pas masquer les courbes, chaque étoile tracée restant une vraie égalité, et le résumé le signale.

#### Scenario: Partie serrée
- **WHEN** la partie compte vingt retours à égalité
- **THEN** le graphe en montre au plus douze, et le résumé indique que toutes ne sont pas marquées

### Requirement: Graphe en mode Écart
En mode « Écart », le graphe SHALL tracer la différence de score autour d'une ligne zéro, la courbe prenant la couleur de l'équipe qui mène.

#### Scenario: Changement de leader
- **WHEN** l'équipe 1 menait et que l'équipe 2 passe devant
- **THEN** la courbe croise la ligne zéro et prend la couleur de l'équipe 2

### Requirement: Graphe en mode Échanges
En mode « Échanges », le graphe SHALL tracer une barre par point, à partir du deuxième, à la couleur de l'équipe qui l'a gagné, de hauteur égale à la durée de l'échange. L'échelle MUST être plafonnée un peu au-dessus du 90e centile des durées (1,2 fois cette valeur, 5 secondes au minimum), pour qu'une pause entre deux jeux n'écrase pas les vrais échanges. Jusqu'à dix durées mesurées, cette valeur est la plus longue durée, et aucune barre ne dépasse. Au-delà, les barres plus hautes que le plafond touchent le haut et sont comptées à part dans le résumé. Le résumé donne l'échange médian plutôt que la moyenne, pour la même raison. Tant qu'aucune durée n'est mesurée, un message remplace le graphe.

#### Scenario: Pause entre deux jeux
- **WHEN** parmi au moins onze échanges mesurés, un seul a duré trois minutes, à cause d'une pause, alors que les autres durent une vingtaine de secondes
- **THEN** sa barre touche le haut du graphe, les autres restent lisibles, et le résumé compte une barre au-dessus de l'échelle

### Requirement: Résumé du déroulé
Sous le graphe, en modes Scores et Écart, la page SHALL donner le plus gros écart de la partie, l'équipe qui en a bénéficié et le point où il est atteint pour la première fois, ainsi que le nombre de retours à égalité s'il y en a.

#### Scenario: Plus gros écart
- **WHEN** le plus gros écart de la partie, six points en faveur de l'équipe 1, est atteint pour la première fois au 18e point joué
- **THEN** le résumé indique un plus gros écart de 6 points pour l'équipe 1, au 18e point joué

### Requirement: Partie conservée sur l'appareil
La page SHALL retrouver, après un rechargement ou une fermeture du navigateur, la partie en cours : noms, couleurs, points avec leur horodatage, et mode du graphe. Une seule partie est conservée, sans historique. Une partie enregistrée avant l'horodatage des points se relit sans durées plutôt que d'être perdue. Si l'enregistrement est illisible, la page repart d'une partie vide, sans message.

#### Scenario: Rechargement en pleine partie
- **WHEN** le visiteur recharge la page à 25-21
- **THEN** il retrouve 25-21, les mêmes équipes, le même graphe, et le temps depuis le dernier point reste juste

### Requirement: Rien ne quitte le navigateur
La page MUST NOT appeler l'API de la ligue ni envoyer de données à un service, et le dit en en-tête : tout reste dans le navigateur.

#### Scenario: Utilisation hors des données de la ligue
- **WHEN** le visiteur marque une partie complète
- **THEN** aucune donnée de la partie ne quitte son navigateur
