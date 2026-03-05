# 📝 Guide : Pages Films Individuelles Style A24

## 🎯 Système de génération automatique

Les pages films individuelles sont générées automatiquement à partir des données du Google Sheet via `data/films.json`.

## 🚀 Générer/Mettre à jour les pages

```bash
python3 generate-film-pages.py
```

Ce script va :
1. Lire tous les films depuis `data/films.json`
2. Générer une page HTML pour chaque film
3. Utiliser le slug du film comme nom de fichier (ex: `fathermothersisterbrother.html`)

## 📋 Structure d'une page film

Chaque page contient :

### 1. **Hero Video Section**
- Player YouTube intégré (si `bande_annonce_url` est fourni)
- Déborde sur le header transparent
- Si pas de vidéo, affiche l'image d'affiche

### 2. **Titre du film**
- Police : **Forma DJR Banner**
- Justifié à gauche
- Taille responsive : `clamp(3rem, 8vw, 8rem)`

### 3. **Métadonnées**
- "un film de [Réalisateur]" • [Date de sortie]
- Casting (si disponible)

### 4. **Contenu**
- **Synopsis** (colonne de gauche)
- **Affiche** (colonne de droite, sticky)

### 5. **Actions Card**
- 3 boutons modernes :
  - **Trouver une séance à proximité** (bouton principal noir)
  - **Regarder en streaming**
  - **Télécharger le matériel**

## 🔧 Champs utilisés depuis le JSON

| Champ JSON | Utilisation |
|------------|-------------|
| `titre` | Titre du film (en majuscules) |
| `cineaste` | Réalisateur |
| `date_sortie` | Date de sortie |
| `casting` | Liste des acteurs |
| `synopsis` | Texte du synopsis |
| `affiche_image` | Image de l'affiche |
| `bande_annonce_url` | URL YouTube pour le player |
| `slug` | Nom du fichier HTML |

## 📝 Format de la bande-annonce

Le script accepte plusieurs formats d'URL YouTube :
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

## 🎨 Styles CSS

Les styles sont dans `styles.css` sous la section `/* === Pages Films Individuelles Style A24 === */`

### Classes principales :
- `.film-hero-video` : Section vidéo qui déborde
- `.film-page-title` : Titre en Forma DJR Banner
- `.film-content-grid` : Grille synopsis + affiche
- `.film-actions-card` : Encart avec les 3 boutons

## 🔄 Mise à jour

Pour mettre à jour toutes les pages après avoir synchronisé depuis le Google Sheet :

1. Synchroniser les données :
   ```bash
   python3 sync-films-from-sheet.py
   ```

2. Régénérer les pages :
   ```bash
   python3 generate-film-pages.py
   ```

## ⚠️ Notes importantes

- **Slug requis** : Chaque film doit avoir un `slug` dans le JSON
- **Bande-annonce optionnelle** : Si pas d'URL YouTube, l'affiche sera affichée à la place
- **Synopsis** : Si vide, affiche "Synopsis à venir."
- **Affiche** : Si vide, utilise une image par défaut

## 🆘 Dépannage

**Les pages ne se génèrent pas** : Vérifiez que `data/films.json` existe et contient des films.

**La vidéo ne s'affiche pas** : Vérifiez que l'URL YouTube dans `bande_annonce_url` est valide.

**Le titre ne s'affiche pas correctement** : Vérifiez que la police Forma DJR Banner est bien chargée.
