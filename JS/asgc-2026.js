/* === CARROUSEL DES VISUELS (page AS Ginglin Cesson) ===
   Les affiches sont écrites en dur dans le HTML. Ce script ne fait que les
   placer sur un axe en perspective et basculer la légende correspondante.
   Sans JavaScript, la première affiche et sa légende restent lisibles.

   Il manquait l'essentiel pour s'en servir : aucun glissement, ni au doigt
   ni à la souris, et les flèches du clavier étaient captées sur toute la
   page, y compris quand le carrousel était hors de l'écran. */
(function () {
    var piste = document.getElementById('piste');
    if (!piste) return;

    var scene = document.getElementById('scene'),
        affiches = [].slice.call(piste.querySelectorAll('.aff')),
        legendes = [].slice.call(document.querySelectorAll('.legendes .legende')),
        jauge = document.getElementById('aff-jauge'),
        position = document.getElementById('aff-position'),
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

    /* Pas horizontal entre deux affiches. C'était 330px en dur, calé sur
       l'affiche de 470px du bureau ; sur téléphone elle n'en fait que 270 et
       il fallait un geste de 165px pour changer d'affiche, soit presque la
       moitié de l'écran. On le déduit de la largeur réelle. */
    function pas() {
        var l = affiches[0] ? affiches[0].getBoundingClientRect().width : 470;
        return Math.max(140, l * 0.7);
    }

    function placer(glisse) {
        var P = pas();
        affiches.forEach(function (aff, i) {
            var e = ecart(i) + (glisse || 0), dist = Math.abs(e), visible = dist <= 3;
            aff.style.transform =
                'translateX(' + (e * P) + 'px) translateZ(' + (-dist * 260) + 'px) ' +
                'rotateY(' + (e * -30) + 'deg) scale(' + (1 - Math.min(dist, 6) * 0.05) + ')';
            aff.style.opacity = visible ? 1 : 0;
            aff.style.zIndex = 50 - Math.round(dist);
            aff.style.pointerEvents = visible ? 'auto' : 'none';
            aff.classList.toggle('est-loin', Math.abs(ecart(i)) > 0);

            /* Une affiche hors champ ne doit être ni lue ni atteignable.
               aria-hidden seul ne suffisait pas : visionneuse.js rend les
               images focalisables, on se retrouvait donc avec du contenu
               tabulable à l'intérieur d'un élément annoncé comme absent,
               ce que Lighthouse signalait à juste titre. inert fait les
               deux ; le tabindex prend le relais là où il n'existe pas. */
            var cache = !visible;
            aff.setAttribute('aria-hidden', cache ? 'true' : 'false');
            if ('inert' in HTMLElement.prototype) aff.inert = cache;
            var vignette = aff.querySelector('img');
            if (vignette) vignette.setAttribute('tabindex', cache ? '-1' : '0');
        });

        legendes.forEach(function (l, i) {
            var active = i === actif;
            l.classList.toggle('est-active', active);
            /* Les légendes inactives sont superposées à l'active : sans ça
               elles étaient toutes annoncées à la suite, et leurs liens
               éventuels restaient atteignables au clavier derrière. */
            l.setAttribute('aria-hidden', active ? 'false' : 'true');
            if ('inert' in HTMLElement.prototype) l.inert = !active;
        });

        jauge.style.width = (100 / total) + '%';
        jauge.style.left = (actif * 100 / total) + '%';
    }

    /* L'annonce attend que le geste soit fini : pendant un glissement rapide
       sur cinq affiches, on ne récite pas les cinq légendes. */
    var minuteur;
    function annoncer() {
        if (!position) return;
        clearTimeout(minuteur);
        minuteur = setTimeout(function () {
            var titre = legendes[actif] && legendes[actif].querySelector('h3');
            position.textContent = 'Affiche ' + (actif + 1) + ' sur ' + total +
                (titre ? ', ' + titre.textContent : '');
        }, 450);
    }

    function aller(i) {
        actif = ((i % total) + total) % total;
        placer();
        annoncer();
    }

    /* --- Glissement, au doigt comme à la souris ---
       Les évènements pointer couvrent les deux. touch-action: pan-y est posé
       en CSS : le navigateur garde le défilement vertical de la page et nous
       laisse l'horizontal, ce qui évite de bloquer le scroll sur téléphone. */
    var SEUIL_CLIC = 8;     /* au-delà, c'est un glissement et non un clic */
    var saisi = false, departX = 0, departY = 0, dx = 0, glissement = false, doigt = null;

    piste.addEventListener('pointerdown', function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        saisi = true; glissement = false; doigt = e.pointerId;
        departX = e.clientX; departY = e.clientY; dx = 0;
    });

    piste.addEventListener('pointermove', function (e) {
        if (!saisi || e.pointerId !== doigt) return;
        dx = e.clientX - departX;
        var dy = e.clientY - departY;
        /* Geste plutôt vertical : c'est un défilement de page, on lâche. */
        if (!glissement && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > SEUIL_CLIC) {
            saisi = false;
            placer();
            return;
        }
        if (!glissement && Math.abs(dx) > SEUIL_CLIC) {
            glissement = true;
            piste.classList.add('en-glissement');
            /* La capture n'est posée qu'ici, et pas au pointerdown : la scène
               occupe toute la largeur de la fenêtre et un geste ample en sort
               par le bord, ce qui interrompait le mouvement. Mais capturer dès
               l'appui retargetait aussi le clic vers la piste, et le simple
               clic sur une affiche n'atteignait plus l'image : la visionneuse
               ne s'ouvrait jamais sur cette page. Capturer au premier vrai
               déplacement règle les deux. */
            try { piste.setPointerCapture(e.pointerId); } catch (err) {}
        }
        if (glissement) placer(-dx / pas());
    });

    function relacher(e) {
        if (!saisi || (e && e.pointerId !== doigt)) return;
        saisi = false;
        piste.classList.remove('en-glissement');
        if (glissement) aller(actif - Math.round(dx / pas()));
        else placer();
    }
    piste.addEventListener('pointerup', relacher);
    piste.addEventListener('pointercancel', relacher);

    /* Un clic sur une affiche de côté l'amène au centre, mais seulement si
       le doigt n'a pas bougé : sinon la fin d'un glissement ouvrait une
       autre affiche que celle visée. */
    affiches.forEach(function (aff, i) {
        aff.addEventListener('click', function (e) {
            if (glissement) { e.preventDefault(); return; }
            if (i !== actif) aller(i);
        });
    });

    prev.addEventListener('click', function () { aller(actif - 1); });
    next.addEventListener('click', function () { aller(actif + 1); });

    /* Les flèches n'agissent que lorsque le carrousel a le focus. Avant,
       l'écouteur était sur document : appuyer sur une flèche n'importe où
       dans la page faisait tourner un carrousel parfois invisible, et
       empêchait de défiler la page au clavier. */
    scene.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowLeft') { ev.preventDefault(); aller(actif - 1); }
        else if (ev.key === 'ArrowRight') { ev.preventDefault(); aller(actif + 1); }
        else if (ev.key === 'Home') { ev.preventDefault(); aller(0); }
        else if (ev.key === 'End') { ev.preventDefault(); aller(total - 1); }
    });

    piste.classList.add('est-prete');
    placer();
})();
