# 🏷️ Guide : Pages thématiques

## 🎯 Qu'est-ce que c'est ?

Les **pages thématiques** permettent de regrouper tous les films ayant la même thématique sur une page dédiée.

**Exemples de thématiques** :
- `Asie` → Tous les films asiatiques
- `Amoureux Amoureuses` → Tous les films sur l'amour
- `Portraits` → Tous les films portraits
- `Contes d'Été` → Tous les films de la série "Contes d'Été"
- `Allemagne` → Tous les films allemands
- etc.

---

## 📝 Comment ajouter des thématiques à un film

### Dans le Google Sheet

1. **Ouvre la colonne `thematiques`** (colonne 10)
2. **Ajoute les thématiques** séparées par des **virgules avec espace** :
   ```
   Asie, Portraits, Amoureux Amoureuses
   ```
3. **Sauvegarde** (automatique)
4. **Synchronise** :
   ```bash
   python3 sync-films-from-sheet.py
   ```

### Exemples

| Film | Thématiques |
|------|-------------|
| Un film de Rohmer sur l'amour | `Amoureux Amoureuses, Contes d'Été` |
| Un film chinois | `Asie, Portraits` |
| Un film allemand sur la famille | `Allemagne, Famille, Portraits` |

---

## 🔗 Comment accéder à une page thématique

### URL directe

```
https://lesfilmsdulosange.netlify.app/thematiques.html?tag=Asie
```

Remplace `Asie` par la thématique que tu veux.

### Exemples d'URLs

- **Asie** : `thematiques.html?tag=Asie`
- **Amoureux Amoureuses** : `thematiques.html?tag=Amoureux Amoureuses`
- **Portraits** : `thematiques.html?tag=Portraits`
- **Contes d'Été** : `thematiques.html?tag=Contes d'Été`

---

## 🎨 Comment créer des liens vers les pages thématiques

### Dans le HTML

```html
<a href="thematiques.html?tag=Asie">Films Asiatiques</a>
<a href="thematiques.html?tag=Amoureux Amoureuses">Films d'amour</a>
```

### Dans le JavaScript

```javascript
// Créer un lien dynamique
const thematique = "Asie";
const link = document.createElement('a');
link.href = `thematiques.html?tag=${encodeURIComponent(thematique)}`;
link.textContent = thematique;
```

---

## 📋 Liste de toutes les thématiques disponibles

Pour obtenir la liste de toutes les thématiques utilisées dans tes films, tu peux :

1. **Ouvrir la console du navigateur** (F12)
2. **Taper** :
   ```javascript
   fetch('data/films.json')
     .then(r => r.json())
     .then(data => {
       const thematiques = new Set();
       data.films.forEach(f => {
         if (f.thematiques) {
           f.thematiques.forEach(t => thematiques.add(t));
         }
       });
       console.log(Array.from(thematiques).sort());
     });
   ```

Ou utiliser la fonction dans `thematiques.js` :
```javascript
getAllThematiques().then(thematiques => console.log(thematiques));
```

---

## ⚠️ Important : Cohérence des noms

Pour que les pages thématiques fonctionnent correctement, **utilise exactement le même nom** pour chaque thématique :

- ✅ **Bon** : `Asie` partout
- ❌ **Mauvais** : `Asie` dans un film, `asie` dans un autre, `Asie ` (avec espace) dans un troisième

**Astuce** : Crée une liste de référence des thématiques dans un coin de ton Google Sheet pour éviter les erreurs de frappe.

---

## 🎯 Exemples de pages thématiques à créer

### Page "Asie"
- URL : `thematiques.html?tag=Asie`
- Films : Tous les films taggés avec `Asie`

### Page "Amoureux Amoureuses"
- URL : `thematiques.html?tag=Amoureux Amoureuses`
- Films : Tous les films taggés avec `Amoureux Amoureuses`

### Page "Portraits"
- URL : `thematiques.html?tag=Portraits`
- Films : Tous les films taggés avec `Portraits`

### Page "Contes d'Été"
- URL : `thematiques.html?tag=Contes d'Été`
- Films : Tous les films taggés avec `Contes d'Été`

---

## 🔧 Personnalisation

### Modifier le titre de la page

Le titre s'adapte automatiquement à la thématique. Si tu veux le personnaliser, modifie `thematiques.js` :

```javascript
// Ligne ~60
if (pageTitle) {
    pageTitle.textContent = thematique.toUpperCase();
}
```

### Ajouter un filtre par thématique sur la page films

Tu peux ajouter des boutons de filtre par thématique sur `films.html` en modifiant `script.js` :

```javascript
// Ajouter des boutons de filtre thématique
const thematiques = ['Asie', 'Portraits', 'Amoureux Amoureuses'];
thematiques.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.thematique = t;
    btn.textContent = t;
    btn.addEventListener('click', () => {
        // Filtrer les films par thématique
        const cards = document.querySelectorAll('.film-card');
        cards.forEach(card => {
            const cardThematiques = card.dataset.thematiques || '';
            if (cardThematiques.includes(t)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
```

---

## ❓ Questions fréquentes

**Q : Un film peut avoir plusieurs thématiques ?**  
R : Oui ! Sépare-les par des virgules : `Asie, Portraits, Amoureux Amoureuses`

**Q : Comment créer un menu avec toutes les thématiques ?**  
R : Utilise la fonction `getAllThematiques()` de `thematiques.js` pour générer dynamiquement les liens.

**Q : Les thématiques sont-elles sensibles à la casse ?**  
R : Non, le filtrage est insensible à la casse, mais pour la cohérence, utilise la même casse partout.

**Q : Puis-je créer des sous-thématiques ?**  
R : Oui, tu peux utiliser des noms comme `Asie - Chine`, `Asie - Japon`, etc., ou créer des thématiques séparées.
