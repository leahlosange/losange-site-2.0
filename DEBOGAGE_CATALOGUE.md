# Débogage : Catalogue ne s'affiche pas

## ✅ Étapes de vérification

### 1. Serveur de développement
```bash
cd "/Users/leaguez/Documents/LOSANGE/SITE WEB"
./start-dev.sh
```

Ouvrez ensuite : `http://localhost:8000/catalogue-cineaste.html`

### 2. Vider le cache du navigateur
- **Mac** : `Cmd + Shift + R`
- **Windows** : `Ctrl + Shift + R`

### 3. Console JavaScript (F12)
Ouvrez la console et cherchez :
- ❌ Erreurs en rouge
- ✅ Messages de log

**Ce que vous devriez voir** :
```
Chargement des films...
Nombre de cinéastes: XX
```

### 4. Vérifier que films.json se charge

Dans la console, tapez :
```javascript
fetch('data/films.json').then(r => r.json()).then(d => console.log('Films:', d.films.length))
```

Vous devriez voir : `Films: XXX`

### 5. Test manuel

Dans la console, tapez :
```javascript
displayFilmsByCineaste()
```

Cela devrait afficher la liste des cinéastes.

## 🐛 Erreurs courantes

### Erreur : "Cannot read property 'classList' of null"
**Solution** : Le container n'existe pas dans la page
- Vérifiez que vous êtes sur `catalogue-cineaste.html` 
- Vérifiez que la page contient `<div class="catalogue-container">`

### Erreur : "fetch failed" ou "404"
**Solution** : Le serveur n'est pas démarré
```bash
./start-dev.sh
```

### Erreur : "groupByLetter is not defined"
**Solution** : Le fichier `catalogue.js` ne se charge pas
- Vérifiez que `<script src="catalogue.js"></script>` existe dans la page
- Videz le cache du navigateur

### Rien ne s'affiche, pas d'erreur
**Solution** : Problème de classe CSS
- Ouvrez l'inspecteur (clic droit → Inspecter)
- Cherchez `.catalogue-container`
- Vérifiez qu'il contient du HTML

## 📝 Test rapide

Ouvrez cette page de test :
```
http://localhost:8000/test-catalogue.html
```

Elle affiche des informations de débogage dans la console.

## 🆘 Si rien ne fonctionne

Envoyez-moi :
1. Le contenu de la console JavaScript (F12 → Console)
2. La sortie de cette commande :
```bash
ls -la catalogue*.html catalogue.js
```
