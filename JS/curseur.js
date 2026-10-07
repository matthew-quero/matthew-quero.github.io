/* === CURSEUR CUSTOM (partagé) ===
   Point plein vert qui suit la souris, devient un anneau au survol
   des éléments cliquables. Masqué en CSS sur les écrans tactiles.
   Attend un <div class="ring"> dans la page. On cible la classe et
   non un id : seule l'accueil en avait un, les six autres pages se
   retrouvaient donc sans curseur du tout, le natif etant masque en CSS. */
(function () {
    const ring = document.querySelector('.ring');
    if (!ring) return;

    const CLICKABLE = 'a, button, [role="option"]';

    addEventListener('pointermove', function (e) {
        ring.style.left = e.clientX + 'px';
        ring.style.top = e.clientY + 'px';
    }, { passive: true });

    document.addEventListener('pointerover', function (e) {
        ring.classList.toggle('hollow', !!e.target.closest(CLICKABLE));
    });
})();
