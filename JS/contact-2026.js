/* === CONTACT 2026 (accueil, section #contact) ===
   Vérification des champs + envoi à Web3Forms sans quitter la page.

   Le menu déroulant était fait maison, avec un <ul role="listbox"> dont
   chaque option portait tabindex="0". Il est maintenant natif : plus rien
   à piloter ici pour l'ouverture, la fermeture, les flèches ou l'échappement,
   le navigateur s'en charge, et le téléphone affiche son propre sélecteur. */
(function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const demande = form.elements.demande;

    /* --- Vérification maison (formulaire en novalidate) ---
       Chaque règle : l'élément qui porte le filet, la valeur à tester, le message. */
    const email = form.elements.email;
    const checks = [
        { el: demande, error: 'Choisissez le type de demande.', test: el => el.value !== '' },
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

    /* Un champ déjà en erreur est revérifié à chaque frappe : le message suit
       la saisie (vide ou mal formé pour l'email) et disparaît dès qu'elle
       devient valide. Le menu déroulant écoute change et non input, et sans
       attendre d'être en erreur : choisir une valeur efface le reproche. */
    checks.forEach(rule => {
        const evenement = rule.el === demande ? 'change' : 'input';
        rule.el.addEventListener(evenement, () => {
            if (rule.el === demande || rule.el.getAttribute('aria-invalid') === 'true') check(rule);
        });
    });

    function validate() {
        const invalid = checks.filter(rule => !check(rule));
        if (invalid.length) invalid[0].el.focus();
        return invalid.length === 0;
    }

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
        form.elements.subject.value = ['Portfolio', demande.value, name].filter(Boolean).join(' · ');
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
            form.hidden = true;
            success.hidden = false;
        } catch {
            /* En cas d'échec, la saisie reste en place : form.reset() n'est
               appelé que sur un envoi réussi. Le message porte role="alert",
               il est donc annoncé sans déplacer le focus. */
            error.hidden = false;
        } finally {
            submit.disabled = false;
            submitLabel.textContent = 'Envoyer';
        }
    });
})();
