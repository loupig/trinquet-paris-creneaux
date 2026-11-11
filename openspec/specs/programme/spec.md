# programme Specification

## Purpose

Donner le calendrier complet des championnats, tous lieux et toutes séries, parties passées et à venir, avec pour chaque partie la composition des deux équipes, de quoi joindre leurs responsables et l'accès à l'aide au report.

## Requirements

### Requirement: Périmètre du calendrier
La page SHALL lister toutes les rencontres des séries 1 et 2 publiées par la ligue, tous lieux confondus, passées et à venir mélangées. Une rencontre dont la date ou l'heure est illisible MUST être absente de la page, sans message. Une partie reportée MUST apparaître à sa nouvelle date, à l'heure d'origine, sans mention du report.

#### Scenario: Toutes les parties de la saison
- **WHEN** un visiteur ouvre la page sans filtre restrictif
- **THEN** il voit les parties déjà jouées et les parties à venir, tous lieux confondus

#### Scenario: Partie reportée
- **WHEN** une partie prévue le 12 octobre a été reportée au 19 octobre
- **THEN** elle apparaît le 19 octobre, à l'heure d'origine, et plus le 12

#### Scenario: Heure illisible
- **WHEN** une rencontre publiée n'a pas d'heure exploitable
- **THEN** elle n'apparaît pas sur la page

### Requirement: Classement par jour
La page SHALL regrouper les parties par jour calendaire, une carte par jour titrée de sa date complète (par exemple « Dimanche 4 Octobre 2026 »), dans l'ordre chronologique, et dans chaque jour par heure. La carte du jour courant MUST être mise en évidence. La page s'ouvre en haut de la liste, sans défilement automatique jusqu'à aujourd'hui.

#### Scenario: Deux parties le même jour
- **WHEN** deux parties se jouent le même dimanche, à 14h et à 16h
- **THEN** elles figurent dans la même carte, celle de 14h en premier

#### Scenario: Aujourd'hui
- **WHEN** des parties se jouent le jour de la visite
- **THEN** la carte de ce jour se distingue des autres par sa couleur

### Requirement: Filtres du calendrier
La page SHALL proposer, dans un bloc repliable, cinq filtres combinés entre eux : spécialité, série (Série 1, Série 2), lieu, phase, et « Masquer les parties passées ». Les pastilles de spécialité, de lieu et de phase MUST être construites d'après toutes les rencontres du calendrier, pas d'après celles qui restent affichées après filtrage. Par défaut, toutes les pastilles sont actives et les parties passées sont visibles. Une valeur qui apparaît pour la première fois dans les données MUST être active. Une partie du jour n'est jamais considérée comme passée. Quand aucune partie ne correspond, la page affiche « Aucune rencontre ne correspond aux filtres. ». Filtrer ne rappelle pas l'API.

#### Scenario: Une seule série
- **WHEN** le visiteur désactive la pastille « Série 2 »
- **THEN** seules les parties de série 1 restent affichées

#### Scenario: Masquer le passé le jour d'un match
- **WHEN** le visiteur active « Masquer les parties passées » un dimanche à 20h
- **THEN** les parties de ce dimanche restent affichées, même celles de 14h

#### Scenario: Nouveau lieu dans les données
- **WHEN** un lieu jamais rencontré apparaît dans les rencontres publiées
- **THEN** sa pastille existe et est active, et ses parties sont affichées

#### Scenario: Filtres trop stricts
- **WHEN** la combinaison des filtres n'en laisse passer aucune partie
- **THEN** la page affiche « Aucune rencontre ne correspond aux filtres. »

### Requirement: Résumé des filtres repliés
Replié, le bloc Filtres SHALL afficher sous son titre, sur une ligne, un résumé de ce qui est filtré, commun aux pages Parties, Classement et Créneaux. Le résumé ne cite que ce qui s'écarte du réglage par défaut : un filtre laissé tout actif n'y figure pas. Dans un filtre, il cite la liste la plus courte : les valeurs gardées, ou celles retirées sous la forme « sans … ». Il MUST NOT citer plus de trois éléments : au-delà, le reste est compté (« +2 »). Sans aucun filtre, il indique « Tout est affiché ». Le résumé suit chaque changement de filtre. Déplié, le bloc ne l'affiche pas.

#### Scenario: Une série masquée
- **WHEN** un visiteur a masqué la série 2 et les parties passées sur la page Parties, puis replié le bloc Filtres
- **THEN** le bloc replié affiche « Série 1 · Parties à venir »

#### Scenario: Une heure retirée
- **WHEN** un visiteur a retiré 17h des heures sur la page Créneaux, et replié le bloc Filtres
- **THEN** le résumé commence par « sans 17h »

#### Scenario: Trop de filtres
- **WHEN** quatre filtres ou plus s'écartent du réglage par défaut
- **THEN** le résumé en cite trois, suivis du nombre des autres

#### Scenario: Aucun filtre
- **WHEN** tous les filtres sont à leur réglage par défaut et le bloc est replié
- **THEN** le résumé indique « Tout est affiché »

### Requirement: Filtres mémorisés sur l'appareil
La page SHALL retrouver, d'une visite à l'autre sur le même navigateur, l'état de ses filtres et l'état ouvert ou replié du bloc Filtres, ce dernier étant commun aux pages Parties, Classement et Créneaux. Le bloc Filtres est replié par défaut, avec son résumé (« Résumé des filtres repliés ») : il ne s'ouvre que si le visiteur l'a ouvert lui-même, sur l'une des trois pages, et ne l'a pas refermé depuis. Ce choix reste dans le navigateur et n'est envoyé nulle part. Si le navigateur ne peut pas le relire, les valeurs par défaut s'appliquent, sans message.

#### Scenario: Première visite
- **WHEN** un visiteur ouvre la page Parties pour la première fois sur ce navigateur
- **THEN** le bloc Filtres est replié et affiche « Tout est affiché »

#### Scenario: Bloc ouvert à la main
- **WHEN** un visiteur a ouvert le bloc Filtres sur la page Classement, puis ouvre la page Créneaux
- **THEN** le bloc Filtres de Créneaux est ouvert

#### Scenario: Retour sur la page
- **WHEN** un visiteur a masqué la série 2 et replié le bloc Filtres, puis revient le lendemain sans avoir rouvert le bloc Filtres sur une autre page
- **THEN** la série 2 est toujours masquée et le bloc toujours replié

### Requirement: Ligne d'une partie
Chaque partie SHALL tenir sur une seule ligne, colorée selon sa série (liseré à gauche et fond teinté, déjà en place), qui donne :
- l'heure (« 14h » ou « 14h30 ») ;
- une pastille de poule, « P1 », « P2 »…, dans la teinte de sa poule, la même qu'au Classement en classement général et au tableau des quarts. Pour une partie hors poule, la pastille porte le libellé court de la phase (« 1/4 », « 1/2 », « Finale », « Barrage »), dans une teinte neutre ;
- les deux équipes sous leur nom court suivi de leur numéro (spec `noms-clubs`), l'équipe qui reçoit en premier : « MPBA 1 vs PEP 2 » (sans numéro quand la ligue n'en donne pas). Un nom long passe à la ligne, et un numéro d'équipe ne s'y retrouve jamais seul ;
- le score à droite quand la partie a été jouée ;
- au bout, un chevron « › », celui du bloc Filtres replié, qui passe en « ⌄ » quand la partie est dépliée.

La série ne s'écrit plus en toutes lettres : sa couleur suffit, expliquée par la légende de la page. Le lieu ne figure pas sur la ligne, sauf quand la partie se joue ailleurs que dans le lieu habituel (le plus fréquent du calendrier) : la ligne porte alors « 📍 » suivi du nom court du lieu (la partie entre parenthèses sans le code postal, comme à l'accueil). Les noms des joueurs ne figurent pas sur la ligne. La ligne est un bouton qui annonce s'il est déplié, et sa phrase lue par un lecteur d'écran dit la série, la poule ou la phase, et le lieu. Dépliée, la partie et son détail partagent un fond teinté. Un club inconnu de la ligue s'affiche « Club <code> ». Sur un iPhone 15 Pro dans Safari (393 × 659 px), le bloc Filtres replié, au moins cinq parties MUST tenir sur le premier écran, au-dessus de la barre d'onglets.

#### Scenario: Partie de poule à venir
- **WHEN** une partie de la poule 2 de série 1, entre « METRO PELOTE BASQUE ANTONY » (éq. 1) et « PARIS EUSKAL PILOTA » (éq. 2), au lieu habituel, n'a pas encore de score
- **THEN** sa ligne donne l'heure, la pastille « P2 », « MPBA 1 vs PEP 2 », sans score, sans lieu, sans « Série 1 » écrit, ni nom de joueur, dans la couleur de la série 1

#### Scenario: Partie de phase finale jouée
- **WHEN** une demi-finale a été jouée
- **THEN** sa ligne porte la pastille « 1/2 » à la place de la poule, et le score à droite

#### Scenario: Partie dans un autre lieu
- **WHEN** la plupart des parties se jouent au « PARIS (Trinquet Paris - 75016) » et l'une se joue au « PARIS (Trinquet Mail - 75006) »
- **THEN** seule cette partie porte « 📍 Trinquet Mail » sur sa ligne

#### Scenario: Le toucher se devine
- **WHEN** un visiteur ouvre Parties
- **THEN** chaque partie finit par un chevron « › »
- **AND** une partie touchée passe en « ⌄ » sur fond teinté, et annonce qu'elle est dépliée

#### Scenario: Premier écran
- **WHEN** un visiteur ouvre Parties sur un iPhone 15 Pro, le bloc Filtres replié
- **THEN** au moins cinq parties sont visibles sans défiler

### Requirement: Légende des parties
Au-dessus des cartes de jour, la page SHALL afficher une légende sur une ou deux lignes : la couleur de chaque série affichée (« Série 1 », « Série 2 »), les pastilles de poule présentes (« P1 », « P2 » : poule), « 📍 lieu inhabituel » quand une partie affichée en porte un, et « Touchez une partie : joueurs, lieu, contacts ». Elle suit les filtres : une série masquée n'y figure plus. Quand aucune partie ne correspond aux filtres, elle n'est pas affichée. Les couleurs ont leur version sombre (spec `apparence`).

#### Scenario: Légende par défaut
- **WHEN** un visiteur ouvre Parties avec toutes les séries
- **THEN** la légende donne la couleur de la Série 1 et de la Série 2, les pastilles « P1 » et « P2 », et dit qu'on touche une partie pour voir joueurs, lieu et contacts

#### Scenario: Série masquée
- **WHEN** le visiteur masque la Série 2
- **THEN** la légende ne cite plus la Série 2

### Requirement: Détail d'une partie
Toucher la ligne d'une partie SHALL déplier son détail, et la toucher à nouveau le replier. Le détail donne :
- pour l'équipe qui reçoit, puis pour l'équipe visiteuse, son nom officiel tel que la ligue l'écrit (« METRO PELOTE BASQUE ANTONY (éq. 1) ») et les noms des joueurs déclarés à la ligue, sous la forme « Prénom Nom », ou « composition non disponible » quand aucun joueur n'est connu ;
- la série et la poule ou la phase, en toutes lettres (« Série 1 · Poule 2 ») ;
- le lieu complet, tel que la ligue l'écrit, ou « Lieu non précisé ».

C'est le seul endroit de la page où figurent les joueurs. Si les compositions ne peuvent pas être chargées, le calendrier s'affiche quand même, avec « composition non disponible ».

#### Scenario: Composition connue
- **WHEN** le visiteur touche une partie dont les deux équipes ont déclaré leurs joueurs
- **THEN** le détail donne, pour chaque équipe, son nom officiel et ses joueurs, sans numéro de licence, puis la série, la poule et le lieu complet

#### Scenario: Composition inconnue
- **WHEN** une équipe n'a déclaré aucun joueur connu de la ligue
- **THEN** sa ligne de détail indique son nom officiel et « composition non disponible »

#### Scenario: Message aux responsables inchangé
- **WHEN** le visiteur touche l'icône WhatsApp d'une équipe dans le détail
- **THEN** le message prérempli nomme les équipes par leur nom officiel et le lieu en entier, comme avant ce changement

### Requirement: Contact des responsables d'équipe
Dans le détail d'une partie, chaque équipe dont le responsable a un numéro exploitable SHALL porter trois icônes, dans l'ordre WhatsApp, SMS et Appeler, vers le numéro de son responsable. Le numéro MUST NOT apparaître dans le texte de la page. Le nom du responsable n'apparaît pas dans le texte, mais il figure dans l'info-bulle des icônes. WhatsApp s'ouvre sur un message prérempli adressé au responsable de cette équipe : salutation par son prénom quand il peut être isolé, rappel de la partie (équipes, date, heure, et lieu s'il est connu), question « Tout est bon de votre côté ? », nom et numéro du responsable adverse s'ils sont connus, pour une partie de poule, rappel que les phases finales ne se reportent pas avec les dates des 1/4, 1/2 et finales de sa série (sans les créneaux), et rappel de la compétition, de la série et de la poule ou de la phase. Sans numéro exploitable, l'équipe n'a pas d'icônes, sans message.

#### Scenario: Responsable joignable
- **WHEN** le visiteur déplie une partie dont le responsable de l'équipe qui reçoit a un numéro exploitable
- **THEN** cette équipe porte les icônes WhatsApp, SMS et Appeler, et aucun numéro n'est écrit dans la page

#### Scenario: Message WhatsApp
- **WHEN** le visiteur touche l'icône WhatsApp d'une équipe
- **THEN** WhatsApp s'ouvre vers son responsable avec le message de vérification de la partie prérempli

#### Scenario: Pas de numéro
- **WHEN** le responsable d'une équipe n'a pas de numéro exploitable
- **THEN** cette équipe n'a pas d'icônes de contact

### Requirement: Compter une partie
Le détail d'une partie sans score SHALL porter le bouton « Compter cette partie », quel que soit son lieu, qui ouvre le compteur de points avec les deux équipes déjà nommées, l'équipe qui reçoit en premier, en 40 points, et la série avec la poule ou la phase. Une partie déjà jouée n'a pas le bouton.

#### Scenario: Partie à jouer
- **WHEN** le visiteur déplie une partie sans score et touche « Compter cette partie »
- **THEN** le compteur s'ouvre avec les deux équipes de la partie

### Requirement: Accès au report
Le détail d'une partie sans score qui se joue au Trinquet Paris SHALL porter le bouton « Chercher une date de report », qui ouvre l'aide au report pour cette partie. La date de la partie n'entre pas en compte : une partie passée restée sans score a aussi le bouton, pour régulariser une partie non jouée. Une partie jouée ou qui se joue ailleurs n'a pas le bouton.

#### Scenario: Partie à venir au Trinquet Paris
- **WHEN** le visiteur déplie une partie sans score prévue au Trinquet Paris
- **THEN** le bouton « Chercher une date de report » ouvre l'aide au report de cette partie

#### Scenario: Partie dans un autre lieu
- **WHEN** le visiteur déplie une partie sans score prévue dans un autre trinquet
- **THEN** le détail n'a pas de bouton de report

#### Scenario: Partie passée sans score
- **WHEN** le visiteur déplie une partie de la semaine dernière au Trinquet Paris, restée sans score
- **THEN** le bouton « Chercher une date de report » est présent
