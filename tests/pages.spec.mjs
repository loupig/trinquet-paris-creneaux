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
    // La carte d'avis de l'accueil a ses propres scénarios : déjà vue ailleurs.
    localStorage.setItem("lidfpb_avis_vu_v1", "1");
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
  { nom: "Équipes", url: "equipe.html?equipe=" + encodeURIComponent(EQUIPE_SUIVIE), contenu: "#results" },
  { nom: "Parties", url: "programme.html", contenu: "#results" },
  { nom: "Classement", url: "classement.html", contenu: "#results" },
  { nom: "Créneaux", url: "creneaux.html", contenu: "#results" },
  { nom: "Report", url: "report.html?oid=" + oidAVenir, contenu: "#targetCard" },
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
      expect(lignes).toEqual(["Accueil : 1", "Équipes : 1", "Parties : 1", "Classement : 1", "Créneaux : 1"]);
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
    // Sur Équipes, le lien donne le focus au contenu sans passer par l'adresse,
    // pour ne pas ajouter d'étape à l'historique (spec apparence).
    if (p.nom === "Équipes") await expect(page.locator("#contenu")).toBeFocused();
    else await expect(page).toHaveURL(/#contenu$/);
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

  test("fin de partie : le résultat part avec l'affiche du graphe en PNG", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => {
      navigator.canShare = (d) => !!(d && d.files && d.files.every((f) => f.type === "image/png"));
      navigator.share = (d) => { window.__partage = d; return Promise.resolve(); };
    });
    await page.goto("compteur.html");
    await page.locator(".team-name").nth(0).fill("Bera");
    await page.locator(".team-name").nth(1).fill("Ahetze");
    await page.getByRole("button", { name: "30 points" }).click();
    const bera = page.locator(".score-btn").nth(0);
    const ahetze = page.locator(".score-btn").nth(1);
    for (let i = 0; i < 29; i++) { await bera.click(); await ahetze.click(); }

    // En cours de partie, « Partager le score » reste le message seul.
    await page.getByRole("button", { name: "Partager le score" }).click();
    expect(await page.evaluate(() => window.__partage.files)).toBeUndefined();

    await bera.click();                                   // 30-29
    await page.getByRole("button", { name: "Partager le résultat" }).click();
    const partage = await page.evaluate(async () => {
      const d = window.__partage;
      const f = d.files && d.files[0];
      const image = f && await createImageBitmap(f);
      return { texte: d.text, nom: f && f.name, type: f && f.type, l: image && image.width, h: image && image.height };
    });
    expect(partage.type).toBe("image/png");
    expect(partage.nom).toBe("resultat-trinquet.png");
    expect([partage.l, partage.h]).toEqual([1080, 1350]);   // portrait 4:5
    expect(partage.texte).toMatch(/^\*Bera 30 – 29 Ahetze\*/);
    // WhatsApp sur iPhone peut ne garder que l'image : le message est copié aussi.
    await expect(page.locator("#partageInfo")).toHaveText("Message copié aussi, à coller si besoin");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(partage.texte);
  });

  test("fin de partie : feuille de partage en échec, affiche téléchargée", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => {
      navigator.canShare = () => true;
      navigator.share = () => Promise.reject(new DOMException("refusé", "NotAllowedError"));
    });
    await page.goto("compteur.html");
    await page.getByRole("button", { name: "30 points" }).click();
    for (let i = 0; i < 30; i++) await page.locator(".score-btn").nth(0).click();
    const telechargement = page.waitForEvent("download");
    await page.getByRole("button", { name: "Partager le résultat" }).click();
    expect((await telechargement).suggestedFilename()).toBe("resultat-trinquet.png");
    await expect(page.locator("#partageInfo")).toHaveText("Score copié, affiche téléchargée");
  });

  test("fin de partie sur ordinateur : message copié, affiche téléchargée", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => { delete Navigator.prototype.share; });
    await page.goto("compteur.html");
    await page.getByRole("button", { name: "30 points" }).click();
    for (let i = 0; i < 30; i++) await page.locator(".score-btn").nth(1).click();
    const telechargement = page.waitForEvent("download");
    await page.getByRole("button", { name: "Partager le résultat" }).click();
    expect((await telechargement).suggestedFilename()).toBe("resultat-trinquet.png");
    await expect(page.locator("#partageInfo")).toHaveText("Score copié, affiche téléchargée");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Victoire de Équipe 2");
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
  for (const p of ["index", "equipe", "equipes", "programme", "classement", "creneaux", "report", "compteur"]) {
    const html = await readFile(p + ".html", "utf8");
    expect(balises(html), p).toEqual(reference);
    expect(html, p + " ne doit pas renvoyer l'aperçu vers Découvrir").not.toContain('property="og:url"');
  }
});

// Spec accueil, « Avis sur la saison » : une carte le temps de la campagne,
// fermée pour de bon sur l'appareil. La constante AVIS de la page est
// remplacée, pour ne dépendre ni du vrai lien ni de la date du jour.
test.describe("Accueil : avis sur la saison", () => {
  const FORMULAIRE = "https://forms.gle/exemple";
  const avecAvis = (page, jusquAu = "2099-12-31", url = FORMULAIRE) => page.route("**/index.html", async (route) => {
    const reponse = await route.fetch();
    const html = (await reponse.text()).replace(/var AVIS = \{[^}]*\};/, `var AVIS = { url: "${url}", jusquAu: "${jusquAu}" };`);
    route.fulfill({ response: reponse, body: html });
  });
  // Pas encore vue sur cet appareil, au premier chargement seulement : un
  // rechargement garde ce que la page a retenu.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem("test_avis")) return;
      sessionStorage.setItem("test_avis", "1");
      localStorage.removeItem("lidfpb_avis_vu_v1");
    });
  });

  test("la page porte un lien https et une date de fin", async () => {
    const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
    expect(html).toMatch(/var AVIS = \{ url: "https:\/\/[^"]+", jusquAu: "\d{4}-\d{2}-\d{2}" \};/);
  });

  test("sans lien de questionnaire, rien ne s'affiche", async ({ page }) => {
    await avecAvis(page, "2099-12-31", "");
    await page.goto("index.html");
    await attendreChargement(page);
    await expect(page.locator(".avis")).toHaveCount(0);
  });

  test("la carte mène au questionnaire, et une fois fermée ne revient plus", async ({ page }) => {
    await avecAvis(page);
    await page.goto("index.html");
    const carte = page.getByRole("region", { name: "Votre avis sur la saison" });
    await expect(carte).toBeVisible();
    // Avant les blocs de l'accueil.
    expect(await page.evaluate(() => document.getElementById("avis-slot").nextElementSibling.id)).toBe("banner-slot");
    const lien = carte.getByRole("link", { name: "Répondre" });
    await expect(lien).toHaveAttribute("href", FORMULAIRE);
    await expect(lien).toHaveAttribute("target", "_blank");
    await carte.getByRole("button", { name: "Ne plus afficher" }).click();
    await expect(page.locator(".avis")).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("lidfpb_avis_vu_v1"))).toBe("1");
    await page.reload();
    await attendreChargement(page);
    await expect(page.locator(".avis")).toHaveCount(0);
  });

  test("répondre suffit à la faire disparaître", async ({ page, context }) => {
    await avecAvis(page);
    await context.route(FORMULAIRE, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>Formulaire</title>" }));
    await page.goto("index.html");
    const onglet = context.waitForEvent("page");
    await page.getByRole("link", { name: "Répondre" }).click();
    await (await onglet).close();
    await expect(page.locator(".avis")).toHaveCount(0);
  });

  test("carte affichée : cibles de 44 px, rien sous 12 px, focus gardé à la fermeture", async ({ page }) => {
    await avecAvis(page);
    await page.goto("index.html");
    await attendreChargement(page);
    const carte = page.locator(".avis");
    for (const cible of [carte.getByRole("link", { name: "Répondre" }), carte.getByRole("button", { name: "Ne plus afficher" })]) {
      const zone = await cible.evaluate((e) => {
        const r = e.getBoundingClientRect(), a = getComputedStyle(e, "::after");
        const deborde = a.content !== "none" && a.position === "absolute";
        return { h: deborde ? Math.max(r.height, 44) : r.height, w: deborde ? Math.max(r.width, 44) : r.width };
      });
      expect(zone.h).toBeGreaterThanOrEqual(44);
      expect(zone.w).toBeGreaterThanOrEqual(44);
    }
    const tailles = await carte.evaluate((c) => [...c.querySelectorAll("*")].filter((e) => e.textContent.trim()).map((e) => parseFloat(getComputedStyle(e).fontSize)));
    expect(Math.min(...tailles)).toBeGreaterThanOrEqual(12);
    await carte.getByRole("button", { name: "Ne plus afficher" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".avis")).toHaveCount(0);
    expect(await page.evaluate(() => document.activeElement.id)).toBe("tiles");
  });

  test("la campagne finie, la carte ne s'affiche plus", async ({ page }) => {
    await avecAvis(page, "2020-01-31");
    await page.goto("index.html");
    await attendreChargement(page);
    await expect(page.locator(".avis")).toHaveCount(0);
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

test("Ancienne adresse equipes.html redirige vers la page Équipes", async ({ page }) => {
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

  test("le script du pli et du résumé est le même dans les quatre pages", async () => {
    const scripts = await Promise.all(["programme", "classement", "creneaux", "equipe"].map(async (n) => {
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
  for (const url of ["programme.html", "classement.html", "creneaux.html", "equipe.html"]) {
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
    const alpha = ligne(page, "Alpha 1");
    expect(await colonnes(alpha)).toEqual(["3", "3", "0", "+51"]);
    await expect(alpha.locator(".rank-score")).toHaveText("3,00");
    expect(await colonnes(ligne(page, "Bravo 1"))).toEqual(["3", "2", "1", "−7"]);
    await expect(ligne(page, "Bravo 1").locator(".rank-score")).toHaveText("2,33");
    // Rien d'autre sur la ligne : ni phrase de détail, ni joueurs.
    await expect(page.locator(".rank-joueurs:visible")).toHaveCount(0);
    await expect(page.locator(".rank-detail:visible")).toHaveCount(0);
  });

  test("toucher une ligne montre ses joueurs puis son détail, un second toucher les cache", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    const bravo = ligne(page, "Bravo 1");
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
    await ligne(page, "Alpha 1").click();
    await expect(page.locator(".rank-row[aria-expanded='true']")).toHaveCount(2);

    await bravo.click();
    await expect(bravo).toHaveAttribute("aria-expanded", "false");
    await expect(plus).toBeHidden();
    await expect.poll(chevron).toBe(replie);
  });

  test("une ligne ouverte le reste quand la simulation recalcule le classement", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await ligne(page, "Bravo 1").click();
    const sim = page.locator(".sim-card").first();
    await sim.locator(".sim-toggle").click();
    await sim.locator(".sim-match").first().locator(".sim-pick").first().click();
    await expect(page.locator("#sim-slot")).toContainText("Simulation en cours");
    await expect(ligne(page, "Bravo 1")).toHaveAttribute("aria-expanded", "true");
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
    const foxtrot = ligne(page, "Foxtrot 1");
    await expect(foxtrot.locator(".rank-pos")).toHaveText("–");
    expect(await colonnes(foxtrot)).toEqual(["0", "–", "–", "–"]);
    await expect(foxtrot.locator(".rank-score")).toHaveText("–");
    await foxtrot.click();
    await expect(page.locator("#" + await foxtrot.getAttribute("aria-controls")).locator(".rank-detail")).toHaveText("aucune partie jouée");
  });

  test("une poule de six entière au premier écran", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await page.evaluate(() => document.fonts.ready);
    const haut = await page.locator(".tab-bar").evaluate((e) => e.getBoundingClientRect().top);
    const lignes = page.locator(".zone-classement").first().locator(".poule-card").first().locator(".rank-row");
    await expect(lignes).toHaveCount(6);
    const bas = await lignes.last().evaluate((e) => e.getBoundingClientRect().bottom);
    expect(bas, "la 6e équipe passe sous la barre d'onglets").toBeLessThanOrEqual(haut);
  });

  test("lecteur d'écran : chaque ligne se lit en une phrase", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    const serie1 = page.locator(".zone-classement").first();   // Alpha est aussi en série 2
    await expect(serie1.getByRole("button", {
      name: "Rang 1, Alpha 1, 3 parties jouées, 3 gagnées, 0 perdue, goal average +51, moyenne 3,00, zone des quarts", exact: true
    })).toHaveCount(1);
    await expect(serie1.getByRole("button", {
      name: "Rang 4, Charlie 1, 2 parties jouées, 1 gagnée, 1 perdue, goal average −17, moyenne 2,00, zone des quarts", exact: true
    })).toHaveCount(1);
    await expect(page.locator(".rank-head").first()).toHaveAttribute("aria-hidden", "true");
  });
});

// Une constante `var NOM = { … };` d'une page, lue telle qu'écrite.
async function constante(fichier, nom) {
  const html = await readFile(new URL(`../${fichier}`, import.meta.url), "utf8");
  const debut = html.indexOf(`var ${nom} = {`);
  expect(debut, `${nom} dans ${fichier}`).toBeGreaterThan(-1);
  let i = html.indexOf("{", debut), prof = 0, fin = i;
  for (; fin < html.length; fin++) {
    if (html[fin] === "{") prof++;
    if (html[fin] === "}" && --prof === 0) break;
  }
  return Function(`return ${html.slice(i, fin + 1)};`)();
}

// Spec noms-clubs : une seule table, recopiée à l'identique, et la spec est la
// référence.
test("noms courts identiques d'une page à l'autre, et à la spec", async () => {
  const accueil = await constante("index.html", "CLUBS_ABREGES");
  expect(await constante("classement.html", "CLUBS_ABREGES")).toEqual(accueil);
  expect(await constante("programme.html", "CLUBS_ABREGES")).toEqual(accueil);
  expect(await constante("equipe.html", "CLUBS_ABREGES")).toEqual(accueil);
  // Le lien du questionnaire d'avis : celui de l'accueil, dans le message des
  // phases finales de la page Équipes.
  expect(await constante("equipe.html", "AVIS")).toEqual(await constante("index.html", "AVIS"));
  // Les libellés des spécialités, identiques dans les quatre pages qui les portent.
  for (const f of ["equipe.html", "classement.html", "programme.html"]) {
    expect(await constante(f, "SPEC_LABELS"), f).toEqual(await constante("index.html", "SPEC_LABELS"));
  }
  // Le lieu court de Parties est celui de l'accueil, au caractère près.
  const lieuCourt = async (f) => {
    const html = await readFile(new URL(`../${f}`, import.meta.url), "utf8");
    const m = html.match(/function lieuCourt\(lieu\) \{[\s\S]*?\n  \}/);
    expect(m, `lieuCourt dans ${f}`).not.toBeNull();
    return m[0];
  };
  expect(await lieuCourt("programme.html")).toBe(await lieuCourt("index.html"));
  // Le libellé de la compétition : celui de Parties, dans le message
  // « Prochaine partie » de la page Équipes.
  expect(await constante("equipe.html", "COMPET_LABELS")).toEqual(await constante("programme.html", "COMPET_LABELS"));
  // Le message de vérification d'une partie et le prénom du responsable :
  // mêmes fonctions, au caractère près, sur Parties et sur la page Équipes.
  for (const nom of ["prenomDuResponsable", "messageVerification", "telLisible", "lienWhatsappAvecTexte"]) {
    const fonction = async (f) => {
      const html = await readFile(new URL(`../${f}`, import.meta.url), "utf8");
      const m = html.match(new RegExp("function " + nom + "\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}"));
      expect(m, `${nom} dans ${f}`).not.toBeNull();
      return m[0];
    };
    expect(await fonction("programme.html"), nom).toBe(await fonction("equipe.html"));
  }
  const spec = await readFile(new URL("../openspec/specs/noms-clubs/spec.md", import.meta.url), "utf8");
  const table = {};
  for (const l of spec.split("\n")) {
    const m = l.match(/^\| ([A-Z0-9 ]+) \| (.+) \|$/);
    if (m) table[m[1]] = m[2];
  }
  expect(table).toEqual(accueil);
});

// Données fictives où Alpha porte un nom de la table des noms courts.
function servirAvecClubDeLaTable(page, rencontres) {
  return page.route("**/script.google.com/**", (route) => {
    const table = new URL(route.request().url()).searchParams.get("table");
    let data = tables[table] || [];
    if (table === "clubs") data = data.map((c, i) => i === 0 ? { ...c, "Nom club": "METRO PELOTE BASQUE ANTONY" } : c);
    if (table === "rencontres" && rencontres) data = rencontres(data);
    route.fulfill({
      status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ table, data, lastSync: new Date().toISOString() })
    });
  });
}

// Spec classement, « Ligne d'une équipe » : nom court sur toute la page, nom
// officiel au toucher.
test("Classement : nom court sur la ligne et aux quarts, nom officiel au toucher", async ({ page }) => {
  await servirAvecClubDeLaTable(page);
  await page.goto("classement.html");
  await attendreChargement(page);
  const serie1 = page.locator(".zone-classement").first();
  const mpba = serie1.locator(".rank-row").first();
  await expect(mpba.locator(".rank-team")).toHaveText("MPBA 1");
  await mpba.click();
  const plus = page.locator("#" + await mpba.getAttribute("aria-controls"));
  await expect(plus.locator("> *").first()).toHaveClass(/rank-nom/);
  await expect(plus.locator(".rank-nom")).toHaveText("METRO PELOTE BASQUE ANTONY (éq. 1)");
  await expect(serie1.locator(".finales-card .quart-side", { hasText: "MPBA 1" })).toHaveCount(1);
  // Un club hors de la table garde son nom, suivi du numéro.
  await expect(serie1.locator(".rank-team", { hasText: /^Bravo\s1$/ })).toHaveCount(1);
  // Plus de « (éq. N) » sur la page, hors des noms officiels du détail.
  expect(await page.evaluate(() => [...document.querySelectorAll("#results *:not(.rank-nom)")]
    .some((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.includes("(éq."))))).toBe(false);
});

// Spec programme, « Ligne d'une partie », « Légende des parties » et « Détail
// d'une partie » : une ligne par partie, le reste au toucher.
test.describe("Parties : une ligne par partie", () => {
  const partie = (page, texte) => page.locator(".match-item").filter({ hasText: texte }).first();

  test("heure, pastille de poule, équipes en noms courts, score : rien d'autre sur la ligne", async ({ page }) => {
    await servirAvecClubDeLaTable(page);
    await page.goto("programme.html");
    await attendreChargement(page);
    const item = partie(page, "MPBA 1 vs Bravo 1");
    const ligne = item.locator(".match-row");
    // Une espace de chaque côté de « vs », le numéro collé à son nom.
    expect(await ligne.locator(".match-row-teams").evaluate((e) => e.textContent)).toBe("MPBA\u00a01 vs Bravo\u00a01");
    await expect(ligne.locator(".poule-tag")).toHaveText("P1");
    await expect(ligne.locator(".poule-tag")).toHaveClass(/teinte-1/);
    await expect(ligne.locator(".match-row-score")).toHaveText(/^\d+ - \d+$/);
    const texte = await ligne.evaluate((e) => e.textContent);
    for (const absent of ["Série", "Poule", "Trinquet", "[", "Joueur", "(éq."]) expect(texte, absent).not.toContain(absent);
    // Les deux poules ont deux teintes, et un quart sa pastille de phase.
    const p2 = page.locator(".match-row .poule-tag", { hasText: "P2" }).first();
    expect(await p2.evaluate((e) => getComputedStyle(e).color)).not.toBe(await ligne.locator(".poule-tag").evaluate((e) => getComputedStyle(e).color));
    await expect(page.locator(".match-row .poule-tag", { hasText: /^1\/4$/ }).first()).toBeVisible();
  });

  test("toucher une partie : chevron, fond teinté, nom officiel, joueurs, série, poule et lieu complet", async ({ page }) => {
    await servirAvecClubDeLaTable(page);
    await page.goto("programme.html");
    await attendreChargement(page);
    const item = partie(page, "MPBA 1 vs Bravo 1");
    const ligne = item.locator(".match-row");
    await expect(ligne).toHaveAttribute("aria-expanded", "false");
    const chevron = () => ligne.locator(".match-chevron svg").evaluate((e) => getComputedStyle(e).transform);
    const replie = await chevron();
    expect(replie).not.toBe("none");
    const fond = () => item.evaluate((e) => getComputedStyle(e).backgroundColor);
    const fondReplie = await fond();
    await ligne.click();
    await expect(ligne).toHaveAttribute("aria-expanded", "true");
    const detail = item.locator(".match-detail");
    await expect(detail).toBeVisible();
    await expect(detail).toContainText("METRO PELOTE BASQUE ANTONY (éq. 1) : Ane Joueur100001, Bixente Joueur100002");
    await expect(detail).toContainText("Bravo (éq. 1) : Ane Joueur100003, Bixente Joueur100004");
    await expect(detail.locator(".match-where")).toHaveText("Série 1 · Poule 1 · PARIS (Trinquet Paris - 75016)");
    await expect.poll(chevron).toBe("none");
    await expect.poll(fond).not.toBe(fondReplie);
    await ligne.click();
    await expect(ligne).toHaveAttribute("aria-expanded", "false");
    await expect(detail).toBeHidden();
  });

  test("WhatsApp et SMS vierges devant chaque équipe, le nom mène à sa page ; compteur en noms courts", async ({ page }) => {
    await servirAvecClubDeLaTable(page);
    await page.goto("programme.html");
    await attendreChargement(page);
    const jouee = partie(page, "MPBA 1 vs Bravo 1");
    await jouee.locator(".match-row").click();
    const liens = jouee.locator(".match-detail a.lien-equipe");
    await expect(liens).toHaveText(["METRO PELOTE BASQUE ANTONY (éq. 1)", "Bravo (éq. 1)"]);
    await expect(liens.nth(1)).toHaveAttribute("href", "equipe.html?equipe=" + encodeURIComponent("2|1|" + codeClub(1) + "|1"));
    // Hors mode organisateur : conversation vierge, pas d'appel (il est sur la page de l'équipe).
    const wa = jouee.getByRole("link", { name: "Écrire sur WhatsApp au responsable de Bravo 1" });
    await expect(wa).toHaveAttribute("href", "https://wa.me/33600000101");
    await expect(jouee.getByRole("link", { name: "Envoyer un SMS au responsable de Bravo 1" })).toHaveAttribute("href", "sms:+33600000101");
    await expect(jouee.locator("a[href^='tel:'], a[href*='text='], a.icon-envoi")).toHaveCount(0);
    expect(await page.locator("main").innerText()).not.toMatch(/0600000|06 00|Responsable Bravo/);
    await expect(page.getByRole("link", { name: "Mode organisateur" })).toHaveAttribute("href", "programme.html?orga");
    await liens.nth(1).click();
    await expect(page).toHaveURL(/equipe\.html\?equipe=/);
    await expect(page.locator(".team-name")).toHaveText("Bravo (éq. 1)");
    await page.goBack();
    await attendreChargement(page);
    // Une partie à jouer ouvre le compteur avec les noms courts.
    const aJouer = partie(page, "MPBA 1 vs Delta 1");
    await expect(aJouer).toBeVisible();
    await aJouer.locator(".match-row").click();
    const lien = new URL(await aJouer.getByRole("link", { name: "Compter cette partie" }).getAttribute("href"), "http://x/");
    expect([lien.searchParams.get("e1"), lien.searchParams.get("e2")]).toEqual(["MPBA 1", "Delta 1"]);
  });

  test("lieu inhabituel : « 📍 » et son nom court sur la ligne, et dans la légende", async ({ page }) => {
    let change = false;
    await servirAvecClubDeLaTable(page, (data) => data.map((r) => {
      if (change || r["Catégorie"] !== "1" || r.club_rec !== codeClub(0) || r.club_vis !== codeClub(1)) return r;
      change = true;
      return { ...r, lieu_renc: "PARIS (Trinquet Mail - 75006)" };
    }));
    await page.goto("programme.html");
    await attendreChargement(page);
    await expect(page.locator(".match-row .match-lieu")).toHaveCount(1);
    await expect(partie(page, "MPBA 1 vs Bravo 1").locator(".match-lieu")).toHaveText("📍 Trinquet Mail");
    await expect(page.locator(".legende-parties")).toContainText("📍 lieu inhabituel");
  });

  test("légende : séries, pastilles, phrase d'aide, et elle suit le filtre Série", async ({ page }) => {
    await page.goto("programme.html");
    await attendreChargement(page);
    const legende = page.locator(".legende-parties");
    await expect(legende).toHaveCount(1);
    await expect(legende.locator(".serie-cle")).toHaveText(["Série 1", "Série 2"]);
    await expect(legende.locator(".poule-tag")).toHaveText(["P1", "P2"]);
    await expect(legende).toContainText("Touchez une partie : joueurs, lieu, équipes");
    await expect(legende).not.toContainText("📍");
    // Avant les jours.
    expect(await page.locator("#results > *").first().evaluate((e) => e.className)).toContain("legende-parties");
    await page.locator("#filtersToggle").click();
    await page.locator("#filterSeries .filter-chip[data-serie='2']").click();
    await expect(legende.locator(".serie-cle")).toHaveText(["Série 1"]);
  });

  test("lecteur d'écran : la ligne dit la série, la poule et le lieu", async ({ page }) => {
    await servirAvecClubDeLaTable(page);
    await page.goto("programme.html");
    await attendreChargement(page);
    const label = await partie(page, "MPBA 1 vs Bravo 1").locator(".match-row").getAttribute("aria-label");
    // Le nom accessible reprend le texte visible (« vs »), puis ce que la couleur et la pastille disent.
    expect(label).toMatch(/^19h30, MPBA 1 vs Bravo 1, /);
    for (const morceau of ["Série 1", "Poule 1", "Trinquet Paris"]) expect(label).toContain(morceau);
  });
});

test.describe("Parties sur iPhone 15 Pro", () => {
  test.use({ viewport: { width: 393, height: 659 } });
  test("au moins cinq parties au premier écran", async ({ page }) => {
    await page.goto("programme.html");
    await attendreChargement(page);
    await page.evaluate(() => document.fonts.ready);
    const haut = await page.locator(".tab-bar").evaluate((e) => e.getBoundingClientRect().top);
    const visibles = await page.locator(".match-row").evaluateAll((l, h) => l.filter((r) => r.getBoundingClientRect().bottom <= h).length, haut);
    expect(visibles).toBeGreaterThanOrEqual(5);
  });
});

// Spec classement, « Zones de fin de poule » et « Légende du classement ».
test.describe("Classement : zones de fin de poule et légende", () => {
  const zones = (carte) => carte.locator(".rank-row").evaluateAll((l) => l.map((r) =>
    (r.className.match(/zone-(quarts|barrage|descente)/) || [, ""])[1]));

  test("Série 1 : quarts et descente ; Série 2 : quarts, barrage et descente", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    const [s1, s2] = [page.locator(".zone-classement").nth(0), page.locator(".zone-classement").nth(1)];
    expect(await zones(s1.locator(".poule-card").first())).toEqual(["quarts", "quarts", "quarts", "quarts", "", "descente"]);
    expect(await zones(s2.locator(".poule-card").first())).toEqual(["quarts", "quarts", "quarts", "quarts", "barrage", "descente"]);
    // Trois couleurs distinctes, et plus de trait des qualifiés.
    const liseré = (cls) => s2.locator(".rank-row." + cls).first().evaluate((e) => getComputedStyle(e).boxShadow);
    expect(new Set([await liseré("zone-quarts"), await liseré("zone-barrage"), await liseré("zone-descente")]).size).toBe(3);
    await expect(page.locator(".cut-line")).toHaveCount(0);
  });

  test("légende de chaque série : zones présentes, « à ce jour », colonnes et barème", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    const l1 = page.locator(".zone-classement").nth(0).locator(".legende-classement");
    const l2 = page.locator(".zone-classement").nth(1).locator(".legende-classement");
    await expect(l1).toHaveCount(1);
    await expect(l1.locator(".zone-cle")).toHaveText(["1-4 Quarts", "6 Descente en Série 2"]);
    await expect(l2.locator(".zone-cle")).toHaveText(["1-4 Quarts", "5 Barrage", "6 Descente en Série 3"]);
    await expect(l1).toContainText("à ce jour");
    await expect(l1).toContainText("J jouées · G gagnées · P perdues · GA goal average · Moy. points par partie (victoire 3, défaite 1)");
    // Elle suit les poules et précède les quarts.
    expect(await page.locator(".zone-classement").first().evaluate((z) =>
      [...z.children].map((e) => e.classList.contains("legende-classement") ? "L" : e.classList.contains("finales-card") ? "Q" : "P").join("")))
      .toBe("PPLQ");
    // La règle a quitté le bloc Filtres.
    await expect(page.locator("#filtersBody .legende")).toHaveCount(0);
  });

  test("classement général : pas de zone, une légende des colonnes seule", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await page.locator("#filtersToggle").click();
    await page.locator("#filterDecoupage .filter-chip[data-mode='general']").click();
    await expect(page.locator(".rank-row[class*='zone-']")).toHaveCount(0);
    const l1 = page.locator(".zone-classement").nth(0).locator(".legende-classement");
    await expect(l1.locator(".zone-cle")).toHaveCount(0);
    await expect(l1).toContainText("J jouées");
    await expect(l1).toContainText("Les 4 premiers de chaque poule vont en quarts.");
  });

  test("poules finies : une équipe qui n'a que des forfaits ferme la poule et descend", async ({ page }) => {
    // Série 1 finie, Foxtrot sans aucun score chiffré.
    await servirAvecClubDeLaTable(page, (data) => data.map((r) => {
      if (r["Catégorie"] !== "1" || r.Phase !== "1") return r;
      if (r.club_rec === codeClub(5) || r.club_vis === codeClub(5)) return { ...r, score_cr: "F", score_cv: "F" };
      return r.score_cr ? r : { ...r, score_cr: "40", score_cv: "20" };
    }));
    await page.goto("classement.html");
    await attendreChargement(page);
    const carte = page.locator(".zone-classement").first().locator(".poule-card").first();
    await expect(carte.locator(".rank-row").last()).toContainText("Foxtrot 1");
    await expect(carte.locator(".rank-row").last()).toHaveClass(/zone-descente/);
  });

  test("une équipe sans partie jouée n'a pas de zone", async ({ page }) => {
    await servirAvecClubDeLaTable(page, (data) => data.map((r) => r["Catégorie"] === "1" && (r.club_rec === codeClub(5) || r.club_vis === codeClub(5)) ? { ...r, score_cr: "", score_cv: "" } : r));
    await page.goto("classement.html");
    await attendreChargement(page);
    const foxtrot = page.locator(".zone-classement").first().locator(".rank-row", { hasText: "Foxtrot 1" });
    await expect(foxtrot).not.toHaveClass(/zone-/);
  });
});

// Spec classement, « Ligne d'une équipe » : une poule entière au premier écran
// d'un iPhone 15 Pro, dans Safari.
test.describe("Classement sur iPhone 15 Pro", () => {
  test.use({ viewport: { width: 393, height: 659 } });
  test("une poule de six entière au premier écran", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await page.evaluate(() => document.fonts.ready);
    const haut = await page.locator(".tab-bar").evaluate((e) => e.getBoundingClientRect().top);
    const lignes = page.locator(".zone-classement").first().locator(".poule-card").first().locator(".rank-row");
    expect(await lignes.last().evaluate((e) => e.getBoundingClientRect().bottom)).toBeLessThanOrEqual(haut);
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

// Spec classement, « Prévision des quarts de finale » : une fois les phases
// finales lancées, leurs scores réels, et les vainqueurs portés en demie puis
// en finale.
test.describe("Classement : phases finales jouées", () => {
  // Série 1, poules finies.
  const poulesFinies = (data) => data.map((r) => r["Catégorie"] === "1" && r.Phase === "1" && !r.score_cr ? { ...r, score_cr: "40", score_cv: "20" } : r);
  function servir(page, rencontres) {
    return page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      let data = tables[table] || [];
      if (table === "rencontres") data = rencontres(data);
      route.fulfill({
        status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data, lastSync: new Date().toISOString() })
      });
    });
  }
  // Les quarts que le tableau prévoit, en codes de club, Q1 à Q4.
  async function quartsPrevus(page) {
    await servir(page, poulesFinies);
    await page.goto("classement.html");
    await attendreChargement(page);
    const code = (nom) => codeClub(tables.clubs.findIndex((c) => c["Nom club"] + " 1" === nom));
    const rangees = page.locator(".finales-card").first().locator(".quart-row");
    const quarts = [];
    for (let i = 0; i < 4; i++) quarts.push((await rangees.nth(i).locator(".quart-nom").allTextContents()).map(code));
    // Les réponses de l'API sont gardées en cache : sans lui, le rechargement
    // relit les rencontres.
    await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("lidfpb_api_v1:")).forEach((k) => localStorage.removeItem(k)));
    return quarts;
  }
  const partie = (cat, phase, rec, vis, cr, cv) => ({
    oid: "f" + phase + rec + vis, "Compétition": "20270301", "Spécialité": "2", "Catégorie": cat, "Phase": phase, "Poule": "",
    club_rec: rec, equip_rec: "1", club_vis: vis, equip_vis: "1",
    lieu_renc: "PARIS (Trinquet Paris - 75016)", date_renc: "01012027", heure_renc: "2000", report: "", date_rep: "",
    score_cr: cr, score_cv: cv
  });
  // Les quarts de la série 1 remplacés par ceux du tableau, avec leurs
  // scores ; Q2 reçu par l'équipe du bas, pour vérifier le sens.
  function avecFinales(quarts, scores, suite) {
    return (data) => {
      let q = 0;
      const sortie = poulesFinies(data).map((r) => {
        if (r["Catégorie"] !== "1" || r.Phase !== "10") return r;
        const [a, b] = quarts[q], [sa, sb] = scores[q++] || ["", ""];
        return q === 2 ? { ...r, club_rec: b, club_vis: a, score_cr: sb, score_cv: sa } : { ...r, club_rec: a, club_vis: b, score_cr: sa, score_cv: sb };
      });
      return sortie.concat(suite || []);
    };
  }

  test("un quart joué : score, vainqueur coché, et le voilà en demie", async ({ page }) => {
    const quarts = await quartsPrevus(page);
    await servir(page, avecFinales(quarts, [["40", "31"], ["22", "40"]]));
    await page.reload();
    await attendreChargement(page);
    const carte = page.locator(".finales-card").first();
    await expect(carte.locator(".statut")).toHaveText("En cours");
    await expect(carte.locator(".poule-sub")).toHaveText("Tableau final");
    const q1 = carte.locator(".tableau-quarts .quart-row").nth(0).locator(".quart-side");
    await expect(q1.nth(0)).toHaveClass(/gagne/);
    await expect(q1.nth(0).locator(".quart-score")).toHaveText("✓ 40");
    await expect(q1.nth(1)).toHaveClass(/battu/);
    await expect(q1.nth(1).locator(".quart-score")).toHaveText("31");
    // Q2 reçu par l'équipe du bas : le score suit l'équipe, pas le côté.
    const q2 = carte.locator(".tableau-quarts .quart-row").nth(1).locator(".quart-side");
    await expect(q2.nth(1)).toHaveClass(/gagne/);
    await expect(q2.nth(0).locator(".quart-score")).toHaveText("22");
    // Charlie, suivie, a perdu Q2 : son chemin n'est plus surligné.
    await expect(carte.locator(".arbre-etape.mien")).toHaveCount(0);
    // Q3 et Q4 pas encore joués : toujours leurs chances.
    await expect(carte.locator(".tableau-quarts .quart-row").nth(2).locator(".quart-proba")).toHaveCount(2);
    // D1 : les vainqueurs de Q1 et Q2, avec leurs chances ; D2 et finale à déterminer.
    const suite = carte.locator(".tableau-suite");
    await expect(suite.locator(".tableau-titre")).toHaveText(["1/2 finales", "Finale"]);
    const d1 = suite.locator(".quart-row").nth(0);
    await expect(d1.locator(".quart-num")).toHaveText("D1");
    await expect(d1.locator(".quart-seed")).toHaveText(["V.Q1", "V.Q2"]);
    await expect(d1.locator(".quart-nom")).toHaveText([
      await q1.nth(0).locator(".quart-nom").textContent(),
      await q2.nth(1).locator(".quart-nom").textContent()
    ]);
    await expect(d1.locator(".quart-proba")).toHaveCount(2);
    await expect(suite.locator(".quart-row").nth(1).locator(".quart-nom")).toHaveText(["À déterminer", "À déterminer"]);
    await expect(suite.locator(".quart-row").nth(2).locator(".quart-nom")).toHaveText(["À déterminer", "À déterminer"]);
    await expect(carte.locator(".tableau-champion")).toHaveCount(0);
    await expect(carte.locator(".finales-note")).toContainText("Scores des phases finales d'après le site de la ligue");
    // La série 2, poules en cours, reste une prévision.
    await expect(page.locator(".finales-card").nth(1).locator(".statut")).toHaveText("Prévision");
    await expect(page.locator(".finales-card").nth(1).locator(".tableau-suite")).toHaveCount(0);
  });

  test("croisement de la ligue autre que la prévision : chaque équipe une seule fois", async ({ page }) => {
    const quarts = await quartsPrevus(page);
    // La ligue oppose le haut de Q1 au bas de Q2 : le bas de Q1 passe en Q2.
    const croises = [[quarts[0][0], quarts[1][1]], [quarts[1][0], quarts[0][1]], quarts[2], quarts[3]];
    await servir(page, avecFinales(croises, [["40", "30"]]));
    await page.reload();
    await attendreChargement(page);
    const carte = page.locator(".finales-card").first();
    const noms = await carte.locator(".tableau-quarts .quart-nom").allTextContents();
    expect(new Set(noms).size).toBe(8);
    const q1 = carte.locator(".tableau-quarts .quart-row").nth(0);
    await expect(q1.locator(".quart-score")).toHaveText(["✓ 40", "30"]);
    const code = (nom) => codeClub(tables.clubs.findIndex((c) => c["Nom club"] + " 1" === nom));
    expect((await q1.locator(".quart-nom").allTextContents()).map(code)).toEqual(croises[0]);
    expect((await carte.locator(".tableau-quarts .quart-row").nth(1).locator(".quart-nom").allTextContents()).map(code))
      .toEqual(croises[1]);
  });

  test("une demie inscrite sans aucun score : toujours une prévision", async ({ page }) => {
    const quarts = await quartsPrevus(page);
    await servir(page, avecFinales(quarts, [], [partie("1", "11", quarts[0][0], quarts[1][0], "", "")]));
    await page.reload();
    await attendreChargement(page);
    const carte = page.locator(".finales-card").first();
    await expect(carte.locator(".statut")).toHaveText("Poules terminées");
    await expect(carte.locator(".tableau-suite")).toHaveCount(0);
  });

  test("équipe suivie battue en demie : plus de trait surligné vers la finale", async ({ page }) => {
    const quarts = await quartsPrevus(page);
    const charlie = codeClub(2);
    const q = quarts.findIndex((x) => x.includes(charlie));
    const k = quarts[q].indexOf(charlie);
    const scores = [];
    scores[q] = k === 0 ? ["40", "30"] : ["30", "40"];
    // Charlie gagne son quart : son chemin est surligné jusqu'à la finale.
    await servir(page, avecFinales(quarts, scores));
    await page.reload();
    await attendreChargement(page);
    const arbre = page.locator(".finales-card").first().locator(".tableau-arbre");
    await expect(arbre.locator("path.mien")).toHaveCount(2);
    // Puis perd sa demie, contre une équipe de l'autre quart de sa moitié.
    const autre = q % 2 === 0 ? q + 1 : q - 1;
    await page.evaluate(() => Object.keys(localStorage).filter((c) => c.startsWith("lidfpb_api_v1:")).forEach((c) => localStorage.removeItem(c)));
    await servir(page, avecFinales(quarts, scores, [partie("1", "11", charlie, quarts[autre][0], "35", "40")]));
    await page.reload();
    await attendreChargement(page);
    await expect(arbre.locator("path.mien")).toHaveCount(1);
  });

  test("deux équipes suivies l'une contre l'autre en demie : le chemin du vainqueur reste surligné", async ({ page }) => {
    const quarts = await quartsPrevus(page);
    const charlie = codeClub(2);
    const q = quarts.findIndex((x) => x.includes(charlie));
    const autre = q % 2 === 0 ? q + 1 : q - 1;
    const adversaire = quarts[autre][0];
    // On suit aussi l'adversaire de demie de Charlie, qui gagne.
    const idx = Number(adversaire.slice(-3)) - 1;
    await page.addInitScript((c) => localStorage.setItem("lidfpb_mes_equipes_v1", JSON.stringify(["2|1|3750003|1", c])), "2|1|" + codeClub(idx) + "|1");
    const scores = [];
    scores[q] = quarts[q].indexOf(charlie) === 0 ? ["40", "30"] : ["30", "40"];
    scores[autre] = ["40", "30"];
    await servir(page, avecFinales(quarts, scores, [partie("1", "11", charlie, adversaire, "35", "40")]));
    await page.reload();
    await attendreChargement(page);
    await expect(page.locator(".finales-card").first().locator(".tableau-arbre path.mien")).toHaveCount(2);
  });

  test("tout joué : demies, finale et champion", async ({ page }) => {
    const quarts = await quartsPrevus(page);
    const [v1, v2, v3, v4] = [quarts[0][0], quarts[1][1], quarts[2][0], quarts[3][1]];
    await servir(page, avecFinales(quarts, [["40", "31"], ["22", "40"], ["40", "35"], ["38", "40"]], [
      partie("1", "11", v2, v1, "40", "36"),   // D1 reçue par le vainqueur de Q2
      partie("1", "11", v3, v4, "30", "40"),
      partie("1", "12", v4, v2, "33", "40")    // finale reçue par le finaliste du bas
    ]));
    await page.reload();
    await attendreChargement(page);
    const carte = page.locator(".finales-card").first();
    await expect(carte.locator(".statut")).toHaveText("Terminées");
    const suite = carte.locator(".tableau-suite .quart-row");
    const nomDe = async (rangee, cote) => carte.locator(".tableau-quarts .quart-row").nth(rangee).locator(".quart-nom").nth(cote).textContent();
    // D1 : V.Q1 en haut, V.Q2 en bas, qui l'a gagnée 40–36.
    await expect(suite.nth(0).locator(".quart-nom")).toHaveText([await nomDe(0, 0), await nomDe(1, 1)]);
    await expect(suite.nth(0).locator(".quart-score")).toHaveText(["36", "✓ 40"]);
    await expect(suite.nth(1).locator(".quart-score")).toHaveText(["30", "✓ 40"]);
    // Finale : V.D1 (vainqueur de Q2) en haut, V.D2 (vainqueur de Q4) en bas.
    await expect(suite.nth(2).locator(".quart-nom")).toHaveText([await nomDe(1, 1), await nomDe(3, 1)]);
    await expect(suite.nth(2).locator(".quart-score")).toHaveText(["✓ 40", "33"]);
    await expect(carte.locator(".tableau-champion")).toHaveText("🏆 Champion de Série 1 : " + await nomDe(1, 1));
  });
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
    await expect(page.locator(".finales-card .finales-note").first()).toContainText("chances de gagner la partie");
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
      "Avec 1 victoire, ça reste jouable : il faut qu'Alpha 1 batte Echo 1 et que Bravo 1 batte Foxtrot 1.");

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
    await expect(sim.locator(".sim-stats-msg")).toContainText("Le scénario qui qualifie Charlie 1");
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

  test("l'accueil résume les équipes suivies, déplie leurs joueurs et mène à leur page", async ({ page }) => {
    await page.goto("index.html");
    await attendreChargement(page);
    const bloc = page.locator(".mes-equipes");
    await expect(bloc.locator(".mes-row")).toHaveCount(1);
    await expect(bloc.locator("input")).toHaveCount(0);   // plus de choix sur l'accueil
    await expect(bloc.getByRole("link", { name: "Gérer →" })).toHaveAttribute("href", "equipe.html");
    // Une seule ligne, comme au Classement : le rang dans son rond, le nom, le
    // jour de la prochaine partie, la série en liseré.
    const ligne = bloc.locator(".mes-row");
    await expect(bloc.locator(".mes-item")).toHaveClass(/serie-1/);
    await expect(ligne.locator(".rank-pos")).toHaveText(/^[1-6]$/);
    await expect(ligne.locator(".mes-nom")).toHaveText("Charlie 1");
    await expect(ligne.locator(".mes-quand")).toHaveText(/^\S+\. \d+ \S+ \d+h(\d\d)?$/);
    expect(await ligne.evaluate((b) => b.getBoundingClientRect().height)).toBeLessThan(44);
    // Au toucher : rang, série et adversaire en clair, joueurs, page de l'équipe.
    await expect(bloc.locator(".mes-plus")).toBeHidden();
    await expect(ligne).toHaveAttribute("aria-expanded", "false");
    await ligne.click();
    await expect(ligne).toHaveAttribute("aria-expanded", "true");
    await expect(bloc.locator(".mes-info")).toHaveText(/^\de sur 6, poule 1 · Série 1 · prochaine partie .+ contre \S+\s1$/);
    await expect(bloc.locator(".rank-joueurs")).toHaveText("Ane Joueur100005, Bixente Joueur100006");
    await bloc.getByRole("link", { name: "Voir l'équipe →" }).click();
    await expect(page).toHaveURL(/equipe\.html\?equipe=/);
    await expect(page.locator(".suivre-btn")).toHaveText("★ Suivie");
  });

  test("compositions non chargées : pas de « non déclarée » à tort dans Mes équipes", async ({ page }) => {
    await page.route("**/script.google.com/**", (route) => {
      if (new URL(route.request().url()).searchParams.get("table") !== "engagements") return route.fallback();
      route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ error: "délai dépassé" }) });
    });
    await page.goto("index.html");
    await attendreChargement(page);
    const bloc = page.locator(".mes-equipes");
    await bloc.locator(".mes-row").click();
    await expect(bloc.locator(".mes-info")).toBeVisible();
    await expect(bloc.locator(".rank-joueurs")).toHaveCount(0);
    await expect(bloc).not.toContainText("non déclarée");
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
    await expect(onglet).toHaveText("Équipes");
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

// Les tests du bloc de la semaine lisent les équipes et les scores, sans
// compositions : les joueurs ont leurs propres scénarios.
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
    // Sous leur jour, comme sur Parties.
    await expect(page.locator("#vue-resultats .jour-tete")).toHaveText(["Vendredi 30 oct.", "Samedi 31 oct.", "Dimanche 1 nov."]);

    // La ligne de Parties : heure, poule, équipes, score à droite, série en couleur.
    await expect(lignes.nth(0)).toHaveClass(/serie-1/);
    await expect(lignes.nth(0).locator(".match-row-time")).toHaveText("19h30");
    await expect(lignes.nth(0).locator(".poule-tag")).toHaveText("P1");
    await expect(lignes.nth(0).locator(".match-row-teams")).toHaveText("Alpha 1 vs Bravo 1");
    await expect(lignes.nth(0).locator(".match-row-score")).toHaveText("40-25");
    await expect(lignes.nth(0).locator(".perdant")).toHaveText("Bravo 1");
    await expect(lignes.nth(0)).not.toHaveClass(/mine/);

    await expect(lignes.nth(1).locator(".match-row-score")).toHaveText("F-40");
    await expect(lignes.nth(1).locator(".perdant")).toHaveCount(0);
    await expect(lignes.nth(1)).not.toContainText("pas encore publié");

    await expect(lignes.nth(2).locator(".match-row-score")).toHaveCount(0);
    await expect(lignes.nth(2).locator(".match-attente")).toHaveText("Score pas encore publié par la ligue");
    // Charlie 1 est suivie : la partie est repérée, son nom à l'accent.
    await expect(lignes.nth(2)).toHaveClass(/mine/);
    await expect(lignes.nth(2).locator(".moi")).toHaveText("Charlie 1");
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

    const parties = page.locator("#vue-ici .match-item");
    await expect(parties).toHaveCount(2);
    await expect(parties.nth(0)).toContainText("Bravo 1 vs Delta 1");   // la partie du jour reste à venir
    await expect(page.locator("#vue-ici .jour-tete").first()).toHaveText("Lundi 2 nov.");
    await expect(page.locator("#vue-ici .jour-tete").first()).toHaveClass(/aujourdhui/);
    // Toutes au lieu habituel : rien sous les équipes, le lieu est au détail.
    await expect(parties.locator(".match-sous")).toHaveCount(0);
    await expect(parties.nth(0).locator(".match-row-score")).toHaveCount(0);
    await parties.nth(0).locator(".match-row").click();
    await expect(parties.nth(0).locator(".match-where")).toHaveText("Série 1 · Poule 1 · PARIS (Trinquet Paris - 75016)");
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
    await expect(page.locator("#vue-resultats .resultat").first()).toContainText("Alpha 1 vs Bravo 1");
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
    const parties = page.locator("#vue-ici .match-item");
    await expect(parties).toHaveCount(3);
    await expect(page.locator("#vue-ici .jour-tete").first()).toHaveText("Vendredi 30 oct.");
    await expect(parties.nth(0).locator(".match-row-teams")).toHaveText("Alpha 1 vs Bravo 1");
    await expect(parties.nth(0).locator(".match-row-score")).toHaveText("40-25");
    await expect(parties.nth(0).locator(".perdant")).toHaveText("Bravo 1");
    await expect(parties.nth(1).locator(".match-row-score")).toHaveText("F-40");
    await expect(parties.nth(1).locator(".perdant")).toHaveCount(0);
    await expect(parties.nth(2).locator(".match-row-teams")).toHaveText("Charlie 1 vs Delta 1");
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

    const parties = page.locator("#vue-ici .match-item");
    await expect(parties).toHaveCount(2);
    await expect(page.locator("#vue-ici .jour-tete").first()).toHaveText("Lundi 2 nov.");
    await expect(parties.nth(0).locator(".match-row-time")).toHaveText("19h30");
    await expect(parties.nth(0).locator(".match-row-teams")).toHaveText("Bravo 1 vs Delta 1");
    await expect(parties.nth(0).locator(".match-row-score")).toHaveText("20-40");
    await expect(parties.nth(0).locator(".perdant")).toHaveText("Bravo 1");
    await expect(parties.nth(1).locator(".match-row-teams")).toHaveText("Alpha 1 vs Charlie 1");
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
    const parties = page.locator("#vue-ici .match-item");
    await expect(parties).toHaveCount(5);
    await expect(parties.nth(0).locator(".match-row-score")).toHaveText("40-25");
    // Pas de « 0h » pour une partie sans heure, et le score attendu sous les équipes.
    await expect(parties.nth(1).locator(".match-row-time")).toHaveText("");
    await expect(parties.nth(1).locator(".match-row-score")).toHaveCount(0);
    await expect(parties.nth(1).locator(".match-attente")).toHaveText("Score pas encore publié par la ligue");
    await expect(parties.nth(2).locator(".match-row-score")).toHaveText("40-35");
    await expect(page.locator("#vue-ici .jour-tete")).toHaveText(["Vendredi 30 oct.", "Samedi 31 oct.", "Dimanche 1 nov.", "Mardi 3 nov.", "Samedi 7 nov."]);
    await expect(parties.nth(3).locator(".match-row-teams")).toHaveText("Bravo 1 vs Delta 1");
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
    // Le corps des parties n'a pas de marge : le message garde la sienne.
    expect(await page.locator("#vue-ici .fin-calendrier").evaluate((e) => getComputedStyle(e).paddingLeft)).toBe("14px");
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
  test("accueil : les joueurs au toucher d'une partie, jamais dans le partage", async ({ page }) => {
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

    // Sur la ligne, les noms courts seuls ; les joueurs au toucher.
    const partie = page.locator("#vue-ici .match-item").first();
    await expect(partie.locator(".match-row-teams")).toHaveText(/^\S+\s1 vs \S+\s1$/);
    await expect(partie.locator(".match-detail")).toBeHidden();
    await partie.locator(".match-row").click();
    await expect(partie.locator(".match-row")).toHaveAttribute("aria-expanded", "true");
    await expect(partie).toHaveClass(/ouverte/);
    await expect(partie.locator(".roster-line")).toHaveText([
      /^\S+ \(éq\. 1\) : Ane Joueur\d+, Bixente Joueur\d+$/, /^\S+ \(éq\. 1\) : Ane Joueur\d+, Bixente Joueur\d+$/
    ]);
    await expect(partie.locator(".lien-equipe").first()).toHaveAttribute("href", /^equipe\.html\?equipe=/);
    // Un second toucher replie la partie.
    await partie.locator(".match-row").click();
    await expect(partie.locator(".match-detail")).toBeHidden();
    // Plus de réglage : ni bouton, ni clé sur l'appareil.
    await expect(page.getByRole("button", { name: "Joueurs", exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("lidfpb_joueurs_v1"))).toBeNull();
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
    const sansCompo = page.locator("#vue-ici .match-item").first();
    await sansCompo.locator(".match-row").click();
    await expect(sansCompo.locator(".roster-noms")).toHaveText([" : composition non disponible", " : composition non disponible"]);
    const sansNoms = await partager();
    expect(sansNoms.texte).toBe(avecNoms.texte);
    expect(sansNoms.hauteur).toBe(avecNoms.hauteur);
  });

  test("accueil : lieu inhabituel sur la ligne, quart à désigner sans joueurs ni lien", async ({ page }) => {
    const partie = (oid, date, rec, vis, a, b, lieu) => ({
      oid: String(oid), "Compétition": "20270301", "Spécialité": "2", "Catégorie": "1", "Phase": "1", "Poule": "1",
      club_rec: rec, equip_rec: "1", club_vis: vis, equip_vis: "1",
      lieu_renc: lieu || "PARIS (Trinquet Paris - 75016)", date_renc: date, heure_renc: "1930", report: "", date_rep: "",
      score_cr: a, score_cv: b
    });
    await page.route("**/script.google.com/**", (route) => {
      const table = new URL(route.request().url()).searchParams.get("table");
      const data = table === "rencontres"
        ? [partie(1, "30102026", codeClub(0), codeClub(1), "40", "25"),
           partie(2, "01112026", codeClub(2), codeClub(3), "", "", "PARIS (Trinquet de la Cavalerie - 75015)"),
           Object.assign(partie(3, "01112026", "9998", codeClub(4), "", ""), { Phase: "10", Poule: "", heure_renc: "2100" })]
        : (tables[table] || []);
      route.fulfill({
        status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ table, data, lastSync: "2026-11-01T08:00:00Z" })
      });
    });
    await page.clock.setFixedTime(new Date("2026-11-01T18:00:00+01:00"));
    await page.goto("index.html");
    await attendreChargement(page);

    const parties = page.locator("#vue-ici .match-item");
    await expect(parties).toHaveCount(3);
    await expect(parties.nth(0).locator(".match-sous")).toHaveCount(0);
    // La Cavalerie n'est pas le lieu habituel : elle le dit sur la ligne.
    await expect(parties.nth(1).locator(".match-lieu")).toHaveText("📍 Trinquet de la Cavalerie");
    // Le quart, pas encore tiré tant que les poules ne sont pas finies :
    // pastille de phase, étiquette, et au détail ni joueurs ni lien.
    await expect(parties.nth(2).locator(".poule-tag")).toHaveText("1/4");
    await expect(parties.nth(2).locator(".match-tag")).toHaveText("1/4 de finale");
    await parties.nth(2).locator(".match-row").click();
    await expect(parties.nth(2).locator(".roster-line")).toHaveCount(2);
    await expect(parties.nth(2).locator(".roster-noms")).toHaveCount(0);
    await expect(parties.nth(2).locator(".lien-equipe")).toHaveCount(0);
    await expect(parties.nth(2).locator(".match-where")).toHaveText("Série 1 · 1/4 de finale · PARIS (Trinquet Paris - 75016)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("Parties : les joueurs au détail seulement, composition non disponible pour un adversaire à désigner", async ({ page }) => {
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
    // Aucun nom de joueur sur les lignes : ils sont au détail.
    const lignes = await page.locator(".match-row").allTextContents();
    expect(lignes.some((t) => /Joueur\d/.test(t))).toBe(false);
    // Le barrage : sa pastille, et au détail les joueurs d'Alpha seuls.
    const barrageItem = page.locator(".match-item").filter({ has: page.locator(".poule-tag", { hasText: /^Barrage$/ }) });
    await expect(barrageItem).toHaveCount(1);
    // L'équipe à désigner n'a pas de numéro, qui ferait croire à une équipe 1
    // (absente des clubs fictifs, elle s'appelle ici « Club 9998 »).
    await expect(barrageItem.locator(".match-row-teams")).toHaveText(/^Alpha\s1 vs Club\s9998$/);
    await barrageItem.locator(".match-row").click();
    const lignesDetail = barrageItem.locator(".roster-line");
    await expect(lignesDetail.first()).toContainText("Alpha (éq. 1) : Ane Joueur100001, Bixente Joueur100002");
    await expect(lignesDetail.nth(1)).toContainText("composition non disponible");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("Classement : les joueurs au toucher de la ligne de chaque équipe, et le lien vers sa page", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await expect(page.getByRole("button", { name: "Joueurs des équipes" })).toHaveCount(0);
    const alpha = page.locator(".rank-item").filter({ hasText: "Alpha (éq. 1)" }).first();
    await expect(alpha.locator(".rank-joueurs")).toBeHidden();
    await alpha.locator(".rank-row").click();
    await expect(alpha.locator(".rank-joueurs")).toHaveText("Ane Joueur100001, Bixente Joueur100002");
    const voir = alpha.getByRole("link", { name: "Voir l'équipe →" });
    await expect(voir).toHaveAttribute("href", "equipe.html?equipe=" + encodeURIComponent("2|1|" + codeClub(0) + "|1"));
    await voir.click();
    await expect(page.locator(".team-name")).toHaveText("Alpha (éq. 1)");
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
    await page.locator(".rank-row").filter({ hasText: "Alpha 1" }).first().click();
    await page.locator(".rank-row").filter({ hasText: "Bravo 1" }).first().click();
    await expect(ligne("Alpha 1")).toHaveText("Composition non déclarée à la ligue");
    await expect(ligne("Alpha 1")).toHaveClass(/inconnus/);
    await expect(ligne("Bravo 1")).toHaveText("Ane Joueur100003, Bixente Joueur100004");

    await page.goto("programme.html");
    await attendreChargement(page);
    const partieAlpha = page.locator(".match-item").filter({ has: page.locator(".match-row-teams", { hasText: /^Alpha\s1 vs / }) }).first();
    await partieAlpha.locator(".match-row").click();
    await expect(partieAlpha.locator(".roster-line").first()).toContainText("Alpha (éq. 1) : composition non disponible");
    await expect(partieAlpha.locator(".roster-line").nth(1)).toContainText(/ : Ane Joueur\d+, Bixente Joueur\d+/);   // l'adversaire seul
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
    await expect(wa).toHaveAttribute("href", /^https:\/\/api\.whatsapp\.com\/send\?phone=33\d+&text=/);
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

// Spec liste-equipes et mon-equipe : la page Équipes s'ouvre sur toutes les
// équipes, au format du Classement, avec de quoi joindre chaque responsable.
// Données servies par scénario : chaque table peut être retouchée.
function servirTables(page, retouches = {}) {
  return page.route("**/script.google.com/**", (route) => {
    const table = new URL(route.request().url()).searchParams.get("table");
    let data = tables[table] || [];
    if (retouches[table]) data = retouches[table](data);
    route.fulfill({
      status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify({ table, data, lastSync: new Date().toISOString() })
    });
  });
}

// Les appels à l'API émis après le chargement : il n'y en a aucun quand on
// passe de la liste à une équipe.
function compterAppels(page) {
  const appels = { n: 0 };
  page.on("request", (r) => { if (r.url().includes("script.google.com")) appels.n++; });
  return appels;
}

test.describe("Équipes : liste de toutes les équipes", () => {
  const ALPHA = "2|1|3750001|1";
  const carte = (page, n) => page.locator(".liste-equipes .poule-card").nth(n);
  const ligne = (page, nom) => page.locator(".liste-equipes .rank-item").filter({ has: page.locator(".rank-team", { hasText: new RegExp("^" + nom + "$") }) }).first();

  test("l'onglet ouvre la liste : une carte par poule, dans l'ordre du classement", async ({ page }) => {
    await page.goto("equipe.html");
    await attendreChargement(page);
    await expect(page.locator(".liste-equipes .poule-card")).toHaveCount(4);
    await expect(page.locator(".liste-equipes .rank-item")).toHaveCount(24);
    await expect(page.locator(".liste-equipes")).not.toContainText("Equipe à désigner");
    // Plus de liste déroulante.
    await expect(page.locator("#choixEquipe")).toHaveCount(0);
    const premiere = carte(page, 0);
    await expect(premiere.locator(".poule-head")).toContainText("Série 1");
    await expect(premiere.locator(".poule-head")).toContainText("Poule 1");
    // Même ordre que le Classement : Alpha en tête de la poule 1 de la série 1.
    await expect(premiere.locator(".rank-team").first()).toHaveText("Alpha 1");
    await expect(premiere.locator(".rank-row").first()).toHaveClass(/\bor\b/);
    await expect(premiere.locator(".rank-pos").first()).toHaveText("1");
    // Aucun nom de joueur tant qu'on n'a rien touché.
    await expect(page.locator(".liste-equipes")).not.toContainText("Joueur");
    // L'équipe suivie a sa pastille au-dessus de la liste.
    await expect(page.locator(".mes-chip")).toHaveText(["Charlie (éq. 1) · Série 1"]);
  });

  test("nom court sur la ligne, nom officiel et joueurs au toucher", async ({ page }) => {
    await servirAvecClubDeLaTable(page);
    await page.goto("equipe.html");
    await attendreChargement(page);
    const mpba = ligne(page, "MPBA 1");
    const bouton = mpba.locator(".rank-row");
    await expect(bouton).toHaveAttribute("aria-expanded", "false");
    await bouton.click();
    await expect(bouton).toHaveAttribute("aria-expanded", "true");
    const plus = mpba.locator(".rank-plus");
    await expect(plus.locator(".rank-nom")).toHaveText("METRO PELOTE BASQUE ANTONY (éq. 1)");
    await expect(plus.locator(".rank-joueurs")).toContainText("Ane Joueur");
    await expect(plus.getByRole("link", { name: "Voir l'équipe →" })).toBeVisible();
    await bouton.click();
    await expect(bouton).toHaveAttribute("aria-expanded", "false");
    await expect(plus).toBeHidden();
  });

  test("composition non déclarée au dépli", async ({ page }) => {
    await servirTables(page, { engagements: (d) => d.filter((e) => !(e["Numéro club"] === "03-750-002" && e["Catégorie"] === "1")) });
    await page.goto("equipe.html");
    await attendreChargement(page);
    const bravo = carte(page, 0).locator(".rank-item").filter({ hasText: "Bravo" });
    await bravo.locator(".rank-row").click();
    await expect(bravo.locator(".rank-joueurs")).toHaveText("Composition non déclarée à la ligue");
  });

  test("voir une équipe sans recharger, puis Retour ramène à la liste", async ({ page }) => {
    await page.goto("equipe.html");
    await attendreChargement(page);
    const appels = compterAppels(page);
    const alpha = carte(page, 0).locator(".rank-item").first();
    await alpha.locator(".rank-row").click();
    await alpha.getByRole("link", { name: "Voir l'équipe →" }).click();
    await expect(page).toHaveURL(new RegExp("equipe=" + encodeURIComponent(ALPHA).replace(/\|/g, "\\|")));
    await expect(page.locator(".suivre-btn")).toBeVisible();
    await expect(page.locator(".liste-equipes")).toHaveCount(0);
    await page.goBack();
    await expect(page.locator(".liste-equipes .rank-item")).toHaveCount(24);
    await expect(page).toHaveURL(/equipe\.html$/);
    expect(appels.n).toBe(0);
  });

  test("« Aller au contenu » sur une équipe : « ← Toutes les équipes » revient bien à la liste", async ({ page }) => {
    await page.goto("equipe.html");
    await attendreChargement(page);
    const alpha = carte(page, 0).locator(".rank-item").first();
    await alpha.locator(".rank-row").click();
    await alpha.getByRole("link", { name: "Voir l'équipe →" }).click();
    await expect(page.locator(".suivre-btn")).toBeVisible();
    const longueur = await page.evaluate(() => history.length);
    await page.locator("a.aller-contenu").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#contenu")).toBeFocused();
    expect(await page.evaluate(() => history.length)).toBe(longueur);   // pas d'étape ajoutée
    await page.getByRole("link", { name: "← Toutes les équipes" }).click();
    await expect(page.locator(".liste-equipes")).toBeVisible();
    // Retour ne rouvre pas l'équipe : la liste est revenue par l'historique.
    expect(await page.evaluate(() => history.length)).toBe(longueur);
  });

  test("équipes pas encore classées : même ordre qu'au Classement, par nom officiel", async ({ page }) => {
    // Deux clubs dont le nom court ne suit pas l'ordre du nom officiel :
    // PARIS TALDEA (« Taldea ») passe avant PILOTARI au nom officiel, après au nom court.
    const noms = { "Alpha": "PARIS TALDEA", "Bravo": "PILOTARI" };
    await servirTables(page, {
      clubs: (d) => d.map((c) => noms[c["Nom club"]] ? { ...c, "Nom club": noms[c["Nom club"]] } : c),
      rencontres: (d) => d.map((r) => ({ ...r, score_cr: "", score_cv: "" }))
    });
    const ordre = (p) => p.locator(".poule-card").first().locator(".rank-team").allTextContents();
    await page.goto("classement.html");
    await attendreChargement(page);
    const auClassement = (await ordre(page)).map((t) => t.replace(/\s+/g, " ").trim());
    await page.goto("equipe.html");
    await attendreChargement(page);
    const dansLaListe = (await ordre(page.locator(".liste-equipes"))).map((t) => t.replace(/\s+/g, " ").trim());
    expect(auClassement.indexOf("Taldea 1")).toBeLessThan(auClassement.indexOf("PILOTARI 1"));
    expect(dansLaListe).toEqual(auClassement);
  });

  test("« ← Toutes les équipes » depuis un lien partagé", async ({ page }) => {
    await page.goto("equipe.html?equipe=" + encodeURIComponent(ALPHA));
    await attendreChargement(page);
    const appels = compterAppels(page);
    await page.getByRole("link", { name: "← Toutes les équipes" }).click();
    await expect(page.locator(".liste-equipes .rank-item")).toHaveCount(24);
    await expect(page).toHaveURL(/equipe\.html$/);
    expect(appels.n).toBe(0);
  });

  test("la pastille d'une équipe suivie ouvre son équipe, Retour ramène à la liste", async ({ page }) => {
    await page.goto("equipe.html");
    await attendreChargement(page);
    await page.locator(".mes-chip").click();
    await expect(page.locator(".suivre-btn")).toHaveText("★ Suivie");
    await page.goBack();
    await expect(page.locator(".liste-equipes")).toBeVisible();
  });

  test("d'une équipe à l'autre par les pastilles, Retour ramène toujours à la liste", async ({ page }) => {
    await page.addInitScript((cles) => localStorage.setItem("lidfpb_mes_equipes_v1", JSON.stringify(cles)), [EQUIPE_SUIVIE, ALPHA]);
    await page.goto("equipe.html");
    await attendreChargement(page);
    await page.locator(".mes-chip").first().click();
    await page.locator(".mes-chip").nth(1).click();
    await expect(page).toHaveURL(new RegExp("equipe=" + encodeURIComponent(ALPHA).replace(/\|/g, "\\|")));
    await page.getByRole("link", { name: "← Toutes les équipes" }).click();
    await expect(page.locator(".liste-equipes")).toBeVisible();
    await expect(page).toHaveURL(/equipe\.html$/);
    // La liste est revenue par l'historique, sans entrée en trop : Avancer
    // rouvre la dernière équipe vue, et non une page de liste ajoutée.
    await page.goForward();
    await expect(page).toHaveURL(new RegExp("equipe=" + encodeURIComponent(ALPHA).replace(/\|/g, "\\|")));
    await expect(page.locator(".suivre-btn")).toBeVisible();
  });

  test("équipe inconnue ou dernière équipe vue : la liste", async ({ page }) => {
    await page.addInitScript((cle) => localStorage.setItem("lidfpb_equipe_vue_v1", cle), ALPHA);
    await page.goto("equipe.html");
    await attendreChargement(page);
    await expect(page.locator(".liste-equipes")).toBeVisible();
    await expect(page.locator(".suivre-btn")).toHaveCount(0);
    await page.goto("equipe.html?equipe=" + encodeURIComponent("2|1|9999999|1"));
    await attendreChargement(page);
    await expect(page.locator(".liste-equipes")).toBeVisible();
    await expect(page.locator(".banner")).toHaveCount(0);
  });

  test("la page d'une équipe joint son responsable : Appeler, SMS, WhatsApp, sans numéro ni nom", async ({ page }) => {
    await servirTables(page, { engagements: (d) => d.map((e) => e["Numéro club"] === "03-750-002" ? { ...e, "Tél1. Resp.": "" } : e) });
    await page.goto("equipe.html?equipe=" + encodeURIComponent(ALPHA));
    await attendreChargement(page);
    const tete = page.locator(".team-contact");
    await expect(tete.getByRole("link", { name: "Appeler le responsable de Alpha (éq. 1)" })).toHaveAttribute("href", "tel:+33600000100");
    await expect(tete.getByRole("link", { name: "Envoyer un SMS au responsable de Alpha (éq. 1)" })).toHaveAttribute("href", "sms:+33600000100");
    await expect(tete.getByRole("link", { name: "Écrire sur WhatsApp au responsable de Alpha (éq. 1)" })).toHaveAttribute("href", "https://wa.me/33600000100");
    const texte = await page.locator("main").innerText();
    expect(texte).not.toMatch(/06\s?00|0600000|Responsable Alpha/);
    // Bravo n'a pas de numéro : pas de boutons.
    await page.goto("equipe.html?equipe=" + encodeURIComponent("2|1|" + codeClub(1) + "|1"));
    await attendreChargement(page);
    await expect(page.locator(".team-name")).toHaveText("Bravo (éq. 1)");
    await expect(page.locator(".team-contact")).toHaveCount(0);
  });

  test("WhatsApp et SMS vers le responsable, sans numéro ni nom affiché", async ({ page }) => {
    await servirTables(page, { engagements: (d) => d.map((e) => e["Numéro club"] === "03-750-002" ? { ...e, "Tél1. Resp.": "" } : e) });
    await page.goto("equipe.html");
    await attendreChargement(page);
    const alpha = carte(page, 0).locator(".rank-item").first();
    const wa = alpha.getByRole("link", { name: "Écrire sur WhatsApp au responsable de Alpha 1" });
    await expect(wa).toHaveAttribute("href", "https://wa.me/33600000100");
    await expect(wa).toHaveAttribute("target", "_blank");
    await expect(alpha.getByRole("link", { name: "Envoyer un SMS au responsable de Alpha 1" })).toHaveAttribute("href", "sms:+33600000100");
    // Poules en cours : pas de message à envoyer.
    await expect(page.locator(".contact-message")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Message aux équipes/ })).toHaveCount(0);
    // Bravo n'a pas de numéro : aucune icône.
    await expect(carte(page, 0).locator(".rank-item").filter({ hasText: "Bravo" }).locator(".rank-actions a")).toHaveCount(0);
    const texte = await page.locator("main").innerText();
    expect(texte).not.toMatch(/06\s?00|0600000|Responsable Alpha/);
  });
});

// Spec liste-equipes, « Message des phases finales » : poules finies, demies
// désignées, finales à désigner. Dates fixées pour un texte exact : le mardi
// 1er décembre 2026, demies le dimanche 6, finales le dimanche 13.
test.describe("Équipes : message des phases finales", () => {
  function dateDepuis(base, jours) {
    const d = new Date(base);
    d.setDate(d.getDate() + jours);
    return String(d.getDate()).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0") + d.getFullYear();
  }
  const partie = (base, cat, phase, jours, heure, rec, vis) => ({
    oid: "pf" + cat + phase + heure, "Compétition": "20270301", "Spécialité": "2", "Catégorie": cat, "Phase": phase, "Poule": "",
    club_rec: rec, equip_rec: "1", club_vis: vis, equip_vis: "1",
    lieu_renc: "PARIS (Trinquet Paris - 75016)", date_renc: dateDepuis(base, jours), heure_renc: heure, report: "", date_rep: "",
    score_cr: "", score_cv: ""
  });
  // Toutes les poules jouées, plus de quarts ; quatre demies et deux finales.
  // Alpha devient « PARIS EUSKAL PILOTA » ; sa première joueuse de série 2 a
  // un nom composé, en capitales comme à la ligue.
  function finDePoules(page, base) {
    const lic = tables.engagements.find((e) => e["Numéro club"] === "03-750-001" && e["Catégorie"] === "2")["Licence&nbsp;1"];
    return servirTables(page, {
      clubs: (d) => d.map((c, i) => i === 0 ? { ...c, "Nom club": "PARIS EUSKAL PILOTA" } : c),
      licencies: (d) => d.map((l) => l.Licence === lic ? { ...l, prenom: "MAITE", nom: "BIDART-ELIZALDE" } : l),
      rencontres: (d) => d.filter((r) => r.Phase === "1")
        .map((r) => r.score_cr ? r : { ...r, score_cr: "40", score_cv: "20" })
        .concat([
          partie(base, "2", "11", 5, "1400", codeClub(0), codeClub(1)),
          partie(base, "2", "11", 5, "1500", codeClub(2), codeClub(3)),
          partie(base, "1", "11", 5, "1600", codeClub(4), codeClub(8)),
          partie(base, "1", "11", 5, "1700", codeClub(5), codeClub(9)),
          partie(base, "2", "12", 12, "1600", "9998", "9998"),
          partie(base, "1", "12", 12, "1700", "9998", "9998")
        ])
    });
  }
  // Les joueurs d'une équipe, tels que le message les écrit.
  function joueurs(i, cat) {
    const e = tables.engagements.find((x) => x["Numéro club"] === "03-750-" + String(i + 1).padStart(3, "0") && x["Catégorie"] === cat);
    return [e["Licence&nbsp;1"], e["Licence&nbsp;2"]].map((l, k) => {
      if (i === 0 && cat === "2" && k === 0) return "Maite Bidart-Elizalde";
      const p = tables.licencies.find((x) => x.Licence === l);
      return p.prenom + " " + p.nom;
    }).join(" & ");
  }
  const MARDI = new Date(2026, 11, 1, 10, 0);
  const attendu = (avecAvis) => [
    "🙏 *Merci à toutes et à tous pour ce championnat d'Île-de-France de Trinquet Pala Gomme Pleine !*",
    "",
    "La saison touche à sa fin et il reste deux rendez-vous à ne pas manquer. Venez nombreux encourager les équipes 👏",
    "",
    "🏟️ *1/2 finales, dimanche 6 décembre*",
    "",
    "*14h · Série 2*",
    "PEP 1 (" + joueurs(0, "2") + ")",
    "vs Bravo 1 (" + joueurs(1, "2") + ")",
    "",
    "*15h · Série 2*",
    "Charlie 1 (" + joueurs(2, "2") + ")",
    "vs Delta 1 (" + joueurs(3, "2") + ")",
    "",
    "*16h · Série 1*",
    "Echo 1 (" + joueurs(4, "1") + ")",
    "vs India 1 (" + joueurs(8, "1") + ")",
    "",
    "*17h · Série 1*",
    "Foxtrot 1 (" + joueurs(5, "1") + ")",
    "vs Juliet 1 (" + joueurs(9, "1") + ")",
    "",
    "🏆 *Finales, dimanche 13 décembre*",
    "• 16h : finale Série 2",
    "• 17h : finale Série 1",
    "",
    "📍 Trinquet Paris (75016)",
    "",
    ...(avecAvis ? [
      "💬 *Votre avis compte* : 2 minutes pour préparer la prochaine saison",
      "https://forms.gle/8z2xRRQsG6ahpDm58",
      ""
    ] : []),
    "📱 *Résultats, classements et parties sur téléphone* (site non officiel, en bêta, en complément de celui de la ligue) :",
    "http://127.0.0.1:8123/decouvrir.html",
    "",
    "À très vite au bord du trinquet ! 💪"
  ].join("\n");

  test("le bouton déplie le message construit, prêt à partager", async ({ page }) => {
    await page.clock.setFixedTime(MARDI);
    await page.addInitScript(() => {
      navigator.share = (donnees) => { window.__partage = donnees; return Promise.resolve(); };
    });
    await finDePoules(page, MARDI);
    await page.goto("equipe.html?orga");
    await attendreChargement(page);

    const bloc = page.locator(".message-equipes");
    await expect(bloc).toContainText("dim. 6 déc.");
    const bouton = bloc.getByRole("button", { name: /Message aux équipes/ });
    await expect(bouton).toHaveAttribute("aria-expanded", "false");
    await expect(bloc.locator(".message-apercu")).toBeHidden();
    await bouton.click();
    await expect(bouton).toHaveAttribute("aria-expanded", "true");
    const texte = await bloc.locator(".message-apercu").textContent();
    expect(texte).toBe(attendu(true));
    // Ni numéro ni nom de responsable dans le message.
    expect(texte).not.toMatch(/Responsable|0600000|06 00/);

    await bloc.getByRole("button", { name: "Partager" }).click();
    expect(await page.evaluate(() => window.__partage.text)).toBe(attendu(true));
  });

  test("chaque ligne envoie le message à son responsable sur WhatsApp", async ({ page }) => {
    await page.clock.setFixedTime(MARDI);
    await finDePoules(page, MARDI);
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    const pep = page.locator(".liste-equipes .rank-item").filter({ has: page.locator(".rank-team", { hasText: /^PEP\s1$/ }) }).first();
    const envoi = pep.getByRole("link", { name: "Envoyer « Phases finales » au responsable de PEP 1" });
    // api.whatsapp.com et non wa.me, dont la redirection perd les emojis sur
    // ordinateur.
    await expect(envoi).toHaveAttribute("href", "https://api.whatsapp.com/send?phone=33600000100&text=" + encodeURIComponent(attendu(true)));
    await expect(envoi).toHaveAttribute("target", "_blank");
    await expect(page.locator(".contact-message:visible")).toHaveCount(24);
    // Rien n'est déplié : aucun joueur à l'écran.
    await expect(page.locator(".liste-equipes")).not.toContainText("Joueur");
  });

  test("campagne d'avis finie : plus de lien du questionnaire, le site reste", async ({ page }) => {
    const JANVIER = new Date(2027, 0, 5, 10, 0);
    await page.clock.setFixedTime(JANVIER);
    await finDePoules(page, JANVIER);
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    const bloc = page.locator(".message-equipes");
    await bloc.getByRole("button", { name: /Message aux équipes/ }).click();
    const texte = await bloc.locator(".message-apercu").textContent();
    expect(texte).not.toContain("forms.gle");
    expect(texte).toContain("http://127.0.0.1:8123/decouvrir.html");
    expect(texte).toContain("*1/2 finales, dimanche 10 janvier*");
  });

  test("un seul en-tête par phase et par jour, même quand les séries s'entrecroisent", async ({ page }) => {
    await page.clock.setFixedTime(MARDI);
    await servirTables(page, {
      rencontres: (d) => d.filter((r) => r.Phase === "1")
        .map((r) => r.score_cr ? r : { ...r, score_cr: "40", score_cv: "20" })
        .concat([
          partie(MARDI, "2", "11", 5, "1000", codeClub(0), codeClub(1)),
          partie(MARDI, "1", "12", 5, "1200", "9998", "9998"),
          partie(MARDI, "2", "11", 5, "1400", codeClub(2), codeClub(3))
        ])
    });
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    const bloc = page.locator(".message-equipes");
    await bloc.getByRole("button", { name: /Message aux équipes/ }).click();
    const texte = await bloc.locator(".message-apercu").textContent();
    expect(texte.match(/\*1\/2 finales, dimanche 6 décembre\*/g)).toHaveLength(1);
    expect(texte.indexOf("*10h · Série 2*")).toBeLessThan(texte.indexOf("*14h · Série 2*"));
    expect(texte.indexOf("*14h · Série 2*")).toBeLessThan(texte.indexOf("*Finales, dimanche 6 décembre*"));
    expect(texte).toContain("il reste un dernier rendez-vous");
    // Le message reste ouvert quand la liste est redessinée (Rafraîchir).
    await page.locator("#refreshBtn").click();
    await attendreChargement(page);
    await expect(bloc.locator(".message-apercu")).toBeVisible();
  });

  test("saison finie : ni bouton ni icône d'envoi", async ({ page }) => {
    const APRES = new Date(2026, 11, 20, 10, 0);
    await page.clock.setFixedTime(APRES);
    await finDePoules(page, MARDI);
    await page.goto("equipe.html");
    await attendreChargement(page);
    await expect(page.locator(".liste-equipes .rank-item")).toHaveCount(24);
    await expect(page.locator(".message-equipes")).toHaveCount(0);
    await expect(page.locator(".contact-message")).toHaveCount(0);
    // En organisateur, « Phases finales » n'est plus proposée.
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    await expect(page.locator(".communication-choix button")).not.toContainText(["Phases finales"]);
  });

  test("sans orga, poules finies : ni bloc ni avion en papier, WhatsApp et SMS restent", async ({ page }) => {
    await page.clock.setFixedTime(MARDI);
    await finDePoules(page, MARDI);
    await page.goto("equipe.html");
    await attendreChargement(page);
    await expect(page.locator(".message-equipes")).toHaveCount(0);
    await expect(page.locator(".contact-message")).toHaveCount(0);
    await expect(page.locator(".liste-equipes .contact-btn.wa")).toHaveCount(24);
    await expect(page.locator(".liste-equipes .contact-btn.sms")).toHaveCount(24);
  });

  test("en organisateur, poules finies : « Phases finales » est choisie", async ({ page }) => {
    await page.clock.setFixedTime(MARDI);
    await finDePoules(page, MARDI);
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    const choix = page.locator(".communication-choix button");
    await expect(choix).toHaveText(["Phases finales", "Prochaine partie", "Perso"]);
    await expect(choix.first()).toHaveAttribute("aria-pressed", "true");
  });
});

// Spec communications-equipes : en organisateur, choisir la communication que
// l'avion en papier envoie. Données fictives ordinaires (poules en cours) :
// Charlie 1 reçoit Foxtrot 1 à 19h30 dans quelques jours.
test.describe("Équipes : communications de l'organisateur", () => {
  const CHARLIE = "2|1|3750003|1";
  // Alpha 1 (série 1) n'a plus de partie à venir.
  const sansPartieAlpha = (d) => d.filter((r) => !(r["Catégorie"] === "1" && !r.score_cr && (r.club_rec === codeClub(0) || r.club_vis === codeClub(0))));
  const ligne = (page, nom) => page.locator(".liste-equipes .poule-card").first().locator(".rank-item").filter({ has: page.locator(".rank-team", { hasText: new RegExp("^" + nom + "\\s1$") }) });
  const parse = (s) => new Date(+s.slice(-4), +s.slice(-6, -4) - 1, +s.slice(0, -6));
  const partieDeCharlie = () => tables.rencontres.find((x) => x["Catégorie"] === "1" && !x.score_cr && x.club_rec === codeClub(2) && x.club_vis === codeClub(5));
  function prochaineDeCharlie(annee) {
    return parse(partieDeCharlie().date_renc).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", ...(annee ? { year: "numeric" } : {}) });
  }
  // Les jours des quarts de la série 1, comme Parties les rappelait.
  function joursDesQuarts() {
    const jours = [];
    for (const r of tables.rencontres) {
      if (r["Catégorie"] !== "1" || r.Phase !== "10") continue;
      const d = parse(r.date_renc);
      const j = d.toLocaleDateString("fr-FR", { weekday: "long" }).slice(0, 3) + ". " + d.getDate() + "/" + (d.getMonth() + 1);
      if (!jours.includes(j)) jours.push(j);
    }
    return jours.join(" et ");
  }
  function joueurs(i, cat) {
    const e = tables.engagements.find((x) => x["Numéro club"] === "03-750-" + String(i + 1).padStart(3, "0") && x["Catégorie"] === cat);
    return [e["Licence&nbsp;1"], e["Licence&nbsp;2"]].map((l) => {
      const p = tables.licencies.find((x) => x.Licence === l);
      return p.prenom + " " + p.nom;
    }).join(" & ");
  }
  // Le message qu'envoyait Parties, adressé au responsable de Charlie 1.
  const prochaine = (tel) => [
    "Bonjour Responsable,",
    "",
    "Votre partie",
    "Charlie (éq. 1) vs Foxtrot (éq. 1)",
    "est prévue le *" + prochaineDeCharlie(true) + " à 19h30*",
    "à PARIS (Trinquet Paris - 75016).",
    "",
    "Tout est bon de votre côté ?",
    "",
    "Responsable adverse : Responsable Foxtrot (" + tel + ").",
    "",
    "Noter qu'il n'est pas possible de reporter les phases finales.",
    "1/4 : " + joursDesQuarts() + ".",
    "",
    "_Championnat 2026-2027, Trinquet / P.G Pleine Masculin, Série 1 - Poule " + partieDeCharlie().Poule + "_",
    "",
    "Merci."
  ].join("\n");

  test("poules en cours : « Prochaine partie » choisie, remplie pour chaque équipe", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.share = (donnees) => { window.__partage = donnees; return Promise.resolve(); };
    });
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    const choix = page.locator(".communication-choix button");
    await expect(choix).toHaveText(["Prochaine partie", "Perso"]);
    await expect(choix.first()).toHaveAttribute("aria-pressed", "true");

    // L'avion en papier de Charlie 1 envoie sa prochaine partie, numéro entier.
    const envoi = ligne(page, "Charlie").getByRole("link", { name: "Envoyer « Prochaine partie » au responsable de Charlie 1" });
    await expect(envoi).toHaveAttribute("href", "https://api.whatsapp.com/send?phone=33600000102&text=" + encodeURIComponent(prochaine("06 00 00 01 05")));

    // Aperçu pour Charlie 1 : le numéro adverse masqué, sauf ses deux derniers chiffres.
    const bloc = page.locator(".message-equipes");
    await bloc.getByRole("button", { name: /Message aux équipes/ }).click();
    await bloc.getByLabel("Aperçu pour").selectOption({ label: "Charlie 1 · Série 1" });
    await expect(bloc.locator(".message-apercu")).toHaveText(prochaine("06\u00a0••\u00a0••\u00a0••\u00a005"));
    const texte = await page.locator("main").innerText();
    expect(texte).not.toMatch(/06 00 00 01 05|0600000105/);
    // Partager envoie le texte entier.
    await bloc.getByRole("button", { name: "Partager" }).click();
    expect(await page.evaluate(() => window.__partage.text)).toBe(prochaine("06 00 00 01 05"));
  });

  test("une équipe sans partie à venir n'a pas d'avion en papier", async ({ page }) => {
    await servirTables(page, { rencontres: sansPartieAlpha });
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    const alpha = ligne(page, "Alpha");
    await expect(alpha.locator(".contact-message")).toBeHidden();
    await expect(alpha.locator(".contact-btn.wa")).toBeVisible();
    await expect(ligne(page, "Bravo").locator(".contact-message")).toBeVisible();
    // Changer de communication met les avions à jour : « Perso » va à tous.
    await page.locator(".communication-choix").getByRole("button", { name: "Perso" }).click();
    await expect(alpha.getByRole("link", { name: "Envoyer « Perso » au responsable de Alpha 1" })).toBeVisible();
  });

  test("« Perso » : balises, ligne vide supprimée, balise inconnue, texte gardé", async ({ page }) => {
    await servirTables(page, { rencontres: sansPartieAlpha });
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    const bloc = page.locator(".message-equipes");
    await bloc.locator(".communication-choix").getByRole("button", { name: "Perso" }).click();
    await bloc.getByRole("button", { name: /Message aux équipes/ }).click();
    const champ = bloc.getByLabel("Texte du message");
    // 16 px : sous cette taille, iOS zoome sur le champ touché.
    expect(await champ.evaluate((e) => getComputedStyle(e).fontSize)).toBe("16px");
    await champ.fill("Salut {responsable} !\nContre {adversaire} le {date}\nVu {capitaine}\nFin");
    // Une balise insérée au curseur, en fin de texte.
    await champ.evaluate((e) => e.setSelectionRange(e.value.length, e.value.length));
    await bloc.getByRole("button", { name: "{equipe}" }).click();
    await expect(champ).toHaveValue("Salut {responsable} !\nContre {adversaire} le {date}\nVu {capitaine}\nFin{equipe}");
    await expect(bloc).toContainText("Balise inconnue : {capitaine}");

    // Alpha 1 n'a plus de partie : la ligne « Contre … » disparaît.
    await bloc.getByLabel("Aperçu pour").selectOption({ label: "Alpha 1 · Série 1" });
    await expect(bloc.locator(".message-apercu")).toHaveText("Salut Responsable !\nVu {capitaine}\nFinAlpha 1");
    const envoi = ligne(page, "Charlie").getByRole("link", { name: "Envoyer « Perso » au responsable de Charlie 1" });
    await expect(envoi).toHaveAttribute("href", "https://api.whatsapp.com/send?phone=33600000102&text=" +
      encodeURIComponent("Salut Responsable !\nContre Foxtrot 1 le " + prochaineDeCharlie() + "\nVu {capitaine}\nFinCharlie 1"));

    // Le texte revient à la visite suivante, puis « Rétablir l'exemple ».
    await page.reload();
    await attendreChargement(page);
    await bloc.locator(".communication-choix").getByRole("button", { name: "Perso" }).click();
    await bloc.getByRole("button", { name: /Message aux équipes/ }).click();
    await expect(bloc.getByLabel("Texte du message")).toHaveValue(/^Salut \{responsable\}/);
    await bloc.getByRole("button", { name: "Rétablir l'exemple" }).click();
    await expect(bloc.getByLabel("Texte du message")).toHaveValue(/^Bonjour \{responsable\},/);
    expect(await page.evaluate(() => localStorage.getItem("lidfpb_message_perso_v1"))).toBeNull();
    // L'exemple, pour Alpha 1 qui n'a plus de partie : aucune ligne ne parle
    // d'une partie qui n'existe pas.
    await bloc.getByLabel("Aperçu pour").selectOption({ label: "Alpha 1 · Série 1" });
    await expect(bloc.locator(".message-apercu")).toHaveText(/^Bonjour Responsable,\n\nRésultats et classements : http\S+\n\nMerci\.$/);
    // Pour Charlie 1, la partie en noms courts des deux côtés.
    await bloc.getByLabel("Aperçu pour").selectOption({ label: "Charlie 1 · Série 1" });
    await expect(bloc.locator(".message-apercu")).toContainText("Votre prochaine partie : Charlie 1 vs Foxtrot 1");
    await expect(bloc.locator(".message-apercu")).toContainText("Tout est bon de votre côté pour le ");
  });

  test("« Perso » sans stockage : la page fonctionne pour la visite", async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function (k) { if (k === "lidfpb_message_perso_v1") throw new Error("refusé"); return get.call(this, k); };
      Storage.prototype.setItem = function (k, v) { if (k === "lidfpb_message_perso_v1") throw new Error("refusé"); return set.call(this, k, v); };
    });
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    const bloc = page.locator(".message-equipes");
    await bloc.locator(".communication-choix").getByRole("button", { name: "Perso" }).click();
    await bloc.getByRole("button", { name: /Message aux équipes/ }).click();
    await bloc.getByLabel("Texte du message").fill("Coucou {equipe}");
    await bloc.getByLabel("Aperçu pour").selectOption({ label: "Charlie 1 · Série 1" });
    await expect(bloc.locator(".message-apercu")).toHaveText("Coucou Charlie 1");
  });

  test("« Perso » vidé reste vide, et un rafraîchissement garde le curseur", async ({ page }) => {
    // Au second appel, la ligue publie une partie de moins : la liste est redessinée.
    let publie = 0;
    await servirTables(page, { rencontres: (d) => (publie++ ? d.slice(0, -1) : d) });
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    const bloc = page.locator(".message-equipes");
    await bloc.locator(".communication-choix").getByRole("button", { name: "Perso" }).click();
    await bloc.getByRole("button", { name: /Message aux équipes/ }).click();
    const champ = bloc.getByLabel("Texte du message");
    await champ.fill("Bonjour");
    await champ.evaluate((e) => e.setSelectionRange(3, 3));
    // Rafraîchissement sans quitter le champ, comme celui qui suit le cache.
    const avant = publie;
    await page.evaluate(() => document.getElementById("refreshBtn").click());
    await expect.poll(() => publie).toBeGreaterThan(avant);
    await attendreChargement(page);
    await expect(champ).toBeFocused();
    await page.keyboard.type("X");
    await expect(champ).toHaveValue("BonXjour");

    await champ.fill("");
    await page.reload();
    await attendreChargement(page);
    await bloc.locator(".communication-choix").getByRole("button", { name: "Perso" }).click();
    await bloc.getByRole("button", { name: /Message aux équipes/ }).click();
    await expect(bloc.getByLabel("Texte du message")).toHaveValue("");
  });

  test("Parties en organisateur : l'avion en papier envoie le même message que « Prochaine partie »", async ({ page }) => {
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    const surEquipes = await ligne(page, "Charlie").getByRole("link", { name: "Envoyer « Prochaine partie » au responsable de Charlie 1" }).getAttribute("href");
    // Le mode est gardé : Parties le reprend, sans « orga » dans l'adresse.
    await page.goto("programme.html");
    await attendreChargement(page);
    const item = page.locator(".match-item.serie-1").filter({ hasText: "Charlie 1 vs Foxtrot 1" });
    await expect(item).toHaveCount(1);
    await item.locator(".match-row").click();
    const envoi = item.getByRole("link", { name: "Envoyer le message de la partie au responsable de Charlie 1" });
    await expect(envoi).toHaveAttribute("href", surEquipes);
    expect(new URL(surEquipes).searchParams.get("text")).toBe(prochaine("06 00 00 01 05"));
    // WhatsApp et SMS restent vierges.
    await expect(item.getByRole("link", { name: "Écrire sur WhatsApp au responsable de Charlie 1" })).toHaveAttribute("href", "https://wa.me/33600000102");
    await expect(item.getByRole("link", { name: "Envoyer un SMS au responsable de Charlie 1" })).toHaveAttribute("href", "sms:+33600000102");
    // Une partie jouée : pas d'avion en papier.
    const jouee = page.locator(".match-item").filter({ has: page.locator(".match-row-score") }).first();
    await jouee.locator(".match-row").click();
    await expect(jouee.locator("a.icon-whatsapp").first()).toBeVisible();
    await expect(jouee.locator("a.icon-envoi")).toHaveCount(0);
    // Une partie passée dont le score n'est pas publié n'est plus « prévue » :
    // pas d'avion en papier non plus.
    const passee = page.locator(".match-item.serie-1").filter({ hasText: "Alpha 1 vs Echo 1" });
    await expect(passee).toHaveCount(1);
    await expect(passee.locator(".match-row-score")).toHaveCount(0);
    await passee.locator(".match-row").click();
    await expect(passee.locator("a.icon-whatsapp").first()).toBeVisible();
    await expect(passee.locator("a.icon-envoi")).toHaveCount(0);
    // Quitter depuis Parties vaut aussi pour la page Équipes.
    await page.getByRole("button", { name: "Quitter le mode organisateur" }).click();
    await attendreChargement(page);
    await expect(page.getByRole("link", { name: "Mode organisateur" })).toBeVisible();
    await page.goto("equipe.html");
    await attendreChargement(page);
    await expect(page.locator(".message-equipes")).toHaveCount(0);
  });

  test("le pied de page ouvre le mode organisateur, gardé d'une visite à l'autre, et le quitte", async ({ page }) => {
    await page.goto("equipe.html");
    await attendreChargement(page);
    await expect(page.locator(".message-equipes")).toHaveCount(0);
    await page.getByRole("link", { name: "Mode organisateur" }).click();
    await attendreChargement(page);
    await expect(page.locator(".message-equipes")).toBeVisible();
    // Gardé : « orga » quitte l'adresse, un lien copié n'y emmène pas un joueur.
    await expect(page).toHaveURL(/equipe\.html$/);
    await page.goto("equipe.html?equipe=" + encodeURIComponent(CHARLIE));
    await attendreChargement(page);
    await page.getByRole("link", { name: "← Toutes les équipes" }).click();
    await expect(page.locator(".message-equipes")).toBeVisible();
    const charlie = ligne(page, "Charlie");
    await charlie.locator(".rank-row").click();
    await expect(charlie.getByRole("link", { name: "Voir l'équipe →" })).toHaveAttribute("href", "equipe.html?equipe=" + encodeURIComponent(CHARLIE));
    // Quitter : retour à la page des joueurs, et pour la visite suivante aussi.
    await page.getByRole("button", { name: "Quitter le mode organisateur" }).click();
    await expect(page.getByRole("link", { name: "Mode organisateur" })).toBeVisible();
    await attendreChargement(page);
    await expect(page.locator(".message-equipes")).toHaveCount(0);
    await page.reload();
    await attendreChargement(page);
    await expect(page.locator(".message-equipes")).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("lidfpb_orga_v1"))).toBeNull();
  });

  test("stockage refusé : orga reste dans l'adresse, de la liste à une équipe et retour", async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function (k) { if (k === "lidfpb_orga_v1") throw new Error("refusé"); return get.call(this, k); };
      Storage.prototype.setItem = function (k, v) { if (k === "lidfpb_orga_v1") throw new Error("refusé"); return set.call(this, k, v); };
    });
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    const charlie = ligne(page, "Charlie");
    await charlie.locator(".rank-row").click();
    const voir = charlie.getByRole("link", { name: "Voir l'équipe →" });
    await expect(voir).toHaveAttribute("href", "equipe.html?equipe=" + encodeURIComponent(CHARLIE) + "&orga");
    await voir.click();
    await expect(page).toHaveURL(/\?equipe=[^&]+&orga$/);
    await expect(page.getByRole("link", { name: "← Toutes les équipes" })).toHaveAttribute("href", "equipe.html?orga");
    await page.getByRole("link", { name: "← Toutes les équipes" }).click();
    await expect(page).toHaveURL(/equipe\.html\?orga$/);
    await expect(page.locator(".message-equipes")).toBeVisible();
    // Par la pastille d'une équipe suivie aussi.
    await page.locator(".mes-chips .mes-chip").click();
    await expect(page).toHaveURL(/&orga$/);
  });

  test("stockage refusé : depuis Parties, le nom d'une équipe garde le mode organisateur", async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function (k) { if (k === "lidfpb_orga_v1") throw new Error("refusé"); return get.call(this, k); };
      Storage.prototype.setItem = function (k, v) { if (k === "lidfpb_orga_v1") throw new Error("refusé"); return set.call(this, k, v); };
    });
    await page.goto("programme.html?orga");
    await attendreChargement(page);
    const item = page.locator(".match-item.serie-1").filter({ hasText: "Charlie 1 vs Foxtrot 1" });
    await item.locator(".match-row").click();
    const lien = item.locator(".lien-equipe").first();
    await expect(lien).toHaveAttribute("href", "equipe.html?equipe=" + encodeURIComponent(CHARLIE) + "&orga");
    await lien.click();
    await attendreChargement(page);
    await expect(page.locator(".team-name")).toHaveText("Charlie (éq. 1)");
    await expect(page.getByRole("button", { name: "Quitter le mode organisateur" })).toBeVisible();
  });

  test("« Mode organisateur » depuis la page d'une équipe y reste", async ({ page }) => {
    await page.goto("equipe.html?equipe=" + encodeURIComponent(CHARLIE));
    await attendreChargement(page);
    await page.getByRole("link", { name: "Mode organisateur" }).click();
    await attendreChargement(page);
    await expect(page.locator(".team-name")).toHaveText("Charlie (éq. 1)");
    await expect(page.getByRole("button", { name: "Quitter le mode organisateur" })).toBeVisible();
    // Gardé : « orga » quitte l'adresse, l'équipe y reste.
    await expect(page).toHaveURL(new RegExp("equipe\\.html\\?equipe=" + encodeURIComponent(CHARLIE).replace(/\|/g, "\\|") + "$"));
  });
});

// Spec liste-equipes, « Filtres de la liste » et « Communications limitées
// aux équipes affichées » : le bloc Filtres du Classement, sur la liste.
test.describe("Équipes : filtres de la liste", () => {
  const cartes = (page) => page.locator(".liste-equipes .poule-card");
  const serie = (page, n) => page.locator(`#filterSeries .filter-chip[data-serie='${n}']`);
  // La série 1 recopiée dans une deuxième spécialité.
  const deuxSpecialites = (d) => d.concat(d.filter((r) => r["Catégorie"] === "1").map((r) => ({ ...r, oid: "s3-" + r.oid, "Spécialité": "3" })));

  test("série 1 masquée : seules les cartes de série 2 restent, choix retrouvé", async ({ page }) => {
    await page.goto("equipe.html");
    await attendreChargement(page);
    await expect(cartes(page)).toHaveCount(4);
    const rangsAvant = await cartes(page).nth(2).locator(".rank-team").allTextContents();
    await page.locator("#filtersToggle").click();
    await serie(page, 1).click();
    await expect(cartes(page)).toHaveCount(2);
    await expect(cartes(page).locator(".badge")).toHaveText(["Série 2", "Série 2"]);
    expect(await cartes(page).first().locator(".rank-team").allTextContents()).toEqual(rangsAvant);
    await page.locator("#filtersToggle").click();
    await expect(page.locator(".filters-recap")).toHaveText("Série 2");
    await page.reload();
    await attendreChargement(page);
    await expect(cartes(page)).toHaveCount(2);
  });

  test("aucune série : le message, et pas de bloc sur la page d'une équipe", async ({ page }) => {
    await page.goto("equipe.html");
    await attendreChargement(page);
    await page.locator("#filtersToggle").click();
    await serie(page, 1).click();
    await serie(page, 2).click();
    await expect(cartes(page)).toHaveCount(0);
    await expect(page.locator("#results")).toContainText("Aucune équipe ne correspond aux filtres.");
    await page.goto("equipe.html?equipe=" + encodeURIComponent(EQUIPE_SUIVIE));
    await attendreChargement(page);
    await expect(page.locator(".recap-card")).toBeHidden();
  });

  test("le pli du bloc est partagé avec le Classement", async ({ page }) => {
    await page.goto("classement.html");
    await attendreChargement(page);
    await page.locator("#filtersToggle").click();
    await page.goto("equipe.html");
    await attendreChargement(page);
    await expect(page.locator("#filtersToggle")).toHaveAttribute("aria-expanded", "true");
  });

  test("deux spécialités : nommées sur les cartes et dans l'aperçu ; une seule : rien", async ({ page }) => {
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    await expect(page.locator(".liste-equipes .poule-head .poule-sub")).toHaveCount(0);

    await servirTables(page, { rencontres: deuxSpecialites });
    await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("lidfpb_api_v1:")).forEach((k) => localStorage.removeItem(k)));
    await page.reload();
    await attendreChargement(page);
    await expect(cartes(page)).toHaveCount(6);
    await expect(page.locator("#filterSpecs .filter-chip")).toHaveText(["Trinquet / P.G Pleine Masculin", "Spécialité 3"]);
    await expect(cartes(page).first().locator(".poule-sub")).toHaveText("Trinquet / P.G Pleine Masculin");
    await expect(cartes(page).last().locator(".poule-sub")).toHaveText("Spécialité 3");
    const bloc = page.locator(".message-equipes");
    await bloc.getByRole("button", { name: /Message aux équipes/ }).click();
    await expect(bloc.locator("#apercu-equipe option", { hasText: "Spécialité 3" }).first()).toBeAttached();
    // La spécialité masquée sort de la liste.
    await page.locator("#filtersToggle").click();
    await page.locator("#filterSpecs .filter-chip", { hasText: "Spécialité 3" }).click();
    await expect(cartes(page)).toHaveCount(4);
    await expect(bloc.locator("#apercu-equipe option", { hasText: "Spécialité 3" })).toHaveCount(0);
  });

  test("organisateur, série 1 masquée : la communication ne vise que la série 2", async ({ page }) => {
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    await expect(page.locator(".contact-message:visible")).toHaveCount(24);
    await page.locator("#filtersToggle").click();
    await serie(page, 1).click();
    await expect(page.locator(".contact-message:visible")).toHaveCount(12);
    const bloc = page.locator(".message-equipes");
    await expect(bloc).toContainText("12 équipes ont une partie à venir");
    await bloc.getByRole("button", { name: /Message aux équipes/ }).click();
    const options = await bloc.locator("#apercu-equipe option").allTextContents();
    expect(options).toHaveLength(12);
    expect(options.every((o) => o.includes("Série 2"))).toBe(true);
  });

  test("organisateur, aucune équipe affichée : pas de partage d'un message vide", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("lidfpb_equipes_filters_v1", JSON.stringify({ specs: "abîmé", series: { "1": false, "2": false } })));
    await page.goto("equipe.html?orga");
    await attendreChargement(page);
    // L'état abîmé (spécialités) est ignoré, les séries sont reprises.
    await expect(page.locator("#filterSpecs .filter-chip.active")).toHaveCount(1);
    const bloc = page.locator(".message-equipes");
    await expect(bloc).toContainText("Aucune équipe affichée n'a de partie à venir");
    await bloc.getByRole("button", { name: /Message aux équipes/ }).click();
    await expect(bloc.locator(".message-apercu")).toHaveText("Aucune équipe affichée n'est concernée.");
    await expect(bloc.getByRole("button", { name: /Partager|Copier/ })).toHaveCount(0);
  });
});

test.describe("Thème choisi sur le site", () => {
  const PAGES_THEME = ["index", "equipe", "programme", "classement", "creneaux", "report", "compteur", "decouvrir", "404"];
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
    expect(await variablesSombres(["index", "equipe", "programme", "classement", "creneaux", "report", "compteur"]),
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
