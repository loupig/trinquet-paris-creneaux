# liste-equipes Specification

## Purpose

Montrer d'un coup toutes les équipes engagées, sur la page Équipes, avec de quoi joindre le responsable de chacune et le message des phases finales à leur envoyer, pour que prévenir tout le championnat tienne en quelques minutes.

## Requirements

### Requirement: Liste de toutes les équipes
Ouverte sans équipe dans l'adresse, la page Équipes SHALL montrer toutes les équipes engagées, hors clubs fictifs de la ligue (dont « Equipe à désigner »), en une carte par série et par poule, dans l'ordre des séries puis des poules. L'en-tête de chaque carte porte la pastille de la série et le numéro de la poule, comme au Classement. Une équipe sans partie de poule figure dans une carte « Hors poule » de sa série. Quand les données comptent plus d'une spécialité, l'en-tête de chaque carte nomme aussi sa spécialité.

#### Scenario: Ouvrir l'onglet
- **WHEN** un visiteur touche l'onglet « Équipes »
- **THEN** la page montre une carte par poule de chaque série, avec toutes les équipes engagées

#### Scenario: Pas d'équipe fictive
- **WHEN** le visiteur parcourt la liste
- **THEN** « Equipe à désigner » n'y figure pas

#### Scenario: Deux spécialités
- **WHEN** les données comptent les spécialités « Trinquet / P.G Pleine Masculin » et une autre
- **THEN** l'en-tête de chaque carte nomme sa spécialité, en plus de la série et de la poule

### Requirement: Ligne d'une équipe dans la liste
Chaque équipe SHALL tenir sur une ligne, dans l'ordre du classement de sa poule (spec `calcul-classement`), le même que sur la page de l'équipe et au Classement, y compris entre équipes à égalité ou pas encore classées, départagées par leur nom officiel : son rang (« – » si elle n'a pas joué), les trois premiers colorés or, argent et bronze comme au Classement, puis son nom court suivi de son numéro (spec `noms-clubs`), jamais tronqué, et un chevron. Au toucher, la ligne déplie son nom officiel, ses joueurs, et un lien « Voir l'équipe → ».

#### Scenario: Ligne repliée
- **WHEN** l'équipe 2 de « PARIS EUSKAL PILOTA » est 3e de sa poule
- **THEN** sa ligne montre « 3 » sur fond bronze et « PEP 2 », sans nom de joueur

#### Scenario: Déplier la ligne
- **WHEN** le visiteur touche cette ligne
- **THEN** son chevron passe de « › » à « ⌄ », et dessous apparaissent « PARIS EUSKAL PILOTA (éq. 2) », ses joueurs et « Voir l'équipe → »
- **AND** un second toucher la replie

#### Scenario: Composition non déclarée
- **WHEN** une équipe n'a pas déclaré sa composition et que le visiteur touche sa ligne
- **THEN** le dépli porte « Composition non déclarée à la ligue »

### Requirement: Ouvrir une équipe depuis la liste
« Voir l'équipe → » SHALL afficher la page de cette équipe (spec `mon-equipe`), sans recharger les données, et mettre l'adresse à jour pour qu'elle se partage telle quelle. Le bouton Retour du navigateur ramène alors à la liste.

#### Scenario: Voir une équipe puis revenir
- **WHEN** le visiteur touche « Voir l'équipe → » sous PEP 2, puis le bouton Retour du navigateur
- **THEN** la page de PEP 2 s'affiche avec son adresse, sans appel réseau, puis Retour ramène à la liste

### Requirement: Joindre le responsable depuis la liste
Quand la ligue a un numéro exploitable pour le responsable d'une équipe, sa ligne SHALL porter une icône WhatsApp, qui ouvre une conversation vide vers ce numéro, et une icône SMS. Chaque icône dit, pour qui écoute la page, ce qu'elle fait et pour quelle équipe. Le numéro et le nom du responsable MUST NOT apparaître dans la page. Sans numéro exploitable, la ligne n'a pas d'icônes, sans message.

#### Scenario: Responsable joignable
- **WHEN** le responsable de PEP 2 a un numéro déclaré à la ligue
- **THEN** la ligne de PEP 2 porte une icône WhatsApp vers ce numéro, sans texte, et une icône SMS, et aucun numéro n'est lisible dans la page

#### Scenario: Pas de numéro
- **WHEN** une équipe n'a pas de numéro de responsable exploitable
- **THEN** sa ligne n'a ni icône WhatsApp, ni icône SMS, ni icône d'envoi du message

### Requirement: Message des phases finales
En mode organisateur (spec `communications-equipes`), tant qu'au moins une partie de phase finale reste à jouer, aujourd'hui ou plus tard, dans une série dont les poules sont finies, le bloc des communications SHALL proposer « Phases finales », dont l'aperçu montre le message des phases finales et un bouton qui le confie à la feuille de partage de l'appareil, ou le copie quand il n'y en a pas. Sinon, cette communication n'est pas proposée. Sans mode organisateur, la page ne montre ni le message ni son bouton.

#### Scenario: Poules finies, demies à venir
- **WHEN** l'organisateur ouvre la page alors que les poules des deux séries sont finies et que les demies se jouent dimanche
- **THEN** « Phases finales » est proposée et choisie, et son aperçu montre le message et un bouton Partager

#### Scenario: Poules en cours
- **WHEN** une partie de poule de chaque série reste sans score
- **THEN** « Phases finales » n'est pas proposée

#### Scenario: Saison finie
- **WHEN** toutes les parties de phase finale ont un score ou une date passée
- **THEN** « Phases finales » n'est pas proposée

#### Scenario: Visiteur ordinaire
- **WHEN** un joueur ouvre la page sans `orga`, poules finies et demies à venir
- **THEN** il ne voit ni le message des phases finales ni son bouton

### Requirement: Contenu du message des phases finales
Le message SHALL donner, mis en forme pour WhatsApp, dans cet ordre : un remerciement pour le championnat, « Merci à toutes » pour un championnat féminin, d'après le libellé de sa spécialité (`SPEC_LABELS`), « Merci à tous » pour tout autre championnat, y compris une spécialité sans libellé connu, et « Merci à toutes et à tous » quand le message mêle championnats féminin et masculin ; les parties de phase finale à venir, par phase et par jour, chacune avec son heure, sa série et ses deux équipes en noms courts suivies de leurs joueurs ; le lieu ; le lien du questionnaire d'avis tant que sa campagne dure (spec `accueil`) ; le lien de la page Découvrir, présentée comme non officielle, en bêta, en complément du site de la ligue.

#### Scenario: Championnat masculin
- **WHEN** toutes les parties du message sont de la spécialité « Trinquet / P.G Pleine Masculin »
- **THEN** le message commence par « 🙏 *Merci à tous pour ce championnat d'Île-de-France de Trinquet Pala Gomme Pleine !* »

#### Scenario: Spécialité sans libellé connu
- **WHEN** une des parties du message est d'une spécialité absente de `SPEC_LABELS`
- **THEN** le message commence par « Merci à tous »

#### Scenario: Demie désignée
- **WHEN** PEP 2, avec Ane Etxeberri et Peio Larralde, reçoit Chatillon 3 en 1/2 finale de Série 2, dimanche 29 novembre à 14h, au Trinquet Paris
- **THEN** le message porte « *1/2 finales, dimanche 29 novembre* », puis « *14h · Série 2* », « PEP 2 (Ane Etxeberri & Peio Larralde) » et « vs Chatillon 3 (… & …) »

#### Scenario: Finale à désigner
- **WHEN** la finale de Série 1 se joue le 6 décembre à 17h entre deux équipes à désigner
- **THEN** le message porte « *Finales, dimanche 6 décembre* » et « • 17h : finale Série 1 », sans nom d'équipe

#### Scenario: Liens du message
- **WHEN** la campagne du questionnaire d'avis dure encore
- **THEN** le message porte le lien du questionnaire, puis celui de la page Découvrir du site, précédé de « site non officiel, en bêta, en complément de celui de la ligue »

#### Scenario: Campagne d'avis finie
- **WHEN** la date de fin de la campagne du questionnaire est passée
- **THEN** le message ne porte pas son lien, et garde celui du site

### Requirement: Écriture des noms dans le message
Dans le message, les joueurs SHALL être écrits « Prénom Nom » avec une majuscule au début de chaque mot et de chaque partie d'un nom composé, le reste en minuscules, tels que la ligue les orthographie par ailleurs ; deux joueurs sont reliés par « & », plus de deux par des virgules puis « & ». Une équipe sans composition déclarée est nommée sans parenthèses.

#### Scenario: Nom en capitales à la ligue
- **WHEN** la ligue déclare « Maite BIDART-ELIZALDE » et « Xabi BIDART-ELIZALDE » pour CPBP 1
- **THEN** le message porte « CPBP 1 (Maite Bidart-Elizalde & Xabi Bidart-Elizalde) »

#### Scenario: Composition non déclarée
- **WHEN** une équipe d'une demie n'a pas déclaré sa composition
- **THEN** le message la nomme par son nom court seul

### Requirement: Lieu dans le message
Quand toutes les parties du message se jouent au même lieu, le message SHALL le donner une seule fois, après les parties (« 📍 Trinquet Paris (75016) »). Sinon, chaque partie porte son lieu sur sa ligne d'heure.

#### Scenario: Toutes au Trinquet Paris
- **WHEN** les demies et les finales se jouent toutes à « PARIS (Trinquet Paris - 75016) »
- **THEN** le message porte une seule fois « 📍 Trinquet Paris (75016) »

### Requirement: Envoyer le message à une équipe
En mode organisateur, quand « Phases finales » est la communication choisie, chaque ligne dont le responsable a un numéro exploitable SHALL porter une troisième icône, qui ouvre WhatsApp vers ce numéro avec le message prérempli. Rien n'est envoyé par le site lui-même : le visiteur valide l'envoi dans WhatsApp.

#### Scenario: Envoyer à PEP 2
- **WHEN** l'organisateur, « Phases finales » choisie, touche l'icône d'envoi du message sur la ligne de PEP 2
- **THEN** WhatsApp s'ouvre vers le responsable de PEP 2 avec le message des phases finales prérempli

#### Scenario: Pas de message
- **WHEN** les poules sont en cours
- **THEN** aucune ligne ne porte l'icône d'envoi du message des phases finales

#### Scenario: Sans mode organisateur
- **WHEN** un joueur ouvre la page sans `orga`, poules finies et demies à venir
- **THEN** aucune ligne ne porte d'icône d'envoi

### Requirement: Filtres de la liste
La liste de toutes les équipes SHALL être précédée d'un bloc Filtres, celui du Classement : spécialité, construite d'après les données, et série (Série 1, Série 2), toutes actives par défaut. Les filtres masquent des cartes entières, sans changer aucun rang. Sans carte restante, la page dit « Aucune équipe ne correspond aux filtres. ». Le choix est retrouvé à la visite suivante, dans le navigateur. La page d'une équipe n'a pas ce bloc.

#### Scenario: Une seule série
- **WHEN** le visiteur désactive « Série 1 »
- **THEN** seules les cartes de série 2 restent, avec les mêmes rangs qu'avant, et le bloc replié résume « Série 2 »

#### Scenario: Retour sur la page
- **WHEN** le visiteur a désactivé « Série 1 » puis revient le lendemain
- **THEN** la série 1 est toujours masquée

#### Scenario: Aucune équipe
- **WHEN** le visiteur désactive les deux séries
- **THEN** la page dit « Aucune équipe ne correspond aux filtres. »

#### Scenario: Page d'une équipe
- **WHEN** le visiteur ouvre la page de Charlie 1
- **THEN** la page n'a pas de bloc Filtres

### Requirement: Communications limitées aux équipes affichées
En mode organisateur (spec `communications-equipes`), une communication SHALL ne viser que les équipes que les filtres laissent affichées : une équipe masquée n'a pas d'icône d'envoi visible, ne figure pas dans la liste « Aperçu pour » et n'est pas comptée dans la note du bloc. Le contenu de « Phases finales » reste celui de toute la ligue : seuls ses destinataires suivent les filtres.

#### Scenario: Communication à une seule série
- **WHEN** l'organisateur désactive « Série 1 » et choisit « Prochaine partie »
- **THEN** seules les équipes de série 2 ont un avion en papier, la liste « Aperçu pour » ne propose qu'elles, et la note ne compte qu'elles

#### Scenario: Aucune équipe affichée concernée
- **WHEN** les filtres ne laissent aucune équipe concernée par la communication choisie
- **THEN** la note et l'aperçu le disent, et le bloc ne propose pas de partage

#### Scenario: Plusieurs spécialités
- **WHEN** les données comptent plus d'une spécialité
- **THEN** la liste « Aperçu pour » nomme la spécialité de chaque équipe
