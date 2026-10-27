/* === OFFRE 2026 (accueil, section #offre) ===
   Le scroll vertical fait défiler les panneaux horizontalement, avec un
   arrêt franc sur chacun. Fonctionne désormais sur mobile aussi.

   C'est la CSS qui décide s'il y a défilement ou non : quand la section
   repasse en pile (écran trop court, ou mouvement réduit demandé), le rail
   devient une colonne. On lit cette direction plutôt que de redéclarer ici
   les mêmes seuils, qui finiraient par diverger de la feuille de style. */
(function () {
    const section = document.getElementById('offre');
    if (!section) return;
    const rail = section.querySelector('.offre-rail');
    if (!rail) return;
    const segs = rail.children.length - 1;

    const HOLD = .36; // part de chaque segment où le panneau reste immobile
    const easeInOutQuad = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

    const empile = () => getComputedStyle(rail).flexDirection === 'column';

    /* L'écart entre panneaux vaut 50px en grand et 28px en petit : il faut
       le compenser dans le déplacement, sinon le dernier panneau s'arrête
       trop tôt. On le relit à chaque mesure au lieu de l'écrire en dur. */
    function ecart() {
        const g = parseFloat(getComputedStyle(rail).columnGap);
        return isNaN(g) ? 0 : g;
    }

    function update() {
        if (empile() || segs < 1) {
            rail.style.transform = '';
            return;
        }
        const rect = section.getBoundingClientRect();
        const course = rect.height - innerHeight;
        if (course <= 0) { rail.style.transform = ''; return; }
        const p = Math.min(1, Math.max(0, -rect.top / course));

        const s = p * segs;
        const i = Math.min(Math.floor(s), segs - 1);
        const t = s - i;
        const move = t < HOLD ? 0 : easeInOutQuad((t - HOLD) / (1 - HOLD));
        const q = (i + move) / segs;

        rail.style.transform =
            `translateX(calc(${-q * segs * 100}% - ${q * segs * ecart()}px))`;
    }

    let enAttente = false;
    addEventListener('scroll', function () {
        if (enAttente) return;
        enAttente = true;
        requestAnimationFrame(function () { update(); enAttente = false; });
    }, { passive: true });

    /* Au redimensionnement, la section peut basculer d'un mode à l'autre :
       on remet le rail à plat avant de recalculer, sinon une transformation
       calculée pour l'autre mode reste collée dessus. */
    addEventListener('resize', function () { rail.style.transform = ''; update(); });
    addEventListener('orientationchange', function () { rail.style.transform = ''; update(); });

    update();
})();
