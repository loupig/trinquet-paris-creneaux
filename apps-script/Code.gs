// =========================================================
// LIDFPB — Google Apps Script
// 1. API REST        → doGet()         (déployé en Web App)
// 2. Scraper auto    → syncDonnees()   (déclenché chaque nuit)
// =========================================================

var DOSSIER_API  = "Lidfpb/api";
var LOGIN_URL    = "https://lidfpb.euskalpilota.fr/infos.php";
var ADMIN_URL    = "https://lidfpb.euskalpilota.fr/admin_db.php";
var CSV_URL      = "https://lidfpb.euskalpilota.fr/csv.php";

var NO_COMPET    = "20270301";   // compétition par défaut

// Alias URL -> clé JSON (évite les accents dans les query strings)
var ALIAS_COLONNES = {
  "no_compet": "Compétition",
  "no_spec":   "Spécialité",
  "no_cat":    "Catégorie",
  "phase":     "Phase",
  "poule":     "Poule"
};

// Tables sur lesquelles le filtre compétition par défaut s'applique
var TABLES_AVEC_COMPET = ["rencontres", "engagements"];


// Identifiants retirés : ce fichier est versionné dans un dépôt PUBLIC.
// Remettre les vraies valeurs uniquement dans l'éditeur Apps Script,
// jamais dans ce fichier commité.
var LOGIN_DATA = {
  "InComite":    "REDACTED",
  "InClubLogin": "REDACTED",
  "InPwd":       "REDACTED",
  "InIdent":     "Valider"
};

var TABLES_CONFIG = {
  "rencontres": {
    "no_compet": "",   // vide = toutes les compétitions
    // "no_spec": "2",   // désactivé par défaut
    // "no_cat":  "3",   // désactivé par défaut
  },
  "clubs": {
    "comite": "03750"
  },
  "engagements": {
    "no_compet": "",   // vide = toutes les compétitions
    // "no_spec": "2",   // désactivé par défaut
    // "no_cat":  "3",   // désactivé par défaut
  }
};

// =========================================================
// SCRAPER — appelé automatiquement chaque jour
// =========================================================

function syncDonnees() {
  Logger.log("🕐 Démarrage sync LIDFPB — " + new Date());

  // 1. Connexion
  var cookies = seConnecter();
  if (!cookies) {
    Logger.log("❌ Connexion échouée — arrêt");
    return;
  }
  Logger.log("✅ Connexion réussie");

  // 2. Export de chaque table
  for (var nomTable in TABLES_CONFIG) {
    Logger.log("\n📦 Table : " + nomTable);

    var filtres = Object.assign({ "table": nomTable }, TABLES_CONFIG[nomTable]);

    // Appliquer les filtres
    var optionsAdmin = {
      method: "post",
      payload: filtres,
      headers: { "Cookie": cookies },
      followRedirects: true,
      muteHttpExceptions: true
    };
    UrlFetchApp.fetch(ADMIN_URL, optionsAdmin);

    // Télécharger le CSV
    var optionsCsv = {
      method: "get",
      headers: { "Cookie": cookies },
      muteHttpExceptions: true
    };
    var csvResponse = UrlFetchApp.fetch(CSV_URL, optionsCsv);

    if (csvResponse.getResponseCode() !== 200) {
      Logger.log("❌ Échec téléchargement pour " + nomTable);
      continue;
    }

    // Décoder UTF-16 → parser CSV → convertir en JSON
    var blob     = csvResponse.getBlob().setContentType("text/plain; charset=UTF-16");
    var csvTexte = blob.getDataAsString("UTF-16");
    var donnees  = csvVersJson(csvTexte);

    // Sauvegarder dans Drive
    sauvegarderJson(nomTable + ".json", donnees);
    Logger.log("✅ " + donnees.length + " lignes sauvegardées pour " + nomTable);
    sauvegarderCsv(nomTable + ".csv", nomTable, donnees);
    Logger.log("✅ CSV sauvegardé pour " + nomTable);

  }

  Logger.log("\n✅ Sync terminée — " + new Date());
}

// ---------------------------------------------------------
// Connexion au site et récupération des cookies de session
// ---------------------------------------------------------
function seConnecter() {
  var options = {
    method: "post",
    payload: LOGIN_DATA,
    followRedirects: false,
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(LOGIN_URL, options);
  var headers  = response.getAllHeaders();

  // Récupérer le cookie de session
  var setCookie = headers["Set-Cookie"] || headers["set-cookie"];
  if (!setCookie) {
    // Pas de redirection = connexion échouée
    return null;
  }

  // Extraire la valeur du cookie PHPSESSID
  var cookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  return cookie.split(";")[0];
}

// ---------------------------------------------------------
// Convertir un texte CSV (séparateur ;) en tableau JSON
// ---------------------------------------------------------
function csvVersJson(csvTexte) {
  var lignes = csvTexte.replace(/\r/g, "").split("\n");
  if (lignes.length < 3) return [];

  // Ignorer ligne 0 ("clubs"), prendre ligne 1 comme en-têtes
  var entetes = lignes[1].split("\t").map(function(h) {
    return h.replace(/"/g, "").trim();
  });

  var donnees = [];
  for (var i = 2; i < lignes.length; i++) {  // ← partir de 2
    var ligne = lignes[i];
    if (!ligne.trim()) continue;

    var valeurs = ligne.split("\t").map(function(v) {
      return v.replace(/"/g, "").trim();
    });

    if (valeurs.length < entetes.length / 2) continue;

    var objet = {};
    entetes.forEach(function(entete, idx) {
      if (entete) objet[entete] = valeurs[idx] || "";
    });
    donnees.push(objet);
  }

  return donnees;
}

// ---------------------------------------------------------
// Sauvegarder / écraser un fichier JSON dans Drive
// ---------------------------------------------------------
function sauvegarderJson(nomFichier, donnees) {
  var dossier = obtenirDossier(DOSSIER_API);
  var contenu = JSON.stringify(donnees);

  // Supprimer l'ancien fichier s'il existe
  var fichiers = dossier.getFilesByName(nomFichier);
  while (fichiers.hasNext()) {
    fichiers.next().setTrashed(true);
  }

  // Créer le nouveau
  dossier.createFile(nomFichier, contenu, MimeType.PLAIN_TEXT);
}

// ---------------------------------------------------------
// Obtenir (ou créer) un dossier Drive par chemin
// ---------------------------------------------------------
function obtenirDossier(chemin) {
  var parties = chemin.split("/");
  var dossier = DriveApp.getRootFolder();
  for (var i = 0; i < parties.length; i++) {
    var sous = dossier.getFoldersByName(parties[i]);
    if (sous.hasNext()) {
      dossier = sous.next();
    } else {
      dossier = dossier.createFolder(parties[i]);
    }
  }
  return dossier;
}

// =========================================================
// DÉCLENCHEUR — à exécuter UNE SEULE FOIS pour programmer
// la sync automatique quotidienne à 6h du matin
// =========================================================

function creerDeclencheur() {
  // Supprimer tous les anciens déclencheurs syncDonnees
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === "syncDonnees") {
      ScriptApp.deleteTrigger(t);
    }
  });

  // Toutes les heures 24h/24
  ScriptApp.newTrigger("syncDonnees")
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log("✅ 1 déclencheur créé — sync toutes les heures");
}

// =========================================================
// API REST — point d'entrée GET (inchangé)
// =========================================================

function doGet(e) {

  if (e.parameter.doc === "1") {
    return HtmlService.createHtmlOutput(getDocHtml())
      .setTitle("LIDFPB API — Documentation");
  }

  var table = e.parameter.table;

  if (!table) {
    return reponseJson({ error: "Paramètre 'table' manquant. Ex: ?table=rencontres" });
  }

  var tablesAutorisees = ["rencontres", "clubs", "engagements"];
  if (tablesAutorisees.indexOf(table) === -1) {
    return reponseJson({ error: "Table inconnue. Tables disponibles : " + tablesAutorisees.join(", ") });
  }

  var fichierInfo = lireFichierJson(table + ".json");
  if (fichierInfo === null) {
    return reponseJson({ error: "Données non disponibles — sync pas encore lancée ?" });
  }
  var donnees = fichierInfo.data;

  // Filtres optionnels (hors paramètres techniques)
  var filtres = {};
  for (var cle in e.parameter) {
    if (cle === "table" || cle === "doc") continue;
    var cleReelle = ALIAS_COLONNES[cle] || cle;
    filtres[cleReelle] = e.parameter[cle];
  }

  if (TABLES_AVEC_COMPET.indexOf(table) !== -1 && !filtres[ALIAS_COLONNES.no_compet]) {
    filtres[ALIAS_COLONNES.no_compet] = NO_COMPET;
  }

  var resultats = filtrer(donnees, filtres);

  return reponseJson({
    table:    table,
    count:    resultats.length,
    filtres:  filtres,
    lastSync: fichierInfo.lastSync.toISOString(),
    data:     resultats
  });
}

// lastSync : date de dernière écriture du fichier Drive (donc de la
// dernière synchro réussie avec lidfpb.euskalpilota.fr), distincte de
// l'heure de l'appel API — utile côté client pour afficher la fraîcheur
// réelle des données plutôt que l'heure de la requête.
function lireFichierJson(nomFichier) {
  try {
    var dossier  = obtenirDossier(DOSSIER_API);
    var fichiers = dossier.getFilesByName(nomFichier);
    if (!fichiers.hasNext()) return null;
    var fichier = fichiers.next();
    return {
      data:     JSON.parse(fichier.getBlob().getDataAsString("utf-8")),
      lastSync: fichier.getLastUpdated()
    };
  } catch(e) {
    return null;
  }
}

function filtrer(donnees, filtres) {
  if (Object.keys(filtres).length === 0) return donnees;
  return donnees.filter(function(ligne) {
    for (var cle in filtres) {
      var valLigne  = (ligne[cle] || "").toString().toLowerCase().trim();
      var valFiltre = filtres[cle].toLowerCase().trim();
      if (valLigne !== valFiltre) return false;
    }
    return true;
  });
}

function reponseJson(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

function sauvegarderCsv_old(nomFichier, donnees) {
  if (!donnees || donnees.length === 0) return;

  var dossier = obtenirDossier("Lidfpb/csv");

  // Supprimer l'ancien fichier
  var fichiers = dossier.getFilesByName(nomFichier);
  while (fichiers.hasNext()) {
    fichiers.next().setTrashed(true);
  }

  // Ligne 1 : en-têtes
  var entetes = Object.keys(donnees[0]).join("\t");

  // Lignes suivantes : données
  var lignes = donnees.map(function(row) {
    return Object.values(row).map(function(v) {
      return '"' + v.toString().replace(/"/g, '""') + '"';
    }).join("\t");
  });

  var contenu = entetes + "\n" + lignes.join("\n");
  dossier.createFile(nomFichier, contenu, MimeType.PLAIN_TEXT);
}

function sauvegarderCsv(nomFichier, nomTable, donnees) {
  if (!donnees || donnees.length === 0) return;

  var dossier = obtenirDossier("Lidfpb/csv");

  // Supprimer l'ancien fichier
  var fichiers = dossier.getFilesByName(nomFichier);
  while (fichiers.hasNext()) {
    fichiers.next().setTrashed(true);
  }

  // Ligne 1 : nom de la table (sans guillemets)
  var ligne1 = nomTable;

  // Ligne 2 : en-têtes sans guillemets, séparés par tabulation
  var entetes = Object.keys(donnees[0]).join("\t");

  // Lignes données : valeurs avec guillemets, séparées par tabulation
  var lignes = donnees.map(function(row) {
    return Object.values(row).map(function(v) {
      return '"' + v.toString().replace(/"/g, '""') + '"';
    }).join("\t");
  });

  var contenu = ligne1 + "\n" + entetes + "\n" + lignes.join("\n");

  dossier.createFile(nomFichier, contenu, MimeType.PLAIN_TEXT);
}


function creerDeclencheurTest() {
  var dans5min = new Date(new Date().getTime() + 1 * 60 * 1000);
  ScriptApp.newTrigger("syncDonnees")
    .timeBased()
    .at(dans5min)
    .create();
  Logger.log("✅ Déclencheur test créé pour : " + dans5min);
}


// =========================================================
// HTML de la documentation (copier le contenu de l'artifact)
// =========================================================

function getDocHtml() {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LIDFPB API — Documentation</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f5f7fa; color: #333; }

  header { background: #1a1a2e; color: #fff; padding: 32px 40px; }
  header h1 { font-size: 22px; font-weight: 700; }
  header p  { font-size: 13px; color: #aab; margin-top: 6px; }
  .badge { display: inline-block; background: #4f8ef7; color: #fff; font-size: 10px;
           padding: 2px 8px; border-radius: 20px; margin-left: 10px; vertical-align: middle; }

  .container { max-width: 860px; margin: 0 auto; padding: 32px 20px; }

  .section { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px;
             box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .section h2 { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px;
                border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; }

  .base-url { background: #1e1e1e; color: #4fc97f; padding: 12px 16px; border-radius: 8px;
              font-family: monospace; font-size: 13px; word-break: break-all; }

  /* Endpoint card */
  .endpoint { border: 1px solid #e8e8e8; border-radius: 10px; margin-bottom: 16px; overflow: hidden; }
  .endpoint-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px;
                     cursor: pointer; background: #fafafa; user-select: none; }
  .endpoint-header:hover { background: #f0f4ff; }
  .method { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 4px;
            min-width: 48px; text-align: center; }
  .get  { background: #e8f5e9; color: #2e7d32; }
  .endpoint-path { font-family: monospace; font-size: 13px; font-weight: 600; color: #333; flex: 1; }
  .endpoint-desc { font-size: 12px; color: #888; }
  .chevron { font-size: 12px; color: #aaa; transition: transform 0.2s; }
  .chevron.open { transform: rotate(90deg); }

  .endpoint-body { padding: 16px; border-top: 1px solid #eee; display: none; }
  .endpoint-body.open { display: block; }

  /* Params table */
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
  th { background: #f5f7fa; padding: 8px 12px; text-align: left; font-weight: 600; color: #555; }
  td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .required { color: #e53935; font-weight: 700; }
  .optional { color: #888; }
  code { background: #f0f4ff; color: #4f8ef7; padding: 2px 6px; border-radius: 4px;
         font-family: monospace; font-size: 11px; }

  /* Examples */
  .example-block { margin-top: 14px; }
  .example-block h4 { font-size: 12px; color: #555; margin-bottom: 6px; font-weight: 600; }
  pre { background: #1e1e1e; color: #d4d4d4; padding: 12px 16px; border-radius: 8px;
        font-size: 11px; overflow-x: auto; white-space: pre-wrap; line-height: 1.6; }
  .highlight-green { color: #4fc97f; }
  .highlight-blue  { color: #4f8ef7; }
  .highlight-orange{ color: #f7a94f; }

  /* Sync info */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 4px; }
  .info-card { background: #f5f7fa; border-radius: 8px; padding: 14px; }
  .info-card .label { font-size: 11px; color: #888; margin-bottom: 4px; }
  .info-card .value { font-size: 13px; font-weight: 600; color: #333; }

  .tag { display: inline-block; background: #f0f4ff; color: #4f8ef7; font-size: 10px;
         padding: 2px 8px; border-radius: 20px; margin-right: 4px; }
</style>
</head>
<body>

<header>
  <h1>LIDFPB API <span class="badge">v1.0</span></h1>
  <p>API REST — Données pelote basque (rencontres, clubs, engagements) — Google Apps Script</p>
</header>

<div class="container">

  <!-- Base URL -->
  <div class="section">
    <h2>🔗 URL de base</h2>
    <div class="base-url">https://script.google.com/macros/s/AKfycbwtBOkWFXXb1aBUPfi-xHfQTfwaDXZGcu64Uc8U8d1ecPAOElKoDlemUizJ-abFvbGR/exec</div>
    <p style="font-size:12px; color:#888; margin-top:10px;">Méthode : <strong>GET</strong> — Pas d'authentification requise — Réponse : <strong>JSON</strong></p>
  </div>

  <!-- Endpoints -->
  <div class="section">
    <h2>📡 Endpoints disponibles</h2>

    <!-- Rencontres -->
    <div class="endpoint">
      <div class="endpoint-header" onclick="toggle(this)">
        <span class="method get">GET</span>
        <span class="endpoint-path">?table=rencontres</span>
        <span class="endpoint-desc">Liste des rencontres de la compétition</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <p style="font-size:12px; color:#555;">Retourne toutes les rencontres de la compétition configurée (<code>no_compet: ${NO_COMPET}</code>).</p>
        <table>
          <tr><th>Paramètre</th><th>Type</th><th>Requis</th><th>Description</th></tr>
          <tr><td><code>table</code></td><td>string</td><td><span class="required">✅ Oui</span></td><td>Valeur fixe : <code>rencontres</code></td></tr>
          <tr><td><code>[colonne]</code></td><td>string</td><td><span class="optional">Non</span></td><td>Filtre sur n'importe quelle colonne. Ex: <code>&NO_CLUB_DOM=03750001</code></td></tr>
        </table>
        <div class="example-block">
          <h4>Exemple — Toutes les rencontres</h4>
          <pre><span class="highlight-blue">GET</span> ?table=rencontres

<span class="highlight-green">Réponse :</span>
{
  "table": "rencontres",
  "count": 42,
  "filtres": {},
  "data": [
    { "NO_RENCONTRE": "...", "NO_CLUB_DOM": "...", ... }
  ]
}</pre>
        </div>
        <div class="example-block">
          <h4>Exemple — Filtrer par club domicile</h4>
          <pre><span class="highlight-blue">GET</span> ?table=rencontres&NO_CLUB_DOM=03750001</pre>
        </div>
      </div>
    </div>

    <!-- Clubs -->
    <div class="endpoint">
      <div class="endpoint-header" onclick="toggle(this)">
        <span class="method get">GET</span>
        <span class="endpoint-path">?table=clubs</span>
        <span class="endpoint-desc">Liste des clubs du comité</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <p style="font-size:12px; color:#555;">Retourne tous les clubs du comité <code>03750</code>.</p>
        <table>
          <tr><th>Paramètre</th><th>Type</th><th>Requis</th><th>Description</th></tr>
          <tr><td><code>table</code></td><td>string</td><td><span class="required">✅ Oui</span></td><td>Valeur fixe : <code>clubs</code></td></tr>
          <tr><td><code>[colonne]</code></td><td>string</td><td><span class="optional">Non</span></td><td>Filtre sur n'importe quelle colonne du résultat</td></tr>
        </table>
        <div class="example-block">
          <h4>Exemple — Tous les clubs</h4>
          <pre><span class="highlight-blue">GET</span> ?table=clubs

<span class="highlight-green">Réponse :</span>
{
  "table": "clubs",
  "count": 18,
  "filtres": {},
  "data": [
    { "NO_CLUB": "...", "NOM_CLUB": "...", ... }
  ]
}</pre>
        </div>
      </div>
    </div>

    <!-- Engagements -->
    <div class="endpoint">
      <div class="endpoint-header" onclick="toggle(this)">
        <span class="method get">GET</span>
        <span class="endpoint-path">?table=engagements</span>
        <span class="endpoint-desc">Liste des engagements de la compétition</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <p style="font-size:12px; color:#555;">Retourne tous les engagements de la compétition <code>${NO_COMPET}</code>.</p>
        <table>
          <tr><th>Paramètre</th><th>Type</th><th>Requis</th><th>Description</th></tr>
          <tr><td><code>table</code></td><td>string</td><td><span class="required">✅ Oui</span></td><td>Valeur fixe : <code>engagements</code></td></tr>
          <tr><td><code>[colonne]</code></td><td>string</td><td><span class="optional">Non</span></td><td>Filtre sur n'importe quelle colonne du résultat</td></tr>
        </table>
        <div class="example-block">
          <h4>Exemple — Tous les engagements</h4>
          <pre><span class="highlight-blue">GET</span> ?table=engagements</pre>
        </div>
      </div>
    </div>

    <!-- Erreurs -->
    <div class="endpoint">
      <div class="endpoint-header" onclick="toggle(this)">
        <span class="method get">GET</span>
        <span class="endpoint-path">?table=[inconnu]</span>
        <span class="endpoint-desc">Réponses d'erreur</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <table>
          <tr><th>Cas</th><th>Réponse</th></tr>
          <tr><td>Paramètre <code>table</code> manquant</td><td><code>{ "error": "Paramètre 'table' manquant. Ex: ?table=rencontres" }</code></td></tr>
          <tr><td>Table inconnue</td><td><code>{ "error": "Table inconnue. Tables disponibles : rencontres, clubs, engagements" }</code></td></tr>
          <tr><td>Sync pas encore lancée</td><td><code>{ "error": "Données non disponibles — sync pas encore lancée ?" }</code></td></tr>
        </table>
      </div>
    </div>

  </div>

  <!-- Sync info -->
  <div class="section">
    <h2>🔄 Synchronisation automatique</h2>
    <p style="font-size:12px; color:#555; margin-bottom:14px;">Les données sont scrappées depuis <strong>lidfpb.euskalpilota.fr</strong> et stockées dans Google Drive (<code>Lidfpb/api/</code>).</p>
    <div class="info-grid">
      <div class="info-card">
        <div class="label">Fréquence</div>
        <div class="value">⏱ Toutes les heures</div>
      </div>
      <div class="info-card">
        <div class="label">Source</div>
        <div class="value">🌐 lidfpb.euskalpilota.fr</div>
      </div>
      <div class="info-card">
        <div class="label">Compétition configurée</div>
        <div class="value">📅 ${NO_COMPET}</div>
      </div>
      <div class="info-card">
        <div class="label">Comité</div>
        <div class="value">🏛 03750</div>
      </div>
    </div>
  </div>

  <!-- Tables dispo -->
  <div class="section">
    <h2>📦 Tables disponibles</h2>
    <p style="font-size:12px; color:#888; margin-bottom:10px;">Valeurs acceptées pour le paramètre <code>table</code> :</p>
    <span class="tag">rencontres</span>
    <span class="tag">clubs</span>
    <span class="tag">engagements</span>
  </div>

</div>

<script>
function toggle(header) {
  const body    = header.nextElementSibling;
  const chevron = header.querySelector('.chevron');
  const isOpen  = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chevron.classList.toggle('open', !isOpen);
}
</script>
</body>
</html>
  `;
}
