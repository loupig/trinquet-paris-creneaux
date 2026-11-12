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
Le bilan SHALL lire les rencontres, les clubs et les compositions comme le Classement, avec le même cache, les mêmes bandeaux d'échec et la même date de synchronisation (spec `donnees-api`), et classer chaque poule selon la spec `calcul-classement`. Partout sur la page (classement des poules, trophées, bloc Mes équipes, parties de la poule, tableau final), les équipes SHALL être nommées par leur nom court suivi de leur numéro (spec `noms-clubs`) : « MPBA 1 ». Un club absent de la table garde le nom de la ligue. Les joueurs déclarés à la ligue pour une équipe ne figurent qu'au toucher de sa ligne de classement, avec son nom officiel (« METRO PELOTE BASQUE ANTONY (éq. 1) ») ; ils n'apparaissent nulle part ailleurs sur la page. Si les compositions ne peuvent être chargées, le bilan s'affiche sans les noms des joueurs. Seuls les messages WhatsApp de fin de poule gardent les noms officiels.

#### Scenario: Joueurs à côté de l'équipe
- **WHEN** un visiteur ouvre le bilan, et que le club « METRO PELOTE BASQUE ANTONY » a une équipe 1
- **THEN** cette équipe s'appelle « MPBA 1 » au classement de sa poule, aux trophées, aux parties et au tableau final, sans nom de joueur
- **AND** toucher sa ligne de classement montre « METRO PELOTE BASQUE ANTONY (éq. 1) », puis ses joueurs, puis son détail

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
Pour chaque équipe suivie (spec `mes-equipes`), la page SHALL donner sous l'affiche son nom court, sa série, son rang de poule, son bilan (victoires, défaites, moyenne, goal average) et son sort : qualifiée avec son quart et son adversaire, ou non qualifiée ; « pour l'instant » tant que sa série a des parties de poule sans score. Une fois les phases finales commencées (spec `classement`, « Prévision des quarts de finale »), le sort se lit au seul tableau final, là où la ligue a placé les équipes et non plus au rang de poule : « battue en quart », « en demie contre … » (ou « contre le vainqueur du quart Qn »), « battue en demie », « en finale contre … », « championne », et « pas de quart cette saison » pour une équipe que la ligue n'a pas mise au tableau. Une partie jouée par forfait, au score non chiffré, est dite jouée, « vainqueur à confirmer ». Dans une série qui n'a pas exactement deux poules, donc pas de tableau, seul le rang est donné. Sans équipe suivie, le bloc n'apparaît pas.

#### Scenario: Équipe suivie qualifiée
- **WHEN** l'équipe suivie est 4e de la poule 1 et que des parties restent
- **THEN** le bloc dit « 4e de la poule 1 · en quarts pour l'instant » et nomme son adversaire de quart sous son nom court

#### Scenario: Équipe suivie qui gagne son quart
- **WHEN** l'équipe suivie a gagné son quart et que l'autre quart de sa moitié n'a pas de score
- **THEN** le bloc dit qu'elle est en demie, contre le vainqueur de l'autre quart

### Requirement: Trophées d'une série
Pour toutes les séries ensemble, puis pour chaque série, la page SHALL décerner, d'après les seuls scores réels de poule : le meilleur bilan (première au classement de la série), la meilleure attaque (le plus gros goal average cumulé, points marqués moins points encaissés sur toutes ses parties de poule), la meilleure défense (points encaissés par partie), les équipes invaincues s'il y en a, la plus longue série de victoires d'affilée (deux au moins, si elle n'est pas celle d'une invaincue), la plus large victoire, la partie la plus serrée et la partie la plus prolifique (le plus de points à deux). À égalité, l'ordre du classement départage les équipes, et la date les parties (la plus ancienne l'emporte). Un nul n'est jamais la plus large victoire ni la plus serrée. Les équipes y sont nommées par leur nom court, sans joueurs. Un trophée qui revient à une équipe suivie est mis en évidence.

#### Scenario: Plus large victoire
- **WHEN** la plus grande différence de score d'une série est un 40–18
- **THEN** le trophée « Plus large victoire » donne la partie, vainqueur en premier, sous les noms courts, et « 22 points d'écart »

### Requirement: Poules et résultats
Pour chaque poule, la page SHALL afficher le classement au format du Classement (spec `classement`, « Ligne d'une équipe ») : un en-tête de colonnes, puis une ligne par équipe avec le rang, le nom court, J, G, P, GA et Moy. en gras, nombres alignés à droite en chiffres de même largeur. Les trois premiers rangs gardent leur médaille (or, argent, bronze). Toucher une ligne déplie sous elle le nom officiel, les joueurs et le détail de l'équipe ; la toucher à nouveau le replie ; la ligne est un bouton qui annonce si elle est dépliée, finit par un chevron « › » qui passe en « ⌄ », et prend un fond teinté une fois dépliée. L'équipe suivie est mise en évidence. Le sort de chaque rang se lit au liseré de la ligne et à la légende, comme au Classement (spec `classement`, « Zones de fin de poule » et « Légende du classement »), avec la même règle : plus de trait des qualifiés. Sous les poules de chaque série, une légende donne les zones présentes, « à ce jour » tant que la série a des parties de poule sans score, et le sens des colonnes. Une poule de six MUST tenir en entier, en-tête de carte compris, sur le premier écran d'un Pixel 7 une fois qu'on y a fait défiler la page.

Viennent ensuite les parties de la poule, repliées, dans l'ordre des dates, une par ligne : la date, « MPBA 1 vs Bravo 1 » (l'équipe qui reçoit en premier), puis à droite le score avec le vainqueur en gras, « à jouer » pour une partie à venir, « sans score » pour une partie passée sans résultat publié, ou le score tel que publié pour un score non chiffré (forfait), qui ne compte pas au classement. Une partie d'une équipe suivie est mise en évidence.

#### Scenario: Déplier les résultats
- **WHEN** le visiteur touche « Les 15 parties de la poule »
- **THEN** les quinze parties de la poule se déplient dans la page, par date, une par ligne, en noms courts

#### Scenario: Zones de la Série 2
- **WHEN** la Série 2 a une poule de sept équipes
- **THEN** les quatre premières ont le liseré des quarts, la 6e celui du barrage et la 7e celui de la descente, et la légende de la série le dit

#### Scenario: Joueurs au toucher
- **WHEN** le visiteur touche la ligne de Charlie 1
- **THEN** son nom officiel, ses joueurs et son détail se déplient sous elle, la ligne annonce qu'elle est dépliée, et la toucher à nouveau les replie

### Requirement: Messages de fin de poule
Sous les résultats de chaque poule, la page SHALL proposer, replié, « 📲 Messages de fin de poule aux équipes » : pour chaque équipe classée, dans l'ordre du classement, son rang, son sort en pastille, un bouton WhatsApp et un bouton Copier. Le message, en gras et italique WhatsApp, salue le responsable par son prénom quand il peut être isolé (comme sur Parties), puis donne, dans cet ordre : la série et la poule ; son rang sur le nombre d'équipes classées, ses victoires, défaites, points et goal average ; son sort, suivi aussitôt d'un mot sportif selon l'issue (bravo et félicitations aux qualifiés, la première place saluée à part, félicitations au maintien, encouragements au barrage et à la descente) ; sa partie suivante ; et, pour une qualifiée dont le quart reste à jouer, le rappel qu'il peut être joué avant sa date (celle que la ligue a fixée pour son quart, sinon « la date prévue ») si un accord est trouvé avec l'adversaire, et que les 1/2 et la finale ne sont pas déplaçables ; une qualifiée déjà inscrite en demie n'a que ce dernier rappel (« la finale n'est pas déplaçable » en finale), une qualifiée sans partie à venir aucun. Le message ne récapitule pas les parties de poule et ne porte pas de lien vers le site. Le sort se lit au rang : les quatre premiers sont qualifiés pour les quarts ; ensuite, en Série 1, le dernier descend en Série 2 et les autres sont maintenus ; en Série 2, le dernier descend en Série 3, l'avant-dernier joue un barrage pour le maintien contre un demi-finaliste de la Série 3, à la fin de la saison de celle-ci (vers juin ou septembre), les autres sont maintenus en Série 2 ; une série sans règle connue dit seulement « pas de phase finale ». La partie suivante est la première partie hors poules, sans score et pas encore passée, où la ligue a inscrit l'équipe : phase, adversaire (« à désigner » pour un club fictif), date, heure et lieu, puis « Responsable adverse : Nom (téléphone) » quand la ligue a un numéro pour le responsable de l'équipe adverse, comme sur Parties (aussi pour l'adversaire de quart déduit du tableau). Sans elle, une qualifiée a son quart et son adversaire d'après le tableau final, et une barragiste la mention de son barrage, avec le jour ou les jours prévus pour la phase dans sa série, sinon, pour une qualifiée, « date et lieu communiqués par la ligue » et, pour une barragiste, « à la fin de la saison de la Série 3, vers juin ou septembre, date et lieu communiqués par la ligue » ; une équipe déjà inscrite par la ligue hors poules, mais sans partie à venir, n'a « pas d'autre partie programmée » ; les autres n'ont plus de partie cette saison. Une équipe sans score chiffré (que des forfaits) ferme le classement de sa poule et a son message. WhatsApp s'ouvre vers le responsable quand la ligue a un numéro exploitable pour lui, sinon sans destinataire, et la ligne le signale. Le message MUST NOT contenir de nom de joueur, ni d'autre numéro de téléphone que celui du responsable adverse ; aucun numéro n'est écrit dans le texte de la page, celui du destinataire n'est que dans le lien WhatsApp (spec `donnees-api`). Tant que la série a des parties de poule sans score, le bloc est remplacé par une ligne qui dit qu'il sera prêt à la fin des poules de la série, et combien de scores manquent : la ligue ne nomme les équipes des phases finales qu'à ce moment-là.

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
Pour chaque série à deux poules, la page SHALL afficher le tableau final tel que le Classement le montre sans simulation (spec `classement`, « Prévision des quarts de finale ») : mêmes croisements, mêmes étiquettes de poule, même arbre vers les demies et la finale, mêmes chances de victoire. Il reprend aussi, une fois les phases finales commencées, leurs scores réels : vainqueur coché, battu grisé, demies et finale sous les quarts, ligne du champion, et le statut « En cours » puis « Terminées ». Avant, la carte porte « Prévision » tant qu'une partie de poule de la série reste sans score, puis « Poules terminées ». Elle rappelle que le tableau officiel reste celui de la ligue, et désigne le quart le plus indécis parmi ceux qui restent à jouer.

#### Scenario: Même tableau qu'au Classement
- **WHEN** un visiteur compare le tableau final du bilan et celui du Classement sans simulation, avec les mêmes données
- **THEN** les quarts, les demies et la finale opposent les mêmes équipes, avec les mêmes pourcentages et les mêmes scores

#### Scenario: Un quart joué
- **WHEN** les poules de la série 1 sont finies et le Q1 est joué
- **THEN** le tableau du bilan montre son score, et son vainqueur en D1

### Requirement: Partager le bilan
L'affiche SHALL porter un bouton « Partager le bilan », qui partage une image PNG de 1080 px de large et un court texte, à envoyer dans un groupe WhatsApp. L'image reprend l'état des poules, les quatre chiffres globaux, trois trophées toutes séries (meilleur bilan, plus large victoire, partie la plus serrée), le tableau des quarts de chaque série avec les étiquettes de poule, le lien du bilan et la date de synchronisation, aux couleurs du thème affiché. Le texte reprend l'état, les chiffres, ces trophées, les quarts de chaque série et le lien du bilan. Dans l'image comme dans le texte, les équipes sont nommées par leur nom court (spec `noms-clubs`). Le partage se comporte comme celui de l'accueil (spec `affiche-week-end`) : feuille de partage du téléphone avec l'image et le texte, sinon texte copié et image téléchargée. L'image et le texte MUST NOT contenir de nom de joueur (spec `donnees-api`).

#### Scenario: Partager sur WhatsApp
- **WHEN** un capitaine touche « Partager le bilan » sur son téléphone
- **THEN** la feuille de partage s'ouvre avec l'image du bilan et son texte, en noms courts, qui finit par le lien du bilan, sans aucun nom de joueur

#### Scenario: Sur ordinateur
- **WHEN** le navigateur n'a pas de feuille de partage
- **THEN** le texte est copié, l'image téléchargée, et le bouton l'indique
