# Proposal

## Why

La page Équipes envoie un seul message, celui des phases finales, et son texte est figé dans le code. Or l'organisateur écrit aux équipes à chaque moment de la saison : début de championnat, prochaine partie, fin de poule, phases finales. Chaque nouveau texte passe aujourd'hui par une demande de développement.

L'organisateur doit pouvoir **choisir la communication** que l'avion en papier envoie, et **écrire la sienne avec des balises** remplies pour chaque équipe. C'est le premier pas d'un catalogue de communications qu'on enrichira au fil de la saison.

## What Changes

- **Mode organisateur** : ouverte avec `?orga` dans l'adresse (`equipe.html?orga`), la page Équipes porte le bloc des communications et l'avion en papier. L'adresse garde `orga` quand on passe de la liste à une équipe et retour.
  - Sans compte, ce n'est pas une protection : l'adresse évite seulement d'encombrer la page des joueurs.
  - **BREAKING** : sans `?orga`, la page n'a plus ni bloc « Message aux équipes » ni avion en papier. WhatsApp et SMS restent sur chaque ligne.
- **Choix de la communication**, en tête de la liste, sous forme de pastilles, sans fenêtre surgissante. L'avion en papier de chaque ligne envoie la communication choisie, préremplie pour cette équipe :
  - **Phases finales** : le message actuel, inchangé. Proposée seulement tant que des phases finales restent à jouer, poules finies.
  - **Prochaine partie** : pour chaque équipe qui a une partie à venir, sa date, son heure, son lieu, son adversaire, les joueurs adverses, et le responsable adverse avec son numéro. Les équipes sans partie à venir n'ont pas d'avion en papier.
  - **Perso** : un texte que l'organisateur écrit avec des balises (`{responsable}`, `{adversaire}`, `{tel adversaire}`…), insérées par des boutons. Il est gardé sur l'appareil.

  Par défaut, la page choisit « Phases finales » quand elle est proposée, sinon « Prochaine partie ».
- **Aperçu** : la communication choisie, remplie pour une équipe au choix, avec un bouton Partager. Les numéros y sont masqués (« 06 •• •• •• 78 »). Le message envoyé les porte en entier.
- **Une balise vide fait disparaître sa ligne** : une équipe sans partie à venir ne reçoit pas de « contre  à  ».
- **Données personnelles**, deux choix validés par le demandeur et écrits dans la spec `donnees-api` :
  - l'exception des noms de joueurs s'étend aux communications de l'organisateur ;
  - le nom et le numéro du responsable adverse peuvent y entrer, comme dans le message de vérification de Parties.
- **Plus tard**, avec des textes écrits ensemble : « Fin de poule » (un texte par sort ?) et « Début de championnat ».

## Capabilities

### New Capabilities
- `communications-equipes` : le mode organisateur, le choix de la communication, les communications « Prochaine partie » et « Perso », les balises, l'aperçu et l'envoi à chaque équipe.

### Modified Capabilities
- `liste-equipes` :
  - « Message des phases finales » devient une communication du mode organisateur ;
  - « Envoyer le message à une équipe » envoie la communication choisie, et seulement en mode organisateur.
- `donnees-api` :
  - « Noms de joueurs seuls » : exception étendue aux communications ;
  - « Numéro des responsables jamais écrit » : masqué dans l'aperçu ;
  - « Préférences gardées sur l'appareil » : le message perso entre dans la liste, la dernière équipe consultée en sort (elle a été retirée par `page-equipes-liste`).

## Impact

- **Page** : `equipe.html` uniquement, pour le mode organisateur, le bloc des communications, le moteur de balises, l'aperçu, l'éditeur et l'avion en papier. `Version AAAA.MM.JJ` mise à jour.
- **Recopie** : `prenomDuResponsable` vient de `programme.html`, recopiée à l'identique, avec un test qui compare les deux copies.
- **`localStorage`** : une clé nouvelle, `lidfpb_message_perso_v1`, pour le texte perso. README à jour.
- **Tests** :
  - le mode organisateur et son absence ;
  - le choix par défaut ;
  - « Prochaine partie » sur les données fictives (avion absent sans partie à venir) ;
  - les balises, et la ligne d'une balise vide qui disparaît ;
  - le texte perso gardé et rétabli ;
  - le numéro masqué dans l'aperçu et entier dans le lien ;
  - `orga` qui reste dans l'adresse ;
  - les scénarios des phases finales passent en `?orga`.
- **Revue** : `/code-review`, et `/security-review`, car le changement touche aux données de l'API (numéros, noms), au `localStorage` et à du texte saisi.
- **Hors champ** :
  - « Fin de poule » et « Début de championnat » ;
  - plusieurs textes perso enregistrés ;
  - le partage d'un modèle par lien ;
  - les communications par partie (aux deux responsables) ;
  - le SMS prérempli ;
  - « Prévenir l'équipe », qui reste sur la page d'une équipe, pour tous.

## Hypothèses à valider

1. **L'organisateur écrit sa relance de la finale du 6 décembre sans demande de développement**, en moins de 10 minutes, avec « Perso » ou « Prochaine partie ».
2. **Une adresse d'organisateur suffit.** On ouvre `equipe.html?orga` depuis un favori. Si c'est trop pénible à retrouver depuis l'application installée, on gardera le mode sur l'appareil.
3. **Trois communications couvrent la fin de saison.** La suivante, « Fin de poule », n'attend que d'être écrite ensemble pour septembre.
