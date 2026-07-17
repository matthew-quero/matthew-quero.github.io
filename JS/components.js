(function () {
    const isAltPage = document.body.classList.contains('alt-page');
    const isAboutPage = document.body.classList.contains('about-page');
    const isProjectPage = document.body.classList.contains('project-page');
    const isHomePage = !isAltPage && !isAboutPage && !isProjectPage;

    /* --- NAVIGATION LATÉRALE --- */
    document.body.insertAdjacentHTML('afterbegin', `
        <button id="nav-trigger" aria-label="Ouvrir le menu" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
        <div id="nav-overlay"></div>
        <nav id="side-nav" aria-label="Navigation principale">
            <a href="index.html" class="side-nav-link${isHomePage ? ' active' : ''}">Accueil</a>
            <a href="index.html#projets" class="side-nav-link${isProjectPage ? ' active' : ''}">Projets</a>
            <a href="as-ginglin-cesson.html" class="side-nav-link${isAltPage ? ' active' : ''}">Alternance</a>
            <a href="a-propos.html" class="side-nav-link${isAboutPage ? ' active' : ''}">À propos</a>
        </nav>
    `);

    /* --- SVG ICONS --- */
    const SVG = {
        linkedin: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="icon"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
        behance: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="icon"><path d="M16.969 16.927a2.561 2.561 0 0 0 1.901.677 2.501 2.501 0 0 0 1.531-.475c.362-.235.636-.584.779-.99h2.585a5.091 5.091 0 0 1-1.9 2.896 5.292 5.292 0 0 1-3.091.88 5.839 5.839 0 0 1-2.284-.433 4.871 4.871 0 0 1-1.723-1.211 5.657 5.657 0 0 1-1.08-1.874 7.057 7.057 0 0 1-.383-2.393c-.005-.8.129-1.595.396-2.349a5.313 5.313 0 0 1 5.088-3.604 4.87 4.87 0 0 1 2.376.563c.661.362 1.231.87 1.668 1.485a6.2 6.2 0 0 1 .943 2.133c.194.821.263 1.666.205 2.508h-7.699c-.063.79.184 1.574.688 2.187ZM6.947 4.084a8.065 8.065 0 0 1 1.928.198 4.29 4.29 0 0 1 1.49.638c.418.303.748.711.958 1.182.241.579.357 1.203.341 1.83a3.506 3.506 0 0 1-.506 1.961 3.726 3.726 0 0 1-1.503 1.287 3.588 3.588 0 0 1 2.027 1.437c.464.747.697 1.615.67 2.494a4.593 4.593 0 0 1-.423 2.032 3.945 3.945 0 0 1-1.163 1.413 5.114 5.114 0 0 1-1.683.807 7.135 7.135 0 0 1-1.928.259H0V4.084h6.947Zm-.235 12.9c.308.004.616-.029.916-.099a2.18 2.18 0 0 0 .766-.332c.228-.158.411-.371.534-.619.142-.317.208-.663.191-1.009a2.08 2.08 0 0 0-.642-1.715 2.618 2.618 0 0 0-1.696-.505h-3.54v4.279h3.471Zm13.635-5.967a2.13 2.13 0 0 0-1.654-.619 2.336 2.336 0 0 0-1.163.259 2.474 2.474 0 0 0-.738.62 2.359 2.359 0 0 0-.396.792c-.074.239-.12.485-.137.734h4.769a3.239 3.239 0 0 0-.679-1.785l-.002-.001Zm-13.813-.648a2.254 2.254 0 0 0 1.423-.433c.399-.355.607-.88.56-1.413a1.916 1.916 0 0 0-.178-.891 1.298 1.298 0 0 0-.495-.533 1.851 1.851 0 0 0-.711-.274 3.966 3.966 0 0 0-.835-.073H3.241v3.631h3.293v-.014ZM21.62 5.122h-5.976v1.527h5.976V5.122Z"/></svg>`,
        facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
        instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`
    };

    /* --- BACK TO TOP --- */
    document.body.insertAdjacentHTML('beforeend', `
        <button id="back-to-top" title="Retour en haut">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4l-8 8h5v8h6v-8h5z"/>
            </svg>
        </button>
    `);

    /* --- FOOTER (pas sur la page à propos) --- */
    if (!isAboutPage) {
        /* Email/tél reconstruits au lieu d'être écrits en clair, pour limiter
           le moissonnage par les bots basiques (même logique que a-propos.html). */
        const emailUser = 'quero.matthew';
        const emailDomain = 'gmail.com';
        const emailAddress = emailUser + '@' + emailDomain;
        const phoneDigits = '0668143424';
        const phoneDisplay = phoneDigits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
        const phoneHref = 'tel:+33' + phoneDigits.slice(1);

        const socialsTitle = isAltPage ? 'Suivre le club' : 'Me suivre sur les réseaux';
        const socialsHTML = isAltPage
            ? `<a href="https://www.facebook.com/AsGinglinCesson/" target="_blank" class="social-link" title="Facebook AS Ginglin">${SVG.facebook}</a>
               <a href="https://www.instagram.com/asginglincesson/" target="_blank" class="social-link" title="Instagram AS Ginglin">${SVG.instagram}</a>`
            : `<a href="https://www.linkedin.com/in/matthew-qu%C3%A9ro/" target="_blank" class="social-link" title="LinkedIn Matthew Quéro" aria-label="LinkedIn de Matthew Quéro">${SVG.linkedin}</a>
               <a href="https://www.behance.net/matthewquero" target="_blank" class="social-link" title="Behance Matthew Quéro" aria-label="Behance de Matthew Quéro">${SVG.behance}</a>`;

        document.body.insertAdjacentHTML('beforeend', `
            <footer id="main-footer">
                <div class="footer-container">
                    <div class="footer-socials">
                        <h4>${socialsTitle}</h4>
                        <div class="social-icons">${socialsHTML}</div>
                    </div>
                    <div class="footer-contact">
                        <h4>Envie de me contacter ?</h4>
                        <div class="contact-info">
                            <a href="mailto:${emailAddress}" class="contact-link">${emailAddress}</a>
                            <br>
                            <a href="${phoneHref}" class="contact-link phone">${phoneDisplay}</a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    © 2026 Matthew Quéro - Tous droits réservés |
                    <a href="mentions-legales.html" style="color: inherit; text-decoration: none; opacity: 0.6;">Mentions Légales</a>
                </div>
            </footer>
        `);
    }

    /* --- BACK BUTTON HOVER EFFECT --- */
    document.querySelectorAll('.back-link, .btn-back').forEach(link => {
        const text = link.textContent.trim();
        const match = text.match(/^(.*?retour)(.*)/i);
        if (!match || !match[2].trim()) return;
        link.innerHTML = `${match[1].trimEnd()}<span class="back-suffix">&nbsp;${match[2].trim()}</span>`;
    });

    /* --- EVENTS --- */
    const navTrigger = document.getElementById('nav-trigger');
    const navOverlay = document.getElementById('nav-overlay');
    const sideNav = document.getElementById('side-nav');
    const closeNav = () => {
        document.body.classList.remove('nav-open');
        navTrigger.setAttribute('aria-expanded', 'false');
    };
    navTrigger.addEventListener('click', () => {
        const open = document.body.classList.toggle('nav-open');
        navTrigger.setAttribute('aria-expanded', String(open));
    });
    navOverlay.addEventListener('click', closeNav);
    sideNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeNav();
    });

    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
