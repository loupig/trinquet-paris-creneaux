# Tasks

Vérification par `npm test` (syntaxe, puis pages dans Chromium sur les données fictives de `tests/donnees.mjs`), et captures sur écran de Pixel 7, en thème clair et sombre.

## 1. Fichier agenda

- [ ] 1.1 Écrire `icsPartie(team, m, maintenant, adressePage)` dans `equipe.html` : `VCALENDAR` avec `VTIMEZONE` Europe/Paris, un `VEVENT` (`UID`, `DTSTAMP`, `DTSTART`/`DTEND` en `TZID=Europe/Paris` sur 1 h 30, `SUMMARY`, `LOCATION`, `DESCRIPTION` avec l'adresse de la page), un `VALARM` à `-P1D`, textes échappés, lignes en `CRLF` repliées à 75 octets.
- [ ] 1.2 Ajouter le bouton « Ajouter à mon agenda » dans `.prochaine-actions`, après « Compter cette partie » : `<button class="report-btn">` avec une icône d'agenda, qui télécharge `partie-AAAA-MM-JJ.ics` par un `Blob` et un lien `download` temporaire. Aligner le style de `button.report-btn` sur celui du lien.

## 2. Tests

- [ ] 2.1 Dans `tests/pages.spec.mjs`, scénario « Ajouter la prochaine partie » : capter le téléchargement, lire le fichier, vérifier le titre (recevant d'abord, série), `DTSTART;TZID=Europe/Paris` au jour et à 19h30, `DTEND` à 21h, `LOCATION`, `TRIGGER:-P1D`, l'adresse de la page dans la description, et qu'aucune requête réseau n'est partie au toucher.
- [ ] 2.2 Scénario « Partie reportée » : servir les données avec un `date_rep` sur la prochaine partie de Charlie 1, vérifier que `DTSTART` porte le jour du report.
- [ ] 2.3 Scénario « Aucune donnée personnelle » : vérifier que le fichier ne contient aucun nom de joueur, aucun nom ni numéro de responsable des données fictives.
- [ ] 2.4 Lancer `npm test` et montrer la sortie.

## 3. Finitions

- [ ] 3.1 Mettre `Version 2026.10.29` dans le pied de page de `equipe.html`.
- [ ] 3.2 Captures de la carte « Prochaine partie » sur Pixel 7, thème clair et sombre : trois boutons lisibles, sans défilement horizontal.
- [ ] 3.3 `/code-review` sur le diff et corriger les constats.
- [ ] 3.4 Ouvrir la PR sur le modèle du dépôt, en laissant à la personne qui décide la vérification sur un vrai iPhone (Safari et mode installé) et sur Android, puis la rubrique « Décision humaine ».
