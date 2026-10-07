/* === COLONNE LATERALE 2026 ===
   Deux comportements : le bouton de retour apparait une fois le premier
   ecran passe, et les liens s'effacent quand le pied de page entre a
   l'ecran. On observe le pied plutot que de calculer sa position, pour
   que ca reste juste quelle que soit la hauteur de la page. */
(function () {
    var cote = document.querySelector('.cote');
    if (!cote) return;

    var bouton = cote.querySelector('.cote-haut');
    var pied = document.querySelector('.site-footer');

    /* --- apparition du bouton --- */
    var affiche = false;
    function jauger() {
        var loin = window.scrollY > window.innerHeight * 0.8;
        if (loin !== affiche) { affiche = loin; cote.classList.toggle('est-loin', loin); }
    }
    var enAttente = false;
    addEventListener('scroll', function () {
        if (enAttente) return;
        enAttente = true;
        requestAnimationFrame(function () { jauger(); enAttente = false; });
    }, { passive: true });
    jauger();

    /* --- effacement des liens au-dessus du pied --- */
    if (pied && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (e) {
            cote.classList.toggle('sur-pied', e[0].isIntersecting);
        }, { threshold: 0 }).observe(pied);
    }

    /* --- retour en haut --- */
    if (bouton) {
        bouton.addEventListener('click', function () {
            var doux = matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: doux ? 'auto' : 'smooth' });
        });
    }
})();
