# Proposal

## Why

La liste de la page Équipes montre toutes les équipes de toutes les séries, sans moyen d'en garder une partie. Le Classement, Parties et Créneaux ont déjà un bloc Filtres (spécialité, série), replié par défaut, avec un résumé. Le demandeur veut le même sur la page Équipes, surtout pour le jour où le site accueillera d'autres spécialités.

C'est utile dès aujourd'hui, avec une seule spécialité : « Série 2 seulement » réduit la liste, et en mode organisateur, la communication ne part alors qu'aux équipes de série 2.

## What Changes

- **Un bloc Filtres sur la liste de la page Équipes**, recopié du Classement :
  - pastilles de spécialité, construites d'après les données ;
  - pastilles de série (Série 1, Série 2), toutes actives par défaut ;
  - replié par défaut, avec le même résumé (« Tout est affiché », « Série 2 »…) ;
  - le pli est commun avec Parties, Classement et Créneaux (`lidfpb_filters_open_v1`), et le script du pli et du résumé est recopié à l'identique.
- **Les filtres masquent des cartes entières** et ne changent jamais le rang d'une équipe. Quand aucune carte ne reste, la page dit « Aucune équipe ne correspond aux filtres. ».
- **Le choix est retrouvé d'une visite à l'autre**, dans le navigateur, dans une clé nouvelle `lidfpb_equipes_filters_v1`.
- **La page d'une équipe n'a pas de filtres** : le bloc n'apparaît que sur la liste.
- **Communications en mode organisateur** : elles ne visent que les équipes affichées. Une équipe masquée par les filtres n'a pas d'avion en papier visible, elle sort de la liste « Aperçu pour », et la note « N équipes ont une partie à venir » ne la compte pas.
- **Plusieurs spécialités** : quand les données en ont plus d'une, l'en-tête de chaque carte et la liste « Aperçu pour » nomment la spécialité. Ça corrige un constat de la revue de `communications-equipes`. Avec une seule spécialité, rien ne change à l'écran.

## Capabilities

### New Capabilities
Aucune.

### Modified Capabilities
- `liste-equipes` :
  - « Liste de toutes les équipes » : la spécialité est nommée quand il y en a plusieurs ;
  - deux exigences nouvelles : « Filtres de la liste », et « Communications limitées aux équipes affichées ».

  Cette dernière va dans `liste-equipes` et non dans `communications-equipes` : cette spec n'existera dans les specs principales qu'après l'archivage de la PR #63, et un delta ne peut modifier qu'une spec qui existe.
- `programme` : « Résumé des filtres repliés » et « Filtres mémorisés sur l'appareil ». Le pli et le résumé deviennent communs aux quatre pages (Équipes ajoutée).

## Impact

- **Pages** :
  - `equipe.html` : HTML du bloc, CSS des filtres recopié, `SPEC_LABELS` recopiée, script du pli et du résumé recopié, état des filtres, filtrage dans `groupesDeLaListe`, et les communications limitées aux équipes affichées ;
  - `Version AAAA.MM.JJ` à mettre à jour.
- **Constantes et scripts dupliqués** :
  - `SPEC_LABELS` rejoint la page Équipes ;
  - le test « le script du pli et du résumé est le même » passe à quatre pages ;
  - README à jour.
- **`localStorage`** : une clé nouvelle, `lidfpb_equipes_filters_v1`. Tableau du README à jour.
- **Tests** :
  - le bloc replié avec « Tout est affiché » ;
  - « Série 2 » masquée, puis retrouvée après rechargement ;
  - le pli partagé avec le Classement ;
  - aucune carte, puis le message ;
  - aucun bloc sur la page d'une équipe ;
  - en organisateur, une équipe filtrée sort de l'aperçu et des envois ;
  - deux spécialités (données de test enrichies) nommées dans l'en-tête et l'aperçu.
- **Hors champ** : le filtre par club ou par poule, et un filtre « mes équipes suivies ». On les ajoutera si on en a besoin.

## Hypothèses à valider

1. **Le filtre Série sert dès maintenant à l'organisateur** : envoyer une communication à une seule série sans toucher aux autres lignes.
2. **Le même bloc que sur les autres pages ne demande aucune explication** aux joueurs : on le mesure par l'absence de questions.
