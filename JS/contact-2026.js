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
        if (option) check(checks[0]);
    }

    /* --- Vérification maison (formulaire en novalidate) ---
       Chaque règle : l'élément qui porte le filet, la valeur à tester, le message. */
    const email = form.elements.email;
    const checks = [
        { el: button, error: 'Choisissez le type de demande.', test: () => hidden.value !== '' },
        { el: form.elements.prenom, test: el => el.value.trim() !== '', error: 'Il me faut votre prénom.' },
        { el: form.elements.nom, test: el => el.value.trim() !== '', error: 'Il me faut votre nom.' },
        {
            el: email,
            test: el => el.value.trim() !== '' && !el.validity.typeMismatch,
            error: el => el.value.trim() === '' ? 'Il me faut votre email pour vous répondre.' : 'Cet email ne semble pas valide.'
        }
    ];

    function setError(rule, message) {
        const msg = document.getElementById(rule.el.getAttribute('aria-describedby'));
        if (message) {
            rule.el.setAttribute('aria-invalid', 'true');
            msg.textContent = message;
            msg.hidden = false;
        } else {
            rule.el.removeAttribute('aria-invalid');
            msg.textContent = '';
            msg.hidden = true;
        }
    }

    // Vérifie une règle ; renvoie true si le champ est valide
    function check(rule) {
        const ok = rule.test(rule.el);
        setError(rule, ok ? '' : (typeof rule.error === 'function' ? rule.error(rule.el) : rule.error));
        return ok;
    }

    // Le message disparaît dès que la saisie redevient valide, sans attendre un nouvel envoi
    checks.slice(1).forEach(rule => {
        rule.el.addEventListener('input', () => {
            if (rule.el.getAttribute('aria-invalid') === 'true' && rule.test(rule.el)) setError(rule, '');
        });
    });

    function validate() {
        const invalid = checks.filter(rule => !check(rule));
        if (invalid.length) invalid[0].el.focus();
        return invalid.length === 0;
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
        if (!validate()) return;

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
