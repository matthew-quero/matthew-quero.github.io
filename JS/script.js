/* === REVEAL AU SCROLL === */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal-left, .reveal-up')
                .forEach(el => el.classList.add('reveal-active'));
        }
    });
}, { threshold: 0.2 });

const sectionAlt = document.getElementById('alternance');
if (sectionAlt) observer.observe(sectionAlt);

const sectionAboutTeaser = document.getElementById('about-teaser');
if (sectionAboutTeaser) observer.observe(sectionAboutTeaser);

/* Reveal individuel pour les sections de la page à propos (chaque élément
   s'anime quand il entre dans le viewport, plutôt qu'en bloc par section). */
const aboutRevealItems = document.querySelectorAll('.about-page .reveal-up');
if (aboutRevealItems.length) {
    const itemObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                itemObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    aboutRevealItems.forEach(el => itemObserver.observe(el));
}

/* === LUEUR DE SCROLL SUR LA TIMELINE À PROPOS ===
   Une lueur se déplace le long de la courbe SVG en fonction de la
   progression du scroll dans la section. */
const timelineTrack = document.querySelector('.timeline-track');
const timelinePath = document.querySelector('.timeline-curve path');
if (timelineTrack && timelinePath) {
    const timelineGlow = document.createElement('div');
    timelineGlow.className = 'timeline-glow';
    timelineTrack.appendChild(timelineGlow);

    const pathLength = timelinePath.getTotalLength();
    let glowTicking = false;

    function updateTimelineGlow() {
        const rect = timelineTrack.getBoundingClientRect();
        // Fenêtre resserrée : démarre quand le haut approche le bas de l'écran,
        // termine quand le bas du tracé est encore bien visible (pas en sortie d'écran).
        const startY = window.innerHeight * 0.85;
        const endY = -rect.height * 0.25;
        let progress = (startY - rect.top) / (startY - endY);
        progress = Math.min(1, Math.max(0, progress));

        const point = timelinePath.getPointAtLength(progress * pathLength);
        timelineGlow.style.left = point.x + '%';
        timelineGlow.style.top = (point.y / 4) + '%';
        timelineGlow.style.opacity = (progress > 0 && progress < 1) ? '1' : '0';
        glowTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!glowTicking) {
            requestAnimationFrame(updateTimelineGlow);
            glowTicking = true;
        }
    });
    updateTimelineGlow();
}

/* Hero de page projet : déjà visible à l'écran au chargement, donc on
   déclenche le slide-in directement plutôt que via l'IntersectionObserver. */
const heroContent = document.querySelector('.project-hero-content');
if (heroContent) {
    requestAnimationFrame(() => {
        setTimeout(() => heroContent.classList.add('reveal-active'), 50);
    });
}


/* === OBFUSCATION CONTACT (anti-spam) ===
   Email et téléphone construits au chargement plutôt qu'écrits en clair
   dans le HTML, pour limiter le moissonnage par les bots basiques. */
const emailLink = document.getElementById('contact-email');
if (emailLink) {
    const address = emailLink.dataset.user + '@' + emailLink.dataset.domain;
    emailLink.href = 'mailto:' + address;
    emailLink.querySelector('.value').textContent = address;
}

const phoneLink = document.getElementById('contact-phone');
if (phoneLink) {
    const num = phoneLink.dataset.num;
    phoneLink.href = 'tel:+33' + num.slice(1);
    phoneLink.querySelector('.value').textContent = num.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

/* === TRANSITION DE CLIC VERS UNE PAGE PROJET ===
   Anime l'image de la carte cliquée (zoom plein écran + perte d'opacité)
   avant de naviguer, pour amorcer visuellement le hero à opacité réduite
   de la page projet de destination. Réutilisée par la pile de l'index et
   le bloc "projet suivant" des pages projet. */
function playProjectTransition(imgEl, href) {
    if (typeof gsap === 'undefined' || !imgEl) {
        window.location.href = href;
        return;
    }

    const rect = imgEl.getBoundingClientRect();
    const clone = imgEl.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.top = rect.top + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.margin = '0';
    clone.style.objectFit = 'cover';
    clone.style.borderRadius = '20px';
    clone.style.zIndex = '999';
    clone.style.pointerEvents = 'none';
    document.body.appendChild(clone);

    gsap.to(clone, {
        duration: 0.5,
        ease: 'power2.inOut',
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        opacity: 0.18,
        onComplete() {
            window.location.href = href;
        }
    });
}

/* === PROJETS STACK === */
(function () {
    const stack = document.getElementById('proj-stack');
    if (!stack) return;

    const stages = Array.from(stack.querySelectorAll('.proj-stage'));

    // La carte n'a plus de bouton : le clic doit naviguer partout, y
    // compris sur mobile où l'effet de pile GSAP est désactivé plus bas.
    stages.forEach(stage => {
        stage.addEventListener('click', function () {
            const href = stage.dataset.href;
            if (href) window.location.href = href;
        });
    });

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.innerWidth < 768) return;

    gsap.registerPlugin(ScrollTrigger);

    const n = stages.length;

    const SMALL_SCALE = 0.28;
    const ease = gsap.parseEase('sine.inOut');

    function setStage(stage, growth) {
        const card = stage.querySelector('.proj-card');
        const meta = stage.querySelector('.proj-meta');

        const scale = SMALL_SCALE + (1 - SMALL_SCALE) * growth;
        const radius = 24 * (1 - growth);
        const offsetY = (1 - growth) * window.innerHeight * SMALL_SCALE;
        const metaOpacity = Math.max(0, (growth - 0.75) / 0.25);
        const stageOpacity = growth > 0 ? 1 : 0;

        gsap.set(card, { scale, y: offsetY, borderRadius: radius });
        if (meta) gsap.set(meta, { opacity: metaOpacity });
        gsap.set(stage, { opacity: stageOpacity });
        stage.style.pointerEvents = growth > 0.9 ? 'auto' : 'none';
    }

    function setDark(stage, amount) {
        const dark = stage.querySelector('.proj-dark');
        if (dark) gsap.set(dark, { opacity: amount * 0.6 });
    }

    stages.forEach((stage, i) => {
        setStage(stage, 0);
        setDark(stage, 0);
        stage.style.zIndex = i + 1;
    });

    // La 1ère carte n'a pas de carte précédente derrière elle pour masquer le
    // fond pendant qu'elle grossit. On clone son contenu réel (image + texte)
    // dans un wrapper fixe placé hors du pin, qui monte par-dessus le
    // contenu encore visible (header, etc.) pendant le scroll normal, avant
    // que le pin ne démarre. Ce clone réutilise setStage() : le texte y
    // apparaît donc exactement comme sur les autres cartes. Au moment où le
    // pin s'enclenche, la vraie 1ère carte (cachée jusque-là) saute direct à
    // sa taille pleine et le clone disparaît : bascule invisible.
    const preroll = document.createElement('div');
    preroll.id = 'proj-preroll';
    preroll.setAttribute('aria-hidden', 'true');
    preroll.appendChild(stages[0].querySelector('.proj-card').cloneNode(true));
    stack.parentNode.insertBefore(preroll, stack);
    setStage(preroll, 0);

    // Montée/descente répartie sur tout le scroll d'approche (pas de "fast
    // span") : symétrique dans les deux sens, sans saut brusque en remontant.
    ScrollTrigger.create({
        trigger: stack,
        start: 'top top+=500',
        end: 'top top',
        scrub: true,
        onUpdate(self) {
            setStage(preroll, ease(self.progress));
        },
        onToggle(self) {
            preroll.style.visibility = self.isActive ? 'visible' : 'hidden';
        }
    });

    // La 1ère carte est déjà pleine taille en entrant dans le pin (cf.
    // preroll ci-dessus) : elle ne consomme pas sa propre unité de scroll.
    // Seules les transitions entre cartes (n - 1 d'entre elles) en ont besoin.
    ScrollTrigger.create({
        trigger: stack,
        start: 'top top',
        end: `+=${(n - 1) * window.innerHeight * 1.2}`,
        pin: true,
        scrub: 1.6,
        onUpdate(self) {
            const p = self.progress * (n - 1);
            stages.forEach((stage, i) => {
                const growth = i === 0 ? 1 : ease(Math.min(1, Math.max(0, p - (i - 1))));
                setStage(stage, growth);
                if (i < n - 1) {
                    const nextGrowth = ease(Math.min(1, Math.max(0, p - i)));
                    setDark(stage, nextGrowth);
                }
            });
        },
        // En scrub, onUpdate ne se déclenche que tant que le scroll est dans
        // la plage du pin. En ressortant par le haut (retour en arrière), la
        // 1ère carte resterait figée à sa taille pleine sans ce reset.
        onLeaveBack() {
            setStage(stages[0], 0);
        }
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
})();

/* === ACCORDÉON MOBILE (page Ginglin) === */
document.querySelectorAll('.carte-slide').forEach(card => {
    card.addEventListener('click', function () {
        if (window.innerWidth > 768) return;
        document.querySelectorAll('.carte-slide').forEach(other => {
            if (other !== card) other.classList.remove('active');
        });
        this.classList.toggle('active');
        if (this.classList.contains('active')) {
            setTimeout(() => this.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
        }
    });
});

/* === BLOC "PROJET SUIVANT" (pages projet, template refonte) ===
   Cherche l'entrée suivante dans PORTFOLIO_PROJECTS (JS/projects-data.js)
   d'après data-current sur #next-project, remplit la carte. Reprend
   exactement la mécanique de #proj-stack : un clone "preroll" (position
   fixed, hors du pin) grossit pendant les 500px de scroll qui précèdent
   l'épinglage, pour éviter le flash noir qu'on aurait si la carte ne
   commençait à apparaître qu'au moment du pin. La vraie carte est
   permutée invisiblement à pleine taille pile quand le pin démarre.
   Pendant tout le pin, une barre de chargement se remplit puis
   déclenche playProjectTransition() vers le projet suivant. */
(function () {
    const section = document.getElementById('next-project');
    if (!section || typeof PORTFOLIO_PROJECTS === 'undefined') return;

    const currentIndex = PORTFOLIO_PROJECTS.findIndex(p => p.id === section.dataset.current);
    if (currentIndex === -1) return;

    const next = PORTFOLIO_PROJECTS[(currentIndex + 1) % PORTFOLIO_PROJECTS.length];

    const img = section.querySelector('.next-card-img-wrap img');
    img.src = next.image;
    img.alt = 'Projet ' + next.title;
    section.querySelector('.next-card-cat').textContent = next.category;
    section.querySelector('.next-card-title').textContent = next.title;
    section.querySelector('.next-card-desc').textContent = next.desc;

    const card = section.querySelector('.next-card');
    card.addEventListener('click', () => playProjectTransition(img, next.href));

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.innerWidth < 768) return;
    gsap.registerPlugin(ScrollTrigger);

    const stackEl = section.querySelector('#next-stack');
    const stage = section.querySelector('.next-stage');
    const loadingBar = section.querySelector('.next-loading-bar');
    const loadingFill = section.querySelector('.next-loading-fill');

    const SMALL_SCALE = 0.28;
    const ease = gsap.parseEase('sine.inOut');
    let navigated = false;

    function setStageEl(stageEl, growth) {
        const cardEl = stageEl.querySelector('.next-card');
        const metaEl = stageEl.querySelector('.next-card-meta');
        const scale = SMALL_SCALE + (1 - SMALL_SCALE) * growth;
        const radius = 24 * (1 - growth);
        const offsetY = (1 - growth) * window.innerHeight * SMALL_SCALE;
        const metaOpacity = Math.max(0, (growth - 0.75) / 0.25);

        gsap.set(cardEl, { scale, y: offsetY, borderRadius: radius });
        if (metaEl) gsap.set(metaEl, { opacity: metaOpacity });
        gsap.set(stageEl, { opacity: growth > 0 ? 1 : 0 });
        cardEl.style.pointerEvents = growth > 0.9 ? 'auto' : 'none';
    }

    setStageEl(stage, 0);

    const preroll = document.createElement('div');
    preroll.id = 'next-preroll';
    preroll.setAttribute('aria-hidden', 'true');
    preroll.appendChild(card.cloneNode(true));
    stackEl.parentNode.insertBefore(preroll, stackEl);
    setStageEl(preroll, 0);

    ScrollTrigger.create({
        trigger: stackEl,
        start: 'top top+=300',
        end: 'top top',
        scrub: true,
        onUpdate(self) {
            setStageEl(preroll, ease(self.progress));
        },
        onToggle(self) {
            preroll.style.visibility = self.isActive ? 'visible' : 'hidden';
        }
    });

    ScrollTrigger.create({
        trigger: stackEl,
        start: 'top top',
        end: `+=${window.innerHeight * 0.7}`,
        pin: true,
        scrub: 1,
        onUpdate(self) {
            setStageEl(stage, 1);
            const loadP = self.progress;
            loadingBar.style.opacity = 1;
            loadingFill.style.width = (loadP * 100) + '%';
            if (loadP >= 1 && !navigated) {
                navigated = true;
                playProjectTransition(img, next.href);
            }
        },
        onLeaveBack() {
            setStageEl(stage, 0);
            loadingBar.style.opacity = 0;
            loadingFill.style.width = '0%';
            navigated = false;
        }
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
})();
