# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
