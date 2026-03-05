# 📝 Guide : Mettre à jour le carousel de la page d'accueil

## 🎯 Solution simple

Le carousel est maintenant géré via un fichier JSON. Pour le modifier, suivez ces étapes :

### 1. Modifier les données du carousel

Éditez le fichier : **`data/carousel.json`**

Ce fichier contient toutes les informations des slides du carousel.

### 2. Appliquer les changements

Exécutez le script de mise à jour :

```bash
python3 update-carousel.py
```

Le script va automatiquement générer le HTML du carousel et le mettre à jour dans `index.html`.

## 📋 Structure du fichier JSON

Chaque slide contient :

```json
{
  "index": 0,                    // Numéro de la slide (commence à 0)
  "active": true,                // true pour la première slide visible
  "image": "chemin/vers/image.jpg",
  "alt": "Texte alternatif",
  "tag": "actuellement en salles",  // Badge (actuellement / prochainement / rétrospective)
  "title": "TITRE DU FILM",      // Texte du titre (utilisé si title_image est null)
  "title_image": null,           // Chemin vers un logo-titre PNG (null pour utiliser le texte)
  "director": "un film de <strong>Nom</strong>",
  "date": "depuis le 10 décembre 2025",
  "award": "🦁 lion d'or • mostra de venise 2025"  // Optionnel (null si pas d'award)
}
```

## 🔧 Exemples de modifications

### Ajouter une nouvelle slide

1. Ouvrez `data/carousel.json`
2. Ajoutez un nouvel objet dans le tableau `slides` :

```json
{
  "index": 5,
  "active": false,
  "image": "images/films/nouveau-film.jpg",
  "alt": "Nouveau Film",
  "tag": "prochainement",
  "title": "NOUVEAU FILM",
  "director": "un film de <strong>Réalisateur</strong>",
  "date": "15 mai 2026",
  "award": null
}
```

3. Exécutez `python3 update-carousel.py`

### Modifier une slide existante

1. Modifiez les champs dans `data/carousel.json`
2. Exécutez `python3 update-carousel.py`

### Utiliser un logo-titre PNG au lieu du texte

1. Ajoutez votre logo-titre PNG dans le dossier `images/` (ex: `images/carousel-titles/resurrection-logo.png`)
2. Dans `data/carousel.json`, remplacez `"title_image": null` par `"title_image": "images/carousel-titles/resurrection-logo.png"`
3. Le champ `"title"` sera ignoré si `title_image` est fourni
4. Exécutez `python3 update-carousel.py`

**Exemple :**
```json
{
  "title": "RÉSURRECTION",  // Ignoré si title_image est fourni
  "title_image": "images/carousel-titles/resurrection-logo.png"
}
```

### Changer la slide active

1. Dans `data/carousel.json`, mettez `"active": true` sur la slide souhaitée
2. Mettez `"active": false` sur toutes les autres
3. Exécutez `python3 update-carousel.py`

### Supprimer une slide

1. Supprimez l'objet correspondant dans `data/carousel.json`
2. Réindexez les slides suivantes (index 0, 1, 2, etc.)
3. Exécutez `python3 update-carousel.py`

## ⚠️ Notes importantes

- **Une seule slide active** : Il doit y avoir exactement une slide avec `"active": true`
- **Indexation** : Les `index` doivent être séquentiels (0, 1, 2, 3...)
- **Images** : Vérifiez que les chemins d'images sont corrects
- **HTML dans les champs** : Vous pouvez utiliser `<br>`, `<strong>`, etc. dans `title` et `director`

## 🆘 Dépannage

**Le script ne trouve pas le carousel** : Vérifiez que `index.html` contient bien `<!-- Hero Carousel` dans le commentaire.

**Plusieurs slides actives** : Le script corrige automatiquement en activant seulement la première slide.

**Erreur JSON** : Vérifiez la syntaxe JSON avec un validateur en ligne.

## 💡 Astuce

Pour synchroniser automatiquement avec les films du Google Sheet, vous pouvez modifier `update-carousel.py` pour lire depuis `data/films.json` et filtrer les films avec `status: "actuellement"` ou `status: "prochainement"`.
