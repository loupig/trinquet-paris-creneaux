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
    await expect(page.locator(".finales-card .demies").first()).toHaveText(/D1 : V\.Q1 – V\.Q2.*D2 : V\.Q3 – V\.Q4/);
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
    expect(texte).toMatch(/Le détail : http.*equipe\.html\?equipe=/);
  });
});
