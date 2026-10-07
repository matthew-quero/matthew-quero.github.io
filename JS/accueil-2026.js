/* === ACCUEIL 2026 === */

/* Année du pied de page, jamais écrite en dur */
(function () {
    const y = document.getElementById('footer-year');
    if (y) y.textContent = new Date().getFullYear();
})();

