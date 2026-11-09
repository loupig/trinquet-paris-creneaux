# bilan Specification

## Purpose

Fêter la fin de la phase de poules par une page de bilan : quelques chiffres de la saison, des trophées pour chambrer au comptoir, le classement et les résultats de chaque poule, et le tableau final qui en découle. Une page qu'on parcourt et qu'on montre, ouverte depuis le Classement.

## Requirements

### Requirement: Page ouverte depuis le Classement
La page `bilan.html` SHALL n'être annoncée que par un lien « Bilan de la phase de poules » de la page Classement, et MUST NOT ajouter d'entrée à la barre d'onglets. Elle porte la barre d'onglets du site avec Classement comme onglet courant, les boutons flottants du haut (Site de la ligue, Rafraîchir, thème, compteur), le bouton « ↑ » et, en tête du contenu, un lien de retour vers le Classement. Elle porte le même aperçu de partage que les autres pages (spec `decouvrir`).

#### Scenario: Depuis le Classement
- **WHEN** un visiteur touche « Bilan de la phase de poules » sur la page Classement
- **THEN** le bilan s'ouvre, la barre d'onglets a toujours cinq entrées et l'onglet Classement est marqué courant

### Requirement: Données et classement
Le bilan SHALL lire les rencontres, les clubs et les compositions comme le Classement, avec le même cache, les mêmes bandeaux d'échec et la même date de synchronisation (spec `donnees-api`), et classer chaque poule selon la spec `calcul-classement`. Chaque équipe nommée au classement d'une poule, aux trophées, au bloc Mes équipes et au tableau final est suivie, entre crochets, des joueurs déclarés à la ligue pour elle, comme à l'accueil (spec `accueil`) : en retrait, sans gras, rien pour une équipe sans composition connue. Si les compositions ne peuvent être chargées, le bilan s'affiche sans les noms.

#### Scenario: Joueurs à côté de l'équipe
- **WHEN** un visiteur ouvre le bilan
- **THEN** chaque ligne de classement lit « Alpha (éq. 1) [Ane Exemple, Bixente Exemple] », suivie de son détail

#### Scenario: Premier chargement impossible
- **WHEN** le bilan est ouvert pour la première fois et que la source des données ne répond pas
- **THEN** la page n'affiche qu'un bandeau d'erreur « Impossible d'afficher le bilan »

### Requirement: Global puis par série
La page SHALL présenter d'abord le bilan global de la phase de poules, toutes séries confondues : l'affiche et ses chiffres, le bloc Mes équipes, puis les trophées toutes séries, où chaque équipe et chaque partie porte sa série. Viennent ensuite les séries, une à une : un titre « Bilan de la série » avec son état, ses quatre chiffres propres, ses trophées, ses poules et son tableau final.

#### Scenario: Ordre de lecture
- **WHEN** un visiteur fait défiler le bilan
- **THEN** il lit les chiffres et trophées toutes séries, puis ceux de la Série 1 et ses poules, puis la Série 2

### Requirement: Affiche de la phase de poules
En tête, la page SHALL afficher une affiche sur fond foncé qui dit où en sont les poules : « Les poules ont rendu leur verdict » avec le nombre de parties jouées et d'équipes qualifiées quand toutes les parties de poule ont un score, sinon « Dernière ligne droite » avec le nombre de parties encore à jouer et la date de la dernière prévue, le nombre de scores attendus pour les parties passées sans résultat publié, et la mention d'un bilan provisoire. Quatre chiffres suivent, sur toutes les séries (et les mêmes pour chaque série, en tête de la série) : les parties jouées et le nombre d'équipes, les points marqués et leur moyenne par partie, l'écart moyen entre vainqueur et vaincu, la part de parties serrées (gagnées de 5 points ou moins). Seules comptent les parties au score chiffré ; un nul n'entre ni dans l'écart moyen ni dans les parties serrées.

#### Scenario: Poules en cours
- **WHEN** des parties de poule restent sans score
- **THEN** l'affiche titre « Dernière ligne droite », sépare les parties à jouer des scores attendus, et parle d'un bilan provisoire

#### Scenario: Poules terminées
- **WHEN** toutes les parties de poule ont un score
- **THEN** l'affiche titre « Les poules ont rendu leur verdict » et donne le nombre de parties jouées et d'équipes qualifiées

### Requirement: Mes équipes au bilan
Pour chaque équipe suivie (spec `mes-equipes`), la page SHALL donner sous l'affiche son rang de poule, son bilan (victoires, défaites, moyenne, goal average) et son sort : qualifiée avec son quart et son adversaire, ou non qualifiée ; « pour l'instant » tant que sa série a des parties de poule sans score. Dans une série qui n'a pas exactement deux poules, donc pas de tableau, seul le rang est donné. Sans équipe suivie, le bloc n'apparaît pas.

#### Scenario: Équipe suivie qualifiée
- **WHEN** l'équipe suivie est 4e de la poule 1 et que des parties restent
- **THEN** le bloc dit « 4e de la poule 1 · en quarts pour l'instant » et nomme son adversaire de quart

### Requirement: Trophées d'une série
Pour toutes les séries ensemble, puis pour chaque série, la page SHALL décerner, d'après les seuls scores réels de poule : le meilleur bilan (première au classement de la série), la meilleure attaque (le plus gros goal average cumulé, points marqués moins points encaissés sur toutes ses parties de poule), la meilleure défense (points encaissés par partie), les équipes invaincues s'il y en a, la plus longue série de victoires d'affilée (deux au moins, si elle n'est pas celle d'une invaincue), la plus large victoire, la partie la plus serrée et la partie la plus prolifique (le plus de points à deux). À égalité, l'ordre du classement départage les équipes, et la date les parties (la plus ancienne l'emporte). Un nul n'est jamais la plus large victoire ni la plus serrée. Un trophée qui revient à une équipe suivie est mis en évidence.

#### Scenario: Plus large victoire
- **WHEN** la plus grande différence de score d'une série est un 40–18
- **THEN** le trophée « Plus large victoire » donne la partie, vainqueur en premier, et « 22 points d'écart »

### Requirement: Poules et résultats
Pour chaque poule, la page SHALL afficher le classement, avec le trait des qualifiés sous la 4e équipe (« En quarts pour l'instant » tant que la poule n'est pas finie, « Qualifiés pour les quarts » ensuite), l'équipe suivie mise en évidence, puis les parties de la poule, repliées, dans l'ordre des dates : score avec le vainqueur en gras, « à jouer » pour une partie à venir, « sans score » pour une partie passée sans résultat publié, et le score tel que publié pour un score non chiffré (forfait), qui ne compte pas au classement.

#### Scenario: Déplier les résultats
- **WHEN** le visiteur touche « Les 15 parties de la poule »
- **THEN** les quinze parties de la poule se déplient dans la page, par date

### Requirement: Messages de fin de poule
Sous les résultats de chaque poule, la page SHALL proposer, replié, « 📲 Messages de fin de poule aux équipes » : pour chaque équipe classée, dans l'ordre du classement, son rang, son sort en pastille, un bouton WhatsApp et un bouton Copier. Le message, en gras et italique WhatsApp, salue le responsable par son prénom quand il peut être isolé (comme sur Parties), puis donne, dans cet ordre : la série et la poule ; son rang sur le nombre d'équipes classées, ses victoires, défaites, points et goal average ; son sort, suivi aussitôt d'un mot sportif selon l'issue (bravo et félicitations aux qualifiés, la première place saluée à part, félicitations au maintien, encouragements au barrage et à la descente) ; sa partie suivante ; et, pour une qualifiée, le rappel que son quart peut être joué avant sa date (celle que la ligue a fixée pour son quart, sinon « la date prévue ») si un accord est trouvé avec l'adversaire, et que les 1/2 et la finale ne sont pas déplaçables. Le message ne récapitule pas les parties de poule et ne porte pas de lien vers le site. Le sort se lit au rang : les quatre premiers sont qualifiés pour les quarts ; ensuite, en Série 1, le dernier descend en Série 2 et les autres sont maintenus ; en Série 2, le dernier descend en Série 3, l'avant-dernier joue un barrage pour le maintien contre un demi-finaliste de la Série 3, à la fin de la saison de celle-ci (vers juin ou septembre), les autres sont maintenus en Série 2 ; une série sans règle connue dit seulement « pas de phase finale ». La partie suivante est la première partie hors poules, sans score et pas encore passée, où la ligue a inscrit l'équipe : phase, adversaire (« à désigner » pour un club fictif), date, heure et lieu. Sans elle, une qualifiée a son quart et son adversaire d'après le tableau final, et une barragiste la mention de son barrage, avec le jour ou les jours prévus pour la phase dans sa série, sinon, pour une qualifiée, « date et lieu communiqués par la ligue » et, pour une barragiste, « à la fin de la saison de la Série 3, vers juin ou septembre, date et lieu communiqués par la ligue » ; une équipe déjà inscrite par la ligue hors poules, mais sans partie à venir, n'a « pas d'autre partie programmée » ; les autres n'ont plus de partie cette saison. Une équipe sans score chiffré (que des forfaits) ferme le classement de sa poule et a son message. WhatsApp s'ouvre vers le responsable quand la ligue a un numéro exploitable pour lui, sinon sans destinataire, et la ligne le signale. Le message MUST NOT contenir de nom de joueur ni de numéro de téléphone, et le numéro du responsable n'est écrit nulle part dans la page (spec `donnees-api`). Tant que la série a des parties de poule sans score, le bloc est remplacé par une ligne qui dit qu'il sera prêt à la fin des poules de la série, et combien de scores manquent : la ligue ne nomme les équipes des phases finales qu'à ce moment-là.

#### Scenario: Qualifiée, quart inscrit par la ligue
- **WHEN** les poules de la Série 2 sont finies et que la ligue a inscrit Alpha, 1re de la poule 1, sur un 1/4 contre India
- **THEN** le message d'Alpha dit « Classement final : 1er sur 6 », « Qualifiés pour les quarts de finale ! », puis « Partie suivante : 1/4 de finale », « contre India (éq. 1) », la date, l'heure et le lieu

#### Scenario: Poule de sept en Série 2
- **WHEN** une poule de la Série 2 compte sept équipes à la fin des poules
- **THEN** les quatre premières ont « Quarts », la 5e « Maintien », la 6e « Barrage » et la 7e « Descente », et le message de la 6e annonce le barrage contre un demi-finaliste de la Série 3

#### Scenario: Poule de six en Série 1
- **WHEN** les poules de la Série 1 sont finies
- **THEN** les quatre premières de chaque poule ont « Quarts », la 5e « Maintien » et la 6e « Descente », dont le message annonce la descente en Série 2

#### Scenario: Poules en cours
- **WHEN** la série a encore des parties de poule sans score
- **THEN** chaque poule dit que les messages seront prêts à la fin des poules de la série, sans bouton

#### Scenario: Responsable sans numéro
- **WHEN** la ligue n'a pas de numéro pour le responsable d'une équipe
- **THEN** son bouton WhatsApp ouvre le message sans destinataire, la ligne dit « responsable sans numéro : contact à choisir », et le message commence par « Bonjour, »

### Requirement: Tableau final
Pour chaque série à deux poules, la page SHALL afficher le tableau des quarts tel que le Classement le calcule sans simulation (spec `classement`, « Prévision des quarts de finale ») : mêmes croisements, mêmes étiquettes de poule, même arbre vers les demies et la finale, mêmes chances de victoire. La carte porte « Prévision » tant qu'une partie de poule de la série reste sans score, « Poules terminées » ensuite, rappelle que le tableau officiel reste celui de la ligue, et désigne le quart le plus indécis.

#### Scenario: Même tableau qu'au Classement
- **WHEN** un visiteur compare le tableau final du bilan et les quarts du Classement sans simulation, avec les mêmes données
- **THEN** les quatre quarts opposent les mêmes équipes avec les mêmes pourcentages

### Requirement: Partager le bilan
L'affiche SHALL porter un bouton « Partager le bilan », qui partage une image PNG de 1080 px de large et un court texte, à envoyer dans un groupe WhatsApp. L'image reprend l'état des poules, les quatre chiffres globaux, trois trophées toutes séries (meilleur bilan, plus large victoire, partie la plus serrée), le tableau des quarts de chaque série avec les étiquettes de poule, le lien du bilan et la date de synchronisation, aux couleurs du thème affiché. Le texte reprend l'état, les chiffres, ces trophées, les quarts de chaque série et le lien du bilan. Le partage se comporte comme celui de l'accueil (spec `affiche-week-end`) : feuille de partage du téléphone avec l'image et le texte, sinon texte copié et image téléchargée. L'image et le texte MUST NOT contenir de nom de joueur (spec `donnees-api`).

#### Scenario: Partager sur WhatsApp
- **WHEN** un capitaine touche « Partager le bilan » sur son téléphone
- **THEN** la feuille de partage s'ouvre avec l'image du bilan et son texte, qui finit par le lien du bilan, sans aucun nom de joueur

#### Scenario: Sur ordinateur
- **WHEN** le navigateur n'a pas de feuille de partage
- **THEN** le texte est copié, l'image téléchargée, et le bouton l'indique
