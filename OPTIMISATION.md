# Plan d'optimisation du portfolio

Audit réalisé le 2026-07-02, à froid, sans aucune modification du site. Ce fichier liste précisément ce qu'il faut faire, fichier par fichier. Il est destiné à une prochaine conversation Claude Code.

**Avant de commencer, la prochaine conversation doit :**
- Lire `CLAUDE.md` (règles : pas de badges décoratifs, pas de tiret long, pas de bordures CSS pour séparer les sections, poser une question à la moindre hésitation).
- Lire la mémoire du projet (dossier memory), en particulier `project_pages_redesign.md` qui documente un point sensible détaillé plus bas (section E.1).
- Traiter les sections par ordre de priorité, un lot à la fois, et **valider visuellement le rendu avant d'enchaîner** (un plan approuvé ne suffit pas, cf. mémoire `feedback_visual_checkpoints`). Ne pas tout faire d'un coup dans une seule passe.
- Ne rien supprimer de façon irréversible (images, classes CSS) sans confirmation explicite, même quand ce document dit "orphelin" ou "non référencé" : revérifier avec grep au moment de l'exécution, l'état du code aura pu changer.

---

## A. Poids des images (priorité critique, gain de performance le plus important)

**A.1 — `img/inutilises/` : 209 Mo, 68 fichiers, confirmé non référencés dans aucun HTML/CSS/JS (grep vide).**
Ce dossier représente 73% du poids total du dossier `img/` (287 Mo). Poser la question à l'utilisateur : supprimer entièrement, ou déplacer hors du dossier déployé (ex: dans un dossier `_archives/` non lié au site, ou hors du repo) ? Ne pas supprimer sans confirmation, ces images peuvent être des sources de travail conservées volontairement.

**A.2 — Images utilisées mais surdimensionnées pour le web.** Recompresser avec `sharp` (déjà en devDependency, déjà utilisé dans ce projet pour l'extraction de palettes, même approche à réutiliser) : qualité webp ~75-80, redimensionner aux dimensions d'affichage réelles max (pas de 4000px de large pour une image affichée à 800px). Cible : aucune image du site au-dessus de 300-400 Ko.
Fichiers prioritaires (> 1 Mo, liste vérifiée) :
- `img/projets/bxlnation/mockup_vinyle.webp` (6.3 Mo, utilisé en hero bg de `projet-bxlnation.html` + carte index + next-project)
- `img/asgc/com/supporter_pas_insupportable.webp` (5.9 Mo)
- `img/asgc/process/process_02.webp` (2.4 Mo), `process_15.webp` (2.2 Mo), `process_14.webp` (2.2 Mo), `process_11.webp` (1.3 Mo), `process_10.webp` (1.3 Mo)
- `img/asgc/affiches/lorient_cep_aller.webp` (2.0 Mo), `enfants_guer.webp` (1.8 Mo), `concarneau_cdf.webp` (1.7 Mo), `auray_aller.webp` (1.7 Mo), `plouvorn_aller.webp` (1.6 Mo)
- `img/asgc/coupe/cdf_6eme_tour_v1.webp` (1.8 Mo), `cdf_6eme_tour_v2.webp` (1.4 Mo)
- `img/asgc/com/resultats_weekend.webp` (1.6 Mo)

Revérifier la liste complète au moment de l'exécution (`find img -type f | xargs du -h | sort -rh`), d'autres fichiers sous le seuil de 1 Mo restent probablement encore trop lourds pour du web (objectif réaliste : aucune image utilisée au-dessus de 400-500 Ko, sauf cas justifié).

**A.3 — Attribut `loading="lazy"` quasi absent.** Actuellement présent sur seulement 2 balises `<img>` dans tout le site (`asgc-club.html`). L'ajouter sur toutes les images qui ne sont pas visibles au premier écran (hero, image LCP de chaque page = garder en chargement eager / sans lazy). Concerne toutes les pages projet, `asgc-club.html`, `asgc-tous-visuels.html`, `as-ginglin-cesson.html`, `index.html`.

---

## B. SEO (aucune page n'a de canonical, ni de sitemap/robots.txt au niveau du site)

**B.1 — Meta description + Open Graph absents sur 5 pages** (présents seulement sur `index.html` et les 4 pages `projet-*.html`) :
- `a-propos.html`
- `as-ginglin-cesson.html`
- `asgc-club.html`
- `asgc-tous-visuels.html`
- `mentions-legales.html` (probablement pas prioritaire vu le contenu, mais au moins la meta description)

Ajouter `<meta name="description" content="...">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, `<meta property="og:type">` dans le `<head>` de chacune, sur le modèle de ce qui existe déjà dans `index.html`. Rédiger un texte propre et spécifique par page, pas un texte générique copié-collé.

**B.2 — Balise `<link rel="canonical">` totalement absente de toutes les pages.** L'ajouter partout, avec l'URL réelle de déploiement GitHub Pages (à confirmer avec l'utilisateur : `https://matthew-quero.github.io/...`).

**B.3 — Créer `sitemap.xml` et `robots.txt` à la racine du projet** (absents actuellement). Lister toutes les pages publiques (exclure `hero-demos.html` et `loader-preview.html`, ce sont des pages de test/preview, pas des pages du site).

**B.4 — `a-propos.html` n'a pas de `<h1>`** : la page commence directement par un `<h2>` (ligne 34 environ, à revérifier). Hiérarchie de titres cassée, à corriger avec un vrai `<h1>` en haut de page.

---

## C. Accessibilité

**C.1 — 16 images avec `alt=""` ou alt non descriptif à corriger**, liste vérifiée (numéros de ligne à revérifier avant édition, le fichier a pu bouger) :
- `projet-bxlnation.html:30` (image hero), `:110` (carte next-project)
- `projet-micasa.html:30`, `:108`
- `projet-transmusicales.html:30`, `:103`
- `projet-el-pingouino.html:30`, `:103`
- `asgc-club.html:42` (cvImg), `:73-74` (cpImgA/B), `:112` (cdfMatchImg), `:213` (cnOtherPreview), `:229` (lbImg), `:791` (lightbox), `:793` (logo club)
- `asgc-tous-visuels.html:36` (lbImg)

Attention : certaines sont des images dupliquées dans une lightbox (zoom d'une image déjà légendée ailleurs sur la page) — dans ce cas un `alt` vide peut être volontaire et correct (image purement décorative/redondante pour un lecteur d'écran). Ne pas mettre un texte générique bidon partout : vérifier au cas par cas si l'image porte une information non redondante, et si oui écrire une description réelle du visuel.

**C.2 — Balise `<main>` absente de toutes les pages.** Envelopper le contenu principal de chaque page dans `<main>` (actuellement tout est en `<div>` génériques). `<footer>` sémantique également sous-utilisé (présent seulement dans `a-propos.html`), alors que `JS/components.js` injecte un footer en `<div>` — évaluer si le convertir en balise `<footer>` a du sens sans casser le CSS existant (sélecteurs `#main-footer`).

---

## D. Architecture CSS (`CSS/style.css`, 3761 lignes, `CSS/base.css`, `CSS/components.css`)

**D.1 — Variables CSS sous-exploitées.** `CSS/base.css:2-11` ne définit que 8 variables (`--bg`, `--bg-alt`, `--accent-yellow`, `--accent`, `--text`, `--text-dim`, `--card-bg`, `--transition`). Des valeurs très répétées dans `style.css` n'ont pas de variable :
- `#fff` : 53 occurrences en dur
- `#888` : 11 occurrences
- `#333` : 9 occurrences
- `#1a1a1a` : 8 occurrences
- `transition: opacity 0.2s` : 12 occurrences identiques (+ variantes 0.3s x12, 0.25s x10, 0.35s x7)
- `border-radius: 50%` : 13 occurrences ; `border-radius: 20px` : 5 ; `border-radius: 12px` : 4 (dont 2 avec `!important`)

Ajouter les variables manquantes dans `CSS/base.css` (`--text-white`, `--text-grey`, `--text-dark`, `--border-dark`, `--radius-round`, `--radius-lg`, `--radius-md`, `--transition-fast`, etc.) puis remplacer les valeurs en dur par lots thématiques (d'abord les couleurs, puis les transitions, puis les radius), en validant le rendu visuel après chaque lot. Ne pas tout remplacer d'un coup.

**D.2 — Deux blocs `@media (max-width: 768px)` non fusionnés**, `style.css:2037` et `style.css:2047`. Les fusionner en un seul bloc (revérifier qu'aucune règle ne se contredit entre les deux avant de fusionner).

**D.3 — Media queries dispersées dans tout le fichier** au lieu d'être regroupées : breakpoints 768px (x3), 900px, 800px, 1100px, 1024px, 769-1100px trouvés à des endroits éloignés (ex: règle `.cm-inner` ligne 2047 vs règle `.gclub-btn` ligne 3690). Regrouper en fin de fichier par breakpoint croissant est la pratique standard, mais **c'est la zone la plus risquée du projet** : le responsive mobile a été validé et terminé récemment (juin 2026, cf mémoire `project_portfolio`). Ne toucher à cette section qu'en dernier, par petits déplacements, avec test visuel mobile complet après chaque déplacement (voir mémoire `feedback_mobile_css_pattern` pour les pièges connus : flex-direction/align-items, hover invisible au tactile).

**D.4 — Classes orphelines confirmées : `.project-header` et `.project-gallery`** (`style.css` autour de la ligne 2573-2623, section commentée "NOUVEAU TEMPLATE PAGE PROJET"). Grep sur tous les `.html` du projet confirme zéro utilisation. Ces classes appartenaient à l'ancien template de page projet, remplacé sur toutes les pages (Al-Lark, dernière page sur l'ancien template, a été retiré et remplacé par Transmusicales sur le nouveau template). Supprimer ce bloc CSS mort, après un dernier grep de confirmation.

**D.5 — 17 occurrences de `!important`**, dont un bloc concentré `style.css:3602-3690` dans la section responsive mobile. Auditer si elles peuvent être évitées en augmentant naturellement la spécificité, mais **seulement après** la section D.3, et sans casser le rendu mobile déjà validé. Si le doute existe, laisser tel quel plutôt que de risquer une régression.

---

## E. Architecture JS et données

**E.1 — Duplication entre `index.html` (lignes ~72-137, les 4 cartes `#proj-stack`) et `JS/projects-data.js`.** Les mêmes données (titre, catégorie, description, image) existent en HTML statique dans `index.html` ET en objet JS `PORTFOLIO_PROJECTS`. Normalement on générerait les cartes dynamiquement depuis `projects-data.js` pour éliminer la duplication.

**Important, à lire avant d'agir :** la mémoire du projet (`project_pages_redesign.md`) indique explicitement que l'utilisateur a déjà rejeté une refonte structurelle des cartes de l'index par le passé ("laisse comment c'était dans la page index"), et que ces cartes sont en "REVERT COMPLET, ne pas retoucher sans demande explicite". Générer les cartes dynamiquement changerait la structure du DOM et risque d'interagir avec l'animation GSAP/ScrollTrigger de pile (`#proj-stack`) déjà calibrée. **Ne pas faire ce changement sans poser explicitement la question à l'utilisateur d'abord**, en expliquant le compromis (moins de duplication vs risque de casser l'animation/le rendu déjà validé).

**E.2 — ~200 lignes de logique lightbox dupliquées à l'identique** entre `asgc-club.html` et `asgc-tous-visuels.html` : `setZoom()`, `openLightbox()`, `closeLightbox()`, gestion de la molette, gestion clavier (zoom ±, reset, Echap). Extraire dans un fichier partagé `JS/lightbox.js`, chargé par les deux pages. Changement mécanique à faible risque si le comportement est testé après (zoom, pan, clavier, fermeture) sur les deux pages.

**E.3 — Aucun script chargé avec `defer` ou `async` sur aucune page** (index.html charge 10 scripts en bloquant, les autres pages 3 à 9). Ajouter `defer` sur toutes les balises `<script src="...">` du site. `defer` préserve l'ordre d'exécution des scripts, donc les dépendances (GSAP avant ScrollTrigger avant `script.js`, etc.) devraient rester valides, mais **tester chaque page après coup** (les scripts avec du code inline entre deux `<script src>` peuvent être sensibles à l'ordre, vérifier `as-ginglin-cesson.html`, `asgc-club.html`, `asgc-tous-visuels.html` qui ont des scripts inline en plus).

**E.4 — `fonts/montserrat-black-b64.js` : 603 Ko, chargé en bloquant sur `index.html` et `as-ginglin-cesson.html`.** Contient la police Montserrat Black encodée en base64, utilisée uniquement par `JS/loader.js` (via `atob()` + `opentype.parse()`) pour dessiner les lettres du loader SVG avant même le chargement complet de la page. Le base64 semble être un choix délibéré (police disponible immédiatement, sans requête HTTP séparée, pendant que le loader tourne). Poser la question à l'utilisateur avant de toucher au loader (composant visuel soigné) : est-ce que le poids (603 Ko bloquant) est un problème connu à corriger, ou un compromis assumé pour la fluidité du loader ? Si à corriger, alternative : `@font-face` classique avec `<link rel="preload">`.

---

## F. Hygiène de projet (hors site public)

**F.1 — Aucun dépôt git initialisé** (pas de `.git`, pas de `.gitignore`), malgré `package.json`/`node_modules` (20 Mo, seule dépendance : `sharp`) présents. Avant de faire des changements de grande ampleur comme ceux listés ci-dessus, proposer à l'utilisateur d'initialiser un dépôt git local avec un `.gitignore` (`node_modules/`, et `img/inutilises/` si ce dossier est conservé hors suivi), pour pouvoir revenir en arrière en cas de régression visuelle. Ne pas l'imposer, poser la question.

---

## Ordre d'exécution suggéré

1. F.1 (filet de sécurité avant de toucher à quoi que ce soit d'autre) — à confirmer avec l'utilisateur.
2. A.1 et A.2 (poids des images, le gain de performance le plus net, faible risque visuel si la recompression est faite proprement).
3. B (SEO) et C (accessibilité), changements additifs à faible risque.
4. E.2 et E.3 (dédoublonnage lightbox, `defer`), changements mécaniques à tester page par page.
5. D.1, D.4 (variables CSS, suppression classes mortes), par petits lots avec validation visuelle.
6. E.1 et E.4, seulement après avoir posé les questions indiquées ci-dessus.
7. D.3, D.5 (réorganisation media queries, audit `!important`) en dernier, c'est la zone la plus sensible du CSS (mobile déjà validé).
