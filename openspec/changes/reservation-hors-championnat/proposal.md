# Proposal

> **Statut : documenté, mise en œuvre non planifiée.** On reprendra ce changement quand la ligue sera prête ; rien n'est construit d'ici là.
>
> Dépend de `migration-hebergement` : ce changement suppose le site servi par le nouvel hébergeur, avec des fonctions serveur sur la même origine.

## Why

Le Trinquet Paris est le seul trinquet de la ligue, et ses créneaux de championnat sont réservés par la ligue. La page Créneaux montre chaque semaine des créneaux libres, que personne n'utilise. Elle le dit même en tête : « pas à un usage libre ». Pendant ce temps, un licencié qui veut jouer hors championnat n'a pas de moyen simple de savoir s'il peut prendre un de ces créneaux, ni de le bloquer.

Permettre aux licenciés de **réserver eux-mêmes un créneau de ligue libre** transforme une capacité déjà payée et inutilisée en temps de jeu. C'est aussi la première fonction du site qui **écrit** quelque chose : elle fait passer le site d'outil de consultation à service de la ligue, et elle donne, pour la première fois, une mesure d'usage réelle (le nombre de réservations).

## What Changes

- **Réserver un créneau libre, tout de suite** : sur la page Créneaux, une case libre propose « Réserver ce créneau » en plus du message à l'adversaire. La réservation est **immédiate** (choix du demandeur), sans validation par un organisateur. Elle respecte des règles automatiques :
  - seulement les créneaux de la grille de la ligue, libres de toute partie de championnat et de toute autre réservation ;
  - dans les **14 jours** qui viennent ;
  - **une réservation à venir** par licencié à la fois ;
  - annulable par son auteur jusqu'à l'heure du créneau.
- **Le championnat reste prioritaire**, de deux façons :
  - **le site de la ligue fait foi** : une partie de championnat (nouvelle, ou reportée) enregistrée sur un créneau réservé annule la réservation, quel que soit le délai, et son auteur est prévenu par e-mail ;
  - **un organisateur de championnat peut annuler une réservation jusqu'à 24 heures avant** le créneau, avec un motif, pour y placer une partie avant même qu'elle soit enregistrée par la ligue.
- **Se connecter par un lien e-mail, rattaché à sa licence** (choix du demandeur) :
  - à la première réservation, le joueur donne son e-mail, son numéro de licence et son nom ;
  - le site vérifie que la licence et le nom correspondent à un licencié d'un club de la ligue, puis envoie un lien de connexion ;
  - pas de mot de passe ;
  - une licence ne se rattache qu'à un seul e-mail.
- **« Mes réservations »** en tête de la page Créneaux une fois connecté, avec l'annulation, la déconnexion et la suppression du compte.
- **Organisateurs de championnat** : des licences désignées voient le nom de l'auteur de chaque réservation et peuvent l'annuler, avec un motif envoyé par e-mail, jusqu'à 24 heures avant le créneau. Contrairement au « mode organisateur » actuel, c'est un vrai droit, vérifié par le serveur.
- **Ce que voient les autres** : une case réservée affiche « Réservé · hors championnat », sans nom. L'aide au report la montre comme disponible pour une partie de championnat, avec la mention de la réservation qu'elle annulerait.
- **BREAKING (choix assumé)** : le site n'est plus « sans compte ». La consultation reste sans compte et les préférences restent dans le navigateur ; seul le fait de réserver demande de se connecter.

## Capabilities

### New Capabilities
- `compte-joueur` : connexion par lien e-mail, rattachement à une licence, session, déconnexion, suppression du compte, rôle organisateur.
- `reservation-creneaux` : règles de réservation, annulation, priorité du championnat, notifications, vue organisateur.

### Modified Capabilities
- `creneaux` : occupation (réservations comprises), grille (fin du « pas à un usage libre »), proposition d'un créneau libre, lecture seule ; ajout des cases réservées, du bouton « Réserver ce créneau », de « Mes réservations » et du bandeau « Réservations indisponibles ».
- `report` : les créneaux réservés hors championnat restent proposés, avec une mention.
- `donnees-api` : « Préférences gardées sur l'appareil », qui ne dit plus qu'il n'y a pas de compte.

## Impact

- **Serveur (nouveau)** : fonctions sous `/api/` sur la même origine, base de données en UE, envoi d'e-mails, tâche planifiée horaire. Code sans dépendance à l'exécution ; un outil de développement de l'hébergeur en dépendance de développement, pour les tests.
- **Pages** :
  - `creneaux.html` : réservation, connexion dans la page, « Mes réservations », cases réservées ;
  - `report.html` : mention des réservations ;
  - une page `connexion.html`, où arrive le lien e-mail ;
  - `Version AAAA.MM.JJ`.
- **Constante dupliquée** : `GRID`, désormais aussi côté serveur ; un test compare les trois copies.
- **Données personnelles nouvelles** : e-mail, lien e-mail ↔ licence, historique des réservations. Note d'information, durées de conservation, registre de traitement de la ligue (design, « RGPD »).
- **Docs** :
  - README : « Choix assumés » (pas de compte → compte pour réserver seulement), section RGPD, réglages hors dépôt (secrets de l'envoi d'e-mails) ;
  - CLAUDE.md : non-objectifs, et `/security-review` obligatoire sur tout changement du serveur.
- **Revue** : `/code-review` et `/security-review` (authentification, sessions, données personnelles).
- **Hors champ** :
  - paiement ;
  - réservation d'un autre trinquet ;
  - créneaux hors de la grille de la ligue ;
  - liste d'attente ;
  - invitation des partenaires de jeu ;
  - application native ;
  - notifications autres que l'e-mail.

## Décisions à prendre par la ligue avant de commencer

1. **La ligue ouvre-t-elle ses créneaux libres au jeu libre**, et le Trinquet Paris est-il d'accord (accès à la salle, clés, accueil) ? Sans cet accord, rien de ce changement ne doit être construit.
2. **Le coût** : le créneau est-il gratuit pour un licencié, ou facturé hors du site ?
3. **Les règles** proposées ici (14 jours, une réservation à la fois, annulation par le joueur jusqu'à l'heure) : à valider ou à ajuster avant les tests.
4. **Les organisateurs de championnat** : quelles licences ont le droit d'annuler.
5. **L'e-mail des licenciés** : si la ligue connaît l'e-mail de chaque licence, envoyer le lien à *cet* e-mail serait une preuve bien plus forte que « licence + nom » (design, question ouverte 1).

## Hypothèses à valider

1. **Il y a une demande** : au moins 8 réservations par mois après deux mois d'ouverture. En dessous, on garde la fonction telle quelle et on n'investit plus (pas de liste d'attente, pas d'invitations).
2. **Le lien e-mail ne fait pas fuir** : au moins 70 % des liens envoyés sont ouverts et mènent à une connexion. Le serveur compte les deux, sans traceur dans la page.
3. **Le championnat prioritaire ne décourage pas** : moins d'une réservation sur dix annulée par une partie de championnat. Au-delà, raccourcir la fenêtre de 14 jours.
4. **Les règles suffisent sans validation humaine** : aucun abus signalé par les organisateurs sur la période. Sinon, passer à une validation par un organisateur, l'option écartée au départ.
