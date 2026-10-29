# Proposal

## Why

Les joueurs organisent leur semaine dans l'agenda de leur téléphone, pas sur ce site. Une partie qui n'y figure pas s'oublie : il faut alors la reporter, ou la perdre, ce qui agace les deux équipes. La page Report traite déjà ce problème une fois qu'il est là. Ce changement l'attaque plus tôt : mettre la prochaine partie dans l'agenda en un geste, depuis la page de son équipe.

C'est un premier pas volontairement petit, pour vérifier une hypothèse : **les joueurs veulent leurs parties dans leur agenda**. Si elle se vérifie, l'étape suivante sera d'ajouter toutes les parties de l'équipe en une fois.

## What Changes

- **Bouton « Ajouter à mon agenda »** dans la carte « Prochaine partie » de Mes équipes, à côté de « Compter cette partie » et de « Chercher une date de report ».
- Le bouton fait télécharger un fichier agenda (`.ics`), construit dans le navigateur à partir des données déjà chargées. Le téléphone l'ouvre dans son application d'agenda.
- L'événement contient :
  - les deux équipes, l'équipe qui reçoit en premier ;
  - la série, et la poule ou la phase ;
  - le jour et l'heure de la partie, ceux du report quand elle a été reportée ;
  - le lieu ;
  - un lien vers la page de l'équipe ;
  - un rappel la veille.
- Rien d'autre ne change sur la page.

## Capabilities

### New Capabilities
<!-- Aucune : tout se passe dans la page Mes équipes. -->

### Modified Capabilities
- `mon-equipe` : la prochaine partie peut être ajoutée à l'agenda de l'appareil.

## Impact

- `equipe.html` (bouton, construction du fichier, version du pied de page), `tests/pages.spec.mjs` (un scénario), la spec `mon-equipe`. Le README n'a pas à changer : il renvoie aux specs pour le comportement des pages.
- Aucun nouvel appel API, aucune nouvelle clé `localStorage`.
- Données personnelles : aucune. Le fichier ne contient ni nom de joueur, ni nom ou numéro de responsable. Il ne contient que ce que la carte affiche déjà : équipes, série, date, lieu. Rien n'est envoyé : le fichier est créé sur l'appareil et reste sur l'appareil.

## Hypothèses à valider

1. **Durée de l'événement : 1 h 30.** Une partie en 40 points dure environ une heure, et l'on arrive un peu avant. Les données de la ligue ne donnent pas de durée.
2. **Rappel 24 heures avant**, à l'heure de la partie. Google Agenda ignore le rappel d'un fichier importé et applique ses propres rappels : c'est assumé.
3. **Heure de Paris**, quel que soit le fuseau de l'appareil : les heures de la ligue sont des heures de Paris.
4. **Seule la prochaine partie** a le bouton. Elle a toujours un jour et une heure lisibles, par définition. La liste des parties n'a pas de bouton, pour ne pas l'alourdir avant d'avoir appris quelque chose.
5. **Partie reportée ensuite** : ajouter de nouveau la partie remplace l'événement dans les agendas qui reconnaissent l'identifiant de l'événement (celui de la partie dans la ligue). Ailleurs, elle peut apparaître en double : c'est accepté pour ce premier pas.
6. **Application installée sur iPhone** : on ne sait pas si l'écran d'accueil (mode installé, sans barre Safari) laisse ouvrir le fichier. Ce point se vérifie sur un vrai téléphone avant la fusion ; sans réponse positive, le changement ne part pas tel quel.
7. **Mesure de l'hypothèse** : le site n'envoie rien et n'a pas de statistiques. On demande à deux ou trois capitaines, trois semaines après la mise en ligne, s'ils s'en servent.
