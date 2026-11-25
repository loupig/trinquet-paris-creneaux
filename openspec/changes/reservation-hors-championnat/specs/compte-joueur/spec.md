# Spec Delta

## Purpose

Reconnaître un licencié de la ligue qui veut réserver un créneau, sans mot de passe, par un lien envoyé à son e-mail et rattaché à son numéro de licence, en gardant la consultation du site ouverte à tous sans compte.

## ADDED Requirements

### Requirement: Consultation sans compte
Toutes les pages SHALL rester consultables sans être connecté, comme aujourd'hui. La connexion MUST n'être demandée qu'au moment de réserver, et jamais avant.

#### Scenario: Visiteur non connecté
- **WHEN** un visiteur non connecté ouvre n'importe quelle page du site
- **THEN** la page s'affiche entièrement, sans demande de connexion

### Requirement: Demande de lien de connexion
Le formulaire de connexion SHALL demander un e-mail, un numéro de licence et un nom, dans la page (pas de fenêtre surgissante). Le site envoie un lien de connexion à l'e-mail seulement si la licence et le nom correspondent à un licencié d'un club de la ligue et que la licence n'est pas déjà rattachée à un autre e-mail. Les zéros de tête du numéro, la casse et les accents du nom MUST NOT compter.

#### Scenario: Licencié reconnu
- **WHEN** un joueur saisit son e-mail, la licence « 0012345 » et le nom « arrieta », qui correspondent au licencié inventé « ARRIETA » de licence « 12345 »
- **THEN** un lien de connexion est envoyé à son e-mail

#### Scenario: Licence d'un autre club
- **WHEN** un joueur saisit une licence d'un club hors de la ligue
- **THEN** aucun lien n'est envoyé

### Requirement: Réponse identique
Après une demande de lien, la page SHALL afficher la même réponse, que le lien soit parti ou non : « Si ces informations correspondent à un licencié de la ligue, un lien vient de partir à cette adresse. » Elle donne ensuite, sous la réponse, les raisons possibles de ne rien recevoir, dont une licence déjà rattachée à un autre e-mail, à signaler à un organisateur.

#### Scenario: Informations fausses
- **WHEN** un visiteur saisit une licence et un nom qui ne correspondent à personne
- **THEN** la page affiche la même réponse que pour un licencié reconnu, et aucun e-mail ne part

### Requirement: Lien à usage unique
Un lien de connexion SHALL être valable 15 minutes et une seule fois. L'ouvrir MUST ne pas suffire à connecter : la page d'arrivée connecte le joueur elle-même, pour qu'un logiciel qui ouvre les liens d'un e-mail pour les analyser ne consomme pas le lien. Un lien expiré ou déjà utilisé affiche un message et propose d'en demander un autre.

#### Scenario: Lien ouvert à temps
- **WHEN** un joueur ouvre son lien 5 minutes après l'avoir demandé
- **THEN** il est connecté et revient sur la page Créneaux, au créneau qu'il voulait réserver

#### Scenario: Lien réutilisé
- **WHEN** un joueur ouvre une seconde fois un lien qui l'a déjà connecté
- **THEN** la page indique que le lien a déjà servi et propose d'en demander un nouveau

### Requirement: Rattachement à la licence
À la première connexion, l'e-mail SHALL être rattaché à la licence saisie, de façon définitive. Une licence MUST NOT être rattachée à plus d'un e-mail, ni un e-mail à plus d'une licence. Seul un organisateur peut défaire un rattachement.

#### Scenario: Seconde adresse pour la même licence
- **WHEN** une licence est rattachée à un e-mail, et qu'une demande de lien arrive pour cette licence avec un autre e-mail
- **THEN** aucun lien n'est envoyé à l'autre e-mail

### Requirement: Session
Une fois connecté, le joueur SHALL le rester sur cet appareil 30 jours après sa dernière visite, sans rien ressaisir. La session MUST être gardée par un cookie inaccessible au JavaScript des pages, jamais dans `localStorage`, et MUST être refusée depuis un autre site.

#### Scenario: Retour une semaine plus tard
- **WHEN** un joueur connecté revient sur la page Créneaux une semaine plus tard, sur le même appareil
- **THEN** il est toujours connecté et voit ses réservations

### Requirement: Déconnexion
Un joueur connecté SHALL pouvoir se déconnecter depuis « Mes réservations ». La session est alors détruite côté serveur, pas seulement oubliée par l'appareil.

#### Scenario: Se déconnecter
- **WHEN** le joueur touche « Se déconnecter »
- **THEN** la page Créneaux le montre non connecté, et réutiliser son ancien cookie ne donne plus accès à ses réservations

### Requirement: Suppression du compte
Un joueur connecté SHALL pouvoir supprimer son compte, après confirmation dans la page. La suppression efface son e-mail et le rattachement à sa licence, annule ses réservations à venir et retire son nom de ses réservations passées.

#### Scenario: Supprimer son compte
- **WHEN** un joueur qui a une réservation à venir supprime son compte
- **THEN** la réservation est annulée, le créneau redevient libre, et une nouvelle demande de lien pour sa licence avec un autre e-mail est acceptée

### Requirement: Rôle organisateur
Le rôle organisateur SHALL être donné à des licences désignées par la ligue, vérifié par le serveur à chaque action. Il ne dépend pas du « mode organisateur » des pages Équipes et Parties, qui reste un simple affichage.

#### Scenario: Mode organisateur des pages sans le rôle
- **WHEN** un joueur sans le rôle a activé le mode organisateur de la page Équipes, puis ouvre la page Créneaux
- **THEN** il ne voit pas les noms des auteurs des réservations et ne peut annuler que les siennes
