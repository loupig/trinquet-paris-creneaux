// Tests « fumée » : chaque page s'ouvre sur des données fictives, sans erreur
// JavaScript ni bandeau d'échec, et affiche l'essentiel. Plus un scénario
// complet pour la prévision des quarts et le simulateur du Classement.
import { readFile } from "node:fs/promises";
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
  { nom: "Mes équipes", url: "equipe.html?equipe=" + encodeURIComponent(EQUIPE_SUIVIE), contenu: "#results" },
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

// Spec navigation : à 390 px, chaque libellé de la barre d'onglets tient sur
// une ligne et dans son onglet, sans défilement horizontal.
test.describe("Barre d'onglets à 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 } });
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
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
});

// Au clavier, le premier arrêt est le lien d'évitement, visible et entouré
// d'un contour ; il mène au contenu.
for (const p of [...PAGES, { nom: "Compteur", url: "compteur.html" }]) {
  test(`${p.nom} : focus visible au clavier, lien d'évitement`, async ({ page }) => {
    await page.goto(p.url);
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
  });
}

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
    // À un point du but : « Nobia », et le score chanté en basque.
    await expect(bera).toContainText("Nobia");
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

  test("le kantari annonce le score, en basque ou en français", async ({ page }) => {
    await page.addInitScript(() => {
      window.__dit = [];
      Object.defineProperty(window, "speechSynthesis", { value: {
        speak: (u) => window.__dit.push({ texte: u.text, langue: u.lang }),
        cancel: () => {},
        getVoices: () => [{ lang: "es-ES", name: "Espagnol" }, { lang: "fr-FR", name: "Français" }],
        addEventListener: () => {}
      } });
    });
    await page.goto("compteur.html");
    await page.locator(".team-name").nth(0).fill("Bera");
    await page.locator("#voix").getByRole("button", { name: "Euskara" }).click();
    const bera = page.locator(".score-btn").nth(0);
    await bera.click();
    let dit = await page.evaluate(() => window.__dit.at(-1));
    // Sans voix basque, une voix espagnole lit les nombres en basque.
    expect(dit).toEqual({ texte: "bat, zero.", langue: "es-ES" });

    await page.locator("#setupBox > summary").click();
    await page.locator("#voix").getByRole("button", { name: "Français" }).click();
    await bera.click();
    dit = await page.evaluate(() => window.__dit.at(-1));
    expect(dit).toEqual({ texte: "2, 0.", langue: "fr-FR" });

    await page.getByRole("button", { name: "Annuler le dernier point" }).click();
    dit = await page.evaluate(() => window.__dit.at(-1));
    expect(dit.texte).toBe("Point annulé. 1, 0.");

    // Le score de l'équipe qui mène est annoncé en premier.
    const ahetze = page.locator(".score-btn").nth(1);
    await ahetze.click();
    await ahetze.click();
    dit = await page.evaluate(() => window.__dit.at(-1));
    expect(dit.texte).toBe("2, 1.");

    // Couper l'annonce : plus rien n'est dit.
    await page.locator("#voix").getByRole("button", { name: "Non" }).click();
    const avant = await page.evaluate(() => window.__dit.length);
    await bera.click();
    expect(await page.evaluate(() => window.__dit.length)).toBe(avant);
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
      const bloc = html.match(/@media \(prefers-color-scheme: dark\) \{\s*:root \{([^}]*)\}/);
      expect(bloc, `${f}.html : bloc sombre`).not.toBeNull();
      noter(bloc[1], f);
      // Le plein écran sombre du compteur reprend la palette sombre.
      const fs = html.match(/\n  \.fs\.sombre \{([^}]*)\}/);
      if (fs) noter(fs[1], f + " (plein écran sombre)");
    }
    return Object.entries(valeurs).filter(([, v]) => Object.keys(v).length > 1);
  }

  test("même palette sombre dans les sept pages de l'application, et entre Découvrir et la 404", async () => {
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
