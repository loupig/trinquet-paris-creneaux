# accueil Specification

## Purpose

Fixer ce que montre la page d'accueil : les blocs présents, leur ordre, et ce qui en est volontairement absent parce que la navigation y donne déjà accès.

## Requirements

### Requirement: Composition de l'accueil
L'accueil SHALL présenter, dans cet ordre, le bloc « Mes équipes », le bloc de la semaine puis le bloc « Championnats » (avancement de la saison), et aucun autre bloc de contenu. Seuls des bandeaux peuvent les précéder : l'appel à donner son avis, le temps d'une campagne, puis l'échec des données (spec `donnees-api`) et les parties en double (ci-dessous). Le bloc de la semaine réunit, sous deux onglets, les résultats depuis vendredi (spec `derniers-resultats`) et les parties d'ici dimanche (spec `affiche-week-end`).

#### Scenario: Ouverture de l'accueil
- **WHEN** un visiteur ouvre l'accueil et que les données sont chargées
- **THEN** il voit « Mes équipes », le bloc de la semaine puis « Championnats », et rien d'autre entre l'en-tête et le pied de page

### Requirement: Avis sur la saison
Le temps d'une campagne de recueil d'avis, l'accueil SHALL afficher en tête, avant tout autre bandeau, une carte « Votre avis sur la saison » : « 2 min, anonyme : le championnat et ce site. », un bouton « Répondre » qui ouvre le questionnaire dans un nouvel onglet, et un bouton « × » (« Ne plus afficher »). Toucher l'un ou l'autre fait disparaître la carte, qui ne revient plus sur cet appareil. La carte ne dépend pas des données de la ligue : elle s'affiche même si elles ne répondent pas. Elle n'apparaît que si la page connaît le lien du questionnaire (une adresse `https://`) et jusqu'au jour de fin de la campagne inclus. Ce n'est pas une fenêtre surgissante : elle prend sa place dans la page, sans masquer le reste. Le questionnaire, hors du site, ne demande ni nom ni coordonnées.

#### Scenario: Campagne en cours
- **WHEN** un visiteur ouvre l'accueil pendant la campagne, sans avoir déjà fermé la carte
- **THEN** la carte « Votre avis sur la saison » est en tête de page, et « Répondre » ouvre le questionnaire dans un nouvel onglet

#### Scenario: Carte fermée
- **WHEN** le visiteur touche « × » ou « Répondre »
- **THEN** la carte disparaît, et elle ne revient pas aux visites suivantes sur cet appareil

#### Scenario: Hors campagne
- **WHEN** la page ne connaît pas de lien de questionnaire, ou que le jour de fin est passé
- **THEN** l'accueil n'affiche pas la carte

### Requirement: Alerte des parties en double
Quand deux parties à venir (sans score, du jour ou après) sont programmées au même lieu, le même jour et à la même heure, l'accueil SHALL afficher, au-dessus des blocs, un bandeau d'alerte « Deux parties au même endroit à la même heure ». Chaque case en double y tient une ligne : le jour, l'heure, le lieu en nom court, puis les parties concernées, et le bandeau rappelle qu'une seule pourra se jouer et qu'il faut le signaler à la ligue. L'heure s'entend comme la case de la grille des Créneaux : 21h et 21h30 sont la même heure, 20h et 21h non. Le lieu se compare sans tenir compte de la casse, des accents, de la ponctuation ni des petits mots (« Trinquet Paris » et « Trinquet de Paris » sont le même lieu) ; seuls comptent la ville et le nom de la salle, sans le code postal, pour qu'un libellé tronqué (« PARIS (Trinquet de Paris - 750 ») rejoigne le libellé complet. Une partie sans lieu n'est jamais en double. Le titre compte les parties d'une case (« Trois parties… ») ; avec plusieurs cases en double, il devient « Plusieurs parties au même endroit à la même heure ». Sans partie en double, pas de bandeau.

#### Scenario: Deux parties dimanche à 21h au Trinquet Paris
- **WHEN** Alpha 1 – Bravo 1 et Charlie 1 – Delta 1 sont toutes deux programmées dimanche 8 novembre à 21h au Trinquet Paris
- **THEN** l'accueil affiche le bandeau, avec la ligne « Dim. 8 nov. · 21h · Trinquet Paris : Alpha 1 vs Bravo 1 et Charlie 1 vs Delta 1 », puis ses blocs habituels

#### Scenario: Parties qui se suivent ou en des lieux différents
- **WHEN** deux parties sont programmées dimanche, l'une à 20h et l'autre à 21h au Trinquet Paris, et une troisième à 21h à la Cavalerie
- **THEN** aucun bandeau de parties en double n'apparaît

### Requirement: Avancement des championnats
Le bloc « Championnats » SHALL donner le nombre de parties jouées sur le total, toutes phases confondues, puis, par spécialité et par série, deux lignes avec leur barre : « Poules » et « Phases finales », chacune avec ses parties jouées sur son total. Une ligne sans aucune partie dans les données n'apparaît pas. Sous chaque série, un encart rappelle les dates des 1/4, 1/2 et finale de cette série, lues dans ses parties, sans les créneaux ; il reste affiché jusqu'au jour de la dernière de ces dates inclus.

#### Scenario: Phase de poules en cours
- **WHEN** la série 1 a joué 24 de ses 30 parties de poule et aucune de ses 7 parties de phase finale
- **THEN** elle affiche « Poules 24 / 30 » et « Phases finales 0 / 7 », suivies de l'encart « Phases finales : 1/4 sam. 14/11 · 1/2 dim. 29/11 · finale dim. 6/12 »

#### Scenario: Saison terminée
- **WHEN** le jour de la finale de la série est passé
- **THEN** l'encart des phases finales de cette série n'apparaît plus

### Requirement: Créneaux et compteur hors de l'accueil
L'accueil SHALL ne plus afficher de tuile pour les créneaux libres du Trinquet Paris ni pour le compteur de points. Ces pages MUST rester accessibles depuis l'accueil : les créneaux par l'onglet Créneaux de la barre de navigation, le compteur par le bouton calculette de l'en-tête.

#### Scenario: Aller aux créneaux
- **WHEN** un visiteur veut voir les créneaux libres depuis l'accueil
- **THEN** l'onglet Créneaux l'y mène

#### Scenario: Ouvrir le compteur
- **WHEN** un visiteur veut marquer une partie depuis l'accueil
- **THEN** le bouton calculette de l'en-tête ouvre le compteur de points

### Requirement: Lien vers la présentation
Le pied de page de l'accueil SHALL porter un lien « Présenter le site à un joueur » vers la page Découvrir (spec `decouvrir`), à partager à qui ne connaît pas le site. Ce lien n'est pas un bloc de contenu : il ne change pas la composition de l'accueil.

#### Scenario: Faire connaître le site
- **WHEN** un visiteur touche « Présenter le site à un joueur » en bas de l'accueil
- **THEN** la page Découvrir s'ouvre

### Requirement: Première visite par la présentation
À l'ouverture de l'accueil, un appareil qui n'a encore aucune clé `lidfpb_` dans son stockage, hors le thème choisi (`lidfpb_theme_v1`, simple réglage d'affichage), SHALL être renvoyé vers la page Découvrir (spec `decouvrir`), une seule fois : la clé `lidfpb_decouvert_v1` est posée avant le renvoi, et aussi par Découvrir elle-même. Un visiteur qui a déjà utilisé le site (équipe suivie, filtres, cache) n'est pas renvoyé. Si le stockage est indisponible, l'accueil s'affiche sans renvoi. Les autres pages, ouvertes par un lien direct, ne renvoient jamais.

#### Scenario: Toute première ouverture
- **WHEN** un visiteur ouvre l'accueil pour la première fois sur son appareil
- **THEN** il arrive sur la page Découvrir, et « Suivre mon équipe » le ramène à l'accueil, qui s'affiche

#### Scenario: Visiteur habitué
- **WHEN** un visiteur qui suit déjà une équipe ouvre l'accueil
- **THEN** l'accueil s'affiche directement

### Requirement: Lignes des parties comme sur Parties
Dans les deux vues du bloc de la semaine (résultats et « D'ici dimanche »), les parties SHALL être regroupées sous leur jour (« Vendredi 20 nov. », le jour même à l'accent) et chacune SHALL tenir sur la ligne de la page Parties (spec `programme`), en plus serré : l'heure (rien pour une partie jouée sans heure dans les données), la pastille de sa poule à la teinte de la poule (« P1 ») ou, hors poule, de sa phase (« 1/4 »), les deux équipes sous leur nom court séparées par « vs », le score à droite pour une partie jouée, et un chevron ; la série est la couleur du liseré et du fond de la ligne. Sous les équipes ne paraît que ce qui sort de l'ordinaire : l'étiquette d'une partie à voir (spec `affiche-week-end`), le lieu précédé de 📍 quand ce n'est pas le lieu le plus fréquent du calendrier, ou « Score pas encore publié par la ligue ». Toucher la ligne déplie, sur un fond teinté, pour chaque équipe son nom complet, qui mène à sa page, suivi de ses joueurs déclarés à la ligue (« composition non disponible » sans composition connue ; ni joueurs ni lien pour une équipe à désigner), puis la série, la poule ou la phase et le lieu complet ; un second toucher replie. Il n'y a aucun réglage, et les noms n'entrent jamais dans le texte ni l'image partagés.

#### Scenario: Lecture d'une partie
- **WHEN** un visiteur ouvre l'accueil et qu'Alpha 1 reçoit Bravo 1 vendredi à 19h30 en poule 1 de la série 1, au lieu habituel
- **THEN** sous « Vendredi 20 nov. », la ligne se lit « 19h30 P1 Alpha 1 vs Bravo 1 », au liseré de la série 1, sans lieu ni noms de joueurs, et sans débordement à 390 px

#### Scenario: Voir les joueurs
- **WHEN** le visiteur touche la ligne
- **THEN** elle se déplie sur « Alpha (éq. 1) : Ane Exemple, Bixente Exemple », « Bravo (éq. 1) : Ane Autre, Bixente Autre » et « Série 1 · Poule 1 · PARIS (Trinquet Paris - 75016) », et un second toucher la replie

#### Scenario: Lieu inhabituel
- **WHEN** une partie se joue au Trinquet de la Cavalerie alors que la plupart se jouent au Trinquet Paris
- **THEN** sa ligne porte « 📍 Trinquet de la Cavalerie » sous les équipes

#### Scenario: Partage
- **WHEN** le visiteur touche « Partager »
- **THEN** le texte et l'image partagés ne contiennent aucun nom de joueur
