/* === ACCUEIL 2026 === */

/* Date du jour au-dessus de "En recherche d'alternance" (hero) */
(function () {
    const d = document.getElementById('hero-date');
    if (!d) return;
    const fmt = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    function day() {
        const t = fmt.format(new Date());
        d.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    }
    day();
    setInterval(day, 600000);
})();
