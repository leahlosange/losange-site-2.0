# Résumé : Système de Cartes pour le Catalogue

## ✅ Fonctionnalités implémentées

### 1. **Page "Par cinéaste"** (`catalogue-cineaste.html`)

#### Affichage initial
- Grille de **cartes visuelles** pour chaque cinéaste
- Photo du cinéaste (format portrait 3:4)
- Nom du cinéaste
- Nombre de films

#### Interaction
- Clic sur une carte → affiche tous les films du cinéaste
- Bouton "Retour aux cinéastes" pour revenir à la grille
- Mode liste/grille fonctionnel sur la page des films

### 2. **Page "Par thématique"** (`catalogue-thematique.html`)

#### Affichage initial
- Grille de **cartes visuelles** pour chaque thématique
- Image : affiche du premier film de la thématique
- Nom de la thématique en superposition
- Nombre de films

#### Interaction
- Clic sur une carte → affiche tous les films de la thématique
- Bouton "Retour aux thématiques" pour revenir à la grille
- Mode liste/grille fonctionnel sur la page des films

## 📁 Structure des fichiers

```
images/
  └── cineastes/
      ├── README.md
      ├── eric-rohmer.jpg
      ├── jim-jarmusch.jpg
      ├── mia-hansen-love.jpg
      └── ... (87 cinéastes au total)
```

## 📋 Photos des cinéastes

### Statistiques
- **Total de cinéastes** : 87
- **Photos à ajouter** : 87 fichiers JPG

### Format requis
- **Ratio** : 3:4 (portrait) - ex: 400×533px
- **Format** : JPG
- **Poids** : max 200KB
- **Nomenclature** : nom-du-cineaste.jpg (minuscules, sans accents)

### Exemples de noms
- `Éric Rohmer` → `eric-rohmer.jpg`
- `Jim Jarmusch` → `jim-jarmusch.jpg`
- `Mia Hansen-Løve` → `mia-hansen-love.jpg`
- `BI Gan` → `bi-gan.jpg`

## 🛠️ Outils créés

### 1. `list-cineastes.py`
Liste tous les cinéastes et les noms de fichiers nécessaires

```bash
python3 list-cineastes.py
```

### 2. `GUIDE_PHOTOS_CINEASTES.md`
Guide complet pour ajouter les photos

### 3. `images/cineastes/README.md`
Instructions rapides dans le dossier des photos

## 🎨 Design

### Cartes cinéastes
- Grille responsive (250px minimum par carte)
- Photo portrait avec effet hover (zoom léger)
- Overlay au survol
- Nom et compteur de films en dessous

### Cartes thématiques
- Grille responsive (300px minimum par carte)
- Format paysage (16:9)
- Image d'affiche de film en arrière-plan
- Nom et compteur en overlay permanent
- Couleur bleue au survol

## 📱 Responsive

### Desktop
- Cinéastes : 4-5 cartes par ligne
- Thématiques : 3-4 cartes par ligne

### Tablet (768px)
- Cinéastes : 3-4 cartes par ligne
- Thématiques : 1-2 cartes par ligne

### Mobile (500px)
- Cinéastes : 2 cartes par ligne
- Thématiques : 1 carte par ligne

## 🔄 Workflow d'utilisation

1. **Utilisateur arrive sur "Par cinéaste"**
   - Voit la grille de tous les cinéastes avec photos
   
2. **Clic sur une carte de cinéaste**
   - La grille disparaît
   - Affiche tous les films du cinéaste sélectionné
   - Bouton "Retour" visible en haut
   
3. **Mode liste/grille**
   - Fonctionne sur l'affichage des films
   - Liste : fiches détaillées
   - Grille : cartes compactes

## 🎯 Prochaines étapes

1. **Ajouter les photos des cinéastes**
   - Télécharger 87 photos
   - Les renommer selon la nomenclature
   - Les placer dans `images/cineastes/`

2. **Créer une image placeholder**
   - `images/placeholder-cineaste.jpg`
   - Utilisée quand la photo n'existe pas
   - Fond neutre avec icône de personne

3. **Tester**
   - Vérifier que toutes les cartes s'affichent
   - Tester la navigation
   - Vérifier le responsive

## 📝 Notes techniques

### Gestion des erreurs
- Si une photo n'existe pas → utilise `placeholder-cineaste.jpg`
- Si pas d'image d'affiche pour une thématique → utilise `placeholder-thematique.jpg`

### Performance
- Images chargées en lazy loading
- Slug normalisé automatiquement par JavaScript
- Pas de requêtes API supplémentaires

### Accessibilité
- Boutons avec aria-label
- Images avec alt text
- Navigation au clavier fonctionnelle
