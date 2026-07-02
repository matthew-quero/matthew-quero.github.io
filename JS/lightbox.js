(function () {
    var lb        = document.getElementById('lightbox');
    var lbImg     = document.getElementById('lbImg');
    var lbCaption = document.getElementById('lbCaption');
    var lbZoomVal = document.getElementById('lbZoomVal');
    var lbWrap    = document.getElementById('lbImgWrap');
    var lbNavPrev = document.getElementById('lbNavPrev');
    var lbNavNext = document.getElementById('lbNavNext');
    if (!lb || !lbImg) return;

    var scale = 1, panX = 0, panY = 0;
    var dragging = false, startX, startY;
    var currentOnNav = null, currentOnClose = null;

    function setZoom(z) {
        scale = Math.min(4, Math.max(0.5, z));
        lbImg.style.transform = 'scale(' + scale + ') translate(' + (panX / scale) + 'px,' + (panY / scale) + 'px)';
        lbZoomVal.textContent = Math.round(scale * 100) + '%';
    }

    function resetView() {
        scale = 1; panX = 0; panY = 0;
        lbImg.style.transform = '';
        lbZoomVal.textContent = '100%';
    }

    function setContent(opts) {
        lbImg.src = opts.src;
        lbImg.alt = opts.alt || '';
        lbCaption.textContent = opts.caption || '';
        resetView();
    }

    /* Ouvre une image simple, sans navigation prev/next */
    function open(opts) {
        currentOnNav = null;
        currentOnClose = null;
        setContent(opts);
        lbNavPrev.classList.add('lb-nav-hidden');
        lbNavNext.classList.add('lb-nav-hidden');
        lb.classList.remove('lb-hidden');
        document.body.style.overflow = 'hidden';
    }

    /* Ouvre avec navigation prev/next (ex: étapes d'un process) */
    function openWithNav(opts) {
        currentOnNav = opts.onNav || null;
        currentOnClose = opts.onClose || null;
        setContent(opts);
        lbNavPrev.classList.toggle('lb-nav-hidden', !opts.hasPrev);
        lbNavNext.classList.toggle('lb-nav-hidden', !opts.hasNext);
        lb.classList.remove('lb-hidden');
        document.body.style.overflow = 'hidden';
    }

    /* Met à jour le contenu affiché sans rouvrir (navigation interne) */
    function updateNav(opts) {
        setContent(opts);
        lbNavPrev.classList.toggle('lb-nav-hidden', !opts.hasPrev);
        lbNavNext.classList.toggle('lb-nav-hidden', !opts.hasNext);
    }

    function close() {
        lb.classList.add('lb-hidden');
        document.body.style.overflow = '';
        var onClose = currentOnClose;
        currentOnNav = null;
        currentOnClose = null;
        if (onClose) onClose();
    }

    function navigate(dir) {
        if (currentOnNav) currentOnNav(dir);
    }

    document.getElementById('lbClose').addEventListener('click', close);
    document.getElementById('lbBackdrop').addEventListener('click', close);
    lbNavPrev.addEventListener('click', function() { navigate(-1); });
    lbNavNext.addEventListener('click', function() { navigate(1); });
    document.getElementById('lbZoomIn').addEventListener('click', function() { setZoom(scale + 0.25); });
    document.getElementById('lbZoomOut').addEventListener('click', function() { setZoom(scale - 0.25); });
    document.getElementById('lbZoomReset').addEventListener('click', function() { scale = 1; panX = 0; panY = 0; setZoom(1); });

    lbWrap.addEventListener('wheel', function(e) {
        e.preventDefault();
        setZoom(scale + (e.deltaY < 0 ? 0.15 : -0.15));
    }, { passive: false });

    lbImg.addEventListener('mousedown', function(e) {
        if (scale <= 1) return;
        dragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        lbImg.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        lbImg.style.transform = 'scale(' + scale + ') translate(' + (panX / scale) + 'px,' + (panY / scale) + 'px)';
    });
    window.addEventListener('mouseup', function() {
        dragging = false;
        lbImg.style.cursor = scale > 1 ? 'grab' : 'default';
    });

    window.addEventListener('keydown', function(e) {
        if (lb.classList.contains('lb-hidden')) return;
        if (e.key === 'Escape') close();
        if (e.key === '+' || e.key === '=') setZoom(scale + 0.25);
        if (e.key === '-') setZoom(scale - 0.25);
        if (e.key === '0') { scale = 1; panX = 0; panY = 0; setZoom(1); }
        if (currentOnNav) {
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        }
    });

    window.Lightbox = {
        open: open,
        openWithNav: openWithNav,
        updateNav: updateNav,
        close: close
    };
})();
