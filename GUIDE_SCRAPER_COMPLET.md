# 🎬 Guide : Scraper COMPLET (tous les films 200+)

## 🎯 Problème

Le scraper de base ne récupère que les premiers films (16 films). Pour récupérer **TOUS les films** (200+), il faut un scraper plus complet qui parcourt toutes les pages.

---

## ✅ Solution : Scraper Complet

J'ai créé **`scraper-complet-browser.js`** qui :
- ✅ Parcourt **toutes les pages** de chaque catégorie (distribution, production, ventes internationales)
- ✅ Va sur **chaque page de film individuelle** pour récupérer tous les détails
- ✅ Évite les doublons automatiquement
- ✅ Récupère synopsis, réalisateur, date, durée, bande-annonce, etc.

---

## 📋 Instructions

### 1. Ouvrir le site dans Chrome/Safari

Va sur : **https://filmsdulosange.com/**

### 2. Ouvrir la console développeur

- **Mac** : `Cmd + Option + I`
- **Windows/Linux** : `F12` ou `Ctrl + Shift + I`

### 3. Aller dans l'onglet "Console"

### 4. Copier-coller le script complet

Ouvre le fichier **`scraper-complet-browser.js`** et copie-colle **tout le code** dans la console.

### 5. Appuyer sur Entrée

Le script va :
- 📥 Parcourir toutes les pages de chaque catégorie
- 📋 Scraper les détails de chaque film
- ⏱️ Prendre **plusieurs minutes** (environ 0.3 seconde par film)
- 💾 Télécharger automatiquement un fichier JSON

### 6. Sauvegarder le fichier JSON

Le fichier téléchargé s'appelle : `losange_films_complet_YYYY-MM-DD.json`

**Renomme-le** en : `data/losange_films.json` (remplace l'ancien)

---

## 🔄 Convertir en format Google Sheet

Une fois le scraping terminé :

```bash
python3 convert-scraped-to-sheet.py
```

Puis importe le CSV dans ton Google Sheet comme expliqué dans `GUIDE_IMPORT_SCRAPED.md`.

---

## ⚠️ Notes importantes

- **Temps d'exécution** : Pour 200+ films, ça prend environ **1-2 minutes**
- **Ne ferme pas l'onglet** pendant le scraping
- **Laisse la console ouverte** pour voir la progression
- **Le script fait des pauses** entre chaque requête pour ne pas surcharger le serveur

---

## 📊 Résultat attendu

Après le scraping complet, tu devrais avoir :
- ✅ **200+ films** dans le JSON
- ✅ Tous les détails (titre, réalisateur, synopsis, image, etc.)
- ✅ Organisés par catégorie (distribution, production, ventes internationales)

---

## 🐛 Si ça ne marche pas

1. **Vérifie que tu es bien sur** `https://filmsdulosange.com/`
2. **Vérifie la console** pour voir les erreurs
3. **Réessaie** - parfois le serveur peut être lent
4. **Utilise le scraper Python** (`scraper.py`) si le JavaScript ne fonctionne pas

---

## 🚀 Alternative : Scraper Python

Si le scraper JavaScript ne fonctionne pas bien, tu peux aussi utiliser le scraper Python amélioré (à créer si besoin).
