/* === MENU MOBILE 2026 ===
   Ouverture et fermeture du panneau plein écran sous 900px.
   Le panneau existe dans le HTML de chaque page, ce script ne fait
   que l'ouvrir, le fermer et tenir l'accessibilité à jour. */
(function () {
    var bouton = document.getElementById('burger');
    var panneau = document.getElementById('menu-mobile');
    if (!bouton || !panneau) return;

    var ouvert = false;

    /* Le reste de la page pendant que le panneau est ouvert. `inert` le
       retire d'un coup du clavier, du pointeur et des lecteurs d'écran.
       Là où il n'existe pas, le piège de focus plus bas prend le relais. */
    var arriere = [document.querySelector('main'), document.querySelector('.site-footer'),
                   document.querySelector('.cote')].filter(Boolean);
    var supporteInert = 'inert' in HTMLElement.prototype;

    var FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]), ' +
                     'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function dansLeCycle() {
        /* Le bouton fait partie du cycle : il est au-dessus du panneau et
           c'est lui qui referme. */
        return [bouton].concat(Array.prototype.slice.call(panneau.querySelectorAll(FOCUSABLES)))
            .filter(function (el) { return el.offsetWidth || el.offsetHeight || el.getClientRects().length; });
    }

    function piege(e) {
        if (!ouvert || e.key !== 'Tab') return;
        var liste = dansLeCycle();
        if (!liste.length) return;
        var premier = liste[0], dernier = liste[liste.length - 1];
        var actif = document.activeElement;
        if (e.shiftKey && (actif === premier || !panneau.contains(actif) && actif !== bouton)) {
            e.preventDefault(); dernier.focus();
        } else if (!e.shiftKey && actif === dernier) {
            e.preventDefault(); premier.focus();
        }
    }

    function ouvrir() {
        ouvert = true;
        panneau.removeAttribute('hidden');
        if (supporteInert) arriere.forEach(function (el) { el.inert = true; });
        /* le retrait de hidden et l'ajout de la classe dans la même image
           annulent la transition : on attend la suivante */
        requestAnimationFrame(function () {
            panneau.classList.add('est-ouvert');
            /* Le focus attend une image de plus. Le panneau part de
               visibility:hidden, et un élément invisible refuse le focus :
               l'appel partait dans le vide et le clavier restait sur le
               bouton. Poser la classe ne suffit pas, la visibilité est en
               transition et ne devient effective qu'à l'image suivante.
               Vérifié à la mesure : au premier rAF l'appel échoue, au
               second il aboutit. */
            requestAnimationFrame(function () {
                var premier = panneau.querySelector('a');
                if (premier && ouvert) premier.focus({ preventScroll: true });
            });
        });
        bouton.classList.add('est-ouvert');
        bouton.setAttribute('aria-expanded', 'true');
        bouton.setAttribute('aria-label', 'Fermer le menu');
        document.body.classList.add('menu-ouvert');
    }

    function fermer(rendreFocus) {
        ouvert = false;
        if (supporteInert) arriere.forEach(function (el) { el.inert = false; });
        /* Le focus ne doit jamais rester dans un panneau qui disparaît :
           il deviendrait invisible et le clavier ne saurait plus où il est. */
        if (!rendreFocus && panneau.contains(document.activeElement)) {
            document.activeElement.blur();
        }
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
        var lien = e.target.closest('a');
        if (!lien) return;
        fermer(false);

        /* Ancre de la même page : le navigateur déplace la vue mais pas le
           focus. On le pose sur la section visée, pour que la lecture au
           clavier ou au lecteur d'écran reprenne là où l'œil est arrivé. */
        var href = lien.getAttribute('href') || '';
        if (href.charAt(0) !== '#' || href.length < 2) return;
        var cible = document.getElementById(href.slice(1));
        if (!cible) return;
        if (!cible.hasAttribute('tabindex')) cible.setAttribute('tabindex', '-1');
        setTimeout(function () { cible.focus({ preventScroll: true }); }, 60);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && ouvert) fermer(true);
        else piege(e);
    });

    /* Passage en grand écran pendant que le panneau est ouvert */
    matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
        if (e.matches && ouvert) fermer(false);
    });

    /* --- L'en-tête suit le défilement ---
       Visible en haut de page, effacé quand on descend, ramené dès qu'on
       remonte. Même règle que le bouton de retour : pendant la lecture on
       rend tout l'écran au contenu, et le geste de remontée est justement
       celui qu'on fait quand on cherche la navigation. */
    var entete = document.querySelector('.site-header, .page-header');
    if (entete) {
        var etroit = matchMedia('(max-width: 900px)');
        var dernier = window.scrollY, cachee = false;
        var enVol = false;
        addEventListener('scroll', function () {
            if (enVol) return;
            enVol = true;
            requestAnimationFrame(function () {
                var y = window.scrollY;
                /* Panneau ouvert : l'en-tête porte la croix de fermeture,
                   il ne doit jamais s'escamoter. */
                var doitCacher = etroit.matches && !ouvert && y > 120 && y > dernier + 2;
                if (y < dernier - 2 || y <= 120) doitCacher = false;
                if (doitCacher !== cachee) {
                    cachee = doitCacher;
                    entete.classList.toggle('entete-cachee', cachee);
                }
                dernier = y;
                enVol = false;
            });
        }, { passive: true });
    }
})();
