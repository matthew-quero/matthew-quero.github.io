/* === CONTACT 2026 (accueil, section #contact) ===
   Menu déroulant maison + envoi du formulaire à Web3Forms sans quitter la page. */
(function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    /* --- Menu déroulant --- */
    const select = form.querySelector('.contact-select');
    const button = select.querySelector('.contact-select-button');
    const valueEl = select.querySelector('.contact-select-value');
    const list = select.querySelector('.contact-select-list');
    const options = [...list.querySelectorAll('[role="option"]')];
    const hidden = form.querySelector('input[name="demande"]');
    const EMPTY = valueEl.textContent;

    function open() {
        list.hidden = false;
        select.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
    }
    function close() {
        list.hidden = true;
        select.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
    }
    function choose(option) {
        options.forEach(o => o.setAttribute('aria-selected', String(o === option)));
        hidden.value = option ? option.textContent : '';
        valueEl.textContent = option ? option.textContent : EMPTY;
        select.classList.toggle('is-chosen', !!option);
    }

    button.addEventListener('click', () => (list.hidden ? open() : close()));
    options.forEach(option => {
        option.addEventListener('click', () => { choose(option); close(); button.focus(); });
        option.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); option.click(); }
        });
    });
    document.addEventListener('click', e => { if (!select.contains(e.target)) close(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !list.hidden) { close(); button.focus(); }
    });

    /* --- Envoi --- */
    const submit = form.querySelector('.contact-submit');
    const submitLabel = submit.querySelector('.contact-submit-label');
    const error = form.querySelector('.contact-error');
    const success = document.querySelector('.contact-success');

    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (form.elements.botcheck.checked) return;

        const name = form.elements.prenom.value.trim() + ' ' + form.elements.nom.value.trim();
        form.elements.subject.value = ['Portfolio', hidden.value, name].filter(Boolean).join(' · ');
        form.elements.replyto.value = form.elements.email.value.trim();

        const data = Object.fromEntries(new FormData(form));
        delete data.botcheck;

        error.hidden = true;
        submit.disabled = true;
        submitLabel.textContent = 'Envoi…';

        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message);

            form.reset();
            choose(null);
            form.hidden = true;
            success.hidden = false;
        } catch {
            error.hidden = false;
        } finally {
            submit.disabled = false;
            submitLabel.textContent = 'Envoyer';
        }
    });
})();
