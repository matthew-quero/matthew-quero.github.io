/* === PAGE 404 2026 ===
   La graisse des trois chiffres suit le curseur. Sans souris (téléphone,
   ou avant le premier mouvement), une vague lente circule à la place.
   La boucle s'arrête quand l'onglet passe en arrière-plan. */
(function () {
    var bloc = document.getElementById('chiffre');
    if (!bloc) return;

    var glyphes = Array.prototype.slice.call(bloc.children);
    var doux = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function poser(g, graisse, vert) {
        g.style.fontVariationSettings = '"wght" ' + Math.round(graisse);
        g.style.color = vert ? 'var(--accent-texte)' : 'var(--ink)';
    }

    if (doux) {
        [300, 800, 300].forEach(function (w, i) { poser(glyphes[i], w, false); });
        return;
    }

    /* --- la vague de repos --- */
    var t = 0, image = null;
    function respirer() {
        t += 0.016;
        glyphes.forEach(function (g, i) {
            poser(g, 480 + Math.sin(t - i * 0.9) * 270, false);
        });
        image = requestAnimationFrame(respirer);
    }
    function lancerVague() { if (!image) { image = requestAnimationFrame(respirer); } }
    function couperVague() { if (image) { cancelAnimationFrame(image); image = null; } }

    lancerVague();

    /* inutile de calculer quoi que ce soit si l'onglet n'est pas regardé */
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') { lancerVague(); } else { couperVague(); }
    });

    /* --- la réponse au curseur --- */
    document.addEventListener('mousemove', function (e) {
        couperVague();

        var proche = null, mini = Infinity;
        var ecarts = glyphes.map(function (g) {
            var r = g.getBoundingClientRect();
            var d = Math.abs(e.clientX - (r.left + r.width / 2)) / r.width;
            if (d < mini) { mini = d; proche = g; }
            return d;
        });

        glyphes.forEach(function (g, i) {
            /* 900 juste sous le curseur, 200 une fois loin */
            poser(g, 900 - Math.min(ecarts[i], 2.4) * 290, g === proche && mini < 0.8);
        });
    });
})();
