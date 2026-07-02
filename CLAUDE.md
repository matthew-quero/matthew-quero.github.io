# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Règles de style
- Jamais de micro-badges/labels décoratifs (spans "Saison X", "En cours"...) : ça fait IA.
- Jamais de tiret long (—) : reformuler avec virgule/point/deux-points.
- Jamais de bordures CSS pour séparer des sections (border-top/bottom).
- Poser une question à la moindre hésitation, ne jamais improviser.

## Projet
Portfolio statique HTML/CSS/JS vanilla, sans framework/bundler/build. Chaque page charge directement ses CSS/JS. `sharp` (devDependency) sert uniquement en CLI ponctuelle pour recompresser des images. Pas de build/lint/test ; pour prévisualiser, ouvrir les `.html` ou servir avec `npx http-server`.

## Architecture
**CSS** (ordre de chargement fixe) : `base.css` (variables + reset) → `components.css` → `style.css` (~3700 lignes, media queries regroupées en fin de fichier).

**JS** (scripts classiques `defer`, pas de modules) :
- `components.js` : injecte nav latérale + footer partagés.
- `script.js` : reveal au scroll, animation pile de cartes accueil, carte "projet suivant".
- `ginglin-data.js` : source unique des données clubs ASGC (`GINGLIN_CLUBS`, `GINGLIN_ALL`), utilisé par `as-ginglin-cesson`/`asgc-club`/`asgc-tous-visuels`.
- `projects-data.js` : `PORTFOLIO_PROJECTS`, pour la carte "projet suivant" des pages `projet-*.html`.
- `lightbox.js` : module partagé `window.Lightbox`, utilisé par `asgc-club.html`/`asgc-tous-visuels.html` (IDs de markup identiques requis).
- `loader.js` : anime le loader "MQ" via `opentype.js` + police base64, pour éviter une requête réseau.
- `hero-text.js`/`hero-webgl.js` : effets du hero de l'accueil uniquement.

Libs externes en CDN (GSAP/ScrollTrigger, Three.js, opentype.js), aucune dans `package.json`.

`asgc-club.html` affiche des layouts totalement différents selon `?club=` : un script inline montre/cache des sections DOM selon l'id du club lu dans `GINGLIN_CLUBS`. Pas un routeur, un gros if/else.

## Duplication connue (ne pas "corriger" sans demander)
Les 4 cartes de `#proj-stack` (accueil) sont en HTML statique en plus de `JS/projects-data.js` : volontaire, animation GSAP/ScrollTrigger déjà calibrée dessus, refus déjà exprimé par le passé pour une génération dynamique.
