# noms-clubs Specification

## Purpose

Fixer les noms courts des clubs de la ligue, tels que les clubs se nomment entre eux, et la façon d'écrire une équipe sous son nom court, pour toutes les pages qui manquent de place.

## Requirements

### Requirement: Table des noms courts
Le site SHALL connaître, pour les clubs suivants, un nom court, repéré par le nom que la ligue donne au club, en majuscules et sans espaces autour :

| Nom donné par la ligue | Nom court |
|---|---|
| CHAVILLE PELOTE BASQUE | Chaville |
| CHATILLON PELOTE BASQUE | Chatillon |
| PARIS EUSKAL PILOTA | PEP |
| METRO PELOTE BASQUE ANTONY | MPBA |
| CLUB DE PELOTE BASQUE DE PARIS | CPBP |
| LEVALLOIS SC | LSC |
| PARIS PELOTE BASQUE 13 | PPB13 |
| PARIS TALDEA | Taldea |

Un club absent de la table, comme AAESB ou PILOTARI, déjà courts, garde le nom que donne la ligue : le site MUST NOT inventer d'abréviation. Un club que la ligue renomme cesse d'être reconnu et retrouve son nom complet, sans erreur. Chaque page qui affiche des noms courts porte une copie de cette table, identique dans toutes ces pages. La table ne change qu'en accord avec le demandeur, dans la spec et dans chaque copie.

#### Scenario: Club de la table
- **WHEN** la ligue nomme un club « METRO PELOTE BASQUE ANTONY »
- **THEN** son nom court est « MPBA »

#### Scenario: Club hors de la table
- **WHEN** la ligue nomme un club « PILOTARI »
- **THEN** son nom court est « PILOTARI »

#### Scenario: Copies identiques
- **WHEN** l'accueil et le Classement portent chacun la table
- **THEN** les deux copies ont les mêmes noms et les mêmes noms courts

### Requirement: Équipe sous son nom court
Une équipe écrite sous son nom court SHALL l'être sous la forme : nom court du club, une espace, numéro d'équipe (« MPBA 1 », « PEP 2 »). Sans numéro d'équipe, le nom court seul. Le nom officiel complet, sous la forme « Nom de la ligue (éq. N) », reste disponible là où la page le prévoit.

#### Scenario: Équipe numérotée
- **WHEN** l'équipe 2 de « PARIS EUSKAL PILOTA » est écrite sous son nom court
- **THEN** elle s'écrit « PEP 2 »

#### Scenario: Club hors de la table
- **WHEN** l'équipe 1 d'un club « Alpha » absent de la table est écrite sous son nom court
- **THEN** elle s'écrit « Alpha 1 »
