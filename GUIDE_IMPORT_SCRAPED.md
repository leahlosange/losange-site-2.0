# 📥 Guide : Importer les données scrapées dans Google Sheet

## 🎯 Objectif

Utiliser les données déjà scrapées du site actuel pour **rapidement alimenter** ton Google Sheet avec les films existants.

---

## 📋 Étapes

### 1. Lancer la conversion

```bash
python3 convert-scraped-to-sheet.py
```

Ce script va :
- ✅ Lire `data/losange_films.json` (tes données scrapées)
- ✅ Extraire tous les films (distribution, production, ventes internationales)
- ✅ Convertir au format Google Sheet
- ✅ Générer `data/films_import_sheet.csv`

### 2. Importer dans Google Sheet

1. **Ouvre le fichier CSV** : `data/films_import_sheet.csv`
2. **Sélectionne tout** (Cmd+A) et **copie** (Cmd+C)
3. **Ouvre ton Google Sheet** (celui configuré pour les films)
4. **Colle les données** (Cmd+V) dans la **2ème ligne** (la 1ère ligne contient les en-têtes)

### 3. Compléter les données manquantes

Le scraper ne récupère pas tout. Tu devras **compléter manuellement** :

- ✅ **casting** : Liste des acteurs (séparés par virgules)
- ✅ **date_sortie** : Date de sortie (format AAAA-MM-JJ)
- ✅ **duree_minutes** : Durée en minutes
- ✅ **nationalites** : Pays (séparés par virgules)
- ✅ **synopsis** : Description du film
- ✅ **thematiques** : Tags thématiques (séparés par virgules)
- ✅ **dossier_presse**, **affiche_photos**, **bande_annonce_*** : Liens si disponibles

### 4. Synchroniser

Une fois les données complétées dans le Sheet :

```bash
python3 sync-films-from-sheet.py
```

---

## 🔄 Workflow complet

```
1. Scraper le site actuel
   ↓
2. python3 convert-scraped-to-sheet.py
   ↓
3. Importer CSV dans Google Sheet
   ↓
4. Compléter les colonnes vides
   ↓
5. python3 sync-films-from-sheet.py
   ↓
6. Commit & push sur GitHub
```

---

## ⚠️ Notes importantes

- **Les doublons sont évités** : Si un film est à la fois en distribution ET production, il n'apparaîtra qu'une fois avec les deux catégories
- **Les slugs sont générés automatiquement** : À partir du titre (ex: "Father Mother Sister Brother" → "father-mother-sister-brother.html")
- **Le status est normalisé** : "actuellement", "prochainement", ou "catalogue"
- **Certaines colonnes restent vides** : Tu devras les remplir manuellement (casting, synopsis, etc.)

---

## 🎯 Exemple de résultat

Après conversion, tu auras dans ton CSV :

```csv
titre,cineaste,casting,date_sortie,duree_minutes,nationalites,synopsis,status,categories,thematiques,affiche_image,...
Resurrection,Bi Gan,,,,"","",actuellement,distribution,,"images/films/downloaded/resurrection.jpg",...
Father Mother Sister Brother,Jim Jarmusch,,,,"","",prochainement,distribution,,"images/films/father mother sister brother/...",...
```

---

## 🚀 Astuce

Si tu veux scraper **de nouvelles données** depuis le site actuel :

1. **Utilise le scraper JavaScript** dans la console du navigateur sur `filmsdulosange.com`
2. **Sauvegarde le JSON** généré dans `data/losange_films.json`
3. **Relance** `convert-scraped-to-sheet.py`
