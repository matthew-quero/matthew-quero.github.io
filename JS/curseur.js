/* === CURSEUR CUSTOM (partagé) ===
   Point plein vert qui suit la souris, devient un anneau au survol
   des éléments cliquables. Masqué en CSS sur les écrans tactiles.
   Attend un <div class="ring" id="ring"> dans la page. */
(function () {
    const ring = document.getElementById('ring');
    if (!ring) return;

    const CLICKABLE = 'a, button';

    addEventListener('pointermove', function (e) {
        ring.style.left = e.clientX + 'px';
        ring.style.top = e.clientY + 'px';
    }, { passive: true });

    document.addEventListener('pointerover', function (e) {
        ring.classList.toggle('hollow', !!e.target.closest(CLICKABLE));
    });
})();
