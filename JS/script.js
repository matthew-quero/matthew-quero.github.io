/* --- CONFIGURATION --- */
const track = document.getElementById("image-track");
const myImages = ['1.webp', '2.webp', '5.webp', '9.webp', '6.webp', '7.webp', '8.webp', '10.webp', '11.webp', '12.webp', '13.webp', '14.webp', '15.webp', '16.webp', '18.webp', '19.webp', '20.webp', '21.webp', '22.webp', '23.webp', '24.webp'];

let lastMousePos = { x: 0, y: 0 };
let imageIndex = 0;
const threshold = 150; 

/* --- INITIALISATION TRACKER --- */
if (track) {
    myImages.forEach(file => {
        const img = document.createElement("img");
        img.src = `img/${file}`;
        img.classList.add("track-image");
        track.appendChild(img);
    });
}

const images = document.querySelectorAll(".track-image");

window.addEventListener("mousemove", e => {
    if (window.scrollY > 600 || !track) return;
    const distance = Math.hypot(e.clientX - lastMousePos.x, e.clientY - lastMousePos.y);
    if (distance > threshold) {
        const img = images[imageIndex];
        img.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        img.style.zIndex = imageIndex;
        img.style.opacity = "1";
        setTimeout(() => { img.style.opacity = "0"; }, 1000);
        lastMousePos = { x: e.clientX, y: e.clientY };
        imageIndex = (imageIndex + 1) % images.length;
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
            // Ferme les autres boîtes ouvertes
            document.querySelectorAll('.carte-slide').forEach(other => {
                if (other !== card) other.classList.remove('active');
            });
            // Alterne l'état de la carte cliquée
            this.classList.toggle('active');
            
            // Scroll doux vers l'élément ouvert
            if(this.classList.contains('active')) {
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 400);
            }
        }
    });
});

/* --- BOUTON RETOUR EN HAUT --- */
const backToTop = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
        backToTop.classList.add("visible");
    } else {
        backToTop.classList.remove("visible");
    }
});

backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});