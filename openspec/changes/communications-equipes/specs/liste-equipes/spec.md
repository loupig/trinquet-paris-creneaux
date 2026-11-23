# Spec Delta

## MODIFIED Requirements

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
