# Les Films du Losange - Refonte Style A24

## 🎬 Structure

Design inspiré de [A24 Films](https://a24films.com/) avec l'identité Losange.

### Page d'accueil
1. **Header fixe** : Menu (gauche) | Logo (centre) | Recherche (droite)
2. **Carousel plein écran** : Films avec titres + dates de sortie
3. **Section News** : 1-2 articles avec images
4. **À regarder maintenant** : Film mis en avant avec vidéo
5. **Trouver une séance** : Barre de recherche sur fond bleu
6. **Footer** : Liens + newsletter

## 🎨 Charte

| Élément | Valeur |
|---------|--------|
| Blanc | `#ffffff` |
| Noir | `#000000` |
| Bleu Losange | `#05B4E4` |
| Police | FORMA DJR |

### Typographie
- **TITRES** → MAJUSCULES
- **textes** → minuscules

## 📁 Structure des fichiers

```
SITE WEB/
├── index.html
├── styles.css
├── script.js
├── fonts/
│   └── FormaDJR*.woff2
├── images/
│   └── logo-losange.svg
└── README.md
```

## 🚀 Lancement

```bash
open index.html
```

## ✨ Fonctionnalités

- **Carousel auto** : Défilement automatique (5s) + navigation clavier/swipe
- **Menu fullscreen** : Animation ouverture/fermeture
- **Recherche overlay** : Plein écran, focus auto
- **Header adaptatif** : Change de couleur selon la section visible

## 📝 Pour personnaliser

### Logo
Remplacez `images/logo-losange.svg` par votre logo officiel (PNG ou SVG).

### Films du carousel
Modifiez les `carousel-slide` dans `index.html` :
```html
<div class="carousel-slide" data-index="0">
    <div class="slide-background">
        <img src="VOTRE_IMAGE.jpg" alt="Titre">
    </div>
    <div class="slide-content">
        <h1 class="film-title">TITRE DU FILM</h1>
        <span class="film-date">2025</span>
    </div>
</div>
```

### Section "À regarder maintenant"
Remplacez la vidéo par une bande-annonce :
```html
<video autoplay muted loop playsinline>
    <source src="VOTRE_VIDEO.mp4" type="video/mp4">
</video>
```

---

*Inspiré de A24 Films pour Les Films du Losange - Décembre 2025*
