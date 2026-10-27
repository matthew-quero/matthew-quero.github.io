/* === LE NOM EN RELIEF (accueil) ===
   Une boucle vidéo de cinq secondes, tirée de la vraie scène Three.js :
   mêmes lettres, même chrome, même balancement. Elle a remplacé le rendu
   WebGL en direct, et la raison est mesurée, pas supposée.

   Le relief calculé dans le navigateur coûtait, sur PageSpeed Insights,
   25 690 ms de blocage du fil principal et 40 s de travail : le robot de
   Google n'a pas de carte graphique et peignait chaque image au
   processeur. Score mobile 45, bureau 60. La même image, jouée au lieu
   d'être calculée, ne bloque rien : le décodage vidéo ne passe pas par le
   fil principal.

   Ce qui est perdu : le relief ne suit plus la souris. Ce qui est gardé :
   la matière, le mouvement, et le score.

   Trois états, dans cet ordre :
   1. l'image fixe, tirée de la première pose de la boucle, affichée tout
      de suite et seule version sur les appareils écartés plus bas ;
   2. la vidéo chargée après la page, une fois le fil principal au repos ;
   3. le fondu vers la vidéo quand elle joue réellement.
   Le SVG .hero-nom reste dessous pour le cas sans JavaScript. */
(function () {
    var video = document.querySelector('.hero-nom-boucle');
    if (!video) return;
    var hero = video.closest('.hero');
    if (!hero) return;

    /* Deux refus, les mêmes que pour l'ancien relief : quelqu'un qui
       demande moins de mouvement, et quelqu'un qui économise ses données.
       Dans les deux cas l'image fixe reste, et rien n'est téléchargé. */
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (navigator.connection && navigator.connection.saveData) return;

    /* Deux définitions. Sur téléphone le nom occupe une bande de 350 px :
       800 px de large suffisent largement, pour 126 Ko au lieu de 265. */
    var etroit = matchMedia('(max-width: 900px)');
    var fichier = etroit.matches ? 'img/site/quero-3d-800.mp4'
                                 : 'img/site/quero-3d-1400.mp4';

    /* Filet : si la vidéo ne joue pas dans ce délai, on en reste à
       l'image. Mieux vaut une image fixe qu'un trou. */
    var filet = setTimeout(abandonner, 6000);
    function abandonner() {
        clearTimeout(filet);
        video.removeAttribute('src');
        video.load();
    }

    function demarrer() {
        video.addEventListener('playing', function () {
            clearTimeout(filet);
            /* La classe n'est posée qu'ici : tant que la vidéo n'a pas
               peint, l'image reste. Comme les deux sont tirées du même
               rendu et cadrées au même pixel, le passage ne se voit pas. */
            hero.classList.add('en-relief');
        }, { once: true });

        video.addEventListener('error', abandonner, { once: true });

        video.src = fichier;
        var essai = video.play();
        /* Un navigateur peut refuser la lecture automatique malgré muted.
           Dans ce cas, pas d'insistance : l'image fixe fait le travail. */
        if (essai && essai.catch) essai.catch(abandonner);
    }

    /* Après le chargement complet, puis pendant un temps mort : la boucle
       ne doit disputer la bande passante à rien de ce qui s'affiche. */
    function planifier() {
        if ('requestIdleCallback' in window) requestIdleCallback(demarrer, { timeout: 1500 });
        else setTimeout(demarrer, 300);
    }
    if (document.readyState === 'complete') planifier();
    else addEventListener('load', planifier, { once: true });

    /* La boucle ne tourne que sous les yeux de quelqu'un : hors champ ou
       onglet en arrière-plan, elle s'arrête. Les navigateurs le font
       souvent d'eux-mêmes, mais pas tous, et pas toujours. */
    var vu = true, ongletActif = true;
    function ajuster() {
        if (!video.src) return;
        if (hero.classList.contains('en-relief-vrai')) { video.pause(); return; }
        if (vu && ongletActif) { var e = video.play(); if (e && e.catch) e.catch(function () {}); }
        else video.pause();
    }
    new IntersectionObserver(function (e) { vu = e[0].isIntersecting; ajuster(); },
        { threshold: 0 }).observe(video);
    document.addEventListener('visibilitychange', function () {
        ongletActif = document.visibilityState === 'visible';
        ajuster();
    });

    /* === Le relief qui suit la souris ===
       La scène Three.js, chargée seulement si quelqu'un bouge une vraie
       souris. Elle coûte cher à peindre là où il n'y a pas de carte
       graphique, et c'est précisément le cas de la machine qui mesure
       PageSpeed : 25 690 ms de blocage mesurés quand elle partait toute
       seule. Cette machine ne bouge jamais de pointeur. Personne ne paie
       donc pour une interaction qu'il n'aura pas. */
    var canvas = document.getElementById('hero-3d');
    if (!canvas) return;
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (innerWidth < 900) return;
    /* Même seuil que pour l'ancien relief : on n'écarte que les machines
       vraiment justes, pas la moitié des ordinateurs de bureau. */
    if (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency < 4) return;
    try {
        var sonde = document.createElement('canvas');
        if (!(sonde.getContext('webgl2') || sonde.getContext('webgl'))) return;
    } catch (e) { return; }

    /* Un vrai geste, pas un artefact. Chrome émet un mousemove quand le
       contenu défile sous un curseur immobile : on exige donc un
       déplacement réel, et d'au moins quelques dizaines de pixels. */
    var depart = null, parcouru = 0, parti = false;
    function geste(e) {
        if (parti || e.pointerType && e.pointerType !== 'mouse') return;
        if (depart) parcouru += Math.abs(e.clientX - depart.x) + Math.abs(e.clientY - depart.y);
        depart = { x: e.clientX, y: e.clientY };
        if (parcouru < 40) return;
        parti = true;
        window.removeEventListener('pointermove', geste);
        charger();
    }
    window.addEventListener('pointermove', geste, { passive: true });

    function charger() {
        var three = document.createElement('script');
        three.src = 'vendor/three.min.js';
        three.onload = function () {
            var relief = document.createElement('script');
            relief.src = 'JS/hero-relief.js';
            document.head.appendChild(relief);
        };
        document.head.appendChild(three);
    }
})();
