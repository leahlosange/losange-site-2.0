# 🎬 Tutoriel : Comment ajouter un film dans le Google Sheet

## 📋 Vue d'ensemble

Chaque **ligne** du Sheet = **un film**. La première ligne contient les **en-têtes** (ne pas modifier).

---

## 📝 Colonnes à remplir (de gauche à droite)

### **1. titre** (obligatoire)
- **Quoi** : Le titre du film
- **Exemple** : `Father Mother Sister Brother`
- **Format** : Texte libre

---

### **2. cineaste**
- **Quoi** : Le nom du réalisateur/réalisatrice
- **Exemple** : `Jim Jarmusch`
- **Format** : Texte libre
- **Peut être vide** : Oui

---

### **3. casting**
- **Quoi** : Liste des acteurs/actrices principaux
- **Exemple** : `Adam Driver, Tom Waits, Cate Blanchett`
- **Format** : Noms séparés par des **virgules** (avec espace après la virgule)
- **Peut être vide** : Oui
- **💡 Astuce** : Si plusieurs personnes, sépare-les par des virgules : `Nom 1, Nom 2, Nom 3`

---

### **4. date_sortie**
- **Quoi** : Date de sortie du film
- **Exemple** : `2025-07-01` (1er juillet 2025)
- **Format** : `AAAA-MM-JJ` (année-mois-jour)
- **Peut être vide** : Oui
- **💡 Astuce** : Dans Google Sheets, tu peux taper `2025-07-01` directement, ou utiliser le format date du Sheet

---

### **5. duree_minutes**
- **Quoi** : Durée du film en minutes
- **Exemple** : `118`
- **Format** : Nombre entier (sans décimales)
- **Peut être vide** : Oui

---

### **6. nationalites**
- **Quoi** : Pays de production du film
- **Exemple** : `États-Unis, France`
- **Format** : Pays séparés par des **virgules** (avec espace après la virgule)
- **Peut être vide** : Oui
- **💡 Astuce** : Si plusieurs pays, sépare-les par des virgules : `France, Allemagne, Belgique`

---

### **7. synopsis**
- **Quoi** : Description du film
- **Exemple** : `Un film sur la famille et les relations humaines, dans lequel...`
- **Format** : Texte libre (peut être long, plusieurs lignes)
- **Peut être vide** : Oui

---

### **8. status**
- **Quoi** : Statut du film pour les filtres
- **Exemple** : `actuellement` ou `prochainement` ou `catalogue`
- **Format** : Un seul mot parmi ces 3 options :
  - `actuellement` = en salles actuellement
  - `prochainement` = sort prochainement
  - `catalogue` = dans le catalogue (déjà sorti)
- **Peut être vide** : Oui (mais recommandé de le remplir)

---

### **9. categories**
- **Quoi** : Catégories du film (distribution, production, ventes internationales)
- **Exemple** : `distribution, production`
- **Format** : Catégories séparées par des **virgules** (avec espace après la virgule)
- **Options possibles** :
  - `distribution`
  - `production`
  - `ventes internationales`
- **Peut être vide** : Oui
- **💡 Astuce** : Si le film est à la fois en distribution ET production, mets : `distribution, production`

---

### **10. thematiques** 🏷️
- **Quoi** : Tags/thématiques du film pour créer des pages thématiques
- **Exemple** : `Asie, Amoureux Amoureuses, Portraits`
- **Format** : Thématiques séparées par des **virgules** (avec espace après la virgule)
- **Exemples de thématiques** :
  - `Asie`
  - `Amoureux Amoureuses`
  - `Portraits`
  - `Contes d'Été`
  - `Allemagne`
  - `Famille`
  - `Guerre`
  - etc.
- **Peut être vide** : Oui
- **💡 Astuce** : 
  - Un film peut avoir **plusieurs thématiques** : `Asie, Portraits, Amoureux Amoureuses`
  - Les thématiques permettent de créer des pages dédiées (ex: `thematiques.html?tag=Asie`)
  - Utilise des noms cohérents (même orthographe) pour regrouper les films

---

### **11. affiche_image**
- **Quoi** : Chemin ou URL vers l'image de l'affiche
- **Exemple** : `images/films/father-mother/affiche.jpg`
- **Format** : 
  - **Chemin relatif** (recommandé) : `images/films/nom-du-film/affiche.jpg`
  - **URL complète** : `https://example.com/affiche.jpg`
- **Peut être vide** : Oui
- **💡 Astuce** : 
  - Si l'image est déjà dans ton dossier `images/films/`, utilise le chemin relatif
  - Si l'image est hébergée ailleurs, mets l'URL complète

---

### **11. dossier_presse** ⬇️
- **Quoi** : Lien vers le dossier de presse (PDF/ZIP) à télécharger
- **Exemple** : `https://example.com/dossiers-presse/film-dossier.pdf`
- **Format** : URL complète vers le fichier
- **Peut être vide** : Oui
- **💡 Astuce** : 
  - Si tu as uploadé le fichier sur ton site, mets l'URL : `https://lesfilmsdulosange.netlify.app/documents/dossier-presse-film.pdf`
  - Si c'est sur Google Drive, partage-le en "Tous ceux qui ont le lien" et copie le lien de téléchargement direct

---

### **12. affiche_photos** ⬇️
- **Quoi** : Lien vers un fichier ZIP/PDF contenant l'affiche et les photos
- **Exemple** : `https://example.com/affiches-photos/film-photos.zip`
- **Format** : URL complète vers le fichier ZIP ou PDF
- **Peut être vide** : Oui
- **💡 Astuce** : 
  - Crée un ZIP avec l'affiche HD + photos du film
  - Upload-le sur ton site ou Google Drive (en mode public)
  - Copie le lien de téléchargement direct ici

---

### **13. bande_annonce_fichier** ⬇️
- **Quoi** : Lien vers le fichier vidéo de la bande-annonce à télécharger
- **Exemple** : `https://example.com/videos/bande-annonce-film.mp4`
- **Format** : URL complète vers le fichier vidéo (MP4, MOV, etc.)
- **Peut être vide** : Oui
- **💡 Astuce** : 
  - Si tu as la BA en fichier, upload-la sur ton site ou un hébergeur
  - Mets l'URL de téléchargement direct ici
  - **OU** utilise la colonne suivante (`bande_annonce_url`) pour un lien YouTube/Vimeo

---

### **14. bande_annonce_url** ▶️
- **Quoi** : Lien YouTube ou Vimeo pour regarder la bande-annonce en ligne
- **Exemple** : `https://www.youtube.com/watch?v=abc123` ou `https://vimeo.com/123456789`
- **Format** : URL complète YouTube ou Vimeo
- **Peut être vide** : Oui
- **💡 Astuce** : 
  - Si la BA est sur YouTube/Vimeo, copie-colle simplement l'URL
  - Le site affichera un bouton "Voir la bande-annonce" qui ouvre ce lien
  - Tu peux remplir **soit** `bande_annonce_fichier` **soit** `bande_annonce_url` (ou les deux)

---

### **15. slug**
- **Quoi** : Nom du fichier HTML de la fiche détaillée du film
- **Exemple** : `fathermothersisterbrother.html`
- **Format** : Nom de fichier en minuscules, sans espaces ni accents
- **Peut être vide** : Oui
- **💡 Astuce** : 
  - Généralement : titre du film en minuscules, sans espaces, sans accents
  - Exemples :
    - `Father Mother Sister Brother` → `fathermothersisterbrother.html`
    - `Le Cri des Gardes` → `le-cri-des-gardes.html`
    - `Amour` → `amour.html`
  - Si tu n'as pas encore créé la page HTML, tu peux laisser vide

---

## ✅ Exemple complet d'une ligne

Voici un exemple de ligne complète pour un film :

```
Father Mother Sister Brother | Jim Jarmusch | Adam Driver, Tom Waits, Cate Blanchett | 2025-07-01 | 118 | États-Unis, France | Un film sur la famille et les relations humaines... | prochainement | distribution | Portraits, Famille, Amoureux Amoureuses | images/films/father-mother/affiche.jpg | https://lesfilmsdulosange.netlify.app/documents/fmsb-dossier-presse.pdf | https://lesfilmsdulosange.netlify.app/documents/fmsb-photos.zip | https://lesfilmsdulosange.netlify.app/videos/fmsb-ba.mp4 | https://vimeo.com/123456789 | fathermothersisterbrother.html
```

---

## 🎯 Résumé rapide

| Colonne | Obligatoire ? | Format | Exemple |
|---------|---------------|--------|---------|
| **titre** | ✅ Oui | Texte | `Father Mother Sister Brother` |
| **cineaste** | ❌ Non | Texte | `Jim Jarmusch` |
| **casting** | ❌ Non | Liste (virgules) | `Adam Driver, Tom Waits` |
| **date_sortie** | ❌ Non | Date (AAAA-MM-JJ) | `2025-07-01` |
| **duree_minutes** | ❌ Non | Nombre | `118` |
| **nationalites** | ❌ Non | Liste (virgules) | `États-Unis, France` |
| **synopsis** | ❌ Non | Texte long | `Description du film...` |
| **status** | ❌ Non | `actuellement` / `prochainement` / `catalogue` | `prochainement` |
| **categories** | ❌ Non | Liste (virgules) | `distribution, production` |
| **thematiques** | ❌ Non | Liste (virgules) | `Asie, Portraits, Amoureux Amoureuses` |
| **affiche_image** | ❌ Non | Chemin ou URL | `images/films/film.jpg` |
| **dossier_presse** | ❌ Non | URL | `https://.../dossier.pdf` |
| **affiche_photos** | ❌ Non | URL | `https://.../photos.zip` |
| **bande_annonce_fichier** | ❌ Non | URL | `https://.../ba.mp4` |
| **bande_annonce_url** | ❌ Non | URL YouTube/Vimeo | `https://vimeo.com/...` |
| **slug** | ❌ Non | Nom fichier | `fathermothersisterbrother.html` |

---

## 🚀 Après avoir rempli le Sheet

1. **Sauvegarde** le Google Sheet (automatique)
2. **Lance la synchronisation** :
   ```bash
   python3 sync-films-from-sheet.py
   ```
3. Le script génère automatiquement `data/films.json`
4. **Commit & push** sur GitHub pour mettre à jour le site

---

## ❓ Questions fréquentes

**Q : Je peux laisser des colonnes vides ?**  
R : Oui, sauf `titre` qui est obligatoire.

**Q : Comment séparer plusieurs éléments dans une liste (casting, nationalites, categories) ?**  
R : Utilise des **virgules avec espace** : `Adam Driver, Tom Waits, Cate Blanchett`

**Q : Où uploader les fichiers (dossier presse, photos, BA) ?**  
R : Tu peux les mettre sur ton site (dans un dossier `documents/` ou `videos/`) ou sur Google Drive (en mode public) et copier le lien de téléchargement direct.

**Q : Je dois remplir `bande_annonce_fichier` ET `bande_annonce_url` ?**  
R : Non, tu peux mettre l'un ou l'autre (ou les deux si tu veux les deux options).

**Q : Le `slug` doit correspondre à un fichier HTML existant ?**  
R : Non, tu peux le laisser vide si la page n'existe pas encore. C'est juste pour créer le lien vers la fiche détaillée.
