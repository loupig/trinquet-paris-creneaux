# communications-equipes Specification

## Purpose

Permettre à l'organisateur de choisir, sur la page Équipes, la communication à envoyer à chaque équipe (phases finales, prochaine partie, ou un texte à lui écrit avec des balises), préremplie pour chaque équipe, sans demande de développement pour chaque nouveau texte.

## Requirements

### Requirement: Mode organisateur
La page Équipes SHALL passer en mode organisateur quand son adresse porte le paramètre `orga`, avec ou sans valeur, ou quand le visiteur touche « Mode organisateur » dans son pied de page (un lien vers `equipe.html?orga`). Le mode est alors gardé dans le navigateur (clé `lidfpb_orga_v1`) : les visites suivantes de la page Équipes, même par l'onglet, sont en mode organisateur, et `orga` quitte l'adresse, pour qu'un lien copié n'y emmène pas un joueur. En mode organisateur, le pied de page porte « Quitter le mode organisateur » à la place du lien : le toucher oublie le mode et rouvre la vue affichée sans lui. Quand le navigateur refuse le stockage, le mode vaut pour la visite : passer de la liste à une équipe, ou d'une équipe à l'autre, MUST alors garder `orga` dans l'adresse. Ce mode seul montre le bloc des communications et l'icône d'envoi des lignes. Hors de ce mode, la page n'a ni bloc des communications ni icône d'envoi. Le mode est le même sur Parties (spec `programme`), qui a le même lien et le même bouton dans son pied de page : entré ou quitté sur l'une des deux pages, il l'est sur l'autre. Ce n'est pas une protection : aucun code n'est demandé.

#### Scenario: Ouvrir en organisateur
- **WHEN** l'organisateur ouvre `equipe.html?orga`
- **THEN** la liste est précédée du bloc des communications, et les lignes joignables portent l'icône d'envoi

#### Scenario: Par le pied de page
- **WHEN** l'organisateur touche « Mode organisateur » en bas de la page Équipes
- **THEN** la page passe en mode organisateur, et l'adresse ne porte plus `orga`

#### Scenario: Mode gardé
- **WHEN** l'organisateur, passé en mode organisateur, revient plus tard sur la page Équipes par l'onglet
- **THEN** la page est en mode organisateur

#### Scenario: Quitter
- **WHEN** l'organisateur touche « Quitter le mode organisateur »
- **THEN** la page n'a plus de bloc des communications, ni à cette visite ni aux suivantes, et le pied de page propose à nouveau « Mode organisateur »

#### Scenario: Même mode sur Parties
- **WHEN** l'organisateur passe en mode organisateur sur la page Équipes, puis ouvre Parties
- **THEN** Parties est en mode organisateur : ses icônes WhatsApp et SMS portent le message de vérification de la partie

#### Scenario: Visiteur ordinaire
- **WHEN** un joueur ouvre `equipe.html` par l'onglet, sans être jamais passé en mode organisateur
- **THEN** la page n'a ni bloc des communications ni icône d'envoi, et garde WhatsApp et SMS sur chaque ligne joignable

#### Scenario: Stockage refusé
- **WHEN** le navigateur refuse le stockage, et que l'organisateur ouvre `equipe.html?orga`, ouvre une équipe depuis la liste puis revient à la liste
- **THEN** l'adresse porte `orga` à chaque étape, et le bloc des communications est toujours là

### Requirement: Choix de la communication
Le bloc SHALL proposer, sous forme de pastilles, les communications disponibles, dans cet ordre : « Phases finales », « Prochaine partie », « Perso ». Une seule est choisie à la fois. Une communication sans destinataire n'est pas proposée. Par défaut, la page choisit « Phases finales » si elle est proposée, sinon « Prochaine partie », sinon « Perso ». Le choix vaut le temps de la visite.

#### Scenario: Poules en cours
- **WHEN** l'organisateur ouvre la page alors que des parties de poule restent à jouer
- **THEN** « Phases finales » n'est pas proposée, et « Prochaine partie » est choisie

#### Scenario: Poules finies, demies à venir
- **WHEN** les poules sont finies et que les demies se jouent dimanche
- **THEN** « Phases finales » est proposée et choisie

### Requirement: Envoyer la communication choisie
En mode organisateur, la ligne d'une équipe dont le responsable a un numéro exploitable, et que la communication choisie concerne, SHALL porter une icône d'envoi. Elle ouvre WhatsApp vers ce numéro avec la communication préremplie pour cette équipe, et dit, pour qui écoute la page, quelle communication elle envoie à quelle équipe. Changer de communication met à jour toutes les icônes. Rien n'est envoyé par le site lui-même.

#### Scenario: Envoyer « Prochaine partie » à PEP 2
- **WHEN** l'organisateur choisit « Prochaine partie » et touche l'icône d'envoi de PEP 2
- **THEN** WhatsApp s'ouvre vers le responsable de PEP 2 avec la prochaine partie de PEP 2 préremplie

#### Scenario: Équipe non concernée
- **WHEN** « Prochaine partie » est choisie et qu'une équipe n'a plus de partie à venir
- **THEN** sa ligne n'a pas d'icône d'envoi, mais garde WhatsApp et SMS

### Requirement: Communication « Prochaine partie »
La communication « Prochaine partie » SHALL concerner les équipes qui ont une partie à venir, et leur envoyer le message de vérification de cette partie, le même que celui des icônes de Parties en mode organisateur (spec `programme`), mis en forme pour WhatsApp, dans cet ordre :
- « Bonjour » et le prénom du responsable quand il peut être isolé ;
- « Votre partie », l'équipe et son adversaire en noms officiels (« Charlie (éq. 1) vs Foxtrot (éq. 1) »), « est prévue le » avec le jour, la date et l'année et l'heure en gras, puis « à » et le lieu tel que la ligue l'écrit, s'il est connu ; le point ferme la dernière ligne écrite ;
- « Tout est bon de votre côté ? » ;
- « Responsable adverse : » avec son nom et, entre parenthèses, son numéro lisible, quand ils sont connus ;
- pour une partie de poule, le rappel que les phases finales ne se reportent pas, avec les jours des 1/4, 1/2 et finales de sa série (sans les créneaux) ;
- en italique, la compétition, la spécialité, la série et la poule ou la phase ;
- « Merci. »

Chaque élément inconnu est omis.

#### Scenario: Partie à venir
- **WHEN** Charlie 1 reçoit Foxtrot 1 jeudi à 19h30 au Trinquet Paris, et que le responsable de Foxtrot 1 a un numéro
- **THEN** la communication de Charlie 1 donne « Charlie (éq. 1) vs Foxtrot (éq. 1) », jeudi et 19h30, le lieu, « Tout est bon de votre côté ? », le nom du responsable de Foxtrot 1 et son numéro, les jours des phases finales, puis « Merci. »

#### Scenario: Adversaire sans numéro
- **WHEN** le responsable de l'adversaire n'a pas de numéro exploitable
- **THEN** la communication n'a pas de ligne pour le responsable adverse

### Requirement: Communication « Perso »
La communication « Perso » SHALL être un texte que l'organisateur écrit dans le bloc, avec des boutons qui insèrent chaque balise à l'endroit du curseur. Le texte est gardé dans le navigateur, jamais envoyé à un serveur, et revient à la visite suivante. Un bouton rétablit le texte d'exemple. Une balise inconnue est signalée sous le champ et laissée telle quelle.

#### Scenario: Texte gardé
- **WHEN** l'organisateur écrit un texte perso, ferme la page puis la rouvre en mode organisateur
- **THEN** « Perso » porte son texte

#### Scenario: Balise inconnue
- **WHEN** le texte porte `{capitaine}`
- **THEN** le bloc signale « Balise inconnue : {capitaine} », et le message garde `{capitaine}` tel quel

#### Scenario: Stockage indisponible
- **WHEN** le navigateur refuse le stockage local
- **THEN** « Perso » fonctionne pour la visite, sans message d'erreur

### Requirement: Balises
Une balise SHALL s'écrire entre accolades et être remplie pour l'équipe de la ligne : `{responsable}` (prénom), `{equipe}`, `{equipe officielle}`, `{serie}`, `{poule}`, `{rang}`, `{joueurs}` ; pour sa prochaine partie : `{date}`, `{heure}`, `{lieu}`, `{adversaire}`, `{joueurs adversaire}`, `{responsable adversaire}`, `{tel adversaire}` ; et `{lien site}`, `{lien questionnaire}`, `{phases finales}`.

#### Scenario: Remplir pour une équipe
- **WHEN** le texte est « Bonjour {responsable}, vous jouez contre {adversaire} » et que la prochaine partie de Charlie 1 est contre Foxtrot 1
- **THEN** le message de Charlie 1 porte « Bonjour <prénom du responsable de Charlie 1>, vous jouez contre Foxtrot 1 »

#### Scenario: Phases finales dans un texte perso
- **WHEN** le texte porte `{phases finales}` et que des phases finales restent à jouer
- **THEN** la balise est remplacée par les parties des phases finales, telles que les donne la communication « Phases finales »

### Requirement: Ligne d'une balise vide
Une ligne du texte dont une balise est vide pour l'équipe SHALL disparaître du message de cette équipe. Deux lignes vides qui se suivent après cela n'en font plus qu'une.

#### Scenario: Pas de partie à venir
- **WHEN** le texte porte la ligne « Prochaine partie : {date} à {heure} » et que l'équipe n'a plus de partie à venir
- **THEN** son message n'a pas cette ligne

#### Scenario: Questionnaire fini
- **WHEN** le texte porte une ligne « {lien questionnaire} » après la fin de la campagne d'avis
- **THEN** le message n'a pas cette ligne

### Requirement: Aperçu de la communication
Le bloc SHALL montrer la communication choisie remplie pour une équipe que l'organisateur choisit, et un bouton qui la confie à la feuille de partage de l'appareil, ou la copie. Dans l'aperçu, chaque numéro de téléphone MUST être masqué sauf ses deux derniers chiffres (« 06 •• •• •• 78 »). Le message partagé et celui de l'icône d'envoi portent le numéro entier.

#### Scenario: Numéro masqué
- **WHEN** l'aperçu de « Prochaine partie » porte le numéro du responsable adverse
- **THEN** la page montre « 06 •• •• •• » suivi des deux derniers chiffres, et aucun numéro entier n'est lisible dans la page
