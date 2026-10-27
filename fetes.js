// Habillages de fête, légers et sans effet sur les données. Chaque fête a son
// accent, un emblème à toucher dans le titre et un décor :
// - Halloween : citrouille et blagues de trinquet, araignée pendue sous
//   l'en-tête, chauve-souris qui traverse une fois ;
// - Toussaint : la fête de tous les saints, en blanc et or, avec un halo dans
//   l'en-tête, des étincelles qui s'éteignent une fois, et des saints de
//   France et du Pays basque.
// À chaque page, une bulle donne une blague ou un saint, une autre à chaque
// fois ; toucher l'emblème en donne une de plus.
// Les habillages n'existent que du 24 octobre au 1er novembre : avant et
// après, la page reste comme avant, quoi qu'on ait choisi, sans rien à
// retirer. Pendant la période, Halloween s'affiche par défaut jusqu'au 29
// octobre, puis la Toussaint ; l'accueil propose de choisir l'un, l'autre ou
// aucun, choix gardé sur l'appareil.
(function () {
  var FETES = {
    halloween: {
      embleme: "🎃", libellé: "Bouh !",
      phrases: [
        "Bouh ! Même les fantômes respectent la ligne de faute.",
        "Ce soir, la pelote rebondit toute seule…",
        "Un fantôme demande un report. Refusé : il n'a pas de licence.",
        "Attention, le trinquet est hanté : jouez groupés.",
        "La citrouille a perdu 40 à 12. Elle est rouge de honte.",
        "Joyeux Halloween, et que vos pelotes soient plus vives que les morts !"
      ],
      css:
        ":root{--accent:#c2410c;--accent-bg:#fff1e6;--accent-border:#fdc9a1}" +
        ".fete-araignee{position:absolute;right:22px;bottom:-34px;width:2px;height:28px;background:#9ca3af;transform-origin:top center;" +
        "pointer-events:none;z-index:5;animation:fete-balance 3.2s ease-in-out infinite}" +
        ".fete-araignee::after{content:'🕷️';position:absolute;left:50%;bottom:-14px;transform:translateX(-50%);font-size:16px}" +
        ".fete-chauve-souris{position:fixed;top:120px;left:-40px;font-size:26px;pointer-events:none;z-index:60;animation:fete-vol 5s ease-in-out forwards}" +
        "@keyframes fete-balance{0%,100%{transform:rotate(7deg)}50%{transform:rotate(-7deg)}}" +
        "@keyframes fete-vol{0%{transform:translate(0,0)}25%{transform:translate(28vw,-30px)}50%{transform:translate(55vw,20px)}" +
        "75%{transform:translate(80vw,-25px)}100%{transform:translate(calc(100vw + 80px),10px)}}" +
        "@media (prefers-reduced-motion:reduce){.fete-araignee{animation:none}.fete-chauve-souris{display:none}}",
      decor: function (header) {
        if (header) header.appendChild(element("div", "fete-araignee"));
        var chauveSouris = element("div", "fete-chauve-souris", "🦇");
        chauveSouris.addEventListener("animationend", function () { chauveSouris.remove(); });
        document.body.appendChild(chauveSouris);
      }
    },
    toussaint: {
      embleme: "✨", libellé: "Un saint de France ou du Pays basque",
      phrases: [
        "Sainte Geneviève, patronne de Paris, rassura la ville face à Attila, en 451.",
        "Saint Denis, premier évêque de Paris, martyr à Montmartre.",
        "Saint Michel Garicoïts, né à Ibarre : un saint du Pays basque, comme la pelote.",
        "Saint Ignace de Loyola, né à Azpeitia, en Gipuzkoa, fondateur des jésuites.",
        "Saint François Xavier, né au château de Javier, en Navarre, patron des missions.",
        "Saint Léon, patron de Bayonne, premier évêque de la ville selon la tradition.",
        "Saint Firmin, né à Pampelune, premier évêque d'Amiens : c'est lui qu'on fête aux San Fermín.",
        "Saint Valentin de Berrio-Otxoa, né à Elorrio, en Biscaye, martyr au Vietnam.",
        "Sainte Jeanne d'Arc, patronne secondaire de la France.",
        "Sainte Thérèse de Lisieux, patronne secondaire de la France et docteure de l'Église.",
        "Saint Louis, roi de France, rendait la justice sous un chêne à Vincennes.",
        "Saint Martin partagea son manteau avec un pauvre, à Amiens.",
        "Sainte Bernadette Soubirous, la voyante de Lourdes.",
        "Saint Vincent de Paul, né dans les Landes, apôtre de la charité.",
        "Saint Jean-Marie Vianney, le curé d'Ars, patron des curés.",
        "Bonne fête de la Toussaint à tous les saints… et à tous les pelotaris."
      ],
      css:
        ":root{--accent:#a16207;--accent-bg:#fef9e7;--accent-border:#f3dc8a}" +
        "header{background:radial-gradient(120% 90% at 50% 0%,#fff6d5 0%,var(--card-bg) 72%)}" +
        ".fete-etincelle{position:absolute;font-size:14px;pointer-events:none;opacity:0;z-index:5;animation:fete-scintille 2.6s ease-in-out forwards}" +
        "@keyframes fete-scintille{0%{opacity:0;transform:scale(.4)}35%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.6) translateY(-8px)}}" +
        "@media (prefers-reduced-motion:reduce){.fete-etincelle{display:none}}",
      decor: function (header) {
        if (!header) return;
        [[12, 30], [28, 70], [46, 22], [63, 60], [80, 34], [92, 74]].forEach(function (pos, i) {
          var etincelle = element("div", "fete-etincelle", "✨");
          etincelle.style.left = pos[0] + "%";
          etincelle.style.top = pos[1] + "%";
          etincelle.style.animationDelay = (i * 0.25) + "s";
          etincelle.addEventListener("animationend", function () { etincelle.remove(); });
          header.appendChild(etincelle);
        });
      }
    }
  };

  function element(tag, classe, texte) {
    var e = document.createElement(tag);
    e.className = classe;
    e.setAttribute("aria-hidden", "true");
    if (texte) e.textContent = texte;
    return e;
  }

  var PERIODE = { du: [9, 24], au: [10, 1] };
  var TOUSSAINT_DES = [9, 30];
  var CLE_CHOIX = "lidfpb_theme_v1";
  var CHOIX = [["halloween", "🎃 Halloween"], ["toussaint", "✨ Toussaint"], ["aucun", "Sans"]];

  function jour(md) { return md[0] * 100 + md[1]; }

  var d = new Date();
  var aujourdhui = jour([d.getMonth(), d.getDate()]);
  if (aujourdhui < jour(PERIODE.du) || aujourdhui > jour(PERIODE.au)) return;
  var parDefaut = aujourdhui >= jour(TOUSSAINT_DES) ? "toussaint" : "halloween";

  // Le stockage peut être refusé (navigation privée) : on retombe alors sur
  // l'habillage du jour, sans message.
  function lireChoix() {
    try {
      var c = localStorage.getItem(CLE_CHOIX);
      return c === "aucun" || FETES[c] ? c : null;
    } catch (e) { return null; }
  }
  function garderChoix(c) {
    try { localStorage.setItem(CLE_CHOIX, c); } catch (e) { /* choix pour cette visite seulement */ }
  }

  // Une phrase différente à chaque page affichée : on reprend où la dernière
  // s'était arrêtée, sur cet appareil. Sans stockage, on part au hasard.
  function phraseSuivante(nom) {
    var phrases = FETES[nom].phrases;
    var cle = "lidfpb_fete_phrase_" + nom;
    var n;
    try { n = parseInt(localStorage.getItem(cle), 10); } catch (e) { /* pas de stockage */ }
    if (!(n >= 0)) n = Math.floor(Math.random() * phrases.length);
    try { localStorage.setItem(cle, String(n + 1)); } catch (e) { /* pas de stockage */ }
    return phrases[n % phrases.length];
  }

  function afficherBulle(texte) {
    var vieille = document.querySelector(".fete-bulle");
    if (vieille) vieille.remove();
    var bulle = document.createElement("div");
    bulle.className = "fete-bulle";
    bulle.setAttribute("role", "status");
    bulle.textContent = texte;
    document.body.appendChild(bulle);
    setTimeout(function () { bulle.remove(); }, 4500);
  }

  var CSS_COMMUN =
    "header{position:relative}" +
    ".fete-choix{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:8px 0 0;font-size:11px;color:var(--muted)}" +
    ".fete-choix button{font:inherit;font-size:11px;font-weight:600;color:var(--text);background:var(--card-bg);border:1px solid var(--border);" +
    "border-radius:14px;padding:4px 10px;cursor:pointer}" +
    ".fete-choix button[aria-pressed=true]{color:var(--accent);background:var(--accent-bg);border-color:var(--accent-border)}" +
    ".fete-embleme{background:none;border:0;padding:0 0 0 6px;font:inherit;cursor:pointer;display:inline-block;transform-origin:50% 80%}" +
    ".fete-embleme:active{transform:scale(1.25) rotate(-10deg)}" +
    ".fete-bulle{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);max-width:calc(100% - 32px);" +
    "background:#1f1430;color:#fff;font-size:13px;padding:9px 14px;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:80;" +
    "pointer-events:none;text-align:center;animation:fete-apparait .25s ease-out}" +
    "@keyframes fete-apparait{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}" +
    "@media (prefers-reduced-motion:reduce){.fete-bulle{animation:none}}";

  // Retire l'habillage en place (style, emblème, décor), pour en changer sans
  // recharger la page.
  function deshabiller() {
    document.querySelectorAll("#fete-style, .fete-embleme, .fete-bulle, .fete-araignee, .fete-chauve-souris, .fete-etincelle")
      .forEach(function (e) { e.remove(); });
  }

  var habillage = 0;

  function habiller(nom) {
    var celuiCi = ++habillage;
    deshabiller();
    var fete = FETES[nom];
    if (!fete) return;
    var style = document.createElement("style");
    style.id = "fete-style";
    style.textContent = fete.css;
    document.head.appendChild(style);

    var titre = document.querySelector("header h1");
    if (titre) {
      var embleme = document.createElement("button");
      embleme.type = "button";
      embleme.className = "fete-embleme";
      embleme.textContent = fete.embleme;
      embleme.setAttribute("aria-label", fete.libellé);
      embleme.addEventListener("click", function () { afficherBulle(phraseSuivante(nom)); });
      titre.appendChild(embleme);
    }

    fete.decor(document.querySelector("header"));
    // La bulle vient d'elle-même à chaque page, le temps que la page se pose ;
    // toucher l'emblème en donne une autre.
    setTimeout(function () {
      if (celuiCi === habillage) afficherBulle(phraseSuivante(nom));
    }, 800);
  }

  // Sur l'accueil seulement : la page réserve la place du choix.
  function proposerChoix(actuel) {
    var place = document.getElementById("choixTheme");
    if (!place) return;
    var ligne = document.createElement("div");
    ligne.className = "fete-choix";
    ligne.setAttribute("role", "group");
    ligne.setAttribute("aria-label", "Thème du site");
    ligne.appendChild(document.createTextNode("Thème :"));
    CHOIX.forEach(function (c) {
      var bouton = document.createElement("button");
      bouton.type = "button";
      bouton.dataset.theme = c[0];
      bouton.textContent = c[1];
      bouton.setAttribute("aria-pressed", String(c[0] === actuel));
      bouton.addEventListener("click", function () {
        garderChoix(c[0]);
        habiller(c[0]);
        ligne.querySelectorAll("button").forEach(function (b) {
          b.setAttribute("aria-pressed", String(b.dataset.theme === c[0]));
        });
      });
      ligne.appendChild(bouton);
    });
    place.appendChild(ligne);
  }

  function demarrer() {
    var commun = document.createElement("style");
    commun.textContent = CSS_COMMUN;
    document.head.appendChild(commun);
    var actuel = lireChoix() || parDefaut;
    habiller(actuel);
    proposerChoix(actuel);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();
})();
