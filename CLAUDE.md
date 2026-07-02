# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Règles de style (à respecter strictement)

- Ne jamais ajouter de micro-badges/labels décoratifs (spans type "Saison X", "Alternance", "En cours", "Nouveau") : c'est du remplissage vide qui fait IA.
- Ne jamais utiliser le tiret long (—) dans les textes. Reformuler avec une virgule, un point ou deux points.
- Ne jamais ajouter de lignes/bordures CSS pour séparer les sections (border-top, border-bottom sur les blocs de contenu).
- Poser des questions à la moindre hésitation ou interrogation. Ne jamais improviser ou inventer.

## Projet

Portfolio statique de Matthew Quéro (créateur visuel / chargé de communication à l'AS Ginglin Cesson, étudiant MyDigitalSchool). Multi-pages HTML/CSS/JS vanilla, **sans framework, sans bundler, sans étape de build**. Chaque page est un fichier `.html` autonome qui charge directement ses CSS/JS via `<link>`/`<script>`, déployé tel quel (GitHub Pages). La seule dépendance npm (`sharp`) est un outil dev utilisé ponctuellement en ligne de commande pour recompresser des images ; elle ne tourne jamais dans le navigateur et il n'existe pas de script réutilisable pour ça (recompression faite via des one-off Node scripts).

### Lancer le site en local

Pas de commande `build`/`lint`/`test` : ouvrir les `.html` directement dans un navigateur fonctionne dans la plupart des cas (pas de `fetch`, pas de modules ES). Pour un rendu plus proche de la prod, servir le dossier avec un serveur statique quelconque (ex. `npx http-server -p 8420`).

## Architecture

### Pages
- `index.html` : accueil. Hero WebGL (`hero-webgl.js`, Three.js), texte cinétique (`hero-text.js`), teaser à propos, pile de cartes projets (`#proj-stack`, animation GSAP/ScrollTrigger pinnée), teaser alternance.
- `a-propos.html` : page à propos.
- `as-ginglin-cesson.html` : page vitrine de l'alternance à l'AS Ginglin Cesson, point d'entrée vers le système de visuels club ci-dessous.
- `asgc-club.html` : **un seul fichier HTML qui affiche des layouts complètement différents selon le paramètre `?club=`**. Ce n'est pas un routeur au sens framework : un script inline en bas de fichier (encapsulé dans `DOMContentLoaded`) lit `URLSearchParams`, puis affiche/masque les sections DOM déjà présentes (`club-visual`, `cdf-layout`, `prg-layout`, `evt-layout`, `com-layout`, `club-gallery`) selon l'id du club. Les données viennent de `JS/ginglin-data.js` (`GINGLIN_CLUBS`).
- `asgc-tous-visuels.html` : galerie à plat de tous les visuels de tous les clubs (`GINGLIN_ALL`, dérivé de `GINGLIN_CLUBS` dans `ginglin-data.js`).
- `projet-bxlnation.html`, `projet-micasa.html`, `projet-transmusicales.html`, `projet-el-pingouino.html` : une page par étude de cas, template et classes CSS identiques (`.project-hero`, `.mockups-grid`, `.project-identity`, `#next-project`). `JS/projects-data.js` (`PORTFOLIO_PROJECTS`) alimente uniquement la carte "projet suivant" en bas de ces 4 pages, pas les cartes de l'accueil (voir duplication connue plus bas).
- `mentions-legales.html` : mentions légales, autonome.

### CSS : 3 fichiers, toujours chargés dans cet ordre
1. `CSS/base.css` : variables CSS (`:root`), reset, classes d'animation reveal-au-scroll.
2. `CSS/components.css` : composants réutilisables.
3. `CSS/style.css` (~3700 lignes) : tout le reste, styles par page/section, media queries regroupées en fin de fichier (chercher les commentaires `/* === RESPONSIVE`). CSS pur, aucun préprocesseur.

### JS : pas de modules ES, pas de bundler, balises `<script>` classiques ; l'ordre de chargement compte
- `JS/components.js` : injecte le drawer de navigation latérale et le footer partagé (`<footer id="main-footer">`) sur chaque page via `insertAdjacentHTML`, en lisant les classes de `<body>` (`alt-page`, `about-page`, `project-page`) pour savoir quel lien de nav est actif.
- `JS/script.js` : comportements globaux du site (reveal au scroll via `IntersectionObserver`, animation GSAP/ScrollTrigger de la pile de cartes de l'accueil, carte "projet suivant" sur les pages projet via `PORTFOLIO_PROJECTS`).
- `JS/ginglin-data.js` : source unique de vérité pour toutes les données clubs/visuels ASGC (`GINGLIN_CLUBS`, `GINGLIN_ALL`). Consommé par `as-ginglin-cesson.html`, `asgc-club.html`, `asgc-tous-visuels.html`.
- `JS/projects-data.js` : `PORTFOLIO_PROJECTS`, consommé uniquement par le widget "projet suivant" des 4 pages `projet-*.html`.
- `JS/lightbox.js` : module lightbox partagé (zoom/pan/clavier/navigation), expose `window.Lightbox` (`open`, `openWithNav`, `updateNav`, `close`). Utilisé par `asgc-club.html` et `asgc-tous-visuels.html`, qui doivent garder des IDs de markup identiques (`lightbox`, `lbImg`, `lbCaption`, `lbZoomVal`, `lbImgWrap`, `lbNavPrev`, `lbNavNext`, `lbClose`, `lbBackdrop`, boutons de zoom).
- `JS/loader.js` : dessine l'animation du loader "MQ" en parsant `fonts/montserrat-black-b64.js` (police Montserrat Black encodée en base64) avec `opentype.js`, pour éviter une requête réseau séparée avant de pouvoir dessiner. Utilisé seulement sur `index.html` et `as-ginglin-cesson.html`.
- `JS/hero-text.js` / `JS/hero-webgl.js` : effets du hero de l'accueil uniquement (découpe cinétique du texte, fond shader Three.js).

Bibliothèques externes chargées depuis un CDN (aucune copie locale, absentes de `package.json`) : GSAP + ScrollTrigger (animations), Three.js (hero WebGL), opentype.js (parsing police du loader). Toutes les balises `<script src>` utilisent `defer` ; quelques scripts inline spécifiques à une page dépendent de globals venant de `ginglin-data.js`/`lightbox.js` et sont enveloppés dans `document.addEventListener('DOMContentLoaded', ...)` pour garantir que ces scripts différés ont déjà tourné.

### Duplication connue (intentionnelle, ne pas "corriger" sans demander)
Les 4 cartes projet de `#proj-stack` sur `index.html` sont écrites en HTML statique et dupliquent des données aussi présentes dans `JS/projects-data.js`. C'est volontaire : les cartes sont imbriquées dans une animation GSAP/ScrollTrigger pinnée déjà calibrée, et l'utilisateur a déjà refusé une génération dynamique par le passé. Toujours demander confirmation avant d'y toucher (voir mémoire `project_optimisation_e1_e4`).
