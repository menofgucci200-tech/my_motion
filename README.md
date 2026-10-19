# Portfolio de Stéphane Say — « Le conte d'Anansi »

**En ligne :** https://menofgucci200-tech.github.io/my_motion/ (GitHub Pages, branche `main`)

Portfolio motion design, site statique (HTML, CSS, JavaScript) sans étape de build.
L'histoire est racontée par Anansi, l'araignée des contes akan.

## Les pages

| Page | Contenu |
|---|---|
| `index.html` | L'accueil : tout le conte en une page (intro animée, résumé de chaque chapitre) |
| `heros.html` | Chapitre 1 · Le héros : présentation, fiche de personnage, progression, hors écran |
| `voyage.html` | Chapitre 2 · Le voyage : frise animée, journal détaillé en 7 étapes, objectifs 2027 |
| `competences.html` | Chapitre 3 · Les poids de l'or : stack en physique, compétences, pouvoirs, méthode, IA |
| `projets.html` | Chapitre 5 · Les projets : toile interactive + études de cas PressLink, Bo Séjour, REJCC |
| `securite.html` | Chapitre 6 · Le bouclier : démo de faille corrigée, grille d'audit, cas réels |
| `contact.html` | Fin · Contact : ce que je cherche, aperçu du CV, coordonnées |
| `cv.html` | Le CV en une diapositive 16:9, animé, avec plein écran (touche F) et export PDF |

Toutes les pages partagent `assets/css/main.css`, `assets/js/core.js` et `assets/js/main.js`
(chaque bloc du script ne s'active que si ses éléments sont présents sur la page).
La navigation, le pied de page et le modèle d'Anansi (`<template id="spiderTpl">`) sont recopiés dans chaque page :
pour changer le menu, il faut le modifier dans les 7 pages.

## Lancer en local

```bash
npx --yes http-server@14.1.1 . -p 5180 -c-1
```

Puis ouvrir http://localhost:5180.

## Le CV

- `cv.html` est la source : une diapositive 16:9 (format PowerPoint 13,33 × 7,5 pouces) avec les projets personnels en vedette.
- `assets/docs/CV-Stephane-Say-2026.pdf` en est l'export (une page, liens cliquables).
- Pour régénérer le PDF après une modification : ouvrir `cv.html` dans Chrome, bouton « Imprimer »,
  destination « Enregistrer au format PDF », marges « Aucune », « Graphiques d'arrière-plan » coché.
- `assets/img/cv-preview.png` est l'aperçu affiché sur la page Contact (capture de la diapositive à 1600 × 900).

## Liens des projets

- PressLink : https://presslink.org/ · code : https://github.com/menofgucci200-tech/PressLink
- Bo Séjour : https://bosejour.ci/
- REJCC : https://rejcc.site/ · code : https://github.com/menofgucci200-tech/rejcc

## Mise en ligne

Le site est publié par **GitHub Pages** depuis la branche `main` (dossier racine) :
chaque `git push` sur `main` met le site à jour en une à deux minutes.
Le fichier `.nojekyll` désactive le traitement Jekyll (inutile ici).

Les URL absolues (`og:image`, `og:url`, `<link rel="canonical">`) et le lien « portfolio » du CV
pointent vers `https://menofgucci200-tech.github.io/my_motion/`. En cas de nom de domaine personnalisé,
les remplacer dans les 8 pages puis régénérer le PDF du CV.

Le dossier `propositions/` (maquettes) et `.claude/` sont exclus du dépôt par `.gitignore`.

## À compléter

- **Photos et images** : retirées pour l'instant. Des emplacements illustrés (monogramme « SS ») les attendent dans `index.html`, `heros.html` et `cv.html` (chercher « Emplacement photo »). Penser ensuite à régénérer `og.png`, `cv-preview.png` et le PDF du CV.
- **Symboles adinkra** : versions stylisées dessinées en SVG (`PG.ADINKRA` dans `core.js`), à remplacer par des tracés fidèles si besoin.
- **Téléphone** : affiché dans Contact et dans le CV ; le retirer si tu ne veux pas le publier.

## Accessibilité et confort

- Lien « Aller au contenu », navigation au clavier, focus visibles, un seul `h1` par page.
- « Réduire les animations » activé sur l'appareil : pas d'intro, pas d'épinglage, physique remplacée par une liste.
- Anansi peut être masqué (bouton de la navigation ou du menu mobile), le choix est mémorisé.
- L'intro complète ne se joue qu'à la première visite de la session ; « Passer l'intro » ou Échap pour la sauter.
