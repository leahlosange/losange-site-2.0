# 📊 Configuration Google Sheet pour les fiches films

## Étape 1 : Créer le Google Sheet

1. **Crée un nouveau Google Sheet** : https://sheets.google.com
2. **Renomme l'onglet** en `Films` (important pour le script)
3. **Rends-le public en lecture** :
   - Clic sur "Partager" (en haut à droite)
   - "Modifier l'accès" → "Tous ceux qui ont le lien"
   - Rôle : **"Lecteur"**
   - Copie le lien

## Étape 2 : Structure du Sheet (colonnes)

**Première ligne = en-têtes** (à copier-coller exactement) :

```
titre | cineaste | casting | date_sortie | duree_minutes | nationalites | synopsis | status | categories | thematiques | affiche_image | dossier_presse | affiche_photos | bande_annonce_fichier | bande_annonce_url | slug
```

### Détails des colonnes :

- **titre** : Titre du film (obligatoire)
- **cineaste** : Nom du réalisateur
- **casting** : Liste séparée par des **virgules** : `Adam Driver, Tom Waits, Cate Blanchett`
- **date_sortie** : Format `YYYY-MM-DD` (ex: `2025-07-01`)
- **duree_minutes** : Nombre entier (ex: `118`)
- **nationalites** : Liste séparée par des **virgules** : `États-Unis, France`
- **synopsis** : Texte libre (peut être long)
- **status** : `actuellement` / `prochainement` / `catalogue`
- **categories** : Liste séparée par des **virgules** : `distribution, production`
- **thematiques** : Liste séparée par des **virgules** : `Asie, Portraits, Amoureux Amoureuses` (pour créer des pages thématiques)
- **affiche_image** : Chemin relatif (ex: `images/films/mon-film.jpg`) ou URL
- **dossier_presse** : URL ou chemin vers le fichier PDF/ZIP
- **affiche_photos** : URL ou chemin vers le fichier ZIP/PDF
- **bande_annonce_fichier** : URL ou chemin vers le fichier vidéo
- **bande_annonce_url** : URL YouTube/Vimeo
- **slug** : Nom du fichier HTML (ex: `fathermothersisterbrother.html`)

### Exemple de ligne (2ème ligne du Sheet) :

```
Father Mother Sister Brother | Jim Jarmusch | Adam Driver, Tom Waits, Cate Blanchett | 2025-07-01 | 118 | États-Unis, France | Synopsis du film... | prochainement | distribution | Portraits, Famille, Amoureux Amoureuses | images/films/father mother sister brother/affiche.jpg | https://.../dossier-presse.pdf | https://.../affiche-photos.zip | https://.../ba.mp4 | https://vimeo.com/... | fathermothersisterbrother.html
```

## Étape 3 : Configurer le script de synchronisation

1. **Récupère l'ID du Sheet** depuis l'URL :
   ```
   https://docs.google.com/spreadsheets/d/ID_ICI/edit
                                          ^^^^^^^^
   ```

2. **Ouvre `sync-films-from-sheet.py`** et remplace :
   ```python
   SHEET_ID = "TON_SHEET_ID_ICI"
   ```
   par ton vrai ID.

## Étape 4 : Synchroniser

### Option A : Manuellement (local)
```bash
python3 sync-films-from-sheet.py
```

### Option B : Automatique (GitHub Actions)
Crée `.github/workflows/sync-films.yml` pour synchroniser automatiquement toutes les X heures.

## 📝 Notes

- Les colonnes peuvent être **vides** sauf `titre` (obligatoire)
- Pour les listes (`casting`, `nationalites`, `categories`), sépare par des **virgules**
- Le script ignore les lignes vides
- Après synchronisation, commit & push le `data/films.json` mis à jour
