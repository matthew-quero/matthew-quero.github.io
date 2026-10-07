/* === MENU MOBILE 2026 ===
   Ouverture et fermeture du panneau plein écran sous 900px.
   Le panneau existe dans le HTML de chaque page, ce script ne fait
   que l'ouvrir, le fermer et tenir l'accessibilité à jour. */
(function () {
    var bouton = document.getElementById('burger');
    var panneau = document.getElementById('menu-mobile');
    if (!bouton || !panneau) return;

    var ouvert = false;

    function ouvrir() {
        ouvert = true;
        panneau.removeAttribute('hidden');
        /* le retrait de hidden et l'ajout de la classe dans la même image
           annulent la transition : on attend la suivante */
        requestAnimationFrame(function () {
            panneau.classList.add('est-ouvert');
        });
        bouton.classList.add('est-ouvert');
        bouton.setAttribute('aria-expanded', 'true');
        bouton.setAttribute('aria-label', 'Fermer le menu');
        document.body.classList.add('menu-ouvert');
        var premier = panneau.querySelector('a');
        if (premier) premier.focus({ preventScroll: true });
    }

    function fermer(rendreFocus) {
        ouvert = false;
        panneau.classList.remove('est-ouvert');
        bouton.classList.remove('est-ouvert');
        bouton.setAttribute('aria-expanded', 'false');
        bouton.setAttribute('aria-label', 'Ouvrir le menu');
        document.body.classList.remove('menu-ouvert');
        if (rendreFocus) bouton.focus({ preventScroll: true });
        /* on attend que le rideau soit remonté avant de cacher le panneau,
           sinon il disparaît d'un coup au milieu du mouvement */
        setTimeout(function () {
            if (!ouvert) panneau.setAttribute('hidden', '');
        }, 580);
    }

    bouton.addEventListener('click', function () {
        ouvert ? fermer(false) : ouvrir();
    });

    /* Un lien cliqué ferme le panneau : sur une ancre de la même page,
       rien ne recharge, et le panneau resterait ouvert par-dessus. */
    panneau.addEventListener('click', function (e) {
        if (e.target.closest('a')) fermer(false);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && ouvert) fermer(true);
    });

    /* Passage en grand écran pendant que le panneau est ouvert */
    matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
        if (e.matches && ouvert) fermer(false);
    });
})();
