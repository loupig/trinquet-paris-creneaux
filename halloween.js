// Habillage d'Halloween, léger et sans effet sur les données : accent
// citrouille, une citrouille à toucher dans le titre, une araignée pendue sous
// l'en-tête et une chauve-souris qui traverse l'écran une fois. Actif du 24
// octobre au 1er novembre, chaque année, puis la page redevient comme avant
// sans qu'il faille retirer quoi que ce soit. "?halloween=1" le force (pour
// le voir hors saison), "?halloween=0" le coupe.
(function () {
  var force = /[?&]halloween=([01])/.exec(window.location.search);
  var d = new Date();
  var enSaison = (d.getMonth() === 9 && d.getDate() >= 24) || (d.getMonth() === 10 && d.getDate() <= 1);
  if (force ? force[1] !== "1" : !enSaison) return;

  var BOUH = [
    "Bouh ! Même les fantômes respectent la ligne de faute.",
    "Ce soir, la pelote rebondit toute seule…",
    "Un fantôme demande un report. Refusé : il n'a pas de licence.",
    "Attention, le trinquet est hanté : jouez groupés.",
    "La citrouille a perdu 40 à 12. Elle est rouge de honte.",
    "Joyeux Halloween, et que vos pelotes soient plus vives que les morts !"
  ];

  var css =
    ":root{--accent:#c2410c;--accent-bg:#fff1e6;--accent-border:#fdc9a1}" +
    "header{position:relative}" +
    ".hw-citrouille{background:none;border:0;padding:0 0 0 6px;font:inherit;cursor:pointer;display:inline-block;transform-origin:50% 80%}" +
    ".hw-citrouille:active{transform:scale(1.25) rotate(-10deg)}" +
    ".hw-araignee{position:absolute;right:22px;bottom:-34px;width:2px;height:28px;background:#9ca3af;transform-origin:top center;" +
    "pointer-events:none;z-index:5;animation:hw-balance 3.2s ease-in-out infinite}" +
    ".hw-araignee::after{content:'🕷️';position:absolute;left:50%;bottom:-14px;transform:translateX(-50%);font-size:16px}" +
    ".hw-chauve-souris{position:fixed;top:120px;left:-40px;font-size:26px;pointer-events:none;z-index:60;animation:hw-vol 5s ease-in-out forwards}" +
    ".hw-bouh{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);max-width:calc(100% - 32px);" +
    "background:#1f1430;color:#fff;font-size:13px;padding:9px 14px;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.25);z-index:80;" +
    "pointer-events:none;text-align:center;animation:hw-apparait .25s ease-out}" +
    "@keyframes hw-balance{0%,100%{transform:rotate(7deg)}50%{transform:rotate(-7deg)}}" +
    "@keyframes hw-vol{0%{transform:translate(0,0)}25%{transform:translate(28vw,-30px)}50%{transform:translate(55vw,20px)}" +
    "75%{transform:translate(80vw,-25px)}100%{transform:translate(calc(100vw + 80px),10px)}}" +
    "@keyframes hw-apparait{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}" +
    "@media (prefers-reduced-motion:reduce){.hw-araignee,.hw-bouh{animation:none}.hw-chauve-souris{display:none}}";

  function habiller() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var titre = document.querySelector("header h1");
    if (titre) {
      var citrouille = document.createElement("button");
      citrouille.type = "button";
      citrouille.className = "hw-citrouille";
      citrouille.textContent = "🎃";
      citrouille.setAttribute("aria-label", "Bouh !");
      var n = Math.floor(Math.random() * BOUH.length);
      citrouille.addEventListener("click", function () {
        var vieux = document.querySelector(".hw-bouh");
        if (vieux) vieux.remove();
        var bulle = document.createElement("div");
        bulle.className = "hw-bouh";
        bulle.setAttribute("role", "status");
        bulle.textContent = BOUH[n++ % BOUH.length];
        document.body.appendChild(bulle);
        setTimeout(function () { bulle.remove(); }, 3200);
      });
      titre.appendChild(citrouille);
    }

    var header = document.querySelector("header");
    if (header) {
      var araignee = document.createElement("div");
      araignee.className = "hw-araignee";
      araignee.setAttribute("aria-hidden", "true");
      header.appendChild(araignee);
    }

    var chauveSouris = document.createElement("div");
    chauveSouris.className = "hw-chauve-souris";
    chauveSouris.setAttribute("aria-hidden", "true");
    chauveSouris.textContent = "🦇";
    chauveSouris.addEventListener("animationend", function () { chauveSouris.remove(); });
    document.body.appendChild(chauveSouris);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", habiller);
  else habiller();
})();
