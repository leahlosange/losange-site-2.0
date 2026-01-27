#!/bin/bash
# Script pour lancer un serveur de développement local
# Usage: ./start-dev.sh

cd "/Users/leaguez/Documents/LOSANGE/SITE WEB"
echo "🚀 Serveur de développement démarré sur http://localhost:8000"
echo "📝 Ouvre http://localhost:8000 dans ton navigateur"
echo "⏹️  Appuie sur Ctrl+C pour arrêter"
echo ""
python3 -m http.server 8000`

