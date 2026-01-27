# 🚀 Serveur de développement local

## Option 1 : Python (le plus simple, déjà installé sur Mac)

### Lancer le serveur

```bash
cd "/Users/leaguez/Documents/LOSANGE/SITE WEB"
python3 -m http.server 8000
```

Puis ouvre dans ton navigateur : **http://localhost:8000**

### Arrêter le serveur
Appuie sur `Ctrl + C` dans le terminal

---

## Option 2 : Live Server (extension VS Code/Cursor) ⭐ RECOMMANDÉ

### Installation

1. **Ouvre Cursor/VS Code**
2. **Extensions** (Cmd+Shift+X)
3. **Cherche "Live Server"** (par Ritwick Dey)
4. **Installe**

### Utilisation

1. **Ouvre un fichier HTML** (ex: `index.html`)
2. **Clic droit** sur le fichier
3. **"Open with Live Server"**
4. Le navigateur s'ouvre automatiquement sur `http://127.0.0.1:5500`

### Avantages

- ✅ **Rechargement automatique** quand tu sauvegardes un fichier
- ✅ **Pas besoin de rafraîchir manuellement**
- ✅ **Fonctionne avec tous tes fichiers HTML/CSS/JS**

---

## Option 3 : Node.js (si tu as Node installé)

### Installation de http-server

```bash
npm install -g http-server
```

### Lancer

```bash
cd "/Users/leaguez/Documents/LOSANGE/SITE WEB"
http-server -p 8000
```

Puis ouvre : **http://localhost:8000**

---

## Option 4 : Serveur avec auto-reload (plus avancé)

### Installation

```bash
npm install -g browser-sync
```

### Lancer

```bash
cd "/Users/leaguez/Documents/LOSANGE/SITE WEB"
browser-sync start --server --files "*.html, *.css, *.js, data/*.json"
```

**Avantages** :
- ✅ Rechargement automatique
- ✅ Synchronisation entre plusieurs navigateurs
- ✅ URL accessible depuis ton téléphone (même réseau WiFi)

---

## 🎯 Recommandation

**Pour toi, je recommande l'Option 2 (Live Server)** car :
- ✅ Simple à installer
- ✅ Rechargement automatique
- ✅ Intégré à Cursor/VS Code
- ✅ Pas besoin de ligne de commande

---

## ⚠️ Important

Ces serveurs locaux sont **uniquement pour le développement**. Pour mettre en ligne, tu dois toujours **push sur GitHub**.

---

## 🔧 Script rapide (Option 1 - Python)

Tu peux créer un fichier `start-dev.sh` :

```bash
#!/bin/bash
cd "/Users/leaguez/Documents/LOSANGE/SITE WEB"
python3 -m http.server 8000
```

Puis rendre exécutable :
```bash
chmod +x start-dev.sh
```

Et lancer avec :
```bash
./start-dev.sh
```
