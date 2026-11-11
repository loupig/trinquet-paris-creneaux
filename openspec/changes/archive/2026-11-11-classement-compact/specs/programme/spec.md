# Spec Delta

## MODIFIED Requirements

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
