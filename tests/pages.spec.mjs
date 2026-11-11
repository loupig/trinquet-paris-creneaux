// Tests « fumée » : chaque page s'ouvre sur des données fictives, sans erreur
// JavaScript ni bandeau d'échec, et affiche l'essentiel. Plus un scénario
// complet pour la prévision des quarts et le simulateur du Classement.
import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { tables, oidAVenir, codeClub } from "./donnees.mjs";

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
  { nom: "Mes équipes", url: "equipe.html?equipe=" + encodeURIComponent(EQUIPE_SUIVIE), contenu: "#results" },
  { nom: "Parties", url: "programme.html", contenu: "#results" },
  { nom: "Classement", url: "classement.html", contenu: "#results" },
  { nom: "Créneaux", url: "creneaux.html", contenu: "#results" },
  { nom: "Report", url: "report.html?oid=" + oidAVenir, contenu: "#targetCard" },
  { nom: "Bilan", url: "bilan.html", contenu: "#results" }
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

// Spec navigation : à 390 px, chaque libellé de la barre d'onglets tient sur
// une ligne et dans son onglet, sans défilement horizontal. Et encore sur les
// plus petits écrans, 320 px.
for (const largeur of [320, 390]) test.describe(`Barre d'onglets à ${largeur} px`, () => {
  test.use({ viewport: { width: largeur, height: 844 } });
  for (const p of [...PAGES, { nom: "Compteur", url: "compteur.html" }]) {
    test(`${p.nom} : cinq libellés sur une ligne`, async ({ page }) => {
      await page.goto(p.url);
      await page.evaluate(() => document.fonts.ready);
      const lignes = await page.locator(".tab-bar a span").evaluateAll((spans) => spans.map((s) => {
        const r = document.createRange();
        r.selectNodeContents(s);
        const tient = r.getBoundingClientRect().width <= s.parentElement.clientWidth;
        return s.textContent + " : " + r.getClientRects().length + (tient ? "" : " (déborde)");
      }));
      expect(lignes).toEqual(["Accueil : 1", "Mes équipes : 1", "Parties : 1", "Classement : 1", "Créneaux : 1"]);
      // L'en-tête aussi tient sur une ligne : « Site de la ligue » ne se replie pas.
      const ligue = page.locator(".header-bar .ligue-btn");
      if (await ligue.count()) {
        const lignesLigue = await ligue.evaluate((a) => { const r = document.createRange(); r.selectNodeContents(a); return r.getClientRects().length; });
        expect(lignesLigue, "« Site de la ligue » sur une ligne").toBe(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
});

// Spec apparence : sur grand écran, les blocs se rangent côte à côte ; sur
// téléphone (le Pixel 7 des autres tests), ils restent empilés.
async function enLigne(locator, combien = Infinity) {
  const boites = (await locator.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()))).slice(0, combien);
  if (boites.length < 2) return false;
  return boites.every((b) => Math.abs(b.top - boites[0].top) < 2) &&
    boites.every((b, i) => i === 0 || b.left >= boites[i - 1].right);
}

test.describe("Grand écran : blocs côte à côte", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("Accueil, Mes équipes, Classement, Parties et Créneaux en colonnes", async ({ page }) => {
    await page.goto("index.html");
    await attendreChargement(page);
    await expect(page.locator("#tiles > .colonne")).toHaveCount(3);
    expect(await enLigne(page.locator("#tiles > .colonne"))).toBe(true);

    await page.goto("equipe.html?equipe=" + encodeURIComponent(EQUIPE_SUIVIE));
    await attendreChargement(page);
    expect(await enLigne(page.locator(".colonnes > .colonne"))).toBe(true);

    await page.goto("classement.html");
    await attendreChargement(page);
    const zone = page.locator(".zone-classement").first();
    await expect(zone.locator(".poule-card")).toHaveCount(3);   // deux poules et les phases finales
    expect(await enLigne(zone.locator(".poule-card"))).toBe(true);

    for (const url of ["programme.html", "creneaux.html"]) {
      await page.goto(url);
      await attendreChargement(page);
      expect(await enLigne(page.locator("#results > .day-card"), 2), url).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), url).toBe(true);
    }
  });
});

// Même largeur de page et même alignement d'en-tête d'un onglet à l'autre :
// les trois premières règles du bloc grand écran sont identiques partout.
test("même mise en page grand écran dans les cinq onglets", async () => {
  const blocs = await Promise.all(["index", "equipe", "programme", "classement", "creneaux"].map(async (n) => {
    const html = await readFile(new URL(`../${n}.html`, import.meta.url), "utf8");
    const debut = html.indexOf("@media (min-width: 1000px) {");
    expect(debut, n).toBeGreaterThan(-1);
    return html.slice(debut).split("\n").filter((l) => /^\s*(main|header|\.header-bar) \{/.test(l)).slice(0, 3).join("\n");
  }));
  expect(blocs[0].split("\n")).toHaveLength(3);
  blocs.forEach((b) => expect(b).toBe(blocs[0]));
});

test("Téléphone : les blocs de l'accueil restent empilés", async ({ page }) => {
  await page.goto("index.html");
  await attendreChargement(page);
  const [a, b] = await page.locator("#tiles > .colonne").evaluateAll((els) => els.slice(0, 2).map((e) => e.getBoundingClientRect()));
  expect(b.top).toBeGreaterThanOrEqual(a.bottom);
});

// Au clavier, le premier arrêt est le lien d'évitement, visible et entouré
// d'un contour ; il mène au contenu, dont le haut reste visible sous
// l'en-tête, et le Tab suivant y reste.
for (const p of [...PAGES, { nom: "Compteur", url: "compteur.html" }]) {
  test(`${p.nom} : focus visible au clavier, lien d'évitement`, async ({ page }) => {
    await page.goto(p.url);
    // Données chargées : la page est assez longue pour défiler.
    if (p.contenu) await attendreChargement(page);
    await page.keyboard.press("Tab");
    const lien = page.getByRole("link", { name: "Aller au contenu" });
    await expect(lien).toBeFocused();
    await expect(lien).toBeInViewport();
    const contour = await lien.evaluate((e) => {
      const s = getComputedStyle(e);
      return s.outlineStyle + " " + s.outlineWidth;
    });
    expect(contour).toBe("solid 2px");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#contenu$/);
    // Le défilement vers l'ancre se fait à l'image suivante.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    expect(await page.evaluate(() => {
      const m = document.getElementById("contenu"), b = m.getBoundingClientRect();
      return m.contains(document.elementFromPoint(b.left + 4, b.top + 4));
    }), "haut du contenu visible, pas sous l'en-tête").toBe(true);
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement.closest("#contenu"))).toBe(true);
  });
}

// Spec apparence : Manrope, des tailles prises dans l'échelle commune, aucun
// texte affiché sous 12 px, et les champs à 16 px pour que l'iPhone ne zoome
// pas dessus.
for (const p of [...PAGES, { nom: "Compteur", url: "compteur.html" }]) {
  test(`${p.nom} : tailles de l'échelle, rien sous 12 px, champs à 16 px`, async ({ page }) => {
    await page.goto(p.url);
    if (p.contenu) await attendreChargement(page);
    await page.evaluate(() => document.fonts.ready);
    const t = await page.evaluate(() => {
      const visible = (e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
      const tailles = new Set();
      const marche = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (marche.nextNode()) {
        const e = marche.currentNode.parentElement;
        if (!marche.currentNode.textContent.trim() || !e || !visible(e)) continue;
        tailles.add(parseFloat(getComputedStyle(e).fontSize));
      }
      const champs = [...document.querySelectorAll("input:not([type=checkbox]):not([type=radio]):not([type=color]), select, textarea")]
        .filter(visible).map((e) => (e.id || e.name || e.tagName) + " : " + getComputedStyle(e).fontSize)
        .filter((s) => parseFloat(s.split(" : ")[1]) < 16);
      return {
        tailles: [...tailles].sort((a, b) => a - b),
        manrope: document.fonts.check("14px Manrope"),
        champs
      };
    });
    expect(t.manrope).toBe(true);
    // Les scores du compteur ont leurs propres tailles, au-delà de 24 px.
    const horsEchelle = t.tailles.filter((x) => ![12, 14, 16, 18, 20, 24].includes(x) && x < 48);
    expect(horsEchelle, "tailles hors échelle ou sous 12 px").toEqual([]);
    expect(t.champs, "champs sous 16 px").toEqual([]);
  });
}

// Moins d'animations demandé : les couleurs changent encore, rien ne bouge.
test("Moins d'animations : ni chevron qui tourne, ni bouton qui s'enfonce", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("classement.html");
  await attendreChargement(page);
  const styles = await page.evaluate(() => ({
    chevron: getComputedStyle(document.querySelector(".filters-toggle svg")).transitionDuration,
    bouton: getComputedStyle(document.querySelector(".filters-toggle")).transitionProperty
  }));
  expect(styles.chevron).toBe("0s");
  expect(styles.bouton).not.toContain("transform");
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
    await expect(page.locator("#resetBtn")).toBeHidden();
    await expect(page.locator(".score-eus").first()).toHaveText("zero");

    const bera = page.locator(".score-btn").nth(0);
    const ahetze = page.locator(".score-btn").nth(1);
    await bera.click();
    // Partie lancée : les réglages se replient, le résumé les rappelle.
    await expect(reglages).not.toHaveAttribute("open", "");
    await expect(page.locator("#setupResume")).toHaveText("Bera contre Ahetze · en 30");
    await expect(bera).toContainText("encore 29");
    await expect(bera.locator(".score-eus")).toHaveText("bat");

    for (let i = 0; i < 27; i++) await bera.click();
    for (let i = 0; i < 25; i++) await ahetze.click();
    await bera.click();                                   // 29-25
    // À un point du but : « Azkena », et le score chanté en basque.
    await expect(bera).toContainText("Azkena");
    await expect(bera).not.toContainText("Nobia");
    await expect(bera.locator(".score-eus")).toHaveText("hogeita bederatzi");
    await expect(ahetze.locator(".score-eus")).toHaveText("hogeita bost");

    await bera.click();                                   // 30-25 : fin
    await expect(page.locator("#fin")).toContainText("Victoire de Bera");
    await expect(page.locator("#fin")).toContainText("30 à 25");
    await expect(bera).toBeDisabled();
    await expect(ahetze).toBeDisabled();
    await expect(bera.locator(".score-eus")).toHaveText("hogeita hamar");
    await expect(page.locator("#fin").getByRole("button", { name: "Nouvelle partie" })).toBeVisible();

    await page.getByRole("button", { name: "Partager le résultat" }).click();
    const texte = await page.evaluate(() => window.__partage && window.__partage.text);
    expect(texte).toMatch(/^\*Bera 30 – 25 Ahetze\*/);
    expect(texte).toContain("Victoire de Bera · partie en 30");
    expect(texte).toMatch(/decouvrir\.html$/);

    // Point gagnant donné par erreur : l'annuler relance la partie.
    await page.getByRole("button", { name: "Annuler le dernier point" }).click();
    await expect(page.locator("#fin")).toBeHidden();
    await expect(ahetze).toBeEnabled();

    // Le graphe se replie, et le reste après un rechargement.
    await page.locator("#chartBox > summary").click();
    await expect(page.locator("#chart")).toBeHidden();
    await expect(page.locator("#chartResume")).not.toBeEmpty();
    // L'événement toggle, qui enregistre le repli, arrive un peu après le clic :
    // recharger avant lui perdrait le repli.
    await expect.poll(() => page.evaluate(() =>
      JSON.parse(localStorage.getItem("lidfpb_compteur_v1")).graphe)).toBe(false);

    // Rechargement : score, score visé et graphe replié retrouvés.
    await page.reload();
    await expect(bera).toContainText("29");
    await expect(page.locator("#setupResume")).toHaveText("Bera contre Ahetze · en 30");
    await expect(page.locator("#chart")).toBeHidden();

    // « Nouvelle partie » en cours de jeu : dans les réglages, loin du score.
    await reglages.locator("summary").click();
    page.once("dialog", (d) => d.accept());
    await reglages.getByRole("button", { name: "Nouvelle partie" }).click();
    await expect(bera.locator(".score-value")).toHaveText("0");
    await expect(reglages).toHaveAttribute("open", "");
  });

  test("plein écran à la demande, thème sombre gardé, Quitter et Retour referment", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("compteur.html");
    const fs = page.locator("#fs");
    await expect(fs).toBeHidden();

    await page.getByRole("button", { name: "Plein écran" }).click();
    await expect(fs).toBeVisible();
    await expect(fs.locator("#scoreboard")).toBeVisible();
    await fs.locator(".score-btn").first().click();
    await expect(fs.locator("#fsResume")).toHaveText("1 – 0 · en 40");

    // Thème sombre au choix, gardé d'une visite à l'autre.
    await expect(fs).not.toHaveClass(/sombre/);
    await fs.getByRole("button", { name: "Passer en thème sombre" }).click();
    await expect(fs).toHaveClass(/sombre/);

    await fs.getByRole("button", { name: "Quitter" }).click();
    await expect(fs).toBeHidden();
    await expect(page.locator("main #scoreboard")).toBeVisible();

    await page.reload();
    await page.getByRole("button", { name: "Plein écran" }).click();
    await expect(fs).toHaveClass(/sombre/);
    await expect(fs.locator(".score-value").first()).toHaveText("1");
    // Le bouton Retour du téléphone referme le plein écran sans quitter la page.
    await page.goBack();
    await expect(fs).toBeHidden();
    await expect(page).toHaveURL(/compteur\.html/);
  });

  test("couleur libre au sélecteur, lisible, gardée, et signalée si trop proche", async ({ page }) => {
    await page.goto("compteur.html");
    // Rouge, vert, puis la couleur libre : trois pastilles par équipe.
    await expect(page.locator(".team-setup").first().locator(".swatch")).toHaveCount(3);
    const selecteurs = page.locator(".swatch-libre input");
    await expect(selecteurs).toHaveCount(2);

    // Violet pour l'équipe 1 : assez foncé pour servir tel quel.
    await selecteurs.nth(0).fill("#8b3fd9");
    const bouton1 = page.locator(".score-btn").nth(0);
    await expect(bouton1).toHaveCSS("border-top-color", "rgb(139, 63, 217)");
    await expect(page.locator(".swatch-libre").nth(0)).toHaveClass(/\bon\b/);

    // Jaune pour l'équipe 2 : trop clair sur blanc, son texte est foncé.
    await selecteurs.nth(1).fill("#f2e600");
    const couleur2 = await page.locator(".score-btn").nth(1).locator(".score-value").evaluate((e) => getComputedStyle(e).color);
    expect(couleur2).not.toBe("rgb(242, 230, 0)");
    await expect(page.locator(".couleurs-proches")).toHaveCount(0);

    // Un violet voisin n'est pas interdit, mais signalé.
    await selecteurs.nth(1).fill("#a040e0");
    await expect(page.locator(".couleurs-proches")).toBeVisible();

    await page.reload();
    await expect(page.locator(".score-btn").nth(0)).toHaveCSS("border-top-color", "rgb(139, 63, 217)");
  });

  test("pause : retirée de la durée de jeu, reprise au point suivant", async ({ page }) => {
    // Trois points, dont un après dix minutes de pause : 100 s de jeu.
    const t0 = Date.now() - 3600 * 1000;
    await page.addInitScript((t) => {
      localStorage.setItem("lidfpb_compteur_v1", JSON.stringify({
        teams: [{ name: "Bera", color: "#CE1126" }, { name: "Ahetze", color: "#009B48" }],
        points: [{ t: 0, at: t }, { t: 1, at: t + 60000 }, { t: 0, at: t + 700000 }],
        pauses: [[t + 70000, t + 670000]], cible: 40
      }));
    }, t0);
    await page.goto("compteur.html");
    await expect(page.locator("#chrono")).toContainText("partie : 1 min 40 s");

    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.locator("#chrono")).toContainText("en pause depuis");
    await expect(page.locator("#scoreboard")).toHaveClass(/en-pause/);
    // Un point marqué reprend la partie.
    await page.locator(".score-btn").nth(1).click();
    await expect(page.locator("#scoreboard")).not.toHaveClass(/en-pause/);
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  });

  test("plein écran : le temps de jeu s'écoule, s'arrête en pause et au point gagnant", async ({ page }) => {
    // Horloge figée : le temps n'avance que quand le test le dit.
    const maintenant = new Date(2026, 9, 28, 20, 0, 0);
    await page.clock.install({ time: maintenant.getTime() - 5000 });
    await page.clock.pauseAt(maintenant);
    const t0 = maintenant.getTime() - 125000;   // premier point il y a 2:05
    await page.addInitScript((t) => {
      localStorage.setItem("lidfpb_compteur_v1", JSON.stringify({
        teams: [{ name: "Bera", color: "#CE1126" }, { name: "Ahetze", color: "#009B48" }],
        // 39 points d'avance, le premier il y a 2:05 : le prochain fait 40.
        points: [{ t: 0, at: t }].concat(Array.from({ length: 38 }, () => ({ t: 0, at: t + 1000 }))), cible: 40
      }));
    }, t0);
    await page.goto("compteur.html");
    await page.getByRole("button", { name: "Plein écran" }).click();
    const temps = page.locator("#fsTemps");
    await expect(temps).toBeVisible();
    await expect(temps).toHaveText("2:05");
    await page.clock.runFor(1000);
    await expect(temps).toHaveText("2:06");

    // En pause, le temps ne bouge plus et passe en grisé.
    await page.locator("#fsPause").click();
    await expect(temps).toHaveClass(/arret/);
    await page.clock.runFor(5000);
    await expect(temps).toHaveText("2:06");
    await page.locator("#fsPause").click();
    await expect(temps).not.toHaveClass(/arret/);

    // Le point gagnant fige le temps.
    await page.clock.runFor(2000);
    await page.locator("#fs .score-btn").first().click();
    await expect(temps).toHaveText("2:08");
    await page.clock.runFor(5000);
    await expect(temps).toHaveText("2:08");
    await expect(temps).toHaveClass(/arret/);
  });

  test("confettis au point gagnant, pas au rechargement ni si moins d'animations", async ({ page }) => {
    await page.goto("compteur.html");
    await page.getByRole("button", { name: "30 points" }).click();
    const bera = page.locator(".score-btn").nth(0);
    for (let i = 0; i < 29; i++) await bera.click();
    await expect(page.locator("#confettis")).toHaveCount(0);
    await bera.click();                                   // 30-0 : victoire
    await expect(page.locator("#confettis")).toHaveCount(1);
    await expect(page.locator("#confettis")).toHaveCount(0, { timeout: 6000 });   // s'efface seule

    await page.reload();                                  // partie finie relue : pas de fête
    await expect(page.locator("#fin")).toBeVisible();
    await expect(page.locator("#confettis")).toHaveCount(0);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("button", { name: "Annuler le dernier point" }).click();
    await bera.click();
    await expect(page.locator("#fin")).toBeVisible();
    await expect(page.locator("#confettis")).toHaveCount(0);
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

test.describe("Compter une partie depuis Parties ou Mes équipes", () => {
  test("Mes équipes : la prochaine partie s'ouvre au compteur, équipes nommées", async ({ page }) => {
    await page.goto("equipe.html?equipe=" + encodeURIComponent(EQUIPE_SUIVIE));
    await attendreChargement(page);
    await page.getByRole("link", { name: "Compter cette partie" }).click();
    await expect(page).toHaveURL(/compteur\.html$/);     // lien consommé
    const noms = await page.locator(".team-name").evaluateAll((l) => l.map((e) => e.value));
    expect(noms).toContain("Charlie 1");
    expect(noms.join(" ")).not.toContain("éq.");
    await expect(page.locator("#contexte")).toHaveText(/^Série 1 · /);
    await expect(page.locator("#setupResume")).toContainText("en 40");
  });

  test("Parties : le détail d'une partie à jouer ouvre le compteur", async ({ page }) => {
    await page.goto("programme.html");
    await attendreChargement(page);
    // Le détail, replié, se déplie au toucher de la ligne.
    const item = page.locator(".match-item").filter({ has: page.locator("a", { hasText: "Compter cette partie" }) }).first();
    await item.locator(".match-row").click();
    const lien = item.getByRole("link", { name: "Compter cette partie" });
    const href = await lien.getAttribute("href");
    expect(href).toMatch(/^compteur\.html\?e1=.+&e2=.+&cible=40&info=/);
    await lien.click();
    await expect(page.locator(".team-name").first()).not.toHaveValue("Équipe 1");
  });

  test("une autre partie en cours n'est pas effacée sans le demander", async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem("deja")) return;
      sessionStorage.setItem("deja", "1");
      localStorage.setItem("lidfpb_compteur_v1", JSON.stringify({
        teams: [{ name: "Bera", color: "#CE1126" }, { name: "Ahetze", color: "#009B48" }],
        points: [{ t: 0, at: Date.now() - 5000 }, { t: 0, at: Date.now() - 2000 }]
      }));
    });
    await page.goto("compteur.html?e1=" + encodeURIComponent("Sare (éq. 2)") + "&e2=Ainhoa&cible=40&info=" + encodeURIComponent("Série 2 · Poule 1"));
    const arrivee = page.locator("#arrivee");
    await expect(arrivee).toContainText("Bera 2 – 0 Ahetze");
    await arrivee.getByRole("button", { name: "Garder la partie en cours" }).click();
    await expect(arrivee).toBeHidden();
    await expect(page.locator(".score-btn").first()).toContainText("Bera");

    await page.goto("compteur.html?e1=" + encodeURIComponent("Sare (éq. 2)") + "&e2=Ainhoa&cible=40&info=" + encodeURIComponent("Série 2 · Poule 1"));
    await arrivee.getByRole("button", { name: "Compter Sare 2 – Ainhoa" }).click();
    await expect(page.locator(".score-btn").first()).toContainText("Sare 2");
    await expect(page.locator(".score-btn .score-value").first()).toHaveText("0");
    await expect(page.locator("#contexte")).toHaveText("Série 2 · Poule 1");
  });
});

test("Accueil : la toute première visite passe par la présentation, une seule fois", async ({ page }) => {
  // Appareil vierge : le beforeEach réinscrit l'équipe suivie à chaque
  // document, on la retire donc à chaque fois. Le reste n'est effacé qu'au
  // premier document, pour que seules les marques posées par les pages tiennent.
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("vierge")) { localStorage.clear(); sessionStorage.setItem("vierge", "1"); }
    localStorage.removeItem("lidfpb_mes_equipes_v1");
  });
  await page.goto("index.html");
  await expect(page).toHaveURL(/decouvrir\.html$/);
  expect(await page.evaluate(() => localStorage.getItem("lidfpb_decouvert_v1"))).toBe("1");
  await page.locator("a.btn-primary").first().click();
  await expect(page).toHaveURL(/index\.html$/);
  await attendreChargement(page);
  await expect(page.locator("#tiles")).not.toBeEmpty();
});

test("Accueil : un thème choisi ailleurs ne compte pas comme une visite", async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("vierge")) { localStorage.clear(); sessionStorage.setItem("vierge", "1"); }
    localStorage.removeItem("lidfpb_mes_equipes_v1");
    localStorage.setItem("lidfpb_theme_v1", "sombre");
  });
  await page.goto("index.html");
  await expect(page).toHaveURL(/decouvrir\.html$/);
});

test("Accueil : arrivé par un lien vers la présentation, on n'y est pas renvoyé", async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("vierge")) { localStorage.clear(); sessionStorage.setItem("vierge", "1"); }
    localStorage.removeItem("lidfpb_mes_equipes_v1");
  });
  await page.goto("decouvrir.html");
  await page.goto("index.html");
  await expect(page).toHaveURL(/index\.html$/);
  await attendreChargement(page);
});

test("Tout lien partagé montre l'aperçu de Découvrir et ouvre sa propre page", async () => {
  const balises = (html) => {
    const lire = (attr, nom) => (html.match(new RegExp(`<meta ${attr}="${nom}" content="([^"]*)"`)) || [])[1];
    return {
      description: lire("name", "description"),
      titre: lire("property", "og:title"),
      texte: lire("property", "og:description"),
      image: lire("property", "og:image"),
      carte: lire("name", "twitter:card")
    };
  };
  const reference = balises(await readFile("decouvrir.html", "utf8"));
  expect(reference.image).toMatch(/og-decouvrir\.png$/);
  for (const p of ["index", "equipe", "equipes", "programme", "classement", "creneaux", "report", "compteur", "bilan"]) {
    const html = await readFile(p + ".html", "utf8");
    expect(balises(html), p).toEqual(reference);
    expect(html, p + " ne doit pas renvoyer l'aperçu vers Découvrir").not.toContain('property="og:url"');
  }
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
  // Pas d'avis inventés sur la page.
  await expect(page.locator("#avis, blockquote")).toHaveCount(0);
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

test("Ancienne adresse equipes.html redirige vers Mes équipes", async ({ page }) => {
  await page.goto("equipes.html");
  await expect(page).toHaveURL(/equipe\.html/);
});

// Spec programme, « Résumé des filtres repliés » : commun à Parties,
// Classement et Créneaux.
test.describe("Filtres repliés : résumé de ce qui est filtré", () => {
  test("Parties : rien de filtré, puis des filtres, trois cités au plus", async ({ page }) => {
    await page.goto("programme.html");
    await attendreChargement(page);
    const recap = page.locator(".filters-recap");
    await expect(recap).toHaveText("Tout est affiché");   // replié par défaut
    await page.locator("#filtersToggle").click();
    await expect(recap).toBeHidden();   // déplié : pas de résumé
    await page.locator("#filtersToggle").click();
    await expect(recap).toHaveText("Tout est affiché");

    await page.locator("#filtersToggle").click();
    await page.locator("#filterSeries .filter-chip[data-serie='2']").click();
    await page.locator("#chipHidePast").click();
    await page.locator("#filtersToggle").click();
    await expect(recap).toHaveText("Série 1 · Parties à venir");

    await page.locator("#filtersToggle").click();
    await page.locator("#filterPhases .filter-chip", { hasText: "1/4 de finale" }).click();
    await page.locator("#filterLieux .filter-chip").first().click();
    await page.locator("#filtersToggle").click();
    await expect(recap).toHaveText("Série 1 · aucun lieu · Poules · +1");
  });

  test("le script du pli et du résumé est le même dans les trois pages", async () => {
    const scripts = await Promise.all(["programme", "classement", "creneaux"].map(async (n) => {
      const html = await readFile(new URL(`../${n}.html`, import.meta.url), "utf8");
      const debut = html.indexOf('var CLE_PLI = "lidfpb_filters_open_v1";');
      expect(debut, n).toBeGreaterThan(-1);
      return html.slice(debut, html.indexOf("</script>", debut));
    }));
    scripts.forEach((s) => expect(s).toBe(scripts[0]));
  });

  test("Créneaux : une heure retirée se lit « sans 17h », la case décochée se dit", async ({ page }) => {
    await page.goto("creneaux.html");
    await attendreChargement(page);
    await page.locator("#filtersToggle").click();
    await page.locator("#filterHours .filter-chip[data-hour='17']").click();
    await page.locator("#filterOnlyFree").uncheck();
    await page.locator("#filtersToggle").click();
    await expect(page.locator(".filters-recap")).toHaveText("sans 17h · Jours complets compris");
  });

  test("Classement : le découpage général figure, pas le découpage par défaut", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await expect(page.locator(".filters-recap")).toHaveText("Tout est affiché");
    await page.locator("#filtersToggle").click();
    await page.locator("#filterDecoupage .filter-chip[data-mode='general']").click();
    await page.locator("#filtersToggle").click();
    await expect(page.locator(".filters-recap")).toHaveText("Classement général");
  });
});

// Spec programme, « Filtres mémorisés sur l'appareil » : le bloc est replié
// par défaut sur les trois pages, et le pli est commun.
test.describe("Filtres repliés par défaut", () => {
  for (const url of ["programme.html", "classement.html", "creneaux.html"]) {
    test(`${url} : première visite, bloc replié qui dit « Tout est affiché »`, async ({ page }) => {
      await page.goto(url);
      await attendreChargement(page);
      await expect(page.locator("#filtersToggle")).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#filtersBody")).toBeHidden();
      await expect(page.locator(".filters-recap")).toHaveText("Tout est affiché");
    });
  }

  test("ouvert à la main sur le Classement, il est ouvert sur Créneaux", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await page.locator("#filtersToggle").click();
    await expect(page.locator("#filtersBody")).toBeVisible();
    await page.goto("creneaux.html");
    await attendreChargement(page);
    await expect(page.locator("#filtersToggle")).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#filtersBody")).toBeVisible();
  });
});

// Spec classement, « Ligne d'une équipe » et « Joueurs des équipes » : une
// ligne en colonnes, les joueurs et le détail au toucher.
test.describe("Classement : une ligne par équipe, en colonnes", () => {
  const ligne = (page, nom) => page.locator(".rank-row").filter({ hasText: nom }).first();
  const colonnes = (row) => row.locator(".rank-n").allTextContents();

  test("en-tête de colonnes et valeurs d'une équipe classée", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    const carte = page.locator(".zone-classement").first().locator(".poule-card").first();
    await expect(carte.locator(".rank-head > span")).toHaveText(["#", "Équipe", "J", "G", "P", "GA", "Moy.", ""]);
    const alpha = ligne(page, "Alpha (éq. 1)");
    expect(await colonnes(alpha)).toEqual(["3", "3", "0", "+51"]);
    await expect(alpha.locator(".rank-score")).toHaveText("3,00");
    expect(await colonnes(ligne(page, "Bravo (éq. 1)"))).toEqual(["3", "2", "1", "−7"]);
    await expect(ligne(page, "Bravo (éq. 1)").locator(".rank-score")).toHaveText("2,33");
    // Rien d'autre sur la ligne : ni phrase de détail, ni joueurs.
    await expect(page.locator(".rank-joueurs:visible")).toHaveCount(0);
    await expect(page.locator(".rank-detail:visible")).toHaveCount(0);
  });

  test("toucher une ligne montre ses joueurs puis son détail, un second toucher les cache", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    const bravo = ligne(page, "Bravo (éq. 1)");
    await expect(bravo).toHaveAttribute("aria-expanded", "false");
    const chevron = () => bravo.locator(".rank-chevron svg").evaluate((s) => getComputedStyle(s).transform);
    const replie = await chevron();
    const fond = () => bravo.evaluate((e) => getComputedStyle(e).backgroundColor);
    const fondReplie = await fond();

    await bravo.click();
    await expect(bravo).toHaveAttribute("aria-expanded", "true");
    const plus = page.locator("#" + await bravo.getAttribute("aria-controls"));
    await expect(plus).toBeVisible();
    await expect(plus.locator(".rank-joueurs")).toHaveText("Ane Joueur100003, Bixente Joueur100004");
    await expect(plus.locator(".rank-detail")).toHaveText(/^3 parties · 2 G · 1 P · 7 pts · /);
    // Les joueurs d'abord, le détail chiffré ensuite.
    expect(await plus.locator(".rank-joueurs, .rank-detail").evaluateAll((l) => l.map((e) => e.className.split(" ")[0])))
      .toEqual(["rank-joueurs", "rank-detail"]);
    await expect.poll(chevron).toBe("none");
    expect(replie).not.toBe("none");
    await expect.poll(fond).not.toBe(fondReplie);

    // Deux lignes ouvertes à la fois.
    await ligne(page, "Alpha (éq. 1)").click();
    await expect(page.locator(".rank-row[aria-expanded='true']")).toHaveCount(2);

    await bravo.click();
    await expect(bravo).toHaveAttribute("aria-expanded", "false");
    await expect(plus).toBeHidden();
    await expect.poll(chevron).toBe(replie);
  });

  test("une ligne ouverte le reste quand la simulation recalcule le classement", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await ligne(page, "Bravo (éq. 1)").click();
    const sim = page.locator(".sim-card").first();
    await sim.locator(".sim-toggle").click();
    await sim.locator(".sim-match").first().locator(".sim-pick").first().click();
    await expect(page.locator("#sim-slot")).toContainText("Simulation en cours");
    await expect(ligne(page, "Bravo (éq. 1)")).toHaveAttribute("aria-expanded", "true");
  });

  test("la phrase d'aide, sur la première carte seulement", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    const aide = page.locator(".rank-aide");
    await expect(aide).toHaveCount(1);
    await expect(aide).toHaveText("👥 Touchez une équipe pour voir ses joueurs");
    await expect(page.locator(".poule-card").first().locator(".rank-aide")).toHaveCount(1);
    // Série 1 masquée : la phrase passe sur la première carte de la série 2.
    await page.locator("#filtersToggle").click();
    await page.locator("#filterSeries .filter-chip[data-serie='1']").click();
    await expect(aide).toHaveCount(1);
    await expect(page.locator(".poule-card").first().locator(".badge")).toHaveText("Série 2");
    await expect(page.locator(".poule-card").first().locator(".rank-aide")).toHaveCount(1);
  });

  test("une équipe qui n'a pas joué : 0 partie et des tirets", async ({ page }) => {
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      // Foxtrot (série 1) n'a plus aucun score.
      const data = table === "rencontres"
        ? tables.rencontres.map((r) => r["Catégorie"] === "1" && (r.club_rec === codeClub(5) || r.club_vis === codeClub(5)) ? { ...r, score_cr: "", score_cv: "" } : r)
        : (tables[table] || []);
      route.fulfill({
        status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data, lastSync: new Date().toISOString() })
      });
    });
    await page.goto("classement.html");
    await attendreChargement(page);
    const foxtrot = ligne(page, "Foxtrot (éq. 1)");
    await expect(foxtrot.locator(".rank-pos")).toHaveText("–");
    expect(await colonnes(foxtrot)).toEqual(["0", "–", "–", "–"]);
    await expect(foxtrot.locator(".rank-score")).toHaveText("–");
    await foxtrot.click();
    await expect(page.locator("#" + await foxtrot.getAttribute("aria-controls")).locator(".rank-detail")).toHaveText("aucune partie jouée");
  });

  test("une poule de six entière au premier écran, lien Bilan sur une ligne", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await page.evaluate(() => document.fonts.ready);
    const haut = await page.locator(".tab-bar").evaluate((e) => e.getBoundingClientRect().top);
    const lignes = page.locator(".zone-classement").first().locator(".poule-card").first().locator(".rank-row");
    await expect(lignes).toHaveCount(6);
    const bas = await lignes.last().evaluate((e) => e.getBoundingClientRect().bottom);
    expect(bas, "la 6e équipe passe sous la barre d'onglets").toBeLessThanOrEqual(haut);
    const titre = page.locator(".bilan-lien .bilan-lien-texte");
    expect(await titre.evaluate((e) => {
      const r = document.createRange(); r.selectNodeContents(e); return r.getClientRects().length;
    })).toBe(1);
    await expect(page.locator(".bilan-lien small")).toHaveCount(0);
  });

  test("lecteur d'écran : chaque ligne se lit en une phrase", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    const serie1 = page.locator(".zone-classement").first();   // Alpha est aussi en série 2
    await expect(serie1.getByRole("button", {
      name: "Rang 1, Alpha (éq. 1), 3 parties jouées, 3 gagnées, 0 perdue, goal average +51, moyenne 3,00", exact: true
    })).toHaveCount(1);
    await expect(serie1.getByRole("button", {
      name: "Rang 4, Charlie (éq. 1), 2 parties jouées, 1 gagnée, 1 perdue, goal average −17, moyenne 2,00", exact: true
    })).toHaveCount(1);
    await expect(page.locator(".rank-head").first()).toHaveAttribute("aria-hidden", "true");
  });
});

for (const largeur of [320, 390]) test.describe(`Classement à ${largeur} px`, () => {
  test.use({ viewport: { width: largeur, height: 844 } });
  test("pas de défilement horizontal, par poule comme en général", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#filtersToggle").click();
    await page.locator("#filterDecoupage .filter-chip[data-mode='general']").click();
    await ouvrirUneLigne(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

// Ouvre une ligne du classement, pour mesurer aussi le détail déplié.
async function ouvrirUneLigne(page) {
  await page.locator(".rank-row").first().click();
  await expect(page.locator(".rank-plus:visible")).toHaveCount(1);
}

// Spec classement, « Poule d'origine en classement général ».
test("Classement : chaque équipe montre sa poule, d'une teinte par poule, jusqu'au tableau des quarts", async ({ page }) => {
  await page.goto("classement.html");
  await attendreChargement(page);
  await expect(page.locator(".poule-tag")).toHaveCount(0);
  await page.locator("#filtersToggle").click();
  await page.locator("#filterDecoupage .filter-chip[data-mode='general']").click();
  const carte = page.locator(".zone-classement").first().locator(".poule-card").first();
  const lignes = carte.locator(".rank-row");
  const n = await lignes.count();
  await expect(carte.locator(".poule-tag")).toHaveCount(n);
  const tags = await carte.locator(".poule-tag").allTextContents();
  expect(new Set(tags)).toEqual(new Set(["P1", "P2"]));
  const teinte = (cls) => carte.locator(".rank-row." + cls).first().evaluate((e) => getComputedStyle(e).boxShadow);
  expect(await teinte("teinte-1")).not.toBe(await teinte("teinte-2"));
  // Le tableau des quarts reprend les mêmes teintes sur ses étiquettes.
  const couleur = (loc) => loc.first().evaluate((e) => getComputedStyle(e).color);
  const finales = page.locator(".zone-classement").first().locator(".finales-card");
  const p1 = await couleur(finales.locator(".quart-seed", { hasText: "P1" }));
  expect(p1).toBe(await couleur(carte.locator(".rank-row.teinte-1 .poule-tag")));
  expect(p1).not.toBe(await couleur(finales.locator(".quart-seed", { hasText: "P2" })));
  await page.locator("#filterDecoupage .filter-chip[data-mode='poule']").click();
  await expect(page.locator(".poule-tag")).toHaveCount(0);
  await expect(page.locator(".finales-card .quart-seed.teinte-1").first()).toBeVisible();
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

  test("chaque équipe d'un quart a ses chances de victoire, qui font 100 %", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);

    const quarts = page.locator(".finales-card").first().locator(".quart-row");
    for (let i = 0; i < 4; i++) {
      const textes = await quarts.nth(i).locator(".quart-proba").allTextContents();
      expect(textes).toHaveLength(2);
      const [a, b] = textes.map((t) => parseInt(t, 10));
      expect(a + b).toBe(100);
      expect(a % 5).toBe(0);
      expect(Math.min(a, b)).toBeGreaterThanOrEqual(5);
    }
    // Q1 oppose le 1er de la poule 1 au 4e de la poule 2 : le 1er est favori.
    await expect(quarts.nth(0).locator(".quart-proba").first()).toHaveClass(/favori/);
    await expect(page.locator(".finales-card .finales-note").first()).toContainText("chances de gagner le quart");
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

  test("« Afficher ce scénario » remplit la poule d'un scénario qui qualifie", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);

    // Charlie (4e, poule 1) : 7 parties restent dans sa poule.
    await page.getByRole("button", { name: /Afficher ce scénario/ }).click();
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

// Spec bilan : le bilan de la phase de poules, ouvert depuis le Classement
// seulement, hors barre d'onglets.
test.describe("Bilan de la phase de poules", () => {
  test("ouvert depuis le Classement : chiffres, mon équipe, trophées, poules, tableau final", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await page.getByRole("link", { name: /Bilan de la phase de poules/ }).click();
    await expect(page).toHaveURL(/bilan\.html$/);
    await attendreChargement(page);

    // Pas d'onglet de plus : le Classement reste l'onglet courant.
    await expect(page.locator(".tab-bar a")).toHaveCount(5);
    await expect(page.locator(".tab-bar a.active")).toHaveText("Classement");
    await expect(page.getByRole("link", { name: "Classement" }).first()).toHaveAttribute("href", "classement.html");

    // Données fictives : 32 parties jouées, des parties de poule restantes.
    const hero = page.locator(".bilan-hero");
    await expect(hero.locator(".bilan-titre")).toHaveText("Dernière ligne droite");
    await expect(hero).toContainText("bilan provisoire");
    // Parties passées sans score : des résultats attendus, pas des parties à jouer.
    await expect(hero.locator(".bilan-sous")).toContainText("Encore 20 parties de poule à jouer");
    await expect(hero.locator(".bilan-sous")).toContainText("et 8 scores pas encore publiés");
    await expect(hero.locator(".bilan-tuile b").first()).toHaveText("32");

    // Charlie, suivie : 4e de sa poule pour l'instant, en Q4 contre le 1er de la poule 2.
    const mien = page.locator(".mien-ligne");
    await expect(mien).toHaveCount(1);
    await expect(mien).toContainText("Charlie (éq. 1)");
    await expect(mien.locator(".mien-verdict")).toHaveText("4e de la poule 1 · en quarts pour l'instant");
    await expect(mien).toContainText("Quart Q4 contre Golf (éq. 1)");
    // Les joueurs entre crochets, à côté du nom de l'équipe.
    await expect(mien.locator("b")).toHaveText(/^Charlie \(éq\. 1\) \[Ane Joueur\d+, Bixente Joueur\d+\]$/);

    // D'abord le bilan global : trophées toutes séries, la série dite après l'équipe.
    const global = page.locator(".bilan-global");
    await expect(global.locator(".trophees .bilan-carte-titre")).toHaveText("Les trophées · toutes séries");
    await expect(global.locator(".trophee").first()).toContainText("Meilleur bilan, toutes séries");
    await expect(global.locator(".trophee").first().locator(".trophee-nom")).toContainText(/Alpha \(éq\. 1\) · Série \d \[Ane/);
    // Puis chaque série, ses propres chiffres en tête.
    await expect(page.locator(".serie-bloc").first().locator(".bilan-tuiles.clair .bilan-tuile")).toHaveCount(4);

    // Série 1 : trophées, deux poules, tableau final.
    const serie = page.locator(".serie-bloc").first();
    await expect(page.locator(".serie-bloc")).toHaveCount(2);
    await expect(serie.locator(".trophee").first()).toContainText("Meilleur bilan de la série");
    await expect(serie.locator(".trophee").first()).toContainText("Alpha (éq. 1)");
    await expect(serie.locator(".trophee", { hasText: "Plus large victoire" })).toContainText("40–18");
    // Meilleure attaque : le plus gros goal average cumulé (Alpha, +51).
    await expect(serie.locator(".trophee", { hasText: "Meilleure attaque" }).locator(".trophee-valeur"))
      .toHaveText("goal average +51 cumulé · 120 marqués, 69 encaissés");
    await expect(serie.locator(".poule-card:not(.finales-card)")).toHaveCount(2);
    const poule1 = serie.locator(".poule-card").first();
    await expect(poule1.locator(".rank-row")).toHaveCount(6);
    await expect(poule1.locator(".rank-row.suivie .rank-team")).toHaveText(/^Charlie \(éq\. 1\) \[Ane Joueur\d+, Bixente Joueur\d+\]$/);
    await expect(poule1.locator(".cut-line")).toHaveText("En quarts pour l'instant");
    // Les 15 parties de la poule, repliées puis dépliées.
    const resultats = poule1.locator("details.resultats");
    await expect(resultats.locator("summary")).toHaveText("Les 15 parties de la poule");
    await expect(resultats.locator(".resultat").first()).toBeHidden();
    await resultats.locator("summary").click();
    await expect(resultats.locator(".resultat")).toHaveCount(15);
    await expect(resultats.locator(".resultat-score.a-jouer", { hasText: "à jouer" })).not.toHaveCount(0);
    await expect(resultats.locator(".resultat-score.a-jouer", { hasText: "sans score" })).toHaveCount(2);

    // Le tableau final est celui du Classement, les joueurs en plus.
    const finales = serie.locator(".finales-card");
    await expect(finales.locator(".statut")).toHaveText("Prévision");
    await expect(finales.locator(".quart-nom .joueurs")).toHaveCount(8);
    const sansJoueurs = (textes) => textes.map((t) => t.replace(/ \[[^\]]*\]/g, ""));
    const quartsBilan = sansJoueurs(await finales.locator(".quart-row").allTextContents());
    expect(quartsBilan).toHaveLength(4);
    await page.goto("classement.html");
    await attendreChargement(page);
    expect(await page.locator(".finales-card").first().locator(".quart-row").allTextContents()).toEqual(quartsBilan);
  });

  test("Partager le bilan : une image PNG et un texte pour WhatsApp, sans nom de joueur", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.canShare = (d) => !!(d && d.files);
      navigator.share = (d) => { window.__partage = d; return Promise.resolve(); };
    });
    await page.goto("bilan.html");
    await attendreChargement(page);
    await expect(page.locator(".joueurs").first()).toBeVisible();
    // L'image se dessine juste après l'affichage ; un toucher trop tôt
    // enverrait le texte seul.
    await expect.poll(async () => {
      await page.getByRole("button", { name: "Partager le bilan" }).click();
      return page.evaluate(() => (window.__partage && window.__partage.files || []).length);
    }).toBe(1);
    const p = await page.evaluate(async () => {
      const f = window.__partage.files[0];
      const img = await createImageBitmap(f);
      return { nom: f.name, type: f.type, largeur: img.width, hauteur: img.height, texte: window.__partage.text };
    });
    expect(p).toMatchObject({ nom: "lidfpb-bilan-des-poules.png", type: "image/png", largeur: 1080 });
    expect(p.hauteur).toBeGreaterThan(1200);
    expect(p.texte).toMatch(/^\*🏁 Bilan de la phase de poules/);
    expect(p.texte).toContain("*Série 1 · 1/4 de finale (prévision)*");
    expect(p.texte).toContain("Q1 1er P1 Alpha (éq. 1) – 4e P2 India (éq. 1)");
    expect(p.texte).toMatch(/Tout le bilan : http.*\/bilan\.html$/);
    expect(p.texte).not.toContain("Joueur");

    // Thème changé à l'écran : l'image suit, fond clair puis sombre.
    const fondImage = () => page.evaluate(async () => {
      const img = await createImageBitmap(window.__partage.files[0]);
      const t = new OffscreenCanvas(img.width, img.height).getContext("2d");
      t.drawImage(img, 0, 0);
      const [r, g, b] = t.getImageData(20, img.height - 10, 1, 1).data;
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    });
    expect(await fondImage()).toBeGreaterThan(0.8);
    await page.locator("#themeBtn").click();
    await expect.poll(async () => {
      await page.getByRole("button", { name: "Partager le bilan" }).click();
      return fondImage();
    }).toBeLessThan(0.2);
  });

  test("sans feuille de partage, le texte est copié et l'image téléchargée", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => { delete Navigator.prototype.share; });
    await page.goto("bilan.html");
    await attendreChargement(page);
    await page.waitForTimeout(500);   // le temps de dessiner l'image
    const telechargement = page.waitForEvent("download");
    await page.getByRole("button", { name: "Partager le bilan" }).click();
    expect((await telechargement).suggestedFilename()).toBe("lidfpb-bilan-des-poules.png");
    await expect(page.locator(".partage-ok")).toHaveText("Texte copié, image téléchargée");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^\*🏁 Bilan de la phase de poules/);
  });

  test("toutes les parties de poule jouées : verdict des poules et tableau définitif", async ({ page }) => {
    // Toutes jouées, dont un forfait au score non chiffré : hors des chiffres, mais affiché.
    const finies = tables.rencontres.map((r) => r.Phase === "1" && !r.score_cr ? { ...r, score_cr: "40", score_cv: "33" } : r)
      .map((r) => r.oid === "1" ? { ...r, score_cr: "F", score_cv: "40" } : r);
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data: table === "rencontres" ? finies : (tables[table] || []), lastSync: new Date().toISOString() })
      });
    });
    await page.goto("bilan.html");
    await attendreChargement(page);
    await expect(page.locator(".bilan-titre")).toHaveText("Les poules ont rendu leur verdict");
    await expect(page.locator(".bilan-hero")).toContainText("59 parties jouées, 16 équipes qualifiées");
    const resultats = page.locator("details.resultats").first();
    await resultats.locator("summary").click();
    await expect(resultats.locator(".resultat")).toHaveCount(15);
    await expect(resultats.locator(".resultat-score", { hasText: "F–40" })).toHaveCount(1);
    await expect(page.locator(".finales-card .statut")).toHaveText(["Poules terminées", "Poules terminées"]);
    await expect(page.locator(".poule-card:not(.finales-card) .statut").first()).toHaveText("Terminée");
    await expect(page.locator(".cut-line").first()).toHaveText("Qualifiés pour les quarts");
    await expect(page.locator(".mien-verdict")).toContainText(/qualifiée pour les quarts|pas de quart cette saison/);
  });

  // Spec bilan, « Messages de fin de poule » : un message WhatsApp par équipe.
  test.describe("Messages de fin de poule", () => {
    const servir = (page, rencontres, clubs = tables.clubs) => page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      const data = table === "rencontres" ? rencontres : (table === "clubs" ? clubs : (tables[table] || []));
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data, lastSync: new Date().toISOString() })
      });
    });
    // Toutes les parties de poule jouées (oid 1, Alpha – Bravo en série 1, par forfait).
    const finies = () => tables.rencontres.map((r) => r.Phase === "1" && !r.score_cr ? { ...r, score_cr: "40", score_cv: "33" } : r)
      .map((r) => r.oid === "1" ? { ...r, score_cr: "F", score_cv: "40" } : r);
    const texteDe = async (ligne) => {
      const href = await ligne.locator("a.message-btn.wa").getAttribute("href");
      return { href, texte: new URL(href).searchParams.get("text") };
    };

    test("pas avant la fin des poules de la série", async ({ page }) => {
      await page.goto("bilan.html");
      await attendreChargement(page);
      await expect(page.locator("details.messages")).toHaveCount(0);
      await expect(page.locator(".messages-attente").first())
        .toContainText("prêts quand toutes les parties de poule de la Série 1 auront un score");
    });

    test("parties, classement, sort et partie suivante de chaque équipe", async ({ page, context }) => {
      // La ligue a inscrit Alpha contre India sur le premier quart de la série 2.
      let premierQuart = true;
      const rencontres = finies().map((r) => {
        if (r.Phase !== "10" || r["Catégorie"] !== "2" || !premierQuart) return r;
        premierQuart = false;
        return { ...r, club_rec: codeClub(0), club_vis: codeClub(8) };
      });
      await servir(page, rencontres);
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto("bilan.html");
      await attendreChargement(page);

      const serie2 = page.locator(".serie-bloc").nth(1);
      const messages = serie2.locator("details.messages").first();
      await messages.locator("summary").click();
      const lignes = messages.locator(".message-eq");
      await expect(lignes).toHaveCount(6);
      // Poule de six en série 2 : quatre en quarts, l'avant-dernier en barrage, le dernier descend.
      await expect(lignes.locator(".message-sort")).toHaveText(["Quarts", "Quarts", "Quarts", "Quarts", "Barrage", "Descente"]);

      // Alpha, 1re : le message entier, dans l'ordre. Classement, résultat et
      // mot sportif, puis le quart inscrit par la ligue et le rappel : un quart
      // peut être avancé, pas les demies ni la finale. Ni récap des parties, ni lien.
      const alpha = await texteDe(lignes.first());
      expect(alpha.href).toMatch(/^https:\/\/wa\.me\/33600000100\?text=/);
      expect(alpha.texte).toMatch(new RegExp("^Bonjour Responsable,\n\n" +
        "\\*🏁 Fin des poules · Série 2 · Poule 1\\*\n\n" +
        "Classement final : \\*1er sur 6\\*\n\\d+ victoires, 0 défaite · \\d+ pts · goal average \\+\\d+\n\n" +
        "🎉 \\*Qualifiés pour les quarts de finale !\\*\n" +
        "👏 Bravo pour votre première place de la poule, félicitations à toute l'équipe\\. Bonne chance pour les quarts, allez chercher le titre !\n\n" +
        "\\*Partie suivante : 1/4 de finale\\*\ncontre India \\(éq\\. 1\\)\n(\\S+ \\d+ \\S+) à 21h\nPARIS \\(Trinquet Paris - 75016\\)\n" +
        "Responsable adverse : Responsable India \\(0600000108\\)\n\n" +
        "Rappel : le quart peut être joué avant le \\1 si un accord est trouvé avec l'adversaire\\. Les 1/2 et la finale ne sont pas déplaçables\\.$"));
      expect(alpha.texte).not.toMatch(/✅|❌|https?:\/\/(?!wa\.me)|bilan\.html/);
      expect((await texteDe(lignes.nth(1))).texte).toMatch(/🎉 \*Qualifiés pour les quarts de finale !\*\n👏 Bravo et félicitations pour la qualification ! .*bonne chance pour les quarts\.\n\n/);

      // L'avant-dernier : barrage contre un demi-finaliste de la Série 3, pas encore programmé.
      const barrage = (await texteDe(lignes.nth(4))).texte;
      expect(barrage).toContain("Classement final : *5e sur 6*");
      expect(barrage).toContain("⚠️ *Barrage pour le maintien* en Série 2, contre un demi-finaliste de la Série 3.");
      expect(barrage).toMatch(/contre un demi-finaliste de la Série 3\.\n💪 Rien n'est joué : .*Bon courage à toute l'équipe !\n\n/);
      expect(barrage).toContain("*Partie suivante : Barrage maintien*\nà la fin de la saison de la Série 3, vers juin ou septembre, date et lieu communiqués par la ligue");
      // Le dernier descend, et n'a plus de partie.
      const dernier = (await texteDe(lignes.nth(5))).texte;
      expect(dernier).toContain("📉 *Descente en Série 3* la saison prochaine.");
      expect(dernier).toContain("Plus de partie cette saison.");
      expect(dernier).toMatch(/la saison prochaine\.\n💪 Saison difficile, .*Revenez plus forts, à l'année prochaine !\n\nPlus de partie cette saison\.$/);

      // Série 1 : le dernier descend en Série 2, sans barrage ; un qualifié pas encore inscrit
      // par la ligue a son adversaire du tableau et les jours des quarts.
      const serie1 = page.locator(".serie-bloc").first().locator("details.messages").first();
      await serie1.locator("summary").click();
      const lignes1 = serie1.locator(".message-eq");
      await expect(lignes1.locator(".message-sort")).toHaveText(["Quarts", "Quarts", "Quarts", "Quarts", "Maintien", "Descente"]);
      const qualifie = (await texteDe(lignes1.first())).texte;
      expect(qualifie).toContain("Rappel : le quart peut être joué avant la date prévue si un accord est trouvé avec l'adversaire. Les 1/2 et la finale ne sont pas déplaçables.");
      expect(qualifie).toMatch(/\*Partie suivante : 1\/4 de finale\*\nQ1 contre (\S+) \(éq\. 1\), d'après le classement des poules\nentre le \S+ \d+ \S+ et le \S+ \d+ \S+\nResponsable adverse : Responsable \1 \(06000001\d\d\)$/m);
      const sixieme = (await texteDe(lignes1.nth(5))).texte;
      expect(sixieme).toContain("📉 *Descente en Série 2* la saison prochaine.");
      expect(sixieme).not.toContain("Barrage");
      expect((await texteDe(lignes1.nth(4))).texte).toContain("👍 *Maintien en Série 1* la saison prochaine.");
      const textes1 = await Promise.all([0, 1, 2, 3, 4, 5].map(async (i) => (await texteDe(lignes1.nth(i))).texte));

      // Ni nom de joueur ni numéro écrit : le numéro n'est que dans le lien.
      // Le seul numéro d'un message est celui du responsable adverse ; jamais
      // celui du destinataire, ni aucun dans le texte de la page.
      for (const t of [alpha.texte, barrage, dernier, ...textes1]) expect(t).not.toMatch(/Joueur/);
      expect(alpha.texte).not.toContain("0600000100");
      expect(barrage).not.toMatch(/0600000|Responsable adverse/);
      expect(dernier).not.toMatch(/0600000|Responsable adverse/);
      expect(await page.locator("body").innerText()).not.toMatch(/0600000|33600000/);

      // Copier : le même texte que WhatsApp.
      await lignes.first().getByRole("button", { name: "Copier" }).click();
      await expect(lignes.first().getByRole("button", { name: /Copié/ })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(alpha.texte);
    });

    test("quart déjà joué : pas de quart annoncé une seconde fois", async ({ page }) => {
      let premierQuart = true;
      const rencontres = finies().map((r) => {
        if (r.Phase !== "10" || r["Catégorie"] !== "2" || !premierQuart) return r;
        premierQuart = false;
        return { ...r, club_rec: codeClub(0), club_vis: codeClub(8), score_cr: "40", score_cv: "35" };
      });
      await servir(page, rencontres);
      await page.goto("bilan.html");
      await attendreChargement(page);
      const messages = page.locator(".serie-bloc").nth(1).locator("details.messages").first();
      await messages.locator("summary").click();
      const alpha = (await texteDe(messages.locator(".message-eq").first())).texte;
      expect(alpha).toContain("Pas d'autre partie programmée pour l'instant.");
      expect(alpha).not.toContain("Partie suivante");
      expect(alpha).not.toContain("Rappel");
    });

    test("quart joué, demie inscrite : le rappel ne parle plus du quart", async ({ page }) => {
      let premierQuart = true;
      const rencontres = finies().map((r) => {
        if (r.Phase !== "10" || r["Catégorie"] !== "2" || !premierQuart) return r;
        premierQuart = false;
        return { ...r, club_rec: codeClub(0), club_vis: codeClub(8), score_cr: "40", score_cv: "35" };
      });
      const quart = tables.rencontres.find((r) => r.Phase === "10" && r["Catégorie"] === "2");
      rencontres.push({ ...quart, oid: "9100", Phase: "11", club_rec: codeClub(0), club_vis: codeClub(1) });
      await servir(page, rencontres);
      await page.goto("bilan.html");
      await attendreChargement(page);
      const messages = page.locator(".serie-bloc").nth(1).locator("details.messages").first();
      await messages.locator("summary").click();
      const alpha = (await texteDe(messages.locator(".message-eq").first())).texte;
      expect(alpha).toContain("*Partie suivante : 1/2 finale*\ncontre Bravo (éq. 1)");
      expect(alpha).toMatch(/\n\nRappel : les 1\/2 et la finale ne sont pas déplaçables\.$/);
      expect(alpha).not.toContain("le quart peut être joué");
    });

    test("poule de sept : le 5e est maintenu, le 6e en barrage, le 7e descend", async ({ page }) => {
      // Mike rejoint la poule 1 de la série 2 et perd ses six parties.
      const mike = { "Ligue": "3", "comité": "750", "club": "013", "Nom club": "Mike", "Numéro club": "03-750-013" };
      const poule = tables.rencontres.filter((r) => r["Catégorie"] === "2" && r.Poule === "1");
      const adversaires = [...new Set(poule.map((r) => r.club_rec))];
      const reference = poule[0];
      const parties = adversaires.map((club, i) => ({
        ...reference, oid: String(9000 + i), club_rec: club, club_vis: codeClub(12), score_cr: "40", score_cv: "10"
      }));
      await servir(page, finies().concat(parties), tables.clubs.concat([mike]));
      await page.goto("bilan.html");
      await attendreChargement(page);
      const messages = page.locator(".serie-bloc").nth(1).locator("details.messages").first();
      await messages.locator("summary").click();
      const lignes = messages.locator(".message-eq");
      await expect(lignes.locator(".message-sort")).toHaveText(["Quarts", "Quarts", "Quarts", "Quarts", "Maintien", "Barrage", "Descente"]);
      await expect(lignes.last()).toContainText("Mike (éq. 1)");
      // Sans numéro de responsable : WhatsApp s'ouvre sans destinataire.
      await expect(lignes.last()).toContainText("responsable sans numéro");
      const mikeMsg = await texteDe(lignes.last());
      expect(mikeMsg.href).toMatch(/^https:\/\/wa\.me\/\?text=/);
      expect(mikeMsg.texte).toMatch(/^Bonjour,\n/);
      const maintenu = (await texteDe(lignes.nth(4))).texte;
      expect(maintenu).toContain("👍 *Maintien en Série 2* la saison prochaine.");
      expect(maintenu).toMatch(/la saison prochaine\.\n💪 Félicitations pour le maintien, objectif rempli ! .*\n\nPlus de partie cette saison\.$/);
    });
  });

  test("sans données, rien n'est affiché qu'un bandeau d'erreur", async ({ page }) => {
    await page.route("**/script.google.com/**", (route) => route.fulfill({ status: 500, body: "" }));
    page.erreurs = [];
    page.removeAllListeners("console");
    await page.goto("bilan.html");
    await expect(page.locator(".banner.error")).toContainText("Impossible d'afficher le bilan");
    await expect(page.locator("#lastSyncText")).toHaveText("échec du chargement");
    await expect(page.locator(".bilan-hero")).toHaveCount(0);
  });
});

test.describe("Suivre ses équipes depuis Mes équipes", () => {
  const ALPHA = "2|1|3750001|1";
  const suivies = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("lidfpb_mes_equipes_v1")));

  test("Suivre, passer d'une équipe suivie à l'autre, ne plus suivre", async ({ page }) => {
    await page.goto("equipe.html?equipe=" + encodeURIComponent(ALPHA));
    await attendreChargement(page);

    // Alpha n'est pas suivie : le bouton et la phrase disent ce que ça apporte.
    const suivre = page.locator(".suivre-btn");
    await expect(suivre).toHaveText("☆ Suivre");
    await expect(page.locator(".suivre-aide")).toContainText("en tête de l'accueil");
    // Charlie, déjà suivie, a sa pastille pour y revenir.
    await expect(page.locator(".mes-chip")).toHaveText(["Charlie (éq. 1) · Série 1"]);

    await suivre.click();
    await expect(suivre).toHaveText("★ Suivie");
    await expect(suivre).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".suivre-aide")).toHaveCount(0);
    expect(await suivies(page)).toEqual([EQUIPE_SUIVIE, ALPHA]);
    await expect(page.locator(".mes-chip")).toHaveCount(2);
    await expect(page.locator('.mes-chip[aria-current="true"]')).toHaveText(/^Alpha/);

    // Une pastille affiche l'autre équipe suivie, sans recharger.
    await page.locator(".mes-chip").first().click();
    await expect(page).toHaveURL(new RegExp("equipe=" + encodeURIComponent(EQUIPE_SUIVIE).replace(/\|/g, "\\|")));
    await expect(page.locator('.mes-chip[aria-current="true"]')).toHaveText(/^Charlie/);

    // Ne plus suivre Charlie : il ne reste qu'Alpha.
    await page.locator(".suivre-btn").click();
    await expect(page.locator(".suivre-btn")).toHaveText("☆ Suivre");
    expect(await suivies(page)).toEqual([ALPHA]);
  });

  test("l'accueil résume les équipes suivies et mène à leur page", async ({ page }) => {
    await page.goto("index.html");
    await attendreChargement(page);
    const bloc = page.locator(".mes-equipes");
    await expect(bloc.locator(".mes-row")).toHaveCount(1);
    await expect(bloc.locator("input")).toHaveCount(0);   // plus de choix sur l'accueil
    await expect(bloc.getByRole("link", { name: "Gérer →" })).toHaveAttribute("href", "equipe.html");
    await bloc.locator(".mes-row").click();
    await expect(page).toHaveURL(/equipe\.html\?equipe=/);
    await expect(page.locator(".suivre-btn")).toHaveText("★ Suivie");
  });

  test("sans équipe suivie, l'accueil invite à en suivre une", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("lidfpb_mes_equipes_v1", "[]"));
    await page.goto("index.html");
    await attendreChargement(page);
    const invite = page.locator("#tiles a.tile").first();
    await expect(invite).toContainText("Suivre une équipe →");
    await expect(invite).toContainText("☆ Suivre");
    await expect(invite).toHaveAttribute("href", "equipe.html");
    // L'onglet renommé tient en entier dans la barre.
    const onglet = page.locator('.tab-bar a[href="equipe.html"] span');
    await expect(onglet).toHaveText("Mes équipes");
    expect(await onglet.evaluate((e) => e.scrollWidth <= e.parentElement.clientWidth)).toBe(true);
  });
});

// Du lundi au jeudi, le bloc de la semaine s'ouvre sur les résultats : les
// parties d'ici dimanche sont derrière leur onglet.
async function ouvrirDIciDimanche(page) {
  const onglet = page.getByRole("tab", { name: /D'ici dim|Prochaines parties/ });
  if (await onglet.count()) await onglet.click();
}

test.describe("Accueil : partage des parties d'ici dimanche", () => {
  test("la feuille de partage reçoit le texte des parties", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.share = (donnees) => { window.__partage = donnees; return Promise.resolve(); };
    });
    await page.goto("index.html");
    await attendreChargement(page);
    await ouvrirDIciDimanche(page);

    await page.getByRole("button", { name: "Partager", exact: true }).click();
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
    await ouvrirDIciDimanche(page);

    await page.getByRole("button", { name: "Partager", exact: true }).click();
    // L'image, prête avant le toucher, part au téléchargement pour WhatsApp Web.
    await expect(page.locator(".partage-ok")).toHaveText(/^Texte copié/);
    const copie = await page.evaluate(() => navigator.clipboard.readText());
    expect(copie).toContain("Programme complet");
  });
});

// Les tests du bloc de la semaine lisent les équipes et les scores : sans
// compositions, aucune équipe ne porte de joueurs entre crochets.
function sansCompositions(table) {
  return table === "engagements" || table === "licencies" ? [] : (tables[table] || []);
}

test.describe("Accueil : la semaine, résultats et parties d'ici dimanche", () => {
  // Calendrier propre à ces tests, autour du lundi 2 novembre 2026 : les
  // données communes sont datées par rapport au jour où les tests tournent.
  function partie(oid, date, rec, vis, scoreRec, scoreVis) {
    return {
      oid: String(oid), "Compétition": "20270301", "Spécialité": "2", "Catégorie": "1", "Phase": "1", "Poule": "1",
      club_rec: rec, equip_rec: "1", club_vis: vis, equip_vis: "1",
      lieu_renc: "PARIS (Trinquet Paris - 75016)", date_renc: date, heure_renc: "1930", report: "", date_rep: "",
      score_cr: scoreRec, score_cv: scoreVis
    };
  }
  const ALPHA = "3750001", BRAVO = "3750002", CHARLIE = "3750003", DELTA = "3750004";
  const calendrier = [
    partie(901, "29102026", ALPHA, DELTA, "40", "30"),     // jeudi d'avant : hors fenêtre
    partie(902, "30102026", ALPHA, BRAVO, "40", "25"),     // vendredi : retenue
    partie(903, "01112026", CHARLIE, DELTA, "", ""),       // dimanche, sans score : en attente
    partie(904, "02112026", BRAVO, DELTA, "", ""),         // aujourd'hui, à venir
    partie(905, "07112026", ALPHA, CHARLIE, "", "")        // samedi suivant
  ];
  // Un report : prévue samedi 31, jouée plus tard, elle n'est pas un résultat.
  calendrier.push(Object.assign(partie(906, "31102026", BRAVO, CHARLIE, "", ""), { date_rep: "14112026" }));
  // Un forfait, publié en lettres : affiché tel quel, sans perdant.
  calendrier.push(Object.assign(partie(907, "31102026", DELTA, BRAVO, "F", "40"), { heure_renc: "1000" }));
  // Un quart dont les adversaires restent à désigner : pas un résultat.
  calendrier.push(Object.assign(partie(908, "31102026", "9998", "9998", "", ""), { Phase: "10", Poule: "" }));

  test.beforeEach(async ({ page }) => {
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      const data = table === "rencontres" ? calendrier : sansCompositions(table);
      route.fulfill({
        status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data, lastSync: "2026-11-02T08:00:00Z" })
      });
    });
  });

  test("le lundi, le bloc s'ouvre sur les résultats : scores, perdant en retrait, score attendu, mon équipe", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-02T10:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);

    const onglets = page.getByRole("tab");
    await expect(onglets).toHaveText(["Résultats du week-end", "D'ici dim. 8 nov."]);
    await expect(page.getByRole("tab", { name: "Résultats du week-end" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".pied-lien")).toHaveText("Classement →");
    await expect(page.locator(".pied-lien")).toHaveAttribute("href", "classement.html");
    await expect(page.getByRole("button", { name: "Partager", exact: true })).toBeVisible();

    const lignes = page.locator("#vue-resultats .resultat");
    await expect(lignes).toHaveCount(3);   // ni le quart à désigner, ni la partie reportée
    await expect(page.locator("#vue-ici")).toBeHidden();

    await expect(lignes.nth(0)).toContainText("ven. 30 oct.");
    await expect(lignes.nth(0).locator(".next-teams")).toHaveText("Alpha 140-25Bravo 1");
    await expect(lignes.nth(0).locator(".perdant")).toHaveText("Bravo 1");
    await expect(lignes.nth(0)).not.toHaveClass(/mine/);

    await expect(lignes.nth(1).locator(".score")).toHaveText("F-40");
    await expect(lignes.nth(1).locator(".perdant")).toHaveCount(0);
    await expect(lignes.nth(1)).not.toContainText("pas encore publié");

    await expect(lignes.nth(2)).toContainText("dim. 1 nov.");
    await expect(lignes.nth(2).locator(".score")).toHaveText("vs");
    await expect(lignes.nth(2)).toContainText("Score pas encore publié par la ligue");
    await expect(lignes.nth(2)).toHaveClass(/mine/);   // Charlie 1 est suivie
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("l'onglet « D'ici dimanche » : la partie du jour, le lieu de chaque partie, le partage", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-02T10:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);

    await page.getByRole("tab", { name: "D'ici dim. 8 nov." }).click();
    await expect(page.getByRole("tab", { name: "D'ici dim. 8 nov." })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#vue-resultats")).toBeHidden();
    await expect(page.getByRole("link", { name: "Tout le programme →" })).toHaveAttribute("href", "programme.html");
    await expect(page.getByRole("button", { name: "Partager", exact: true })).toBeVisible();

    const parties = page.locator("#vue-ici .affiche");
    await expect(parties).toHaveCount(2);
    await expect(parties.nth(0)).toContainText("Bravo 1 vs Delta 1");   // la partie du jour reste à venir
    // Chaque partie dit où elle se joue, à voir ou non.
    await expect(parties.locator(".affiche-lieu")).toHaveText(["Trinquet Paris", "Trinquet Paris"]);
    await expect(parties.nth(0).locator(".affiche-tag")).toHaveCount(0);
  });

  test("le vendredi, le bloc s'ouvre sur « D'ici dimanche », les résultats restent à un toucher", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-06T10:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);
    await expect(page.getByRole("tab", { name: "D'ici dim. 8 nov." })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#vue-ici")).toBeVisible();

    // Depuis le vendredi d'avant : le 30, le forfait, le dimanche et le lundi sans score.
    await page.getByRole("tab", { name: "Résultats du week-end" }).click();
    await expect(page.locator("#vue-resultats .resultat")).toHaveCount(4);
    await expect(page.locator("#vue-resultats")).toContainText("Alpha 140-25Bravo 1");
  });

  test("le dimanche, « D'ici dimanche » garde les parties jouées depuis vendredi, avec leur score", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.share = (d) => { window.__partage = d; return Promise.resolve(); };
    });
    await page.clock.setFixedTime(new Date("2026-11-01T18:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);
    await expect(page.getByRole("tab", { name: "D'ici dim. 1 nov." })).toHaveAttribute("aria-selected", "true");

    // Vendredi joué, samedi forfait, dimanche encore à venir ; ni le quart à
    // désigner ni la partie reportée.
    const parties = page.locator("#vue-ici .affiche");
    await expect(parties).toHaveCount(3);
    await expect(parties.nth(0)).toContainText("ven. 30 oct.");
    await expect(parties.nth(0).locator(".next-teams")).toHaveText("Alpha 140-25Bravo 1");
    await expect(parties.nth(0).locator(".perdant")).toHaveText("Bravo 1");
    await expect(parties.nth(0).locator(".affiche-lieu")).toHaveText("Trinquet Paris");
    await expect(parties.nth(1).locator(".score")).toHaveText("F-40");
    await expect(parties.nth(1).locator(".perdant")).toHaveCount(0);
    await expect(parties.nth(2).locator(".next-teams")).toHaveText("Charlie 1 vs Delta 1");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.getByRole("button", { name: "Partager", exact: true }).click();
    const texte = await page.evaluate(() => window.__partage.text);
    expect(texte).toContain("19h30 · Série 1 · Trinquet Paris · Alpha (éq. 1) 40-25 Bravo (éq. 1)");
    expect(texte).toContain("Charlie (éq. 1) vs Delta (éq. 1)");
  });

  // Un autre calendrier pour un test : la route posée en dernier l'emporte.
  async function servir(page, rencontres) {
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      route.fulfill({
        status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data: table === "rencontres" ? rencontres : sansCompositions(table), lastSync: "2026-11-02T08:00:00Z" })
      });
    });
  }

  test("en semaine, la partie du jour terminée garde son score, celle de vendredi n'y est plus", async ({ page }) => {
    await servir(page, [
      partie(902, "30102026", ALPHA, BRAVO, "40", "25"),
      partie(904, "02112026", BRAVO, DELTA, "20", "40"),
      partie(905, "07112026", ALPHA, CHARLIE, "", "")
    ]);
    await page.clock.setFixedTime(new Date("2026-11-02T22:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);
    await page.getByRole("tab", { name: "D'ici dim. 8 nov." }).click();

    const parties = page.locator("#vue-ici .affiche");
    await expect(parties).toHaveCount(2);
    await expect(parties.nth(0)).toContainText("lun. 2 nov. 19h30");
    await expect(parties.nth(0).locator(".next-teams")).toHaveText("Bravo 120-40Delta 1");
    await expect(parties.nth(0).locator(".perdant")).toHaveText("Bravo 1");
    await expect(parties.nth(1).locator(".next-teams")).toHaveText("Alpha 1 vs Charlie 1");
  });

  test("le dimanche soir, week-end fini : ses scores en tête, puis le week-end suivant", async ({ page }) => {
    await servir(page, [
      partie(902, "30102026", ALPHA, BRAVO, "40", "25"),
      // Samedi, sans heure ni score publié.
      Object.assign(partie(910, "31102026", ALPHA, CHARLIE, "", ""), { heure_renc: "" }),
      partie(903, "01112026", CHARLIE, DELTA, "40", "35"),
      partie(904, "03112026", BRAVO, DELTA, "", ""),
      partie(905, "07112026", ALPHA, CHARLIE, "", "")
    ]);
    await page.clock.setFixedTime(new Date("2026-11-01T22:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);

    // Le mardi et le week-end suivant ne sont pas cachés par les scores.
    await expect(page.getByRole("tab", { name: "D'ici dim. 8 nov." })).toHaveAttribute("aria-selected", "true");
    const parties = page.locator("#vue-ici .affiche");
    await expect(parties).toHaveCount(5);
    await expect(parties.nth(0).locator(".score")).toHaveText("40-25");
    // Pas de « 0h » pour une partie sans heure, et le score attendu à la place du lieu.
    await expect(parties.nth(1).locator(".next-when")).toHaveText("sam. 31 oct.");
    await expect(parties.nth(1).locator(".score")).toHaveText("vs");
    await expect(parties.nth(1).locator(".affiche-lieu")).toHaveText("Score pas encore publié par la ligue");
    await expect(parties.nth(2).locator(".score")).toHaveText("40-35");
    await expect(parties.nth(3)).toContainText("mar. 3 nov.");
    await expect(parties.nth(3).locator(".next-teams")).toHaveText("Bravo 1 vs Delta 1");
    await expect(page.locator("#vue-ici")).not.toContainText("Plus aucune rencontre");
  });

  test("Partager envoie l'image PNG de la vue ouverte avec son texte", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.canShare = (d) => !!(d && d.files);
      navigator.share = (d) => { window.__partage = d; return Promise.resolve(); };
    });
    await page.clock.setFixedTime(new Date("2026-11-02T10:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);

    // L'image se dessine juste après l'affichage ; un toucher trop tôt
    // enverrait le texte seul.
    async function partager() {
      await expect.poll(async () => {
        await page.getByRole("button", { name: "Partager", exact: true }).click();
        return page.evaluate(() => (window.__partage.files || []).length);
      }).toBe(1);
      return page.evaluate(async () => {
        const f = window.__partage.files[0];
        const img = await createImageBitmap(f);
        return { nom: f.name, type: f.type, largeur: img.width, hauteur: img.height, texte: window.__partage.text };
      });
    }

    const resultats = await partager();
    expect(resultats).toMatchObject({ nom: "lidfpb-resultats-du-week-end.png", type: "image/png", largeur: 1080 });
    expect(resultats.hauteur).toBeGreaterThan(400);
    expect(resultats.texte).toMatch(/^\*Pala gomme pleine · Résultats du week-end\*/);
    expect(resultats.texte).toContain("Série 1 · Alpha (éq. 1) 40-25 Bravo (éq. 1)");
    expect(resultats.texte).toContain("(score pas encore publié)");
    expect(resultats.texte).toMatch(/Classement : http.*\/classement\.html$/);

    await page.evaluate(() => { window.__partage = {}; });
    await page.getByRole("tab", { name: "D'ici dim. 8 nov." }).click();
    const ici = await partager();
    expect(ici).toMatchObject({ nom: "lidfpb-dici-dimanche.png", type: "image/png", largeur: 1080 });
    expect(ici.texte).toMatch(/^\*Pala gomme pleine · D'ici dimanche 8 nov\.\*/);
    expect(ici.texte).toMatch(/Programme complet : http.*\/programme\.html$/);
  });

  test("les deux onglets tiennent sur une ligne, de 320 à 412 px", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-02T10:00:00+01:00"));
    for (const largeur of [320, 390, 412]) {
      await page.setViewportSize({ width: largeur, height: 800 });
      await page.goto("index.html");
      await attendreChargement(page);
      const hauts = await page.getByRole("tab").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
      expect(hauts, `${largeur} px`).toHaveLength(2);
      expect(hauts[0], `${largeur} px`).toBe(hauts[1]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${largeur} px`).toBe(true);
    }
  });

  test("au clavier : un seul arrêt sur les onglets, les flèches passent de l'un à l'autre", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-02T10:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);
    const resultats = page.getByRole("tab", { name: "Résultats du week-end" });
    const ici = page.getByRole("tab", { name: "D'ici dim. 8 nov." });
    await expect(resultats).toHaveAttribute("tabindex", "0");
    await expect(ici).toHaveAttribute("tabindex", "-1");
    await resultats.focus();
    await page.keyboard.press("ArrowRight");
    await expect(ici).toBeFocused();
    await expect(ici).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#vue-ici")).toBeVisible();
    await page.keyboard.press("Home");
    await expect(resultats).toBeFocused();
    await expect(resultats).toHaveAttribute("aria-selected", "true");
  });

  test("l'onglet choisi tient quand l'accueil se redessine", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-02T10:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);
    await page.getByRole("tab", { name: "D'ici dim. 8 nov." }).click();
    await page.getByRole("button", { name: "Rafraîchir" }).click();
    await attendreChargement(page);
    await expect(page.getByRole("tab", { name: "D'ici dim. 8 nov." })).toHaveAttribute("aria-selected", "true");
  });

  test("sur ordinateur : texte copié, image téléchargée, message effacé au changement d'onglet", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => { delete Navigator.prototype.share; });
    await page.setViewportSize({ width: 320, height: 800 });
    await page.clock.setFixedTime(new Date("2026-11-02T10:00:00+01:00"));
    const telechargements = [];
    page.on("download", (d) => telechargements.push(d.suggestedFilename()));
    await page.goto("index.html");
    await attendreChargement(page);

    // Chaque toucher efface le message, la copie le remet ensuite : on attend
    // qu'il revienne avant de le lire. Tant que l'image n'est pas prête, il dit
    // « Texte copié, à coller » et l'on touche de nouveau.
    const info = page.locator(".partage-ok");
    await expect.poll(async () => {
      await page.getByRole("button", { name: "Partager", exact: true }).click();
      await expect(info).not.toHaveText("");
      return info.textContent();
    }).toBe("Texte copié, image téléchargée");
    await expect.poll(() => telechargements).toContain("lidfpb-resultats-du-week-end.png");
    // Le pied, lien, message et bouton, ne déborde pas à 320 px.
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.getByRole("tab", { name: "D'ici dim. 8 nov." }).click();
    await expect(info).toHaveText("");
  });

  test("sans résultat depuis vendredi, pas d'onglets", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-23T10:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);
    await expect(page.getByRole("tab")).toHaveCount(0);
    await expect(page.locator("#tiles .tile-title")).toHaveText(["Mes équipes", "Prochaines parties", "Championnats"]);
    await expect(page.locator("#vue-ici")).toContainText("Plus aucune rencontre à venir");
  });
});

test.describe("Accueil : alerte des parties en double", () => {
  // Autour du jeudi 5 novembre 2026. Trois parties le dimanche 8 à 21h au
  // Trinquet Paris, sous trois libellés du même lieu : en double. Les autres
  // ne le sont pas : autre heure, autre lieu, ou déjà passées.
  function partie(oid, date, heure, lieu, rec, vis) {
    return {
      oid: String(oid), "Compétition": "20270301", "Spécialité": "2", "Catégorie": "1", "Phase": "1", "Poule": "1",
      club_rec: rec, equip_rec: "1", club_vis: vis, equip_vis: "1",
      lieu_renc: lieu, date_renc: date, heure_renc: heure, report: "", date_rep: "", score_cr: "", score_cv: ""
    };
  }
  const PARIS = "PARIS (Trinquet Paris - 75016)", PARIS_BIS = "PARIS (Trinquet de Paris - 75016)";
  const CAVALERIE = "PARIS (Trinquet de la Cavalerie - 75015)";
  const ALPHA = "3750001", BRAVO = "3750002", CHARLIE = "3750003", DELTA = "3750004", ECHO = "3750005", FOXTROT = "3750006";
  const GOLF = "3750007", HOTEL = "3750008";
  const calendrier = [
    partie(951, "08112026", "2100", PARIS, ALPHA, BRAVO),
    partie(952, "08112026", "2100", PARIS_BIS, CHARLIE, DELTA),
    partie(953, "08112026", "2000", PARIS, ECHO, FOXTROT),       // l'heure d'avant
    partie(957, "08112026", "2100", "PARIS (Trinquet de Paris - 750", GOLF, HOTEL),   // libellé tronqué, même lieu
    partie(954, "08112026", "2100", CAVALERIE, ECHO, ALPHA),     // ailleurs
    partie(955, "01112026", "1500", PARIS, BRAVO, DELTA),        // passées
    partie(956, "01112026", "1500", PARIS, FOXTROT, CHARLIE)
  ];

  test("deux parties à la même heure au même lieu s'affichent en alerte", async ({ page }) => {
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      route.fulfill({
        status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data: table === "rencontres" ? calendrier : (tables[table] || []), lastSync: "2026-11-05T08:00:00Z" })
      });
    });
    await page.clock.setFixedTime(new Date("2026-11-05T10:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);

    const alerte = page.locator("#banner-slot .banner.doublons");
    await expect(alerte).toHaveCount(1);
    await expect(alerte.locator("strong")).toHaveText("Trois parties au même endroit à la même heure");
    await expect(alerte.locator("li")).toHaveCount(1);
    await expect(alerte.locator("li")).toHaveText("Dim. 8 nov. · 21h · Trinquet Paris : Alpha 1 vs Bravo 1, Charlie 1 vs Delta 1 et Golf 1 vs Hotel 1");
    await expect(alerte).toContainText("à signaler à la ligue");
    // L'alerte vient avant les blocs, qui restent tous là.
    await expect(page.locator("#tiles > .colonne")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("sans partie en double, pas d'alerte", async ({ page }) => {
    await page.goto("index.html");
    await attendreChargement(page);
    await expect(page.locator("#tiles > .colonne")).toHaveCount(3);
    await expect(page.locator(".banner.doublons")).toHaveCount(0);
  });
});

test.describe("Joueurs des équipes : accueil, Parties et Classement", () => {
  const NOMS = /^ \[Ane Joueur\d+, Bixente Joueur\d+\]$/;

  test("accueil : les joueurs entre crochets après chaque équipe, jamais dans le partage", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.canShare = (d) => !!(d && d.files);
      navigator.share = (d) => { window.__partage = d; return Promise.resolve(); };
    });
    // L'image se dessine juste après l'affichage : on touche jusqu'à l'avoir.
    async function partager() {
      await page.evaluate(() => { window.__partage = {}; });
      await expect.poll(async () => {
        await page.getByRole("button", { name: "Partager", exact: true }).click();
        return page.evaluate(() => (window.__partage.files || []).length);
      }).toBe(1);
      return page.evaluate(async () => ({
        hauteur: (await createImageBitmap(window.__partage.files[0])).height,
        texte: window.__partage.text
      }));
    }
    await page.goto("index.html");
    await attendreChargement(page);
    await ouvrirDIciDimanche(page);

    const equipes = page.locator("#vue-ici .next-teams").first();
    await expect(equipes).toHaveText(/^\S+ 1 \[Ane Joueur\d+, Bixente Joueur\d+\] vs \S+ 1 \[Ane Joueur\d+, Bixente Joueur\d+\]$/);
    await expect(equipes.locator(".joueurs")).toHaveText([NOMS, NOMS]);
    // Plus de réglage : ni bouton, ni clé sur l'appareil.
    await expect(page.getByRole("button", { name: "Joueurs", exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("lidfpb_joueurs_v1"))).toBeNull();
    // Les noms passent à la ligne, sans déborder ni être coupés.
    expect(await equipes.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    const avecNoms = await partager();
    expect(avecNoms.texte).toContain(" vs ");
    expect(avecNoms.texte).not.toContain("Joueur1");

    // Sans compositions, le partage est le même : texte identique, et pas une
    // ligne de plus dans l'image.
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      route.fulfill({
        status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data: sansCompositions(table), lastSync: new Date().toISOString() })
      });
    });
    await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("lidfpb_api_v1:")).forEach((k) => localStorage.removeItem(k)));
    await page.reload();
    await attendreChargement(page);
    await ouvrirDIciDimanche(page);
    await expect(page.locator(".next-teams .joueurs")).toHaveCount(0);
    const sansNoms = await partager();
    expect(sansNoms.texte).toBe(avecNoms.texte);
    expect(sansNoms.hauteur).toBe(avecNoms.hauteur);
  });

  test("accueil : une partie jouée met le score entre les deux équipes et leurs joueurs", async ({ page }) => {
    const partie = (oid, date, rec, vis, a, b) => ({
      oid: String(oid), "Compétition": "20270301", "Spécialité": "2", "Catégorie": "1", "Phase": "1", "Poule": "1",
      club_rec: rec, equip_rec: "1", club_vis: vis, equip_vis: "1",
      lieu_renc: "PARIS (Trinquet Paris - 75016)", date_renc: date, heure_renc: "1930", report: "", date_rep: "",
      score_cr: a, score_cv: b
    });
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      const data = table === "rencontres"
        ? [partie(1, "30102026", codeClub(0), codeClub(1), "40", "25"), partie(2, "01112026", codeClub(2), codeClub(3), "", "")]
        : (tables[table] || []);
      route.fulfill({
        status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data, lastSync: "2026-11-01T08:00:00Z" })
      });
    });
    await page.clock.setFixedTime(new Date("2026-11-01T18:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);

    const parties = page.locator("#vue-ici .next-teams");
    await expect(parties.nth(0)).toHaveText("Alpha 1 [Ane Joueur100001, Bixente Joueur100002]40-25Bravo 1 [Ane Joueur100003, Bixente Joueur100004]");
    await expect(parties.nth(0).locator(".perdant")).toHaveText("Bravo 1");
    await expect(parties.nth(1)).toHaveText("Charlie 1 [Ane Joueur100005, Bixente Joueur100006] vs Delta 1 [Ane Joueur100007, Bixente Joueur100008]");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("Parties : les joueurs entre crochets, rien pour un adversaire à désigner", async ({ page }) => {
    // Un barrage dont l'un des adversaires reste à désigner.
    const barrage = {
      oid: "990", "Compétition": "20270301", "Spécialité": "2", "Catégorie": "1", "Phase": "2", "Poule": "",
      club_rec: codeClub(0), equip_rec: "1", club_vis: "9998", equip_vis: "1",
      lieu_renc: "PARIS (Trinquet Paris - 75016)", date_renc: "01012026", heure_renc: "2000", report: "", date_rep: "",
      score_cr: "", score_cv: ""
    };
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      const data = table === "rencontres" ? [...tables.rencontres, barrage] : (tables[table] || []);
      route.fulfill({
        status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data, lastSync: new Date().toISOString() })
      });
    });
    await page.goto("programme.html");
    await attendreChargement(page);

    await expect(page.getByRole("button", { name: "Joueurs des équipes" })).toHaveCount(0);
    const equipes = page.locator(".match-item").filter({ hasNotText: "Barrage" }).first().locator(".match-row-teams");
    await expect(equipes).toHaveText(/^\S+ \(éq\. 1\) \[Ane Joueur\d+, Bixente Joueur\d+\] vs \S+ \(éq\. 1\) \[Ane Joueur\d+, Bixente Joueur\d+\]$/);
    await expect(equipes.locator(".joueurs")).toHaveText([NOMS, NOMS]);
    // Alpha garde ses joueurs, l'équipe à désigner n'en a pas.
    const ligneBarrage = page.locator(".match-item").filter({ hasText: "Barrage" }).locator(".match-row-teams");
    await expect(ligneBarrage).toHaveCount(1);
    await expect(ligneBarrage.locator(".joueurs")).toHaveText(["[Ane Joueur100001, Bixente Joueur100002]"]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("Classement : les joueurs au toucher de la ligne de chaque équipe", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await expect(page.getByRole("button", { name: "Joueurs des équipes" })).toHaveCount(0);
    const alpha = page.locator(".rank-item").filter({ hasText: "Alpha (éq. 1)" }).first();
    await expect(alpha.locator(".rank-joueurs")).toBeHidden();
    await alpha.locator(".rank-row").click();
    await expect(alpha.locator(".rank-joueurs")).toHaveText("Ane Joueur100001, Bixente Joueur100002");
  });

  test("une équipe sans composition déclarée le dit sur le Classement, sans crochets ailleurs", async ({ page }) => {
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      const data = table === "engagements"
        ? tables.engagements.filter((e) => e["Numéro club"] !== "03-750-001")   // Alpha
        : (tables[table] || []);
      route.fulfill({
        status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data, lastSync: new Date().toISOString() })
      });
    });

    await page.goto("classement.html");
    await attendreChargement(page);
    const ligne = (nom) => page.locator(".rank-item").filter({ hasText: nom }).first().locator(".rank-joueurs");
    await page.locator(".rank-row").filter({ hasText: "Alpha (éq. 1)" }).first().click();
    await page.locator(".rank-row").filter({ hasText: "Bravo (éq. 1)" }).first().click();
    await expect(ligne("Alpha (éq. 1)")).toHaveText("Composition non déclarée à la ligue");
    await expect(ligne("Alpha (éq. 1)")).toHaveClass(/inconnus/);
    await expect(ligne("Bravo (éq. 1)")).toHaveText("Ane Joueur100003, Bixente Joueur100004");

    await page.goto("programme.html");
    await attendreChargement(page);
    const partieAlpha = page.locator(".match-row-teams").filter({ hasText: /^Alpha \(éq\. 1\) vs / }).first();
    await expect(partieAlpha.locator(".joueurs")).toHaveCount(1);   // l'adversaire seul
  });
});

test.describe("Mes équipes : la prochaine partie dans l'agenda", () => {
  // Prochaine partie de Charlie 1 dans les données fictives : il reçoit
  // Foxtrot 1 dans quatre jours, à 19h30, au Trinquet Paris.
  function jourIcs(decalageJours) {
    const d = new Date();
    d.setDate(d.getDate() + decalageJours);
    return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
  }

  async function telechargerAgenda(page) {
    await page.goto("equipe.html?equipe=" + encodeURIComponent(EQUIPE_SUIVIE));
    await attendreChargement(page);
    const requetes = [];
    page.on("request", (r) => { if (/^https?:/.test(r.url())) requetes.push(r.url()); });
    const [fichier] = await Promise.all([
      page.waitForEvent("download"),
      page.locator(".prochaine").getByRole("button", { name: "Ajouter à mon agenda" }).click()
    ]);
    expect(fichier.suggestedFilename()).toMatch(/^partie-\d{4}-\d{2}-\d{2}\.ics$/);
    const texte = await readFile(await fichier.path(), "utf-8");
    expect(requetes, "appels réseau au toucher").toEqual([]);
    return texte;
  }

  test("un événement à l'heure de Paris, avec lieu et rappel la veille", async ({ page }) => {
    const ics = await telechargerAgenda(page);
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(ics).toContain("BEGIN:VTIMEZONE\r\nTZID:Europe/Paris\r\n");
    expect(ics).toContain("SUMMARY:Charlie 1 – Foxtrot 1 · Série 1\r\n");
    expect(ics).toContain("DTSTART;TZID=Europe/Paris:" + jourIcs(4) + "T193000\r\n");
    expect(ics).toContain("DTEND;TZID=Europe/Paris:" + jourIcs(4) + "T210000\r\n");
    expect(ics).toContain("LOCATION:PARIS (Trinquet Paris - 75016)\r\n");
    expect(ics).toMatch(/\r\nUID:partie-\d+@lidfpb\r\n/);
    expect(ics).toMatch(/\r\nSEQUENCE:\d+\r\n/);
    expect(ics).toContain("TRIGGER:-P1D\r\n");
    // Lignes de 75 octets au plus, une fois les replis défaits l'adresse de
    // la page de l'équipe est entière dans la description.
    for (const ligne of ics.split("\r\n")) expect(Buffer.byteLength(ligne)).toBeLessThanOrEqual(75);
    const deplie = ics.replace(/\r\n /g, "");
    expect(deplie).toContain("DESCRIPTION:Série 1 · Poule 1\\nhttp://127.0.0.1:8123/equipe.html?equipe=" + encodeURIComponent(EQUIPE_SUIVIE) + "\r\n");
    // Aucune donnée personnelle : ni joueur ni responsable des données fictives.
    for (const l of tables.licencies) {
      expect(deplie).not.toContain(l.nom);
      expect(deplie).not.toMatch(new RegExp("\\b" + l.prenom + "\\b"));
    }
    for (const e of tables.engagements) {
      expect(deplie).not.toContain(e["Responsable"]);
      expect(deplie.replace(/\D/g, "")).not.toContain(e["Tél1. Resp."].slice(1));
    }
  });

  test("sans partie à venir, pas de bouton d'agenda", async ({ page }) => {
    const jouees = tables.rencontres.filter((r) => r.club_rec !== "3750003" && r.club_vis !== "3750003" || r.score_cr !== "");
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data: table === "rencontres" ? jouees : tables[table] || [], lastSync: new Date().toISOString() })
      });
    });
    await page.goto("equipe.html?equipe=" + encodeURIComponent(EQUIPE_SUIVIE));
    await attendreChargement(page);
    await expect(page.getByText("plus de partie programmée")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ajouter à mon agenda" })).toHaveCount(0);
  });

  test("une partie reportée tombe au jour du report", async ({ page }) => {
    const reportee = structuredClone(tables.rencontres);
    const ligne = reportee.find((r) => r["Catégorie"] === "1" && r.club_rec === "3750003" && r.club_vis === "3750006");
    ligne.date_rep = jourIcs(6).slice(6, 8) + jourIcs(6).slice(4, 6) + jourIcs(6).slice(0, 4);
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data: table === "rencontres" ? reportee : tables[table] || [], lastSync: new Date().toISOString() })
      });
    });
    const ics = await telechargerAgenda(page);
    expect(ics).toContain("SUMMARY:Charlie 1 – Foxtrot 1 · Série 1\r\n");
    expect(ics).toContain("DTSTART;TZID=Europe/Paris:" + jourIcs(6) + "T193000\r\n");
  });
});

test.describe("Mes équipes : prévenir l'équipe de ses parties à jouer", () => {
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


// Thème sombre : chaque page suit le réglage du téléphone (spec `apparence`).
// Les contrôles portent sur ce que voit le visiteur : fond sombre, textes
// lisibles (4,5:1, 3:1 pour les grands titres), aucun bloc resté blanc.
async function auditSombre(page, exceptionsBlanc = []) {
  return page.evaluate((exceptions) => {
    // Chromium rend rgb()/rgba(), et color(srgb …) en 0..1 pour un color-mix().
    function rgba(c) {
      const srgb = c.match(/color\(srgb ([^)]+)\)/);
      if (srgb) {
        const v = srgb[1].split(/[\s/]+/).filter(Boolean).map(Number);
        return { r: v[0] * 255, g: v[1] * 255, b: v[2] * 255, a: v.length > 3 ? v[3] : 1 };
      }
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 };
    }
    function luminance(c) {
      const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    }
    function contraste(a, b) {
      const la = luminance(a), lb = luminance(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    }
    // Fond réellement derrière un élément : le premier ancêtre au fond opaque
    // (ou presque), faute de mieux le fond de la page.
    function fondDe(el) {
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        const c = rgba(getComputedStyle(e).backgroundColor);
        if (c && c.a >= 0.5) return c;
      }
      return rgba(getComputedStyle(document.documentElement).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    }
    function visible(el) {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        const s = getComputedStyle(e);
        if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
      }
      return true;
    }
    function nom(el) {
      return el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") +
        (el.classList.length ? "." + [...el.classList].join(".") : "") +
        " « " + (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30) + " »";
    }
    const fond = luminance(fondDe(document.body));
    const contrastesFaibles = [];
    const fondsBlancs = [];
    for (const el of document.body.querySelectorAll("*")) {
      if (!visible(el) || el.closest("svg")) continue;
      const s = getComputedStyle(el);
      const bg = rgba(s.backgroundColor);
      if (bg && bg.a >= 0.5 && luminance(bg) > 0.75 && !exceptions.some((sel) => el.matches(sel))) fondsBlancs.push(nom(el));
      const texte = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!texte || el.matches(":disabled, [aria-disabled=true]") || el.closest(":disabled")) continue;
      const fg = rgba(s.color);
      // Texte transparent : c'est un dégradé découpé dans le texte, à juger sur capture.
      if (!fg || fg.a === 0) continue;
      const taille = parseFloat(s.fontSize), gras = Number(s.fontWeight) >= 700;
      const seuil = taille >= 24 || (gras && taille >= 18.66) ? 3 : 4.5;
      const c = contraste(fg, fondDe(el));
      if (c < seuil) contrastesFaibles.push(nom(el) + " : " + c.toFixed(2));
    }
    return { fond, contrastesFaibles, fondsBlancs };
  }, exceptionsBlanc);
}

test.describe("Thème choisi sur le site", () => {
  const PAGES_THEME = ["index", "equipe", "programme", "classement", "creneaux", "report", "compteur", "bilan", "decouvrir", "404"];
  const fond = (page) => page.evaluate(() => {
    const [r, g, b] = getComputedStyle(document.body).backgroundColor.match(/\d+/g).map(Number);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  });
  const couleurBarre = (page) => page.evaluate(() =>
    [...document.querySelectorAll('meta[name="theme-color"]')].find((m) => matchMedia(m.media).matches).content);

  test("le même script de thème dans chaque page", async () => {
    const scripts = [];
    for (const f of PAGES_THEME) {
      const html = await readFile(new URL(`../${f}.html`, import.meta.url), "utf8");
      const m = html.match(/<script>\n  \/\/ Thème clair ou sombre[\s\S]*?<\/script>/);
      expect(m, `${f}.html : script de thème`).not.toBeNull();
      scripts.push(m[0]);
    }
    scripts.forEach((s) => expect(s).toBe(scripts[0]));
  });

  test("téléphone en clair : la lune passe en sombre, gardé d'une page à l'autre, le soleil rend le téléphone", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("index.html");
    await attendreChargement(page);
    const bouton = page.locator(".header-actions #themeBtn");
    await expect(bouton).toHaveAccessibleName("Passer en thème sombre");
    // À côté de Rafraîchir.
    expect(await page.locator(".header-actions > *").evaluateAll((els) => els.map((e) => e.id || e.className)))
      .toEqual(["refreshBtn", "themeBtn", "icon-btn calc"]);
    expect(await fond(page)).toBeGreaterThan(0.8);

    await bouton.click();
    await expect(bouton).toHaveAccessibleName("Passer en thème clair");
    expect(await fond(page)).toBeLessThan(0.1);
    expect(await couleurBarre(page)).toBe("#1f1f1f");
    expect(await page.evaluate(() => localStorage.getItem("lidfpb_theme_v1"))).toBe("sombre");

    // Les autres pages s'ouvrent en sombre, compteur compris, même sans bouton.
    for (const url of ["programme.html", "compteur.html", "decouvrir.html"]) {
      await page.goto(url);
      expect(await fond(page), url).toBeLessThan(0.1);
    }
    await page.goto("classement.html");
    await attendreChargement(page);
    await page.locator("#themeBtn").click();
    expect(await fond(page)).toBeGreaterThan(0.8);
    expect(await couleurBarre(page)).toBe("#ffffff");
    // Revenu au thème du téléphone : plus de choix gardé, le site le suit de nouveau.
    expect(await page.evaluate(() => localStorage.getItem("lidfpb_theme_v1"))).toBeNull();
    await page.emulateMedia({ colorScheme: "dark" });
    expect(await fond(page)).toBeLessThan(0.1);
    await expect(page.locator("#themeBtn")).toHaveAccessibleName("Passer en thème clair");
  });

  test("un choix fait dans un autre onglet s'applique aux pages déjà ouvertes", async ({ page, context }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("index.html");
    await attendreChargement(page);
    const autre = await context.newPage();
    await autre.emulateMedia({ colorScheme: "light" });
    await autre.goto("compteur.html");
    await page.locator("#themeBtn").click();
    await expect.poll(() => fond(autre)).toBeLessThan(0.1);
    await page.locator("#themeBtn").click();
    await expect.poll(() => fond(autre)).toBeGreaterThan(0.8);
    await autre.close();
  });

  test("téléphone en sombre, clair choisi : la page s'ouvre en clair, la barre du navigateur aussi", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.addInitScript(() => localStorage.setItem("lidfpb_theme_v1", "clair"));
    await page.goto("creneaux.html");
    await attendreChargement(page);
    expect(await fond(page)).toBeGreaterThan(0.8);
    expect(await couleurBarre(page)).toBe("#ffffff");
    await expect(page.locator("#themeBtn")).toHaveAccessibleName("Passer en thème sombre");
  });
});

test.describe("Thème sombre", () => {
  test.use({ colorScheme: "dark" });

  // Comme les autres constantes dupliquées : une variable sombre porte la même
  // valeur partout où elle est écrite, dans un même groupe de pages.
  async function variablesSombres(fichiers) {
    const valeurs = {};
    const noter = (bloc, ou) => {
      for (const [, nom, valeur] of bloc.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
        if (nom.startsWith("--fs-")) continue;
        ((valeurs[nom] ||= {})[valeur] ||= []).push(ou);
      }
    };
    for (const f of fichiers) {
      const html = await readFile(new URL(`../${f}.html`, import.meta.url), "utf8");
      const bloc = html.match(/@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{([^}]*)\}/);
      expect(bloc, `${f}.html : bloc sombre`).not.toBeNull();
      noter(bloc[1], f);
      // Le thème sombre choisi sur le site reprend le bloc du téléphone, à l'identique.
      const choisi = html.match(/\n  :root\[data-theme="dark"\] \{([^}]*)\}/);
      expect(choisi, `${f}.html : bloc sombre choisi`).not.toBeNull();
      const valeurs = (b) => [...b.matchAll(/(--[\w-]+|color-scheme):\s*([^;]+);/g)].map((m) => m[1] + ":" + m[2]);
      expect(valeurs(choisi[1]), `${f}.html : sombre choisi = sombre du téléphone`).toEqual(valeurs(bloc[1]));
      // Le plein écran sombre du compteur reprend la palette sombre.
      const fs = html.match(/\n  \.fs\.sombre \{([^}]*)\}/);
      if (fs) noter(fs[1], f + " (plein écran sombre)");
    }
    return Object.entries(valeurs).filter(([, v]) => Object.keys(v).length > 1);
  }

  test("même palette sombre dans les pages de l'application, et entre Découvrir et la 404", async () => {
    expect(await variablesSombres(["index", "equipe", "programme", "classement", "creneaux", "report", "compteur", "bilan"]),
      "variables sombres aux valeurs différentes selon la page").toEqual([]);
    expect(await variablesSombres(["decouvrir", "404"]),
      "variables sombres aux valeurs différentes entre Découvrir et la 404").toEqual([]);
  });

  test("le réglage du téléphone change, la page suit sans être rechargée", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("index.html");
    await attendreChargement(page);
    const couleurBarre = () => page.evaluate(() =>
      [...document.querySelectorAll('meta[name="theme-color"]')].find((m) => matchMedia(m.media).matches).content);
    expect((await auditSombre(page)).fond).toBeGreaterThan(0.8);
    expect(await couleurBarre()).toBe("#ffffff");
    await page.evaluate(() => { window.__pasRecharge = true; });
    await page.emulateMedia({ colorScheme: "dark" });
    expect((await auditSombre(page)).fond).toBeLessThan(0.1);
    expect(await couleurBarre()).toBe("#1f1f1f");
    expect(await page.evaluate(() => window.__pasRecharge)).toBe(true);
  });

  const PAGES_SOMBRES = [
    ...PAGES.map((p) => ({ ...p, api: true })),
    { nom: "Compteur", url: "compteur.html", contenu: "#setup", blanc: [".swatch-blanc"] },
    // Les deux traits du bouton menu sont dessinés dans la couleur du texte.
    // Ses sections n'apparaissent qu'au défilement : on la parcourt avant l'audit.
    { nom: "Découvrir", url: "decouvrir.html", contenu: "main", blanc: [".menu-btn span"], defiler: true },
    { nom: "Page 404", url: "404.html", contenu: "h1", enLigne: true }
  ];

  for (const p of PAGES_SOMBRES) {
    test(`${p.nom} en sombre : fond sombre, textes lisibles, aucun bloc blanc`, async ({ page }) => {
      // La 404 vise les fichiers par leur chemin en ligne, sous /trinquet-paris-creneaux/.
      if (p.enLigne) await page.route("**/trinquet-paris-creneaux/**", (route) =>
        route.continue({ url: route.request().url().replace("/trinquet-paris-creneaux/", "/") }));
      await page.goto(p.url);
      if (p.api) await attendreChargement(page);
      await expect(page.locator(p.contenu).first()).toBeVisible();
      if (p.defiler) {
        const hauteur = await page.evaluate(() => document.body.scrollHeight);
        for (let y = 0; y < hauteur; y += 400) await page.mouse.wheel(0, 400);
        await page.waitForTimeout(1200);
      }
      const audit = await auditSombre(page, p.blanc);
      expect(audit.fond, "luminance du fond de la page").toBeLessThan(0.1);
      expect(audit.contrastesFaibles, "textes sous le contraste minimal").toEqual([]);
      expect(audit.fondsBlancs, "blocs restés blancs").toEqual([]);
    });
  }

  test("Compteur en sombre : couleurs d'équipe éclaircies sur la page, et qui suivent le téléphone", async ({ page }) => {
    await page.goto("compteur.html");
    // Équipe 2 en vert par défaut : vert clair sur la page sombre.
    const equipe2 = page.locator("main #scoreboard .score-team").nth(1);
    await expect(equipe2).toHaveCSS("color", "rgb(47, 209, 122)");
    await page.emulateMedia({ colorScheme: "light" });
    await expect(equipe2).toHaveCSS("color", "rgb(0, 113, 58)");
  });

  test("Compteur, téléphone en sombre : le plein écran laissé en clair reste clair", async ({ page }) => {
    await page.goto("compteur.html");
    const couleurBarre = () => page.evaluate(() =>
      [...document.querySelectorAll('meta[name="theme-color"]')].find((m) => matchMedia(m.media).matches).content);
    await page.getByRole("button", { name: "Plein écran" }).click();
    const fs = page.locator("#fs");
    await expect(fs).toHaveClass(/sombre/);
    expect(await couleurBarre()).toBe("#000000");
    await fs.getByRole("button", { name: "Passer en thème clair" }).click();
    await expect(fs).not.toHaveClass(/sombre/);
    expect(await couleurBarre()).toBe("#f4f5f7");
    // Boutons et scores du plein écran clair : sur fond clair, couleurs claires.
    await expect(fs).toHaveCSS("background-color", "rgb(244, 245, 247)");
    await expect(fs.locator(".score-btn").first()).toHaveCSS("background-color", "rgba(206, 17, 38, 0.08)");
    await expect(fs.locator(".score-team").nth(1)).toHaveCSS("color", "rgb(0, 113, 58)");
    await fs.getByRole("button", { name: "Quitter" }).click();
    expect(await couleurBarre()).toBe("#1f1f1f");
  });

  test("Compteur, téléphone en clair : le plein écran mis en sombre prend la palette sombre", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("compteur.html");
    await page.getByRole("button", { name: "Plein écran" }).click();
    const fs = page.locator("#fs");
    await fs.getByRole("button", { name: "Passer en thème sombre" }).click();
    await expect(fs).toHaveClass(/sombre/);
    const palette = await fs.evaluate((e) => ["--card-bg", "--accent", "--warn-bg", "--danger"]
      .map((v) => getComputedStyle(e).getPropertyValue(v).trim()));
    expect(palette).toEqual(["#1f1f1f", "#8ba6ff", "#2e2610", "#ff8a80"]);
    // La page derrière reste claire.
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(244, 245, 247)");
  });

  test("Découvrir en sombre : menu plein écran ouvert", async ({ page }) => {
    await page.goto("decouvrir.html");
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await expect(page.locator("#menu")).toBeVisible();
    await page.waitForTimeout(600);
    const audit = await auditSombre(page, [".menu-btn span"]);
    expect(audit.contrastesFaibles, "textes sous le contraste minimal").toEqual([]);
    expect(audit.fondsBlancs, "blocs restés blancs").toEqual([]);
  });

  test("Classement en sombre : simulateur ouvert, résultat choisi, bandeau de simulation", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    const sim = page.locator(".sim-card").first();
    await sim.locator(".sim-toggle").click();
    await sim.locator(".sim-match").first().locator(".sim-pick").first().click();
    await expect(page.locator("#sim-slot")).toContainText("Simulation en cours");
    const audit = await auditSombre(page);
    expect(audit.contrastesFaibles, "textes sous le contraste minimal").toEqual([]);
    expect(audit.fondsBlancs, "blocs restés blancs").toEqual([]);
  });
});
