// Tests « fumée » : chaque page s'ouvre sur des données fictives, sans erreur
// JavaScript ni bandeau d'échec, et affiche l'essentiel. Plus un scénario
// complet pour la prévision des quarts et le simulateur du Classement.
import { test, expect } from "@playwright/test";
import { tables, oidAVenir } from "./donnees.mjs";

const EQUIPE_SUIVIE = "2|1|3750003|1";   // Charlie, série 1, poule 1

test.beforeEach(async ({ page }) => {
  page.erreurs = [];
  page.on("pageerror", (e) => page.erreurs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") page.erreurs.push(m.text()); });
  // Aucune page ne doit joindre la vraie API pendant un test.
  await page.route("**/script.google.com/**", (route) => {
    const table = new URL(route.request().url()).searchParams.get("table");
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ table, data: tables[table] || [], lastSync: new Date().toISOString() })
    });
  });
  await page.addInitScript((cle) => {
    localStorage.setItem("lidfpb_mes_equipes_v1", JSON.stringify([cle]));
  }, EQUIPE_SUIVIE);
});

test.afterEach(async ({ page }) => {
  expect(page.erreurs, "erreurs JavaScript dans la page").toEqual([]);
});

// Une page qui charge l'API : la synchro finit par s'afficher, sans échec.
async function attendreChargement(page) {
  await expect(page.locator("#lastSyncText")).not.toHaveText(/chargement/);
  await expect(page.locator("#lastSyncText")).not.toHaveText(/échec/);
  await expect(page.locator(".banner.error")).toHaveCount(0);
}

const PAGES = [
  { nom: "Accueil", url: "index.html", contenu: "#tiles" },
  { nom: "Mon équipe", url: "equipe.html?equipe=" + encodeURIComponent(EQUIPE_SUIVIE), contenu: "#results" },
  { nom: "Parties", url: "programme.html", contenu: "#results" },
  { nom: "Classement", url: "classement.html", contenu: "#results" },
  { nom: "Créneaux", url: "creneaux.html", contenu: "#results" },
  { nom: "Report", url: "report.html?oid=" + oidAVenir, contenu: "#targetCard" }
];

for (const p of PAGES) {
  test(`${p.nom} s'affiche sans erreur`, async ({ page }) => {
    await page.goto(p.url);
    await attendreChargement(page);
    await expect(page.locator(p.contenu)).not.toBeEmpty();
  });
}

test("Compteur s'affiche sans erreur", async ({ page }) => {
  await page.goto("compteur.html");
  await expect(page.locator("#setup")).toBeVisible();
});

test.describe("Compteur : mode match, fin de partie et partage", () => {
  test("réglages repliés au premier point, victoire au score visé, partage, annulation", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.share = (donnees) => { window.__partage = donnees; return Promise.resolve(); };
    });
    await page.goto("compteur.html");
    const reglages = page.locator("#setupBox");
    await expect(reglages).toHaveAttribute("open", "");
    await page.locator(".team-name").nth(0).fill("Bera");
    await page.locator(".team-name").nth(1).fill("Ahetze");
    await page.getByRole("button", { name: "30 points" }).click();
    await expect(page.locator("#shareBtn")).toBeHidden();

    const bera = page.locator(".score-btn").nth(0);
    const ahetze = page.locator(".score-btn").nth(1);
    await bera.click();
    // Partie lancée : les réglages se replient, le résumé les rappelle.
    await expect(reglages).not.toHaveAttribute("open", "");
    await expect(page.locator("#setupResume")).toHaveText("Bera contre Ahetze · en 30");
    await expect(bera).toContainText("encore 29");

    for (let i = 0; i < 27; i++) await bera.click();
    for (let i = 0; i < 25; i++) await ahetze.click();
    await bera.click();                                   // 29-25
    await expect(bera).toContainText("Balle de partie");

    await bera.click();                                   // 30-25 : fin
    await expect(page.locator("#fin")).toContainText("Victoire de Bera");
    await expect(page.locator("#fin")).toContainText("30 à 25");
    await expect(bera).toBeDisabled();
    await expect(ahetze).toBeDisabled();

    await page.getByRole("button", { name: "Partager le résultat" }).click();
    const texte = await page.evaluate(() => window.__partage && window.__partage.text);
    expect(texte).toMatch(/^\*Bera 30 – 25 Ahetze\*/);
    expect(texte).toContain("Victoire de Bera · partie en 30");
    expect(texte).toMatch(/decouvrir\.html$/);

    // Point gagnant donné par erreur : l'annuler relance la partie.
    await page.getByRole("button", { name: "Annuler le dernier point" }).click();
    await expect(page.locator("#fin")).toBeHidden();
    await expect(ahetze).toBeEnabled();

    // Rechargement : score et score visé retrouvés.
    await page.reload();
    await expect(bera).toContainText("29");
    await expect(page.locator("#setupResume")).toHaveText("Bera contre Ahetze · en 30");
  });

  test("en cours de partie, le score se copie sans feuille de partage", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => { delete Navigator.prototype.share; });
    await page.goto("compteur.html");
    await page.locator(".score-btn").nth(1).click();
    await page.getByRole("button", { name: "Partager le score" }).click();
    await expect(page.locator("#partageInfo")).toHaveText("Score copié, à coller");
    const copie = await page.evaluate(() => navigator.clipboard.readText());
    expect(copie).toContain("Équipe 1 0 – 1 Équipe 2");
    expect(copie).toContain("Partie en cours, 1 point joué");
  });
});

test("Accueil : le pied de page mène à la présentation", async ({ page }) => {
  await page.goto("index.html");
  await page.getByRole("link", { name: "Présenter le site à un joueur" }).click();
  await expect(page).toHaveURL(/decouvrir\.html/);
});

test("Découvrir : la présentation mène à l'accueil", async ({ page }) => {
  await page.goto("decouvrir.html");
  await expect(page.locator("h1")).toBeVisible();
  // Une seule action : chaque bouton d'appel ouvre l'accueil.
  const appels = page.locator("a.btn-primary");
  await expect(appels).toHaveCount(4);   // haut, barre, menu et bas de page
  for (const a of await appels.all()) await expect(a).toHaveAttribute("href", "index.html");
  // Les questions se déplient dans la page, sans fenêtre.
  const question = page.locator(".faq details").first();
  await question.locator("summary").click();
  await expect(question.locator("p")).toBeVisible();
  // La phrase s'allume mot à mot une fois à l'écran.
  await page.locator("#tagline").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 300);
  await expect(page.locator("#tagline .w").last()).toHaveClass(/\bon\b/);
  // Les avis inventés sont signalés comme tels.
  await expect(page.locator("#avis .note")).toContainText("illustration");
});

test("Découvrir : le menu plein écran s'ouvre et se referme", async ({ page }) => {
  await page.goto("decouvrir.html");
  const bouton = page.locator(".menu-btn");
  const menu = page.locator("#menu");
  await expect(menu).toBeHidden();
  await bouton.click();
  await expect(bouton).toHaveAttribute("aria-expanded", "true");
  await expect(menu.getByRole("link", { name: "Questions" })).toBeVisible();
  // Le même bouton referme, toujours accessible au-dessus du panneau.
  await bouton.click();
  await expect(menu).toBeHidden();
  // Un lien touché referme le menu et mène à sa section.
  await bouton.click();
  await menu.getByRole("link", { name: "Questions" }).click();
  await expect(menu).toBeHidden();
  await expect(page.locator("#questions")).toBeInViewport();
});

test("Page 404 propose de revenir à l'accueil", async ({ page }) => {
  // En ligne, le site vit sous /trinquet-paris-creneaux/ : on y sert les fichiers locaux.
  await page.route("**/trinquet-paris-creneaux/**", (route) =>
    route.continue({ url: route.request().url().replace("/trinquet-paris-creneaux/", "/") }));
  await page.goto("404.html");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByRole("link", { name: "Revenir à l'accueil" })).toHaveAttribute("href", "/trinquet-paris-creneaux/index.html");
});

test("Ancienne adresse equipes.html redirige vers Mon équipe", async ({ page }) => {
  await page.goto("equipes.html");
  await expect(page).toHaveURL(/equipe\.html/);
});

test.describe("Classement : quarts et simulation", () => {
  test("ordre poules, quarts, simulateur, et quarts croisés", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);

    // Série 1 : Poule 1, Poule 2, quarts, simulateur.
    const cartes = page.locator("#results > div").first().locator(".poule-card");
    await expect(cartes.nth(0).locator(".poule-head")).toContainText("Poule 1");
    await expect(cartes.nth(1).locator(".poule-head")).toContainText("Poule 2");
    await expect(cartes.nth(2)).toHaveClass(/finales-card/);
    await expect(page.locator("#results > .sim-card").first()).toBeVisible();

    const quarts = page.locator(".finales-card").first().locator(".quart-row");
    await expect(quarts).toHaveCount(4);
    await expect(quarts.nth(0)).toContainText("1er P1");
    await expect(quarts.nth(0)).toContainText("4e P2");
    await expect(quarts.nth(1)).toContainText("3e P1");
    await expect(quarts.nth(1)).toContainText("2e P2");
    await expect(quarts.nth(2)).toContainText("2e P1");
    await expect(quarts.nth(2)).toContainText("3e P2");
    await expect(quarts.nth(3)).toContainText("4e P1");
    await expect(quarts.nth(3)).toContainText("1er P2");
    // Arbre : D1, D2 et Finale, reliés aux quarts par des traits.
    const arbre = page.locator(".finales-card .tableau-arbre").first();
    await expect(arbre.locator(".arbre-etape")).toHaveText(["D1", "D2", "Finale"]);
    await expect(arbre.locator("path")).toHaveCount(6);
    // L'équipe suivie (Charlie) a son chemin surligné jusqu'à sa demie.
    await expect(arbre.locator(".arbre-etape.mien")).toHaveCount(1);
    // Les étapes sont dessinées dans la carte, pas ailleurs dans la page.
    const boite = await arbre.boundingBox();
    for (const etape of await arbre.locator(".arbre-etape").all()) {
      const b = await etape.boundingBox();
      expect(b.y).toBeGreaterThanOrEqual(boite.y);
      expect(b.y + b.height).toBeLessThanOrEqual(boite.y + boite.height);
      expect(b.x + b.width).toBeLessThanOrEqual(boite.x + boite.width);
    }
    await expect(page.locator(".finales-card .statut").first()).toHaveText("Prévision");
  });

  test("une simulation recalcule, se signale et s'efface", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);

    const sim = page.locator(".sim-card").first();
    await expect(sim.locator(".sim-impact")).toContainText("Charlie");
    await expect(sim.locator(".sim-impact")).toContainText(/puis D\d contre V\.Q\d/);
    await expect(sim.locator(".sim-compteur")).toHaveText(/^0\//);

    await sim.locator(".sim-toggle").click();
    // Les parties de l'équipe suivie passent en premier.
    const premiere = sim.locator(".sim-match").first();
    await expect(premiere.locator(".sim-mienne")).toBeVisible();

    // Toucher le vainqueur : 40–30, compteur et bandeau à jour.
    await premiere.locator(".sim-pick").first().click();
    await expect(premiere.locator(".sim-score").first()).toHaveValue("40");
    await expect(premiere.locator(".sim-score").nth(1)).toHaveValue("30");
    await expect(sim.locator(".sim-compteur")).toHaveText(/^1\//);
    await expect(page.locator("#sim-slot")).toContainText("Simulation en cours");

    // La saisie d'un score garde le champ actif pendant le recalcul.
    const champ = sim.locator(".sim-match").nth(1).locator(".sim-score").first();
    await champ.click();
    await page.keyboard.type("40");
    await expect(champ).toBeFocused();

    await page.locator("#sim-slot .sim-reset").click();
    await expect(page.locator("#sim-slot")).toBeEmpty();
    await expect(page.locator(".sim-card").first().locator(".sim-compteur")).toHaveText(/^0\//);
  });

  test("le chemin vers les quarts de l'équipe suivie, d'après les résultats réels", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);

    // Charlie, 4e, a 3 parties à jouer : toutes les issues sont passées en revue.
    const chemin = page.locator(".sim-card").first().locator(".sim-impact .chemin");
    await expect(chemin).toHaveText("Chemin vers les quarts : 🎯 Qualifiée à coup sûr en gagnant vos 3 parties. " +
      "Avec 1 victoire, ça reste jouable : il faut qu'Alpha (éq. 1) batte Echo (éq. 1) et que Bravo (éq. 1) batte Foxtrot (éq. 1).");

    // Une simulation ne change pas le chemin, tiré des seuls résultats réels.
    const texte = await chemin.textContent();
    await page.locator(".sim-card").first().locator(".sim-toggle").click();
    await page.locator(".sim-card").first().locator(".sim-match").first().locator(".sim-pick").first().click();
    await expect(page.locator(".sim-card").first().locator(".sim-impact .chemin")).toHaveText(texte);
  });

  test("« Montre-moi ce scénario » remplit la poule d'un scénario qui qualifie", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);

    // Charlie (4e, poule 1) : 7 parties restent dans sa poule.
    await page.getByRole("button", { name: /Montre-moi ce scénario/ }).click();
    const sim = page.locator(".sim-card").first();
    await expect(sim.locator(".sim-toggle")).toHaveAttribute("aria-expanded", "true");
    await expect(sim.locator(".sim-compteur")).toHaveText(/^7\//);
    await expect(sim.locator(".sim-stats-msg")).toContainText("Le scénario qui qualifie Charlie (éq. 1)");
    // Le scénario tient : Charlie y est qualifiée.
    await expect(sim.locator(".sim-impact .verdict")).toContainText(" · qualifiée");
    await expect(page.locator("#sim-slot")).toContainText("Simulation en cours");
  });

  test("le comptoir pronostique les parties libres, sans écraser la main", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);

    let sim = page.locator(".sim-card").first();
    await sim.locator(".sim-toggle").click();
    // Une partie simulée à la main avant : le comptoir la laisse telle quelle.
    await sim.locator(".sim-match").first().locator(".sim-pick").nth(1).click();

    await sim.getByRole("button", { name: /Le prono du comptoir/ }).click();
    sim = page.locator(".sim-card").first();
    const compteur = await sim.locator(".sim-compteur").textContent();
    const [faites, total] = compteur.split("/");
    expect(faites).toBe(total);
    await expect(sim.locator(".sim-stats-msg")).toContainText("Le comptoir a tranché");
    // Charlie perd contre Bravo d'après les adversaires communs : on le lui dit.
    await expect(sim.locator(".sim-stats-msg")).toContainText("Charlie");

    const premiere = sim.locator(".sim-match").first();
    await expect(premiere.locator(".sim-prono")).toBeHidden();
    await expect(premiere.locator(".sim-score").nth(1)).toHaveValue("40");
    await expect(sim.locator(".sim-match .sim-prono:visible").first()).toHaveText("🍻 Comptoir");

    // « Tout effacer », à côté du prono, défait tout sans redescendre.
    await sim.locator(".sim-actions").first().getByRole("button", { name: "Tout effacer" }).click();
    await expect(page.locator(".sim-stats-msg")).toHaveCount(0);
    await expect(page.locator("#sim-slot")).toBeEmpty();
  });
});

test.describe("Accueil : partage des parties d'ici dimanche", () => {
  test("la feuille de partage reçoit le texte des parties", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.share = (donnees) => { window.__partage = donnees; return Promise.resolve(); };
    });
    await page.goto("index.html");
    await attendreChargement(page);

    await page.getByRole("button", { name: "Partager ces parties" }).click();
    const texte = await page.evaluate(() => window.__partage && window.__partage.text);
    expect(texte).toMatch(/^\*Pala gomme pleine · (D'ici dimanche|Prochaines parties)/);
    expect(texte).toContain(" vs ");
    expect(texte).toContain("Trinquet Paris");
    expect(texte).toMatch(/Programme complet : http.*\/programme\.html$/);
  });

  test("sans feuille de partage, le texte est copié", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => { delete Navigator.prototype.share; });
    await page.goto("index.html");
    await attendreChargement(page);

    await page.getByRole("button", { name: "Partager ces parties" }).click();
    await expect(page.locator(".partage-ok")).toHaveText("Texte copié, à coller");
    const copie = await page.evaluate(() => navigator.clipboard.readText());
    expect(copie).toContain("Programme complet");
  });
});

test.describe("Mon équipe : prévenir l'équipe de ses parties à jouer", () => {
  test("le message met en tête la partie à reprogrammer", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.share = (donnees) => { window.__partage = donnees; return Promise.resolve(); };
    });
    await page.goto("equipe.html?equipe=" + encodeURIComponent(EQUIPE_SUIVIE));
    await attendreChargement(page);

    // La partie à la date passée n'est plus « à venir » dans la liste.
    await expect(page.locator(".match-score.retard")).toHaveText(["à reprogrammer"]);

    const bloc = page.locator(".prevenir");
    await expect(bloc).toContainText("à reprogrammer au plus vite");

    // WhatsApp vers le responsable, message prérempli, sans numéro affiché.
    const wa = bloc.locator("a.prevenir-btn.wa");
    await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/33\d+\?text=/);
    await expect(page.locator("body")).not.toContainText("0600000");

    await bloc.getByRole("button", { name: "Partager" }).click();
    const texte = await page.evaluate(() => window.__partage && window.__partage.text);
    expect(texte).toContain("Charlie (éq. 1)");
    const retard = texte.indexOf("*À reprogrammer au plus vite*");
    const aVenir = texte.indexOf("*À venir*");
    expect(retard).toBeGreaterThan(0);
    expect(aVenir).toBeGreaterThan(retard);
    expect(texte).toContain("Une date est à trouver au plus vite.");
    // Pas de lien, mais le numéro du responsable adverse pour fixer la date.
    expect(texte).not.toContain("http");
    expect(texte).toMatch(/Responsable : .*06 00 00 0\d \d\d/);
    // Les phases finales, une date chacune, tant que la finale de la saison
    // (6 déc. 2026) n'est pas passée ; les quarts de la série 1 sont le 14 nov.
    if (new Date() < new Date(2026, 10, 14)) {
      expect(texte).toMatch(/\*Rappel des phases finales\*\n• 1\/4 de finale : sam\. 14 nov\.\n• 1\/2 finale : dim\. 29 nov\.\n• Finale : dim\. 6 déc\.$/);
    } else if (new Date() >= new Date(2026, 11, 7)) {
      expect(texte).not.toContain("Rappel des phases finales");
    }
  });
});

test.describe("Habillages de fête", () => {
  const embleme = (page) => page.locator("header h1 .fete-embleme");

  test("Halloween par défaut, choix gardé d'une visite à l'autre", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 27, 12));
    await page.goto("index.html");
    await attendreChargement(page);
    await expect(embleme(page)).toHaveText("🎃");
    // La bulle vient seule, puis une autre phrase au toucher de l'emblème.
    const bulle = page.locator(".fete-bulle");
    await expect(bulle).toBeVisible();
    const premiere = await bulle.textContent();
    await embleme(page).click();
    await expect(bulle).not.toHaveText(premiere);

    await page.getByRole("button", { name: "✨ Toussaint" }).click();
    await expect(embleme(page)).toHaveText("✨");
    await page.reload();
    await attendreChargement(page);
    await expect(embleme(page)).toHaveText("✨");
    await expect(page.getByRole("button", { name: "✨ Toussaint" })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "Sans" }).click();
    await expect(embleme(page)).toHaveCount(0);
    await page.goto("equipe.html");
    await expect(embleme(page)).toHaveCount(0);
  });

  test("Toussaint par défaut dès le 30 octobre, sur toutes les pages", async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 30, 12));
    await page.goto("programme.html");
    await attendreChargement(page);
    await expect(embleme(page)).toHaveText("✨");
    // Le choix ne se fait que depuis l'accueil.
    await expect(page.locator(".fete-choix")).toHaveCount(0);
  });

  test("après le 1er novembre, plus rien, même choisi", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("lidfpb_theme_v1", "halloween"));
    await page.clock.setFixedTime(new Date(2026, 10, 2, 12));
    await page.goto("index.html");
    await attendreChargement(page);
    await expect(page.locator(".fete-embleme, .fete-choix, .fete-araignee, .fete-chauve-souris, .fete-etincelle")).toHaveCount(0);
  });
});
