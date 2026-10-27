/* === HERO 3D (accueil) ===
   Nom QUÉRO extrudé en Three.js, chrome gris vert. Sur ordinateur il
   suit la souris ; sur téléphone il se balance tout seul, parce qu'il
   n'y a pas de pointeur à suivre. Les contours des lettres sont
   embarqués (objet GL) : pas de police à charger.
   Lettres disponibles : H A E W U O Q M É R T.

   Three.js n'est PAS chargé par le HTML : ce fichier décide d'abord si
   la 3D a un sens ici, et ne va chercher les 650 Ko qu'ensuite, une fois
   la page affichée et le fil principal au repos. Le relief ne remplace
   jamais rien avant d'avoir peint sa première image : en attendant, et
   définitivement sur les appareils écartés plus bas, le hero montre
   l'image .hero-nom-3d (un tirage de cette même scène) sur téléphone, et
   le tracé SVG .hero-nom sur ordinateur et sans JavaScript. */
(function () {
const canvas = document.getElementById('hero-3d');
if (!canvas) return;
const zone = canvas.parentElement;       // l'emplacement du nom, qui donne la taille
const hero = canvas.closest('.hero');    // la section, qui porte les classes d'état
if (!hero) return;

/* Deux cadrages pour une seule scène : sur ordinateur le relief recouvre
   le hero entier et suit le pointeur ; sur téléphone il occupe le bloc
   réservé au nom et tourne tout seul. */
const etroit = matchMedia('(max-width: 900px)');

/* Le suivi du pointeur demande un pointeur fin. Au doigt il n'y a rien à
   suivre, mais la scène garde son balancement : c'est elle qui tourne,
   pas le visiteur qui la tourne. */
const finPointeur = matchMedia('(hover: hover) and (pointer: fine)').matches;
/* Trois refus, et ils valent pour tous les appareils : quelqu'un qui
   demande moins de mouvement, quelqu'un qui économise ses données, et
   une machine trop juste pour tenir une boucle de rendu. Un téléphone
   courant annonce 8 cœurs, un vieux 4 : on n'écarte que les vraiment
   justes. */
const sobre = matchMedia('(prefers-reduced-motion: reduce)').matches;
const eco = navigator.connection ? navigator.connection.saveData : false;
const faible = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency < 4;
if (sobre || eco || faible) return;

/* Vérifier WebGL avant de télécharger, pas après. */
try {
    const sonde = document.createElement('canvas');
    if (!(sonde.getContext('webgl2') || sonde.getContext('webgl'))) return;
} catch (e) { return; }

/* À partir d'ici, la 3D va être tentée. On masque donc le SVG tout de
   suite : il ne doit se voir que si le relief n'arrive pas. Tant que cette
   classe n'est pas posée (mouvement réduit, économiseur de données,
   appareil juste, pas de WebGL, ou simplement pas de JavaScript), le SVG
   reste affiché, c'est lui la version par défaut.
   L'image du téléphone, elle, n'est pas concernée : elle reste visible
   pendant toute l'attente et ne s'efface qu'une fois le relief peint. */
hero.classList.add('attend-relief');

/* Filet de sécurité : si au bout de ce délai aucune image n'a été peinte,
   on rend la main au SVG. Sans lui, un échec silencieux (WebGL perdu,
   fichier corrompu, machine à genoux) laisserait un trou blanc à la place
   du nom, ce qui est pire que le SVG. */
const ATTENTE_MAX = 4000;
let filet = setTimeout(abandonner, ATTENTE_MAX);
function abandonner() {
    clearTimeout(filet);
    hero.classList.remove('attend-relief');
}

/* Après le chargement complet, puis pendant un temps mort du fil principal.
   Le timeout borne l'attente sur une page qui ne se calme jamais. */
function planifier() {
    if ('requestIdleCallback' in window) requestIdleCallback(charger, { timeout: 1200 });
    else setTimeout(charger, 200);
}
function charger() {
    const s = document.createElement('script');
    s.src = 'vendor/three.min.js';
    s.onload = demarrer;
    s.onerror = abandonner;
    document.head.appendChild(s);
}
if (document.readyState === 'complete') planifier();
else addEventListener('load', planifier, { once: true });

function demarrer() {
if (typeof THREE === 'undefined') { abandonner(); return; }
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
/* 1.5 et non 2 : au-delà, le gain est invisible sur du chrome flou
   et le nombre de pixels à calculer double. Sur téléphone, 1 tout court :
   l'appareil annonce souvent 3, le mot n'occupe qu'une bande de 350 px
   de large, et chaque cran coûte le carré de lui-même en pixels à peindre.
   La valeur est reposée à chaque resize, pour suivre un changement
   d'orientation qui ferait passer le seuil. */
renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
const scene=new THREE.Scene();
/* Objectif plus long : 15° de champ à 20 unités de recul, au lieu de 32° à 9.
   Le cadrage est le même (la hauteur visible vaut toujours 2*z*tan(fov/2),
   soit 5,16 dans les deux cas), mais la fuite est bien plus douce.

   C'est ce qui réglait le Q et le O « plus petits » : leur géométrie est
   correcte, ils sont même légèrement plus hauts que les autres lettres,
   comme dans toute police où les rondes débordent pour paraître égales.
   Le problème venait du pivot : aux extrémités du mot, une lettre qui
   recule de 1,1 unité passait de 9 à 10,1 unités de la caméra, soit 11 %
   plus petite, pendant que celle d'en face gagnait 14 %. Près de 30 %
   d'écart entre les deux bouts. À 20 unités, le même pivot ne fait plus
   que 11 % d'écart total. */
const camera=new THREE.PerspectiveCamera(15,1,.1,100);
camera.position.set(0,0,20);

// Environnement lumineux maison (pas de fichier externe)
const envScene=new THREE.Scene();
const box=new THREE.Mesh(new THREE.BoxGeometry(30,30,30),new THREE.MeshBasicMaterial({color:0x93a8a0,side:THREE.BackSide}));
envScene.add(box);
function panel(color,x,y,z,w,h,ry){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);envScene.add(m);}
panel(0xffffff,0,9,4,12,3);
panel(0x3fd7ae,-10,1,2,6,12);
panel(0x1d2622,10,-1,1,6,12);
panel(0x263630,-11,-3,7,5,7);
panel(0x1b2b25,11,3,7,5,7);
panel(0x3fd7ae,4,-7,6,10,2.5);
panel(0xe8f5ef,-5,4,-9,8,5);
panel(0xf4fbf8,0,3.2,12,14,2.2);
panel(0x2a3a33,0,-2.6,12,14,1.4);
panel(0x3fd7ae,-7,-4,10,7,3);
panel(0xa9f0da,7,-3.5,10,6,3);
panel(0xffffff,6,5,9,5,3);
const pmrem=new THREE.PMREMGenerator(renderer);
scene.environment=pmrem.fromScene(envScene,.02).texture;

const key=new THREE.DirectionalLight(0xffffff,1.2);key.position.set(3,4,5);scene.add(key);

// Matériaux
const chrome=new THREE.MeshPhysicalMaterial({color:0xc5d8d0,metalness:.92,roughness:.13,clearcoat:1,clearcoatRoughness:.05});

/* 24 segments de courbe et 4 passes de biseau, au lieu de 48 et 6.
   Mesuré dans le navigateur : la construction elle-même ne coûtait que
   123 ms, ce n'était donc pas elle le problème. En revanche le maillage
   tombe de 92 900 à 33 300 triangles, redessinés à chaque image par deux
   objets (le chrome et son contour). C'est le coût par image qui baisse.
   En dessous de 4 passes de biseau, les arêtes deviennent facettées. */
/* Le biseau horizontal est ce qui donne au chrome son arête éclairée :
   sans lui les lettres deviennent des silhouettes plates. On le garde,
   et on rattrape juste après son effet de bord (voir lettres()). */
const BISEAU = .05;
/* 24 sur ordinateur, où le mot peut occuper 1 200 px de large. Sur
   téléphone il en fait 350 : au-delà de 16 segments par courbe, on
   calcule des arêtes plus fines que le pixel. Un tiers de triangles en
   moins, pour une silhouette identique à l'œil. */
const SEG = etroit.matches ? 16 : 24;
function extrudeBrut(shapes,depth){return new THREE.ExtrudeGeometry(shapes,{depth,bevelEnabled:true,bevelThickness:.06,bevelSize:BISEAU,bevelSegments:4,curveSegments:SEG});}
function extrudeSansBiseau(shapes,depth){return new THREE.ExtrudeGeometry(shapes,{depth,bevelEnabled:false,curveSegments:SEG});}
const GL={"upm":1000,"glyphs":{"H":{"adv":938,"cmds":[["M",69.6005859375,750],["L",277.197509765625,750],["L",277.197509765625,0],["L",69.6005859375,0],["Z"],["M",660.4013671875,750],["L",867.998291015625,750],["L",867.998291015625,0],["L",660.4013671875,0],["Z"],["M",185.5987548828125,472.5985107421875],["L",746.200439453125,472.5985107421875],["L",746.200439453125,289.4012451171875],["L",185.5987548828125,289.4012451171875],["Z"]]},"A":{"adv":957,"cmds":[["M",216.398681640625,144.401123046875],["L",216.398681640625,310.998779296875],["L",732.5989990234375,310.998779296875],["L",732.5989990234375,144.401123046875],["Z"],["M",614.796630859375,750],["L",956.1973876953125,0],["L",734.8006591796875,0],["L",448.5989990234375,661.6015625],["L",508.5986328125,661.6015625],["L",222.39697265625,0],["L",1.000244140625,0],["L",342.4010009765625,750],["Z"]]},"E":{"adv":794,"cmds":[["M",710.598876953125,450.399169921875],["L",710.598876953125,299.600830078125],["L",161.9998779296875,299.600830078125],["L",161.9998779296875,450.399169921875],["Z"],["M",302.9976806640625,375],["L",254.197509765625,73.5986328125],["L",170.1983642578125,167.997802734375],["L",744.398681640625,167.997802734375],["L",744.398681640625,0],["L",47.200439453125,0],["L",104.2005615234375,375],["L",47.200439453125,750],["L",739.398681640625,750],["L",739.398681640625,582.002197265625],["L",170.1983642578125,582.002197265625],["L",254.197509765625,676.4013671875],["Z"]]},"W":{"adv":1360,"cmds":[["M",1009.198974609375,88.3984375],["L",944.1995849609375,87.7984619140625],["L",1131.0013427734375,750],["L",1349.998046875,750],["L",1121.7969970703125,0],["L",855.4010009765625,0],["L",637.799560546875,640.201904296875],["L",722.5986328125,640.201904296875],["L",504.9971923828125,0],["L",238.6011962890625,0],["L",10.400146484375,750],["L",230.3968505859375,750],["L",416.798583984375,88.3984375],["L",352.5992431640625,89.3984375],["L",570.8006591796875,750],["L",789.99755859375,750],["Z"]]},"U":{"adv":878,"cmds":[["M",267.197509765625,335.199462890625],["Q",267.197509765625,283.798828125,286.69781494140625,246.49835205078125],["Q",306.1981201171875,209.1978759765625,344.39862060546875,188.99761962890625],["Q",382.59912109375,168.79736328125,438.7996826171875,168.79736328125],["Q",496.000244140625,168.79736328125,534.000732421875,188.6976318359375],["Q",572.001220703125,208.597900390625,591.2015380859375,246.1983642578125],["Q",610.40185546875,283.798828125,610.40185546875,335.199462890625],["L",610.40185546875,750],["L",817.998779296875,750],["L",817.998779296875,324.7996826171875],["Q",817.998779296875,222.1998291015625,770.598876953125,145.59991455078125],["Q",723.198974609375,69,638.0991821289062,26.300048828125],["Q",552.9993896484375,-16.39990234375,438.7996826171875,-16.39990234375],["Q",325.5999755859375,-16.39990234375,240.3001708984375,26.300048828125],["Q",155.0003662109375,69,107.30047607421875,145.59991455078125],["Q",59.6005859375,222.1998291015625,59.6005859375,324.7996826171875],["L",59.6005859375,750],["L",267.197509765625,750],["Z"]]},"O":{"adv":965,"cmds":[["M",482.399658203125,-16.39990234375],["Q",348.9998779296875,-16.39990234375,248.70001220703125,32.60009765625],["Q",148.400146484375,81.60009765625,92.6002197265625,169.7000732421875],["Q",36.80029296875,257.800048828125,36.80029296875,375],["Q",36.80029296875,492.199951171875,92.6002197265625,580.2999267578125],["Q",148.400146484375,668.39990234375,248.70001220703125,717.39990234375],["Q",348.9998779296875,766.39990234375,482.399658203125,766.39990234375],["Q",615.7994384765625,766.39990234375,716.0993041992188,717.39990234375],["Q",816.399169921875,668.39990234375,872.1990966796875,580.2999267578125],["Q",927.9990234375,492.199951171875,927.9990234375,375],["Q",927.9990234375,257.800048828125,872.1990966796875,169.7000732421875],["Q",816.399169921875,81.60009765625,716.0993041992188,32.60009765625],["Q",615.7994384765625,-16.39990234375,482.399658203125,-16.39990234375],["Z"],["M",482.399658203125,168.79736328125],["Q",555.400390625,168.79736328125,608.200927734375,193.69769287109375],["Q",661.00146484375,218.5980224609375,689.7017822265625,264.89862060546875],["Q",718.402099609375,311.19921875,718.402099609375,375],["Q",718.402099609375,438.80078125,689.7017822265625,485.10137939453125],["Q",661.00146484375,531.4019775390625,608.200927734375,556.3023071289062],["Q",555.400390625,581.20263671875,482.399658203125,581.20263671875],["Q",409.7989501953125,581.20263671875,356.79840087890625,556.3023071289062],["Q",303.7978515625,531.4019775390625,275.0975341796875,485.10137939453125],["Q",246.397216796875,438.80078125,246.397216796875,375],["Q",246.397216796875,311.19921875,275.0975341796875,264.89862060546875],["Q",303.7978515625,218.5980224609375,356.79840087890625,193.69769287109375],["Q",409.7989501953125,168.79736328125,482.399658203125,168.79736328125],["Z"]]},"Q":{"adv":965,"cmds":[["M",353.2010498046875,305.19921875],["L",600.5975341796875,305.19921875],["L",926.997802734375,-56.1998291015625],["L",673.6014404296875,-56.1998291015625],["Z"],["M",482.399658203125,-16.39990234375],["Q",348.9998779296875,-16.39990234375,248.70001220703125,32.60009765625],["Q",148.400146484375,81.60009765625,92.6002197265625,169.7000732421875],["Q",36.80029296875,257.800048828125,36.80029296875,375],["Q",36.80029296875,492.199951171875,92.6002197265625,580.2999267578125],["Q",148.400146484375,668.39990234375,248.70001220703125,717.39990234375],["Q",348.9998779296875,766.39990234375,482.399658203125,766.39990234375],["Q",615.7994384765625,766.39990234375,716.0993041992188,717.39990234375],["Q",816.399169921875,668.39990234375,872.1990966796875,580.2999267578125],["Q",927.9990234375,492.199951171875,927.9990234375,375],["Q",927.9990234375,257.800048828125,872.1990966796875,169.7000732421875],["Q",816.399169921875,81.60009765625,716.0993041992188,32.60009765625],["Q",615.7994384765625,-16.39990234375,482.399658203125,-16.39990234375],["Z"],["M",482.399658203125,168.79736328125],["Q",555.400390625,168.79736328125,608.200927734375,193.69769287109375],["Q",661.00146484375,218.5980224609375,689.7017822265625,264.89862060546875],["Q",718.402099609375,311.19921875,718.402099609375,375],["Q",718.402099609375,438.80078125,689.7017822265625,485.10137939453125],["Q",661.00146484375,531.4019775390625,608.200927734375,556.3023071289062],["Q",555.400390625,581.20263671875,482.399658203125,581.20263671875],["Q",409.7989501953125,581.20263671875,356.79840087890625,556.3023071289062],["Q",303.7978515625,531.4019775390625,275.0975341796875,485.10137939453125],["Q",246.397216796875,438.80078125,246.397216796875,375],["Q",246.397216796875,311.19921875,275.0975341796875,264.89862060546875],["Q",303.7978515625,218.5980224609375,356.79840087890625,193.69769287109375],["Q",409.7989501953125,168.79736328125,482.399658203125,168.79736328125],["Z"]]},"M":{"adv":1236,"cmds":[["M",1166.197021484375,750],["L",1166.197021484375,0],["L",968.7999267578125,0],["L",968.7999267578125,675.8013916015625],["L",1013.3997802734375,671.4014892578125],["L",722.597412109375,0],["L",513.2001953125,0],["L",222.3978271484375,669.2015380859375],["L",266.9976806640625,674.201416015625],["L",266.9976806640625,0],["L",69.6005859375,0],["L",69.6005859375,750],["L",389.7957763671875,750],["L",658.5985107421875,106.197998046875],["L",578.799072265625,106.197998046875],["L",846.0018310546875,750],["Z"]]},"\u00c9":{"adv":794,"cmds":[["M",710.598876953125,450.399169921875],["L",710.598876953125,299.600830078125],["L",161.9998779296875,299.600830078125],["L",161.9998779296875,450.399169921875],["Z"],["M",302.9976806640625,375],["L",254.197509765625,73.5986328125],["L",170.1983642578125,167.997802734375],["L",744.398681640625,167.997802734375],["L",744.398681640625,0],["L",47.200439453125,0],["L",104.2005615234375,375],["L",47.200439453125,750],["L",739.398681640625,750],["L",739.398681640625,582.002197265625],["L",170.1983642578125,582.002197265625],["L",254.197509765625,676.4013671875],["Z"],["M",423.4007568359375,974.3995361328125],["L",655.3975830078125,974.3995361328125],["L",481.7979736328125,805.6002197265625],["L",276.2008056640625,805.6002197265625],["Z"]]},"R":{"adv":850,"cmds":[["M",213.198486328125,422.1995849609375],["L",486.3997802734375,422.1995849609375],["Q",535.6004638671875,422.1995849609375,563.6008911132812,444.9998779296875],["Q",591.601318359375,467.8001708984375,591.601318359375,509.0006103515625],["Q",591.601318359375,550.60107421875,563.6008911132812,573.2013549804688],["Q",535.6004638671875,595.8016357421875,486.3997802734375,595.8016357421875],["L",183.9989013671875,595.8016357421875],["L",277.197509765625,695.0006103515625],["L",277.197509765625,0],["L",69.6005859375,0],["L",69.6005859375,750],["L",515.1990966796875,750],["Q",600.798828125,750,665.0986328125,719.7000732421875],["Q",729.3984375,689.400146484375,765.29833984375,635.6002807617188],["Q",801.1982421875,581.8004150390625,801.1982421875,509.0006103515625],["Q",801.1982421875,438.2008056640625,765.29833984375,384.1009521484375],["Q",729.3984375,330.0010986328125,665.0986328125,300.00115966796875],["Q",600.798828125,270.001220703125,515.1990966796875,270.001220703125],["L",213.198486328125,270.001220703125],["Z"],["M",325.199951171875,351],["L",558.19677734375,351],["L",826.7979736328125,0],["L",586.601318359375,0],["Z"]]},"T":{"adv":818,"cmds":[["M",305.0008544921875,659.001220703125],["L",512.5977783203125,659.001220703125],["L",512.5977783203125,0],["L",305.0008544921875,0],["Z"],["M",18.9998779296875,750],["L",798.5987548828125,750],["L",798.5987548828125,565.602783203125],["L",18.9998779296875,565.602783203125],["Z"]]}}};
/* === CONSTRUCTION DU MOT, LETTRE PAR LETTRE ===
   Les cinq lettres formaient une seule géométrie fusionnée, et le contour
   noir était cette même géométrie reprise à l'échelle 1,375 contre 1,35.
   Or un agrandissement part du centre de l'objet : au milieu du mot le
   contour reste concentrique, mais aux extrémités il glisse vers
   l'extérieur. Calcul fait : 0,056 unité de décalage sur le Q et le O,
   soit un cinquième de l'épaisseur d'un fût. Le noir mordait leur bord
   intérieur, et c'est pour ça que ces deux lettres paraissaient plus
   petites et plus maigres que les trois autres.

   Chaque lettre a donc maintenant sa propre géométrie, centrée sur
   elle-même et reposée à sa place dans le mot. Son contour s'agrandit
   autour de son propre centre : même épaisseur partout, sur les cinq. */
function lettres(word){
  const parts=[]; let x=0; const s=1/GL.upm;
  for(const ch of word){
    const g=GL.glyphs[ch];const sp=new THREE.ShapePath();
    for(const c of g.cmds){
      if(c[0]==='M')sp.moveTo((c[1]+x)*s,c[2]*s);
      else if(c[0]==='L')sp.lineTo((c[1]+x)*s,c[2]*s);
      else if(c[0]==='Q')sp.quadraticCurveTo((c[1]+x)*s,c[2]*s,(c[3]+x)*s,c[4]*s);
      else if(c[0]==='C')sp.bezierCurveTo((c[1]+x)*s,c[2]*s,(c[3]+x)*s,c[4]*s,(c[5]+x)*s,c[6]*s);
    }
    const formes=sp.toShapes(true);
    const geo=extrudeBrut(formes,.34);
    geo.computeBoundingBox();
    const centre=geo.boundingBox.getCenter(new THREE.Vector3());
    geo.translate(-centre.x,-centre.y,-centre.z);   // la lettre se centre sur elle-même

    /* --- Rattrapage du biseau ---
       Mesuré lettre par lettre : le biseau élargit bien le U, le É et le R
       de 2 x BISEAU, mais ne touche ni le Q ni le O. Ces deux-là sont les
       seuls glyphes du mot à comporter des trous, et ExtrudeGeometry ne
       pousse pas le biseau vers l'extérieur sur une forme percée. Trois
       lettres sur cinq se retrouvaient donc grossies de 10 %, et le Q et
       le O paraissaient rabougris à côté : c'est exactement ce qui se
       voyait à l'écran.
       On compare donc chaque lettre à sa version sans biseau et, quand
       l'élargissement n'a pas eu lieu, on le reproduit à l'échelle. Le
       test est fait sur la mesure, pas sur une liste de lettres : si le
       mot change un jour, le rattrapage suit. */
    const nu=extrudeSansBiseau(formes,.34);
    nu.computeBoundingBox();
    const hNu=nu.boundingBox.max.y-nu.boundingBox.min.y;
    const hBiseau=geo.boundingBox.max.y-geo.boundingBox.min.y;
    nu.dispose();
    if(hBiseau-hNu < BISEAU){
      const f=(hNu+2*BISEAU)/hNu;
      geo.scale(f,f,1);              // la profondeur reste celle des autres
      geo.computeBoundingBox();
    }

    parts.push({geo, centre});
    x+=g.adv-18;
  }
  /* La boîte du mot se calcule après coup, sur les lettres telles qu'elles
     sont vraiment, rattrapage compris. */
  const boite=new THREE.Box3();
  for(const p of parts){
    boite.union(p.geo.boundingBox.clone().translate(p.centre));
  }
  const centreMot=boite.getCenter(new THREE.Vector3());
  for(const p of parts) p.pos=p.centre.clone().sub(centreMot);
  return {parts, taille:boite.getSize(new THREE.Vector3())};
}

const mot=lettres('QUÉRO');

/* 1,0185 : c'est exactement l'ancien rapport 1,375 / 1,35, pour que
   l'épaisseur du trait noir ne change pas par rapport à ce qui existait. */
const CONTOUR=1.0185;
const noir=new THREE.MeshBasicMaterial({color:0x0A0A0A,side:THREE.BackSide});

const corps=new THREE.Group(), contours=new THREE.Group();
for(const p of mot.parts){
  const chair=new THREE.Mesh(p.geo,chrome); chair.position.copy(p.pos); corps.add(chair);
  const bord=new THREE.Mesh(p.geo,noir); bord.position.copy(p.pos);
  bord.scale.setScalar(CONTOUR); contours.add(bord);
}
corps.scale.setScalar(1.35); contours.scale.setScalar(1.35);

const group=new THREE.Group();scene.add(group);
group.add(contours);group.add(corps);


let mx=0,my=0,tx=0,ty=0;
/* Au doigt, pas d'écoute : un glissement de défilement ferait pivoter le
   mot sans qu'on l'ait demandé, et le balancement suffit. */
if(finPointeur){
  window.addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth)*2-1;my=(e.clientY/innerHeight)*2-1;});
}

// Largeur du nom (contour compris), pour qu'il tienne sur un écran vertical
const nameWidth=mot.taille.x*1.35*CONTOUR;

function resize(){
  /* La taille vient du canvas lui-même et non du hero : sur ordinateur
     les deux se confondent, sur téléphone le canvas n'est qu'un bloc de
     la colonne et c'est lui qui décide du cadrage. */
  const w=canvas.clientWidth||zone.clientWidth,h=canvas.clientHeight||zone.clientHeight;
  if(!w||!h) return;
  renderer.setPixelRatio(etroit.matches?1:Math.min(window.devicePixelRatio,1.5));
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  const visibleWidth=2*camera.position.z*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect;
  if(etroit.matches){
    /* Le bloc est taillé à la proportion du mot : celui-ci le remplit,
       au lieu de flotter au milieu d'un hero entier. Le facteur n'est pas
       choisi au jugé : la scène a été photographiée tout au long de son
       balancement, et l'emprise la plus large du mot, toutes poses
       confondues, laisse encore une vingtaine de pixels de chaque côté. */
    group.scale.setScalar(visibleWidth*.85/nameWidth);
  }else{
    const s=Math.min(1,w/1100);
    group.scale.setScalar(Math.min(.72+.28*s,visibleWidth*.9/nameWidth));
  }
}
addEventListener('resize',resize);
etroit.addEventListener('change',resize);
resize();

const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock=new THREE.Clock();

/* La scene ne tourne que quand le hero est a l'ecran, et jamais quand
   l'onglet est en arriere-plan : inutile de faire chauffer la carte
   graphique d'un telephone pour une animation que personne ne regarde. */
let visible=true, actif=document.visibilityState==='visible', enCours=false;
new IntersectionObserver(function(e){ visible=e[0].isIntersecting; relancer(); },
  {threshold:0}).observe(canvas);
document.addEventListener('visibilitychange',function(){
  actif=document.visibilityState==='visible'; relancer();
});
function relancer(){
  if(visible&&actif&&!enCours){ enCours=true; clock.getDelta(); frame(); }
}

/* Cadence bridée sur téléphone. Le balancement fait un aller-retour en
   quatorze secondes : à trente images par seconde il est aussi fluide
   qu'à soixante, et c'est moitié moins de travail pour le processeur
   graphique, donc moitié moins de batterie. Sur ordinateur le relief
   suit la souris, où la moindre saccade se voit : pas de bride. */
const PAS = etroit.matches ? 32 : 0;
let dernierRendu = 0;

let premiere=true;
function frame(){
  if(!visible||!actif){ enCours=false; return; }
  requestAnimationFrame(frame);
  const maintenant=performance.now();
  if(PAS && maintenant-dernierRendu < PAS) return;
  dernierRendu=maintenant;
  const t=clock.getElapsedTime();
  tx+=(mx-tx)*.06;ty+=(my-ty)*.06;
  const spin=Math.sin(t*.45)*.38;
  group.rotation.y=tx*.55+(reduce?0:spin);
  group.rotation.x=ty*.3+.05;
  /* Sur ordinateur le mot est posé sous le centre du hero, le titre
     occupe le dessus. Sur téléphone son bloc lui appartient : il se
     centre dedans. */
  const assise=etroit.matches?0:-.86;
  group.position.y=assise+(reduce?0:Math.sin(t*.9)*.06);
  renderer.render(scene,camera);
  /* Le relief ne prend la place du SVG qu'une fois réellement peint,
     jamais avant : sinon on troque une image par un carré vide. */
  if(premiere){ premiere=false; clearTimeout(filet); hero.classList.add('en-relief'); }
}
enCours=true;frame();
}
})();
