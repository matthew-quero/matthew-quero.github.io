const strip = document.getElementById('image-strip');
const sliderContainer = document.getElementById('slider-container');
const content = document.getElementById('content');

// --- TA LISTE D'IMAGES ---
const myImages = [
    '1.png',   
    '2.png',   
    '3.jpg',   
    '5.png',   
    '9.jpg',   
    '6.png',   
    '7.jpg',
    '8.jpg',
    '10.jpg',
    '11.jpg',
    '12.jpg',
    '13.jpg',
    '14.jpg',
    '15.jpg',
    '16.jpg',
    '18.png',
    '19.jpg',
    '20.jpg',
    '21.jpg',
    '22.jpg',
    '23.jpg',
    '24.jpg',
];

const numberOfImages = myImages.length; 
const imageWidthVW = 40; 
let imageWidthPx = (window.innerWidth * imageWidthVW) / 100; 

function createImages(setIndex) {
    myImages.forEach((filename) => {
        const div = document.createElement('div');
        div.classList.add('image-item');
        // Le code cherche dans le dossier "img"
        div.style.backgroundImage = `url(img/${filename})`; 
        strip.appendChild(div);
    });
}

// On génère 3 fois la liste
createImages(1); 
createImages(2); 
createImages(3);

const images = document.querySelectorAll('.image-item');


// --- 3. POSITIONNEMENT INITIAL ---
// On calcule la largeur totale d'un SEUL set d'images
let singleSetWidth = numberOfImages * imageWidthPx;

// On place l'utilisateur au début du SET 2 (au milieu)
let currentTranslate = -singleSetWidth;
let prevTranslate = currentTranslate;

strip.style.transform = `translateX(${currentTranslate}px)`;


// --- 4. LOGIQUE DRAG & DROP ---
let isDown = false;
let startX;

sliderContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - sliderContainer.offsetLeft;
    strip.style.transition = 'none'; // Pas de transition quand on drag
});

sliderContainer.addEventListener('mouseleave', () => {
    isDown = false;
    strip.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
});

sliderContainer.addEventListener('mouseup', () => {
    isDown = false;
    strip.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
    prevTranslate = currentTranslate;
});

sliderContainer.addEventListener('mousemove', (e) => {
    
    // --- A. GESTION DU MOUVEMENT ---
    if (isDown) {
        e.preventDefault();
        const x = e.pageX - sliderContainer.offsetLeft;
        const walk = (x - startX) * 1.5; // Vitesse du scroll
        currentTranslate = prevTranslate + walk;
        
        strip.style.transform = `translateX(${currentTranslate}px)`;
        
        // VÉRIFICATION DE LA BOUCLE INFINIE PENDANT LE DRAG
        checkBoundary();
    }

    // --- B. EFFET LUMIÈRE (LAMPE TORCHE) ---
    const range = 600; 

    images.forEach(img => {
        const rect = img.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const dist = Math.abs(e.clientX - centerX);
        
        if (dist < range) {
            const intensity = 1 - (dist / range);
            img.style.filter = `grayscale(${100 - (intensity * 100)}%)`;
            img.style.opacity = 0.2 + (intensity * 0.8);
        } else {
            img.style.filter = 'grayscale(100%)';
            img.style.opacity = '0.2';
        }
    });

    // --- C. GESTION DU TEXTE ---
    // J'ai supprimé le code ici. Le texte ne disparaîtra plus jamais.
});

// --- 5. LA FONCTION MAGIQUE DE BOUCLE INFINIE ---
function checkBoundary() {
    // Si on est allé trop loin à GAUCHE
    if (currentTranslate > 0) {
        strip.style.transition = 'none'; 
        currentTranslate -= singleSetWidth; 
        prevTranslate = currentTranslate; 
        strip.style.transform = `translateX(${currentTranslate}px)`;
    }
    
    // Si on est allé trop loin à DROITE
    if (currentTranslate < -(singleSetWidth * 2)) {
        strip.style.transition = 'none'; 
        currentTranslate += singleSetWidth; 
        prevTranslate = currentTranslate;
        strip.style.transform = `translateX(${currentTranslate}px)`;
    }
}

// --- 6. RESPONSIVE ---
window.addEventListener('resize', () => {
    imageWidthPx = (window.innerWidth * imageWidthVW) / 100;
    singleSetWidth = numberOfImages * imageWidthPx;
    currentTranslate = -singleSetWidth;
    prevTranslate = currentTranslate;
    strip.style.transform = `translateX(${currentTranslate}px)`;
});

// --- 7. ANIMATION AU SCROLL (Intersection Observer) ---
const observerOptions = {
    threshold: 0.3 // L'animation se lance quand 30% de la section est visible
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // On trouve les éléments à animer DANS la section visible
            const reveals = entry.target.querySelectorAll('.reveal-left, .reveal-up');
            reveals.forEach(el => el.classList.add('reveal-active'));
        }
    });
}, observerOptions);

// On surveille la section alternance
const sectionAlternance = document.getElementById('alternance');
if (sectionAlternance) {
    observer.observe(sectionAlternance);
}

// --- 8. EFFET STACK 3D (SCALE & FADE) ---
document.addEventListener('DOMContentLoaded', () => {
    
    const cards = document.querySelectorAll('.card');
    
    // Sécurité : si pas de cartes, on arrête
    if(cards.length === 0) return;

    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;

        cards.forEach((card, index) => {
            // On ne touche pas à la dernière carte
            if (index === cards.length - 1) return;

            const nextCard = cards[index + 1];
            
            // On récupère la position du haut de la carte suivante
            const nextCardTop = nextCard.getBoundingClientRect().top;

            // Si la carte suivante commence à monter dans l'écran
            if (nextCardTop < windowHeight && nextCardTop > 0) {
                
                // Calcul de la distance parcourue (0 à 1)
                const distance = windowHeight - nextCardTop;
                const factor = distance / windowHeight;

                // Effet 3D : On réduit jusqu'à 0.95 (subtil)
                const scale = 1 - (factor * 0.05);
                
                // Effet Sombre : On assombrit un peu
                const brightness = 1 - (factor * 0.5);

                card.style.transform = `scale(${scale})`;
                card.style.filter = `brightness(${brightness})`;
                
            } else {
                // Reset si on remonte ou si la carte est loin
                card.style.transform = 'scale(1)';
                card.style.filter = 'brightness(1)';
            }
        });
    });
});
