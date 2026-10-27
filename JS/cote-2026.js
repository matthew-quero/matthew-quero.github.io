/* === COLONNE LATERALE 2026 ===
   Trois comportements : le bouton de retour apparait une fois le premier
   ecran passe, les liens s'effacent quand le pied de page entre a l'ecran,
   et sur ecran etroit le bouton ne se montre que pendant une remontee.

   Pourquoi cette derniere regle : sous 1280px il n'y a plus de colonne
   laterale, le bouton se cale en bas a droite, et la colonne de texte fait
   toute la largeur. Mesure faite sur les 7 pages, il recouvrait jusqu'a
   37px de mot, avec un fond blanc opaque : il masquait, il ne survolait
   pas. Pendant qu'on lit, on descend ; quand on veut revenir en haut, on
   remonte. Le lier au sens du defilement le fait disparaitre exactement
   pendant la lecture. */
(function () {
    var cote = document.querySelector('.cote');
    if (!cote) return;

    var bouton = cote.querySelector('.cote-haut');
    var pied = document.querySelector('.site-footer');
    var etroit = matchMedia('(max-width: 1279px)');

    var affiche = false;        /* etat courant de la classe */
    var remonte = false;        /* le dernier geste allait vers le haut */
    var dernierY = window.scrollY;

    function jauger() {
        var y = window.scrollY;
        /* 2px de marge morte : sans elle, le rebond d'un defilement
           inertiel suffit a faire clignoter le bouton. */
        if (y > dernierY + 2) remonte = false;
        else if (y < dernierY - 2) remonte = true;
        dernierY = y;

        var loin = y > window.innerHeight * 0.8;
        var doit = etroit.matches ? (loin && remonte) : loin;
        if (doit !== affiche) { affiche = doit; cote.classList.toggle('est-loin', doit); }
    }

    var enAttente = false;
    addEventListener('scroll', function () {
        if (enAttente) return;
        enAttente = true;
        requestAnimationFrame(function () { jauger(); enAttente = false; });
    }, { passive: true });

    /* Au passage d'un seuil a l'autre, la regle change : on reevalue
       plutot que d'attendre le prochain defilement. */
    if (etroit.addEventListener) etroit.addEventListener('change', jauger);
    else if (etroit.addListener) etroit.addListener(jauger);

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
            /* Le bouton a fait son travail : il s'efface, sinon il reste
               seul a l'ecran en haut de page pendant toute la remontee. */
            remonte = false;
            affiche = false;
            cote.classList.remove('est-loin');
        });
    }
})();
