# Design

## Context

Voir proposal.md, « Why ». Les specs de ce change ont été écrites à partir d'une lecture complète de chaque page (`classement.html`, `programme.html`, `creneaux.html`, `report.html`, `compteur.html`), des éléments communs aux sept pages, et des copies du calcul de classement dans `index.html` et `equipe.html`. Ces copies ont été comparées avec `diff` : elles sont identiques, aux noms de fonctions près. Le README a été lu en parallèle, et chaque différence avec le code est relevée plus bas.

## Goals / Non-Goals

**Goals:**
- Des specs qui décrivent ce que font les pages aujourd'hui, et qu'on peut vérifier sur le site en ligne.
- Une liste complète des écarts entre le code, le README et l'intention, pour qu'aucun ne se perde.

**Non-Goals:**
- Corriger un bug, un texte ou un titre dans les pages. Chaque correction fera l'objet de son propre change.
- Trancher les questions RGPD relevées. Elles sont signalées, pas résolues.
- Documenter les constantes, les clés de stockage et les noms de fonctions dans les specs. Ils restent dans la section Configuration du README.

## Decisions

**D1. Specs de pages et specs transverses.** Une spec par page qui n'en avait pas, plus `navigation`, `donnees-api` et `calcul-classement`. Ce qui est commun aux pages n'est écrit qu'une fois. Le calcul du classement, recopié dans trois pages, a enfin une spec qui fixe l'obligation de résultats identiques. Alternative écartée : une spec par page seulement. Le cache, la barre d'onglets et la règle sur les noms de joueurs y auraient été répétés six fois, avec le risque de diverger.

**D2. Le code fait foi, mais un bug n'est pas une règle.** Quand le code et le README divergent, la spec suit le code. Quand le code contredit visiblement son intention, comme le nombre de changements de leader du compteur, toujours à zéro, la spec n'inscrit ni le comportement fautif ni l'intention non tenue : le point reste hors spec et figure dans la liste des écarts. C'est aussi le cas d'un comportement dont on ne sait pas s'il est voulu, comme les créneaux déjà passés du jour encore proposés comme libres. Alternative écartée : spécifier l'intention. La spec serait fausse dès son archivage, et ce change ne corrige rien.

**D3. Le pourquoi en une phrase, seulement quand il protège une règle.** Par exemple : diviser par le nombre de parties jouées parce que les poules n'avancent pas au même rythme, plafonner l'échelle des échanges pour qu'une pause n'écrase pas le graphe, ou ne pas afficher de grille vide parce qu'elle serait lue comme « tout est libre ». Les justifications purement historiques vont dans le paragraphe « Choix assumés » du README.

**D4. Textes exacts seulement quand ils portent une promesse.** Les specs citent mot pour mot les textes qui engagent le site envers le visiteur : « ne réserve rien », les titres de bandeaux, les messages d'absence. Les autres sont paraphrasés, pour ne pas rendre la spec fausse à la moindre retouche de formulation.

**D5. Déplacement de l'exigence « Onglet Mon équipe ».** Elle est retirée de `mon-equipe` et reprise dans `navigation` sous le nom « Barre d'onglets ». Le fond est le même, avec une seule précision : les pages Report et Compteur n'ont pas d'onglet courant, ce qui est déjà le cas. Les autres exigences des specs existantes restent vraies et ne sont pas touchées. Celles qui disent « calculé comme sur la page Classement » restent justes, et `calcul-classement` leur donne désormais une référence explicite.

**D6. README cible.** Le README garde, dans l'ordre :
- la présentation et l'adresse du site ;
- une ligne par page avec le lien vers sa spec ;
- l'installation sur l'écran d'accueil ;
- la mise à jour du site ;
- la configuration ;
- un résumé RGPD, corrigé (voir plus bas) ;
- le backend et l'API ;
- un court paragraphe « Choix assumés ».

Il perd les descriptions détaillées des pages, la section « Fonctionnement », le détail du cache et les « Limites connues », dont le contenu vérifié est passé dans les specs. Le reste, devenu faux, disparaît.

**D7. Les écarts deviennent une issue GitHub.** Une seule issue reprend la liste ci-dessous, à découper ensuite en changes. Créer l'issue est une action publique, sur un dépôt public : elle est confirmée par l'utilisateur au moment de l'appliquer, et elle ne contient aucun nom de joueur ni de responsable.

## Écarts relevés

### Bugs : le code contredit son intention

1. **Compositions et contacts absents après un passage par l'accueil ou le Classement.** Ces pages ne gardent en cache que les rencontres et les clubs. Ouvertes moins de cinq minutes après, les pages Parties et Report s'affichent depuis ce cache avec des compositions et des contacts vides, et sautent la revalidation. Résultat : « composition non disponible » partout, plus aucun contact, et sur Report « aucun responsable joignable », jusqu'à un « Rafraîchir ». C'est le parcours le plus courant, constaté sur le site en ligne le 4 octobre 2026 : aucune icône de contact sur Parties, 304 après « Rafraîchir ». Cela contredit `programme` (« Détail d'une partie ») et `report` (« Proposer des dates »).
2. **« Rafraîchir » referme ce qui était déplié**, sur toutes les pages : la page est redessinée depuis le cache avant l'appel. `donnees-api` ne promet de garder les détails ouverts que pour la revalidation automatique.
3. **Classement : le découpage « Général » n'est pas retenu.** Il est enregistré mais jamais relu, si bien que la page revient toujours à « Par poule ».
4. **Compteur :**
   - le nombre de changements de leader vaut toujours zéro, donc la phrase n'apparaît jamais ;
   - « Jamais plus d'un point d'écart » est inaccessible ;
   - en mode Échanges, les barres se chevauchent jusqu'à 17 points et la dernière est coupée ;
   - une partie sans horodatage affiche « il en faut au moins deux points » ;
   - le résumé écrit « 1e » au lieu de « 1er ».
5. **Report :**
   - pour une phase finale future d'une seule journée, l'horizon s'arrête à la date d'origine, donc aucune date postérieure n'est proposée ;
   - le message de report coupe « Notre partie / A vs B / prévue le… » sur trois lignes ;
   - le message « d'ici la fin de la phase en cours » s'affiche même quand l'horizon est un repli.
6. **Normalisation des numéros :** « 0033… » et « +33 (0)6… » donnent des liens d'appel et WhatsApp invalides (Parties, Mon équipe, Report).
7. **Titres :**
   - le `<title>` de `classement.html` est « Parties par équipe » ;
   - celui de `programme.html` porte un ancien nom (« Parties par date ») ;
   - deux pages finissent par « Trinquet Paris 75016 » au lieu de « LIDFPB » ;
   - le message d'erreur de l'accueil parle encore du « menu ci-dessus ».
8. **Classement :**
   - « Aucune équipe ne correspond aux filtres » s'affiche aussi quand les données sont vides ;
   - en début de saison, le trait des qualifiés peut tomber sous des équipes non classées ;
   - la légende annonce les quatre qualifiés aussi en vue générale, où il n'y a pas de trait.
9. **Créneaux :** quand aucune des deux équipes n'a de composition, le détail n'affiche pas « composition non disponible », seulement les équipes.
10. **Accessibilité :**
    - deux titres principaux par page ;
    - lignes de partie cliquables mais non atteignables au clavier ;
    - le score du compteur est masqué aux lecteurs d'écran.

### Comportements dont l'intention est à confirmer (hors spec)

11. Créneaux et Report proposent comme libres les créneaux du jour déjà passés.
12. Créneaux : deux parties sur la même case n'en montrent qu'une, sans signaler le conflit.
13. Créneaux et Report : seule l'heure pleine compte. Une partie à 20h45 occupe la case 20h, une partie à 21h30 laisse 22h libre.
14. Report : la fin de phase se calcule toutes séries confondues, pas pour la série de la partie.
15. Compteur :
    - « Le plus long échange » compte les pauses entre les jeux ;
    - la médiane prend la valeur haute quand le nombre de durées est pair ;
    - il n'y a ni score cible ni fin de partie.
16. Parties : une partie reportée apparaît à sa nouvelle date sans mention du report. C'est écrit dans la spec parce que c'est vérifiable, mais l'absence de mention n'a peut-être pas été choisie.
16 bis. Report : le message « aucun créneau disponible » n'apparaît pas quand le créneau actuel de la partie figure dans le tableau, même si aucune case n'est libre. Le tableau montre alors seulement « Créneau actuel ». La spec ne décrit que le cas sans créneau actuel.
16 ter. Report ne compte comme occupés que les créneaux des séries 1 et 2, alors que Créneaux compte toutes les catégories. Sans effet aujourd'hui, seules ces deux séries jouant au Trinquet Paris.

### Données personnelles : à trancher, sans affirmer de non-conformité

17. Le **nom du responsable** d'équipe est traité différemment selon la page :
    - Mon équipe n'affiche ni nom ni numéro ;
    - Parties met le nom dans l'info-bulle des icônes ;
    - Report l'écrit en clair à côté des liens.

    `donnees-api` n'interdit que l'affichage du numéro, ce qui est vrai partout. Faut-il aligner les pages sur Mon équipe ? C'est une question de minimisation des données, à trancher.
18. Le **message WhatsApp prérempli de la page Parties** contient le nom et le numéro brut du responsable adverse. Le numéro n'est pas affiché dans la page, mais il part dans le message.
18 bis. Le cache du navigateur garde, sans date d'expiration, les tables complètes des licenciés (noms et numéros de licence des joueurs des clubs du comité) et des engagements (noms et téléphones des responsables) sur tout appareil qui a ouvert Parties, Créneaux, Mon équipe ou Report. Rien n'est affiché au-delà de ce que décrivent les specs, mais la durée de conservation de ces données sur l'appareil est une question de minimisation à trancher.
18 ter. Mon équipe met l'équipe affichée dans l'adresse (`?equipe=`), que l'hébergeur reçoit au rechargement. C'est un code club et un numéro d'équipe, pas une donnée personnelle.
19. La section RGPD du README est inexacte :
    - elle dit que les noms de joueurs n'apparaissent que sur deux pages, alors que Créneaux les affiche aussi ;
    - elle oublie les contacts de la page Report.

    Elle sera corrigée dans le README allégé, car c'est de la documentation.

    La question déjà ouverte de la base légale qui permet de republier les noms de joueurs reste ouverte.

### README périmé (corrigé par l'allègement)

20. Plusieurs affirmations du README sont fausses :
    - un cache « partagé par les trois pages » (six en réalité) ;
    - « Tout est dans un seul fichier autonome, `creneaux.html` » ;
    - deux boutons flottants en bas de page ;
    - « Rafraîchir » à droite du titre ;
    - « Poule ou Qualification » comme niveau de partie ;
    - le libellé du filtre « libre uniquement » ;
    - les valeurs de flou et d'opacité de la barre d'onglets ;
    - Report ouvert « depuis le programme » seulement ;
    - l'horizon des phases finales ;
    - `PHASE_LABELS` « dans `creneaux.html` » ;
    - la commande `git add` de la mise à jour.
21. Le README et les commentaires du code disent que la source se synchronise une fois par nuit. Les en-têtes affichent « synchro horaire », et le script Apps Script local crée un déclencheur horaire. Voir Open Questions.

## Risks / Trade-offs

- [Une spec décrit mal la page, faute d'une lecture assez fine] → Chaque spec est relue contre le code pendant l'application, et les scénarios principaux sont vérifiés sur le site en ligne avant l'archivage.
- [Une spec inscrit comme règle un comportement discutable, comme le nom du responsable affiché sur Report] → Ces points sont listés plus haut. La spec sera modifiée par le change qui les tranchera.
- [L'allègement fait perdre au README des explications utiles] → Le contenu vérifié passe dans les specs avant d'être retiré, les choix historiques vont dans « Choix assumés », et chaque page du README renvoie à sa spec.
- [Les specs et le README divergent de nouveau] → Le README ne décrit plus le comportement des pages, il renvoie aux specs. Il n'y a donc plus deux sources à tenir à jour.

## Migration Plan

Aucune page n'est déployée, donc rien n'est à migrer. L'archivage du change crée les huit specs et retire une exigence de `mon-equipe`. En cas de retour arrière, un `git revert` des commits du change suffit.

## Open Questions

- Fréquence réelle de synchronisation de la source, horaire ou nocturne. La copie locale du script Apps Script crée un déclencheur horaire, ce qui va dans le sens des en-têtes, mais le déploiement n'a pas été vérifié. Le README allégé ne citera une fréquence qu'une fois le déploiement vérifié. Les specs n'en dépendent pas : elles exigent seulement d'afficher la date de dernière synchronisation.
