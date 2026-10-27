# compteur Specification

## Purpose

Marquer sur place, au bord du trinquet, les points d'une partie entre deux équipes jusqu'au score visé, suivre son déroulé sur un graphe, retrouver la partie en cours après un rechargement et, si on le choisit, envoyer le score à son groupe ; rien d'autre ne quitte le navigateur.

## Requirements

### Requirement: Équipes de la partie
La page SHALL laisser nommer librement les deux équipes, en 24 caractères au plus. Par défaut, elles s'appellent « Équipe 1 » et « Équipe 2 ». Un nom effacé est remplacé par « Équipe 1 » ou « Équipe 2 » sur le bouton de score et dans la légende du graphe. Un changement de nom se répercute aussitôt sur le score et le graphe.

#### Scenario: Nommer une équipe
- **WHEN** une partie est entamée, en mode Scores, et le visiteur tape le nom d'un club dans le champ de la première équipe
- **THEN** le bouton de score et la légende du graphe portent ce nom

#### Scenario: Nom effacé
- **WHEN** le visiteur vide le champ de la seconde équipe
- **THEN** le bouton de score affiche « Équipe 2 »

### Requirement: Couleurs d'équipe
Chaque équipe SHALL prendre une couleur parmi quatre, celles de l'ikurriña plus le noir : rouge, vert, blanc et noir, ou, en dernier choix, une couleur libre prise au sélecteur du téléphone. Par défaut, la première équipe est rouge et la seconde verte. Choisir une des quatre couleurs de l'autre équipe MUST échanger les couleurs des deux équipes, et une couleur libre identique à celle de l'autre équipe fait changer l'autre, pour que deux équipes n'aient jamais la même couleur. Une couleur libre trop proche de celle de l'autre équipe n'est pas interdite, mais un avertissement le signale. Pour le texte, les bordures et les courbes, le blanc s'affiche en gris et le vert en vert foncé, et une couleur libre trop claire est foncée jusqu'à rester lisible sur fond blanc (éclaircie sur le fond noir du thème sombre).

#### Scenario: Choisir la couleur de l'adversaire
- **WHEN** l'équipe 1 est rouge, l'équipe 2 verte, et le visiteur choisit le vert pour l'équipe 1
- **THEN** l'équipe 1 devient verte et l'équipe 2 rouge

#### Scenario: Équipe en blanc
- **WHEN** une équipe a la couleur blanche
- **THEN** son nom, son score et sa courbe sont tracés en gris

#### Scenario: Couleur du club
- **WHEN** le visiteur choisit un jaune vif au sélecteur pour l'équipe 2
- **THEN** sa pastille et le fond de son bouton prennent ce jaune, et son nom et son score s'écrivent dans un jaune foncé lisible

#### Scenario: Couleurs voisines
- **WHEN** les deux équipes ont deux violets très proches
- **THEN** un avertissement signale que le score et le graphe seront difficiles à distinguer

### Requirement: Score à atteindre
Avant ou pendant la partie, la page SHALL laisser choisir le score à atteindre parmi 30, 35 et 40 points, ou « Libre » pour compter sans fin. Par défaut, une partie se joue en 40, comme en championnat. En cours de partie, un score déjà atteint par l'une des équipes MUST NOT être proposé, pour ne pas désigner un vainqueur après coup.

#### Scenario: Partie d'entraînement
- **WHEN** le visiteur choisit « Libre »
- **THEN** les points s'ajoutent sans fin de partie

### Requirement: Réglages repliés pendant la partie
Les noms, les couleurs et le score à atteindre SHALL être ouverts tant qu'aucun point n'est marqué, puis repliés dès le premier point, sous une ligne qui les résume (« Bera contre Ahetze · en 40 ») et qui les déplie dans la page. Partie lancée, les deux boutons de score MUST occuper l'essentiel de l'écran, pour être touchés sans viser.

#### Scenario: Premier point
- **WHEN** le visiteur marque le premier point d'une partie
- **THEN** les réglages se replient et les boutons de score s'agrandissent

### Requirement: Marquer un point
Chaque équipe SHALL avoir un grand bouton qui lui ajoute un point, et qui montre son nom, son score, ce score écrit en basque, comme le chante le kantari (37 : « hogeita hamazazpi »), et les points qui lui manquent (« encore 6 »). À un point du score visé, l'équipe affiche « Nobia », la balle de partie en basque. La mention « dernier point » apparaît sous l'équipe qui a marqué le dernier point. Chaque point est horodaté, et le téléphone vibre brièvement quand il le permet.

#### Scenario: Point marqué
- **WHEN** le visiteur touche le bouton de l'équipe 2 à 1-1, dans une partie en 40
- **THEN** le score passe à 1-2, « bi », « encore 38 » et « dernier point » apparaissent sous l'équipe 2

#### Scenario: Nobia
- **WHEN** l'équipe 1 atteint 39 dans une partie en 40
- **THEN** son bouton affiche « hogeita hemeretzi » et « Nobia »

### Requirement: Fin de partie
La première équipe à atteindre le score visé SHALL gagner la partie. Les boutons de score deviennent inactifs, l'équipe gagnante affiche « Victoire », et un encart annonce le vainqueur, le score, la durée de jeu, le nombre d'égalités et de changements de leader, avec les boutons « Partager le résultat » et « Nouvelle partie ». Annuler le point gagnant MUST relancer la partie là où elle en était.

#### Scenario: Point gagnant
- **WHEN** l'équipe 1 marque son 40e point à 40-37, dans une partie en 40
- **THEN** l'encart annonce « Victoire » de l'équipe 1, 40 à 37, et plus aucun point ne peut être marqué

#### Scenario: Point gagnant donné par erreur
- **WHEN** le visiteur annule le dernier point d'une partie terminée
- **THEN** l'encart disparaît et les points peuvent de nouveau être marqués

### Requirement: Écran gardé allumé
Pendant une partie en cours, la page SHALL demander au téléphone de garder l'écran allumé, quand il le permet, et le signaler dans la ligne de chronologie. La demande est relâchée à la fin de la partie, et reprise quand la page revient au premier plan.

#### Scenario: Téléphone posé entre deux points
- **WHEN** une partie est en cours et que personne ne touche l'écran pendant plusieurs minutes
- **THEN** l'écran reste allumé, sur un téléphone qui le permet

### Requirement: Partager le score
Dès qu'un point est marqué, la page SHALL permettre de partager le score, par la feuille de partage du téléphone (WhatsApp, SMS…) ou, à défaut, en le copiant. Le message donne les deux équipes et le score, le vainqueur ou l'état de la partie en cours, le score visé, la durée de jeu, les égalités et le plus gros écart, puis le lien vers la page Découvrir.

#### Scenario: Résultat envoyé au groupe
- **WHEN** à la fin d'une partie gagnée 40-37 par Bera contre Ahetze, le visiteur touche « Partager le résultat »
- **THEN** la feuille de partage reçoit « *Bera 40 – 37 Ahetze* », la victoire de Bera, et le lien vers la page Découvrir

#### Scenario: Sans feuille de partage
- **WHEN** le navigateur ne propose pas de feuille de partage
- **THEN** le message est copié et la page indique « Score copié, à coller »

### Requirement: Annuler le dernier point
La page SHALL permettre d'annuler le dernier point marqué, sans confirmation, autant de fois qu'il y a de points. Le bouton est inactif quand aucun point n'est marqué.

#### Scenario: Erreur de saisie
- **WHEN** le visiteur a donné un point à la mauvaise équipe et touche « Annuler le dernier point »
- **THEN** ce point disparaît du score et du graphe

### Requirement: Nouvelle partie
Le bouton « Nouvelle partie » SHALL effacer les points après confirmation, en conservant les noms et les couleurs des équipes. Il MUST rester loin des boutons de score et d'« Annuler le dernier point », pour qu'un toucher de trop n'efface pas une partie : en cours de jeu, il se trouve dans les réglages repliés ; partie finie, dans l'encart de fin. Il n'apparaît pas quand aucun point n'est marqué.

#### Scenario: Enchaîner une partie
- **WHEN** le visiteur touche « Nouvelle partie » puis confirme
- **THEN** le score revient à 0-0, avec les mêmes noms, les mêmes couleurs et le même score à atteindre, et les réglages se rouvrent

#### Scenario: Refus de la confirmation
- **WHEN** le visiteur touche « Nouvelle partie » puis annule la confirmation
- **THEN** la partie en cours reste intacte

### Requirement: Chronologie de la partie
Dès qu'un point est marqué, une ligne sous le score SHALL donner le nombre de points joués, la durée écoulée entre le premier et le dernier point dès qu'il y en a deux, et le temps écoulé depuis le dernier point. Elle se met à jour chaque seconde. Sans point, la ligne n'apparaît pas.

#### Scenario: Partie en cours
- **WHEN** 12 points ont été marqués et que le dernier remonte à 40 secondes
- **THEN** la ligne indique 12 points, la durée de la partie, et « dernier point il y a 40 s », qui avance chaque seconde

### Requirement: Plein écran à la demande
Un bouton « Plein écran » SHALL n'afficher que les deux boutons de score, aussi grands que l'écran le permet, sans en-tête ni barre d'onglets, avec en haut « Quitter », le score et le score visé, « Annuler » et le choix du thème. Partie gagnée, l'encart de fin s'y affiche aussi, sous les scores ou à côté en paysage. Le téléphone passe en plein écran quand il le permet. « Quitter » MUST rester visible et refermer le plein écran ; Échap, la sortie du plein écran par le téléphone et le bouton Retour le referment aussi, sans quitter la page.

#### Scenario: Compter en plein écran
- **WHEN** le visiteur touche « Plein écran » puis le bouton d'une équipe
- **THEN** le point est compté, et la barre du haut affiche le nouveau score

#### Scenario: Bouton Retour du téléphone
- **WHEN** le visiteur est en plein écran et fait Retour
- **THEN** le plein écran se referme et la page du compteur reste ouverte

### Requirement: Thème sombre en plein écran
Le plein écran SHALL proposer un thème clair et un thème sombre, fond noir, couleurs d'équipe éclaircies pour rester lisibles (le noir y devient gris clair). Sans choix, il suit le réglage du téléphone ; le choix est gardé d'une visite à l'autre.

#### Scenario: Passer en sombre
- **WHEN** le visiteur touche « Sombre » en plein écran
- **THEN** le fond devient noir, et le plein écran s'ouvrira en sombre aux visites suivantes

### Requirement: Graphe repliable
Le déroulé de la partie SHALL pouvoir se replier, sous une ligne qui garde l'essentiel (« 8 égalités · écart max 6 »), et se déplier dans la page. Replié ou ouvert, il le reste d'une visite à l'autre.

#### Scenario: Écran gardé pour le score
- **WHEN** le visiteur replie le déroulé puis recharge la page
- **THEN** le déroulé reste replié

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
Sous le graphe, en modes Scores et Écart, la page SHALL donner le plus gros écart de la partie, l'équipe qui en a bénéficié et le point où il est atteint pour la première fois, ainsi que le nombre de retours à égalité s'il y en a. Quand l'écart n'a jamais dépassé un point, le résumé indique « Jamais plus d'un point d'écart. ».

#### Scenario: Plus gros écart
- **WHEN** le plus gros écart de la partie, six points en faveur de l'équipe 1, est atteint pour la première fois au 18e point joué
- **THEN** le résumé indique un plus gros écart de 6 points pour l'équipe 1, au 18e point joué

#### Scenario: Partie serrée de bout en bout
- **WHEN** à 2-1, l'écart n'a jamais dépassé un point
- **THEN** le résumé indique « Jamais plus d'un point d'écart. »

### Requirement: Partie conservée sur l'appareil
La page SHALL retrouver, après un rechargement ou une fermeture du navigateur, la partie en cours : noms, couleurs, score à atteindre, points avec leur horodatage, mode du graphe, graphe replié ou non, et thème du plein écran. Une partie enregistrée avant le score à atteindre se relit en 40. Une seule partie est conservée, sans historique. Une partie enregistrée avant l'horodatage des points se relit sans durées plutôt que d'être perdue. Si l'enregistrement est illisible, la page repart d'une partie vide, sans message.

#### Scenario: Rechargement en pleine partie
- **WHEN** le visiteur recharge la page à 25-21
- **THEN** il retrouve 25-21, les mêmes équipes, le même graphe, et le temps depuis le dernier point reste juste

### Requirement: Rien ne quitte le navigateur
La page MUST NOT appeler l'API de la ligue ni envoyer de données à un service, et le dit en en-tête. Seul le message de score quitte la page, et seulement quand le visiteur le partage lui-même.

#### Scenario: Utilisation hors des données de la ligue
- **WHEN** le visiteur marque une partie complète sans la partager
- **THEN** aucune donnée de la partie ne quitte son navigateur
