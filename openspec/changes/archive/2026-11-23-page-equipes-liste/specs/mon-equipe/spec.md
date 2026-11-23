# Spec Delta

## MODIFIED Requirements

### Requirement: Équipe affichée
La page SHALL porter sur l'équipe désignée dans l'adresse de la page. Sans équipe dans l'adresse, la page MUST montrer la liste de toutes les équipes (spec `liste-equipes`), et non la dernière équipe consultée ni une équipe suivie. Une équipe désignée qui n'existe pas dans les rencontres publiées est traitée comme absente : la page montre la liste, sans message d'erreur.

#### Scenario: Lien partagé
- **WHEN** un visiteur ouvre un lien de la page qui désigne une équipe
- **THEN** la page montre cette équipe, même s'il ne la suit pas et ne l'a jamais consultée

#### Scenario: Retour par l'onglet
- **WHEN** un visiteur a consulté une équipe, puis revient plus tard sur la page par l'onglet, sans équipe dans l'adresse
- **THEN** la page montre la liste de toutes les équipes

#### Scenario: Première visite d'un visiteur qui suit des équipes
- **WHEN** un visiteur qui suit deux équipes ouvre la page pour la première fois, sans équipe dans l'adresse
- **THEN** la page montre la liste de toutes les équipes, sous les pastilles de ses deux équipes suivies

#### Scenario: Première visite sans équipe suivie
- **WHEN** un visiteur qui ne suit aucune équipe ouvre la page pour la première fois, sans équipe dans l'adresse
- **THEN** la page montre la liste de toutes les équipes, sans pastilles

#### Scenario: Équipe introuvable
- **WHEN** l'adresse désigne une équipe absente des rencontres publiées
- **THEN** la page montre la liste de toutes les équipes, sans message d'erreur

## ADDED Requirements

### Requirement: Retour à la liste des équipes
La page d'une équipe SHALL porter en tête un lien « ← Toutes les équipes », qui montre la liste sans recharger les données et retire l'équipe de l'adresse.

#### Scenario: Revenir à la liste
- **WHEN** le visiteur, sur la page de Charlie 1, touche « ← Toutes les équipes »
- **THEN** la liste de toutes les équipes s'affiche, l'adresse ne désigne plus d'équipe, et aucun appel réseau n'est émis

## REMOVED Requirements

### Requirement: Choix de l'équipe
**Reason**: La liste déroulante est remplacée par la liste de toutes les équipes, au format du Classement, qui montre aussi de quoi joindre chaque responsable (spec `liste-equipes`).
**Migration**: Ouvrir l'onglet « Équipes », puis toucher la ligne d'une équipe et « Voir l'équipe → ». Les équipes suivies restent en pastilles en tête de page.

### Requirement: Dernière équipe mémorisée sur l'appareil
**Reason**: Sans équipe dans l'adresse, la page montre désormais la liste : la dernière équipe consultée n'a plus d'usage.
**Migration**: Aucune action du visiteur. La clé `lidfpb_equipe_vue_v1` n'est plus lue ni écrite, et ce qu'elle contient encore dans un navigateur reste ignoré.
