/* === VISIONNEUSE D'IMAGES (partagée) ===
   Agrandit une capture ou une affiche au clic, par-dessus la page.

   Construite autour de <dialog> et de showModal() plutôt qu'à la main : le
   navigateur fournit alors le piège de focus, la fermeture par Échap, le
   fond inerte et le retour du focus au déclencheur. Trois lignes de code
   remplacent cinquante, et le comportement est celui que les gens
   connaissent déjà.

   Ne s'applique qu'aux visuels désignés par CIBLES : ni les logos, ni les
   écussons, ni la marque du pied de page, qui n'ont rien à montrer de plus. */
(function () {
    /* .navigateur img : le back-office et le formulaire de devis. Dans
       une colonne de téléphone ils tombent sous 150 px de haut, donc
       illisibles, et c'étaient les deux seules captures qui ne
       s'ouvraient pas. */
    var CIBLES = '.ecran-vue img, .piece-vue img, .aff img, .navigateur img';
    var visuels = [].slice.call(document.querySelectorAll(CIBLES));
    if (!visuels.length) return;
    if (typeof HTMLDialogElement === 'undefined') return;   /* pas de repli bancal */

    var dlg = document.createElement('dialog');
    dlg.className = 'visionneuse';
    dlg.innerHTML =
        '<button class="visionneuse-fermer" type="button" aria-label="Fermer l\'image">' +
        '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
        '<path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>' +
        '</svg></button>' +
        '<img class="visionneuse-img" alt="">' +
        '<p class="visionneuse-legende"></p>';
    document.body.appendChild(dlg);

    var img = dlg.querySelector('.visionneuse-img');
    var legende = dlg.querySelector('.visionneuse-legende');
    var fermer = dlg.querySelector('.visionneuse-fermer');
    var declencheur = null;

    function ouvrir(source) {
        declencheur = source;
        img.src = source.currentSrc || source.src;
        /* L'alternative de la vignette décrit déjà l'image : on la reprend
           telle quelle plutôt que d'en inventer une seconde. */
        img.alt = source.alt || '';
        legende.textContent = source.alt || '';
        legende.hidden = !source.alt;
        dlg.showModal();
    }

    dlg.addEventListener('close', function () {
        img.removeAttribute('src');
        /* showModal rend normalement le focus tout seul ; on le refait ici
           pour les cas où l'élément a été remplacé entre-temps. */
        if (declencheur && document.contains(declencheur)) {
            declencheur.focus({ preventScroll: true });
        }
        declencheur = null;
    });

    fermer.addEventListener('click', function () { dlg.close(); });

    /* Clic en dehors de l'image : le ::backdrop n'est pas une cible, c'est
       le dialogue lui-même qu'on reçoit quand on clique à côté. */
    dlg.addEventListener('click', function (e) {
        if (e.target === dlg) dlg.close();
    });

    visuels.forEach(function (v) {
        /* Une image n'est pas focalisable : sans ça, la visionneuse serait
           inatteignable au clavier. On la déclare bouton et on lui donne un
           nom, le rôle décoratif ne conviendrait pas ici. */
        v.setAttribute('tabindex', '0');
        v.setAttribute('role', 'button');
        v.setAttribute('aria-haspopup', 'dialog');
        if (v.alt) v.setAttribute('aria-label', 'Agrandir : ' + v.alt);
        v.classList.add('est-agrandissable');

        v.addEventListener('click', function (e) {
            /* Dans le carrousel, seule l'affiche centrale s'agrandit : les
               autres servent à naviguer, et un glissement ne doit jamais
               finir par ouvrir une image. asgc-2026.js pose .en-glissement
               pendant le geste et .est-loin sur les affiches de côté. */
            var aff = v.closest('.aff');
            if (aff) {
                if (aff.classList.contains('est-loin')) return;
                if (aff.parentElement.classList.contains('en-glissement')) return;
            }
            e.preventDefault();
            ouvrir(v);
        });

        v.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ouvrir(v); }
        });
    });
})();
