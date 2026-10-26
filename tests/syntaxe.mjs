// Vérifie que le JavaScript de chaque page se lit sans erreur de syntaxe :
// sans build, une virgule de trop casserait une page entière en production.
// Le script est seulement compilé, jamais exécuté.
import { readdirSync, readFileSync } from "node:fs";
import { Script } from "node:vm";

let erreurs = 0;
for (const fichier of readdirSync(".").filter((f) => f.endsWith(".html")).sort()) {
  const html = readFileSync(fichier, "utf8");
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
  scripts.forEach((m, i) => {
    const ligne = html.slice(0, m.index).split("\n").length;
    try {
      new Script(m[1], { filename: `${fichier} (script ${i + 1}, ligne ${ligne})` });
    } catch (e) {
      erreurs++;
      console.error(`✗ ${fichier}, script ${i + 1} (ligne ${ligne}) : ${e.message}`);
    }
  });
  console.log(`${erreurs ? "…" : "✓"} ${fichier} : ${scripts.length} script(s)`);
}
// Les scripts partagés entre pages, comme halloween.js.
for (const fichier of readdirSync(".").filter((f) => f.endsWith(".js")).sort()) {
  try {
    new Script(readFileSync(fichier, "utf8"), { filename: fichier });
    console.log(`✓ ${fichier}`);
  } catch (e) {
    erreurs++;
    console.error(`✗ ${fichier} : ${e.message}`);
  }
}
if (erreurs) {
  console.error(`${erreurs} erreur(s) de syntaxe.`);
  process.exit(1);
}
