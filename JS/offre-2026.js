/* === OFFRE 2026 (accueil, section #offre) ===
   Le scroll vertical fait défiler les panneaux horizontalement, avec un
   arrêt franc sur chacun. Désactivé sous 861px (panneaux empilés en CSS). */
(function () {
    const section = document.getElementById('offre');
    if (!section) return;
    const rail = section.querySelector('.offre-rail');
    const cta = section.querySelector('.offre-cta');
    const segs = rail.children.length - 1;
    const mobile = matchMedia('(max-width: 860px)');

    const HOLD = .36; // part de chaque segment où le panneau reste immobile
    const easeInOutQuad = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

    function update() {
        if (mobile.matches || segs < 1) {
            rail.style.transform = '';
            cta.classList.add('is-visible');
            return;
        }
        const rect = section.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -rect.top / (rect.height - innerHeight)));

        const s = p * segs;
        const i = Math.min(Math.floor(s), segs - 1);
        const t = s - i;
        const move = t < HOLD ? 0 : easeInOutQuad((t - HOLD) / (1 - HOLD));
        const q = (i + move) / segs;

        // Le second terme compense les 50px d'écart entre panneaux
        rail.style.transform = `translateX(calc(${-q * segs * 100}% - ${q * segs * 50}px))`;
        cta.classList.toggle('is-visible', q > .88);
    }

    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
})();
