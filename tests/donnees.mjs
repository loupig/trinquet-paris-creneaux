// Données fictives servies à la place de l'API Apps Script pendant les tests.
// Clubs, joueurs et numéros sont inventés : le dépôt est public.
//
// Deux séries de deux poules de six équipes. Les parties de poule passées ont
// un score, sauf deux par poule ; d'autres sont à venir, au Trinquet Paris,
// pour que l'accueil, Parties et Créneaux aient de quoi afficher. Les dates
// sont relatives au jour du test.

const LIEU_PARIS = "PARIS (Trinquet Paris - 75016)";
const NOMS = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot",
  "Golf", "Hotel", "India", "Juliet", "Kilo", "Lima"];

function dateRenc(decalageJours) {
  const d = new Date();
  d.setDate(d.getDate() + decalageJours);
  return String(d.getDate()).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0") + d.getFullYear();
}

export const clubs = NOMS.map((nom, i) => {
  const club = String(i + 1).padStart(3, "0");
  return { "Ligue": "3", "comité": "750", "club": club, "Nom club": nom, "Numéro club": "03-750-" + club };
});

export function codeClub(i) { return "3750" + String(i + 1).padStart(3, "0"); }

export const rencontres = [];
const aVenir = [];
export const engagements = [];
export const licencies = [];

let oid = 0;
let licence = 100000;
for (const cat of ["1", "2"]) {
  for (const [poule, premier] of [["1", 0], ["2", 6]]) {
    const equipes = [0, 1, 2, 3, 4, 5].map((k) => premier + k);
    equipes.forEach((i) => {
      const lic = [++licence, ++licence];
      lic.forEach((l, j) => licencies.push({ "Numéro club": "03-750-" + String(i + 1).padStart(3, "0"), "Licence": String(l), "nom": "Joueur" + l, "prenom": j ? "Bixente" : "Ane" }));
      engagements.push({
        "Numéro club": "03-750-" + String(i + 1).padStart(3, "0"), "Catégorie": cat, "Equipe": "1", "Poule": poule,
        "Licence&nbsp;1": String(lic[0]), "Licence&nbsp;2": String(lic[1]),
        "Responsable": "Responsable " + NOMS[i], "Tél1. Resp.": "0600000" + String(100 + i)
      });
    });
    let n = 0;
    for (let a = 0; a < 6; a++) {
      for (let b = a + 1; b < 6; b++) {
        n++;
        // Une partie sur trois est à venir ; deux passées restent sans score.
        const estAVenir = n % 3 === 0;
        const sansScore = n === 4 || n === 11;
        const jours = estAVenir ? (n % 9) + 1 : -(n + 2);
        if (estAVenir) aVenir.push(String(oid + 1));
        rencontres.push({
          oid: String(++oid), "Compétition": "20270301", "Spécialité": "2", "Catégorie": cat,
          "Phase": "1", "Poule": poule,
          club_rec: codeClub(equipes[a]), equip_rec: "1", club_vis: codeClub(equipes[b]), equip_vis: "1",
          lieu_renc: LIEU_PARIS, date_renc: dateRenc(jours), heure_renc: "1930", report: "", date_rep: "",
          score_cr: (estAVenir || sansScore) ? "" : "40",
          score_cv: (estAVenir || sansScore) ? "" : String(15 + ((a * 7 + b * 3) % 24))
        });
      }
    }
  }
  // Quarts de finale : programmés, adversaires encore à désigner.
  for (let q = 0; q < 4; q++) {
    rencontres.push({
      oid: String(++oid), "Compétition": "20270301", "Spécialité": "2", "Catégorie": cat, "Phase": "10", "Poule": "",
      club_rec: "9998", equip_rec: "1", club_vis: "9998", equip_vis: "1",
      lieu_renc: LIEU_PARIS, date_renc: dateRenc(30 + q), heure_renc: "2000", report: "", date_rep: "",
      score_cr: "", score_cv: ""
    });
  }
}

export const tables = { rencontres, clubs, engagements, licencies };

// Une partie de poule à venir au Trinquet Paris, pour la page Report.
export const oidAVenir = aVenir[0];
