(function () {

    /* === HERO : TYPO KINÉTIQUE === */
    var heroEl = document.getElementById('hero');
    var line1  = document.querySelector('.line-1');
    if (!heroEl || !line1) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Découpe "PORTFOLIO" en lettres individuelles pour l'animation, en gardant le mot complet pour les lecteurs d'écran */
    var word = line1.textContent;
    line1.setAttribute('aria-label', word);
    line1.innerHTML = '';
    word.split('').forEach(function (char) {
        var span = document.createElement('span');
        span.className = 'letter';
        span.textContent = char;
        span.setAttribute('aria-hidden', 'true');
        line1.appendChild(span);
    });

    function playReveal() {
        var letters = line1.querySelectorAll('.letter');

        if (typeof gsap === 'undefined' || reducedMotion) {
            gsap && gsap.set([letters, '.hero-line', '.line-2', '.scroll-indicator'], { clearProps: 'all' });
            return;
        }

        var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from(letters, { yPercent: 100, opacity: 0, duration: 0.8, stagger: 0.045 })
          .to('.hero-line', { scaleX: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3')
          .from('.line-2', { y: 20, opacity: 0, duration: 0.6 }, '-=0.2')
          .from('.scroll-indicator', { opacity: 0, duration: 0.6 }, '-=0.2');
    }

    document.addEventListener('hero:reveal', playReveal, { once: true });


})();
