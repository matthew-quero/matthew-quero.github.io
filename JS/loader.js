(function () {

    /* === LOADER : DRAW SVG === */
    var loader = document.getElementById('loader');
    if (!loader) return;

    document.documentElement.style.overflow = 'hidden';

    var animDone = false;
    var pageDone = false;

    function doSlideUp() {
        if (!animDone || !pageDone) return;
        loader.classList.add('slide-up');
        document.dispatchEvent(new CustomEvent('hero:reveal'));
        loader.addEventListener('transitionend', function () {
            document.documentElement.style.overflow = '';
            document.body.classList.remove('is-loading');
            loader.remove();
        }, { once: true });
    }

    window.addEventListener('load', function () {
        setTimeout(function () { pageDone = true; doSlideUp(); }, 400);
    });

    if (typeof opentype !== 'undefined' && typeof MONTSERRAT_BLACK_B64 !== 'undefined' && typeof gsap !== 'undefined') {
        try {
            var mEl  = document.getElementById('loader-path-m');
            var qEl  = document.getElementById('loader-path-q');

            var b64  = MONTSERRAT_BLACK_B64.replace(/\s/g, '');
            var bin  = atob(b64);
            var buf  = new ArrayBuffer(bin.length);
            var view = new Uint8Array(buf);
            for (var i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);

            var font     = opentype.parse(buf);
            var fSize    = 100;
            var baseline = 98;
            var mAdv     = (font.charToGlyph('M').advanceWidth / font.unitsPerEm) * fSize;
            var qAdv     = (font.charToGlyph('Q').advanceWidth / font.unitsPerEm) * fSize;
            var gap      = 10;
            var totalW   = mAdv + gap + qAdv;
            var mX       = (220 - totalW) / 2;
            var qX       = mX + mAdv + gap;

            mEl.setAttribute('d', font.getPath('M', mX, baseline, fSize).toPathData(2));
            qEl.setAttribute('d', font.getPath('Q', qX, baseline, fSize).toPathData(2));

            var mLen = mEl.getTotalLength();
            var qLen = qEl.getTotalLength();

            gsap.set(mEl, { strokeDasharray: mLen, strokeDashoffset: mLen, fillOpacity: 0, strokeOpacity: 1 });
            gsap.set(qEl, { strokeDasharray: qLen, strokeDashoffset: qLen, fillOpacity: 0, strokeOpacity: 1 });

            gsap.timeline({ delay: 0.25 })
                .to(mEl, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, 0)
                .to(qEl, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, 0.3)
                .to([mEl, qEl], { fillOpacity: 1, duration: 0.4, ease: 'power1.in'  }, 1.6)
                .to([mEl, qEl], { strokeOpacity: 0, duration: 0.25                  }, 1.75)
                .add(function () { animDone = true; doSlideUp(); }, '+=0.4');

        } catch (e) {
            console.error('Loader error:', e);
            animDone = true; doSlideUp();
        }
    } else {
        animDone = true; doSlideUp();
    }

})();
