// Habillages de fête, légers et sans effet sur les données. Chaque fête a sa
// période, son accent, un emblème à toucher dans le titre et un décor :
// - Halloween, du 24 au 31 octobre : citrouille et blagues de trinquet,
//   araignée pendue sous l'en-tête, chauve-souris qui traverse une fois ;
// - Toussaint, le 1er novembre : la fête de tous les saints, en blanc et or,
//   avec un halo dans l'en-tête, des étincelles qui s'éteignent une fois, et
//   des saints de France et du Pays basque à découvrir en touchant l'étoile.
// Hors de ces dates la page reste comme avant, sans rien à retirer.
// "?theme=halloween" ou "?theme=toussaint" en montre une hors saison,
// "?theme=aucun" les coupe.
(function () {
  var FETES = {
    halloween: {
      du: [9, 24], au: [9, 31],
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
      du: [10, 1], au: [10, 1],
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

  function feteDuJour(d) {
    var jour = d.getMonth() * 100 + d.getDate();
    for (var nom in FETES) {
      var f = FETES[nom];
      if (jour >= f.du[0] * 100 + f.du[1] && jour <= f.au[0] * 100 + f.au[1]) return nom;
    }
    return null;
  }

  var force = /[?&]theme=([a-z]+)/.exec(window.location.search);
  var fete = FETES[force ? force[1] : feteDuJour(new Date())];
  if (!fete) return;

  var CSS_COMMUN =
    "header{position:relative}" +
    ".fete-embleme{background:none;border:0;padding:0 0 0 6px;font:inherit;cursor:pointer;display:inline-block;transform-origin:50% 80%}" +
    ".fete-embleme:active{transform:scale(1.25) rotate(-10deg)}" +
    ".fete-bulle{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);max-width:calc(100% - 32px);" +
    "background:#1f1430;color:#fff;font-size:13px;padding:9px 14px;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:80;" +
    "pointer-events:none;text-align:center;animation:fete-apparait .25s ease-out}" +
    "@keyframes fete-apparait{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}" +
    "@media (prefers-reduced-motion:reduce){.fete-bulle{animation:none}}";

  function habiller() {
    var style = document.createElement("style");
    style.textContent = CSS_COMMUN + fete.css;
    document.head.appendChild(style);

    var titre = document.querySelector("header h1");
    if (titre) {
      var embleme = document.createElement("button");
      embleme.type = "button";
      embleme.className = "fete-embleme";
      embleme.textContent = fete.embleme;
      embleme.setAttribute("aria-label", fete.libellé);
      var n = Math.floor(Math.random() * fete.phrases.length);
      embleme.addEventListener("click", function () {
        var vieille = document.querySelector(".fete-bulle");
        if (vieille) vieille.remove();
        var bulle = document.createElement("div");
        bulle.className = "fete-bulle";
        bulle.setAttribute("role", "status");
        bulle.textContent = fete.phrases[n++ % fete.phrases.length];
        document.body.appendChild(bulle);
        setTimeout(function () { bulle.remove(); }, 3600);
      });
      titre.appendChild(embleme);
    }

    fete.decor(document.querySelector("header"));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", habiller);
  else habiller();
})();
