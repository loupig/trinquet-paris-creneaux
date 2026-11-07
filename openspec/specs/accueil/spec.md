# accueil Specification

## Purpose

Fixer ce que montre la page d'accueil : les blocs présents, leur ordre, et ce qui en est volontairement absent parce que la navigation y donne déjà accès.

## Requirements

### Requirement: Composition de l'accueil
L'accueil SHALL présenter, dans cet ordre, le bloc « Mes équipes », le bloc de la semaine puis le bloc « Championnats » (avancement de la saison), et aucun autre bloc de contenu. Seuls des bandeaux peuvent les précéder : échec des données (spec `donnees-api`) et parties en double (ci-dessous). Le bloc de la semaine réunit, sous deux onglets, les résultats depuis vendredi (spec `derniers-resultats`) et les parties d'ici dimanche (spec `affiche-week-end`).

#### Scenario: Ouverture de l'accueil
- **WHEN** un visiteur ouvre l'accueil et que les données sont chargées
- **THEN** il voit « Mes équipes », le bloc de la semaine puis « Championnats », et rien d'autre entre l'en-tête et le pied de page

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

### Requirement: Joueurs des équipes à la demande
Le bloc de la semaine SHALL proposer dans son pied, à côté de « Partager », un bouton « Joueurs », éteint par défaut. Allumé, chaque partie des deux vues (résultats et « D'ici dimanche ») porte une ligne de plus, en petit et en retrait : les noms des joueurs de l'équipe qui reçoit, « vs », ceux de l'équipe visiteuse, tels que déclarés à la ligue (composition de l'engagement, comme sur Mes équipes). Une équipe sans composition déclarée y est dite « composition non déclarée » ; une partie sans aucune composition connue (adversaires à désigner) n'a pas cette ligne. Le réglage est gardé sur l'appareil (`lidfpb_joueurs_v1`) et commun avec le Classement. Bouton éteint, les tables des compositions ne sont pas chargées. Les noms n'entrent jamais dans le texte ni l'image partagés.

#### Scenario: Par défaut
- **WHEN** un visiteur ouvre l'accueil sans avoir jamais touché « Joueurs »
- **THEN** aucune partie ne porte de noms de joueurs, et les compositions ne sont pas demandées à l'API

#### Scenario: Afficher les joueurs
- **WHEN** le visiteur touche « Joueurs »
- **THEN** chaque partie dont une composition est connue montre une ligne « Ane Exemple, Bixente Exemple vs … », le bouton reste allumé, et le Classement s'ouvrira lui aussi avec les joueurs

#### Scenario: Partage avec joueurs affichés
- **WHEN** les joueurs sont affichés et que le visiteur touche « Partager »
- **THEN** le texte et l'image partagés ne contiennent aucun nom de joueur
