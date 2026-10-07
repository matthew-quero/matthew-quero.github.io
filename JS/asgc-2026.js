/* === CARROUSEL DES VISUELS (page AS Ginglin Cesson) ===
   Les affiches sont écrites en dur dans le HTML. Ce script ne fait que les
   placer sur un axe en perspective et basculer la légende correspondante.
   Sans JavaScript, la première affiche et sa légende restent lisibles. */
(function () {
    var piste = document.getElementById('piste');
    if (!piste) return;

    var affiches = [].slice.call(piste.querySelectorAll('.aff')),
        legendes = [].slice.call(document.querySelectorAll('.legendes .legende')),
        jauge = document.getElementById('aff-jauge'),
        prev = document.getElementById('aff-prev'),
        next = document.getElementById('aff-next'),
        total = affiches.length,
        actif = 0;

    /* Écart au plus court, dans un sens comme dans l'autre : le carrousel
       boucle, il y a donc toujours des affiches des deux côtés. */
    function ecart(i) {
        var e = i - actif;
        if (e > total / 2) e -= total;
        if (e < -total / 2) e += total;
        return e;
    }

    function placer() {
        affiches.forEach(function (aff, i) {
            var e = ecart(i), dist = Math.abs(e), visible = dist <= 3;
            aff.style.transform =
                'translateX(' + (e * 330) + 'px) translateZ(' + (-dist * 260) + 'px) ' +
                'rotateY(' + (e * -30) + 'deg) scale(' + (1 - dist * 0.05) + ')';
            aff.style.opacity = visible ? 1 : 0;
            aff.style.zIndex = 50 - dist;
            aff.style.pointerEvents = visible ? 'auto' : 'none';
            aff.classList.toggle('est-loin', dist > 0);
        });

        legendes.forEach(function (l, i) { l.classList.toggle('est-active', i === actif); });

        jauge.style.width = (100 / total) + '%';
        jauge.style.left = (actif * 100 / total) + '%';
    }

    function aller(i) {
        actif = ((i % total) + total) % total;
        placer();
    }

    affiches.forEach(function (aff, i) {
        aff.addEventListener('click', function () { if (i !== actif) aller(i); });
    });
    prev.addEventListener('click', function () { aller(actif - 1); });
    next.addEventListener('click', function () { aller(actif + 1); });
    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowLeft') aller(actif - 1);
        if (ev.key === 'ArrowRight') aller(actif + 1);
    });

    piste.classList.add('est-prete');
    placer();
})();
