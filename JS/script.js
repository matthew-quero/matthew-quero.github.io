/* --- CONFIGURATION --- */
const track = document.getElementById("image-track");
const myImages = ['1.webp', '2.webp', '5.webp', '9.webp', '6.webp', '7.webp', '8.webp', '10.webp', '11.webp', '12.webp', '13.webp', '14.webp', '15.webp', '16.webp', '18.webp', '19.webp', '20.webp', '21.webp', '22.webp', '23.webp', '24.webp'];

let lastMousePos = { x: 0, y: 0 };
let imageIndex = 0;
const threshold = 150; 
const priorityCount = 10; 
let priorityLoaded = 0;
let isReadyToStart = false;

/* --- INITIALISATION TRACKER INTELLIGENT (UNIQUEMENT PC > 1024px) --- */
if (track && window.innerWidth > 1024) {
    myImages.forEach((file, index) => {
        const img = new Image(); 
        img.src = `img/${file}`;
        img.classList.add("track-image");
        img.dataset.index = index;

        img.onload = () => {
            img.classList.add("loaded");
            // Si c'est une image prioritaire, on incrémente le compteur
            if (index < priorityCount) {
                priorityLoaded++;
                if (priorityLoaded === priorityCount) {
                    isReadyToStart = true;
                    console.log("QuickStart : Prêt à tracker.");
                }
            }
        };
        track.appendChild(img);
    });
}

const images = document.querySelectorAll(".track-image");

window.addEventListener("mousemove", e => {
    // Désactivé si : pas prêt / scroll > 600 / écran <= 1024px / pas de track
    if (!isReadyToStart || window.scrollY > 600 || !track || window.innerWidth <= 1024) return;

    const distance = Math.hypot(e.clientX - lastMousePos.x, e.clientY - lastMousePos.y);

    if (distance > threshold) {
        const currentImages = document.querySelectorAll(".track-image");
        // SKIP LOGIC : On prend l'image prévue
        let imgToDisplay = currentImages[imageIndex];
        
        // Si elle n'est pas encore chargée (classe 'loaded' absente)
        if (imgToDisplay && !imgToDisplay.classList.contains('loaded')) {
            // On cherche en marche arrière l'image chargée la plus proche
            let fallbackIndex = imageIndex;
            while (fallbackIndex >= 0 && currentImages[fallbackIndex] && !currentImages[fallbackIndex].classList.contains('loaded')) {
                fallbackIndex--;
            }
            if (fallbackIndex >= 0) imgToDisplay = currentImages[fallbackIndex];
            else return; 
        }

        if (imgToDisplay) {
            imgToDisplay.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
            imgToDisplay.style.zIndex = imageIndex;
            imgToDisplay.style.opacity = "1";

            setTimeout(() => { imgToDisplay.style.opacity = "0"; }, 1000);

            lastMousePos = { x: e.clientX, y: e.clientY };
            imageIndex = (imageIndex + 1) % currentImages.length;
        }
    }
});

/* --- REVEAL ANIMATIONS --- */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal-left, .reveal-up').forEach(el => el.classList.add('reveal-active'));
        }
    });
}, { threshold: 0.2 });

const sectionAlt = document.getElementById('alternance');
if (sectionAlt) observer.observe(sectionAlt);

/* --- STACK CARD EFFECT (Activé partout) --- */
window.addEventListener('scroll', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const next = cards[i + 1].getBoundingClientRect().top;
        if (next < window.innerHeight && next > 0) {
            const factor = (window.innerHeight - next) / window.innerHeight;
            card.style.transform = `scale(${1 - factor * 0.05})`;
            card.style.filter = `brightness(${1 - factor * 0.5})`;
        } else {
            card.style.transform = 'scale(1)';
            card.style.filter = 'brightness(1)';
        }
    });
});

/* --- GESTION CLIC ALTERNANCE MOBILE (Ouverture bas) --- */
document.querySelectorAll('.carte-slide').forEach(card => {
    card.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.carte-slide').forEach(other => {
                if (other !== card) other.classList.remove('active');
            });
            this.classList.toggle('active');
            if(this.classList.contains('active')) {
                setTimeout(() => { this.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 400);
            }
        }
    });
});

/* --- BOUTON RETOUR EN HAUT --- */
const backToTop = document.getElementById("back-to-top");
if (backToTop) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) backToTop.classList.add("visible");
        else backToTop.classList.remove("visible");
    });
    backToTop.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: "smooth" }); });
}

/* --- LOGIQUE ASSISTANT AVATAR --- */
const assistantTrigger = document.getElementById('assistant-trigger');
const assistantMenu = document.getElementById('assistant-menu');
if (assistantTrigger && assistantMenu) {
    assistantTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        assistantMenu.classList.toggle('active');
    });
    document.addEventListener('click', () => {
        assistantMenu.classList.remove('active');
    });
}