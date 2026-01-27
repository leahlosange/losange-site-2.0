# ⬇️ Guide rapide : Colonnes de téléchargement

## 🎯 Les 4 colonnes de téléchargement (colonnes 11-14)

Ces colonnes permettent d'ajouter des **boutons de téléchargement** sur la fiche film du site.

---

## 📄 **dossier_presse** (colonne 11)

**Quoi** : Lien vers le dossier de presse (PDF)

**Comment obtenir le lien** :

### Option A : Fichier sur ton site
1. Upload le PDF dans un dossier `documents/` sur ton site
2. Après déploiement, copie l'URL : `https://lesfilmsdulosange.netlify.app/documents/nom-du-dossier.pdf`
3. Colle cette URL dans la colonne

### Option B : Google Drive
1. Upload le PDF sur Google Drive
2. Clic droit → "Partager" → "Tous ceux qui ont le lien" → "Lecteur"
3. Copie le lien
4. Transforme le lien en lien de téléchargement direct :
   - Lien Drive : `https://drive.google.com/file/d/ID_DU_FICHIER/view?usp=sharing`
   - Lien direct : `https://drive.google.com/uc?export=download&id=ID_DU_FICHIER`
   - (Remplace `ID_DU_FICHIER` par l'ID trouvé dans l'URL)

**Exemple** : `https://lesfilmsdulosange.netlify.app/documents/fmsb-dossier-presse.pdf`

---

## 🖼️ **affiche_photos** (colonne 12)

**Quoi** : Lien vers un ZIP contenant l'affiche HD + photos du film

**Comment faire** :

1. **Crée un dossier** avec :
   - L'affiche en haute résolution (JPG/PNG)
   - Les photos du film (stills, photos plateau, etc.)

2. **Compresse en ZIP** :
   - Sur Mac : Clic droit → "Compresser"
   - Sur Windows : Clic droit → "Envoyer vers" → "Dossier compressé"

3. **Upload le ZIP** :
   - Sur ton site (dossier `documents/` ou `images/`)
   - OU sur Google Drive (en mode public)

4. **Copie l'URL** et colle-la dans la colonne

**Exemple** : `https://lesfilmsdulosange.netlify.app/documents/fmsb-affiche-photos.zip`

---

## 🎬 **bande_annonce_fichier** (colonne 13)

**Quoi** : Lien vers le fichier vidéo de la BA à télécharger (MP4, MOV, etc.)

**Comment faire** :

### Option A : Fichier sur ton site
1. Upload la vidéo dans un dossier `videos/` sur ton site
2. Copie l'URL : `https://lesfilmsdulosange.netlify.app/videos/nom-du-film-ba.mp4`
3. Colle dans la colonne

### Option B : Hébergeur vidéo (Vimeo en téléchargement)
1. Upload sur Vimeo
2. Dans les paramètres de la vidéo, active "Téléchargement"
3. Copie le lien de téléchargement direct

**⚠️ Attention** : Les fichiers vidéo sont souvent lourds. Assure-toi d'avoir assez d'espace sur ton hébergeur.

**Exemple** : `https://lesfilmsdulosange.netlify.app/videos/fmsb-ba.mp4`

---

## ▶️ **bande_annonce_url** (colonne 14)

**Quoi** : Lien YouTube ou Vimeo pour regarder la BA en ligne

**Comment faire** :

1. **Upload la BA sur YouTube ou Vimeo**
2. **Copie l'URL** de la vidéo :
   - YouTube : `https://www.youtube.com/watch?v=abc123`
   - Vimeo : `https://vimeo.com/123456789`
3. **Colle l'URL** dans la colonne

**💡 Astuce** : 
- Tu peux remplir **soit** `bande_annonce_fichier` **soit** `bande_annonce_url` (ou les deux)
- Si tu mets les deux, le site affichera 2 boutons : "Télécharger la BA" et "Voir la BA"

**Exemple** : `https://vimeo.com/123456789`

---

## ✅ Résumé visuel

```
Colonne 11 : dossier_presse
   ↓
   URL vers PDF
   Ex: https://.../dossier.pdf

Colonne 12 : affiche_photos
   ↓
   URL vers ZIP
   Ex: https://.../photos.zip

Colonne 13 : bande_annonce_fichier
   ↓
   URL vers fichier vidéo
   Ex: https://.../ba.mp4

Colonne 14 : bande_annonce_url
   ↓
   URL YouTube/Vimeo
   Ex: https://vimeo.com/123456789
```

---

## 🎯 Exemple complet

Pour un film, tu pourrais avoir :

| dossier_presse | affiche_photos | bande_annonce_fichier | bande_annonce_url |
|----------------|---------------|----------------------|-------------------|
| `https://lesfilmsdulosange.netlify.app/documents/fmsb-dossier.pdf` | `https://lesfilmsdulosange.netlify.app/documents/fmsb-photos.zip` | `https://lesfilmsdulosange.netlify.app/videos/fmsb-ba.mp4` | `https://vimeo.com/123456789` |

Résultat sur le site : **4 boutons de téléchargement** apparaîtront sur la fiche film.

---

## ❓ Questions fréquentes

**Q : Je dois remplir toutes les colonnes ?**  
R : Non, seulement celles que tu veux. Si une colonne est vide, le bouton correspondant n'apparaîtra pas sur le site.

**Q : Les fichiers doivent être sur mon site ou je peux utiliser Google Drive ?**  
R : Les deux fonctionnent ! Assure-toi juste que les liens sont accessibles publiquement.

**Q : Les fichiers sont trop lourds pour mon hébergeur, que faire ?**  
R : Utilise Google Drive (en mode public) ou un autre hébergeur de fichiers (Dropbox, WeTransfer, etc.) et copie le lien de téléchargement direct.

**Q : Comment savoir si mon lien fonctionne ?**  
R : Teste-le dans un navigateur : si le fichier se télécharge ou s'affiche, le lien est bon.
