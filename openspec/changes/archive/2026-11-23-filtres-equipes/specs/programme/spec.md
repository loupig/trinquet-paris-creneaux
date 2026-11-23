# Spec Delta

## MODIFIED Requirements

### Requirement: Résumé des filtres repliés
Replié, le bloc Filtres SHALL afficher sous son titre, sur une ligne, un résumé de ce qui est filtré, commun aux pages Parties, Classement, Créneaux et Équipes (liste de toutes les équipes). Le résumé ne cite que ce qui s'écarte du réglage par défaut : un filtre laissé tout actif n'y figure pas. Dans un filtre, il cite la liste la plus courte : les valeurs gardées, ou celles retirées sous la forme « sans … ». Il MUST NOT citer plus de trois éléments : au-delà, le reste est compté (« +2 »). Sans aucun filtre, il indique « Tout est affiché ». Le résumé suit chaque changement de filtre. Déplié, le bloc ne l'affiche pas.

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
La page SHALL retrouver, d'une visite à l'autre sur le même navigateur, l'état de ses filtres et l'état ouvert ou replié du bloc Filtres, ce dernier étant commun aux pages Parties, Classement, Créneaux et Équipes. Le bloc Filtres est replié par défaut, avec son résumé (« Résumé des filtres repliés ») : il ne s'ouvre que si le visiteur l'a ouvert lui-même, sur l'une de ces quatre pages, et ne l'a pas refermé depuis. Ce choix reste dans le navigateur et n'est envoyé nulle part. Si le navigateur ne peut pas le relire, les valeurs par défaut s'appliquent, sans message.

#### Scenario: Première visite
- **WHEN** un visiteur ouvre la page Parties pour la première fois sur ce navigateur
- **THEN** le bloc Filtres est replié et affiche « Tout est affiché »

#### Scenario: Bloc ouvert à la main
- **WHEN** un visiteur a ouvert le bloc Filtres sur la page Classement, puis ouvre la page Créneaux
- **THEN** le bloc Filtres de Créneaux est ouvert

#### Scenario: Retour sur la page
- **WHEN** un visiteur a masqué la série 2 et replié le bloc Filtres, puis revient le lendemain sans avoir rouvert le bloc Filtres sur une autre page
- **THEN** la série 2 est toujours masquée et le bloc toujours replié

#### Scenario: Pli partagé avec la page Équipes
- **WHEN** un visiteur a ouvert le bloc Filtres sur le Classement, puis ouvre la liste de la page Équipes
- **THEN** le bloc Filtres de la page Équipes est ouvert
