# Spec Delta

## MODIFIED Requirements

### Requirement: Données et classement
Le bilan SHALL lire les rencontres, les clubs et les compositions comme le Classement, avec le même cache, les mêmes bandeaux d'échec et la même date de synchronisation (spec `donnees-api`), et classer chaque poule selon la spec `calcul-classement`. Partout sur la page (classement des poules, trophées, bloc Mes équipes, parties de la poule, tableau final), les équipes SHALL être nommées par leur nom court suivi de leur numéro (spec `noms-clubs`) : « MPBA 1 ». Un club absent de la table garde le nom de la ligue. Les joueurs déclarés à la ligue pour une équipe ne figurent qu'au toucher de sa ligne de classement, avec son nom officiel (« METRO PELOTE BASQUE ANTONY (éq. 1) ») ; ils n'apparaissent nulle part ailleurs sur la page. Si les compositions ne peuvent être chargées, le bilan s'affiche sans les noms des joueurs. Seuls les messages WhatsApp de fin de poule gardent les noms officiels.

#### Scenario: Joueurs à côté de l'équipe
- **WHEN** un visiteur ouvre le bilan, et que le club « METRO PELOTE BASQUE ANTONY » a une équipe 1
- **THEN** cette équipe s'appelle « MPBA 1 » au classement de sa poule, aux trophées, aux parties et au tableau final, sans nom de joueur
- **AND** toucher sa ligne de classement montre « METRO PELOTE BASQUE ANTONY (éq. 1) », puis ses joueurs, puis son détail

#### Scenario: Premier chargement impossible
- **WHEN** le bilan est ouvert pour la première fois et que la source des données ne répond pas
- **THEN** la page n'affiche qu'un bandeau d'erreur « Impossible d'afficher le bilan »

### Requirement: Mes équipes au bilan
Pour chaque équipe suivie (spec `mes-equipes`), la page SHALL donner sous l'affiche son nom court, sa série, son rang de poule, son bilan (victoires, défaites, moyenne, goal average) et son sort : qualifiée avec son quart et son adversaire, ou non qualifiée ; « pour l'instant » tant que sa série a des parties de poule sans score. Une fois les phases finales commencées (spec `classement`, « Prévision des quarts de finale »), le sort suit le tableau final : « battue en quart », « en demie contre … » (ou « contre le vainqueur de Qn »), « battue en demie », « en finale contre … », « championne ». Dans une série qui n'a pas exactement deux poules, donc pas de tableau, seul le rang est donné. Sans équipe suivie, le bloc n'apparaît pas.

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
