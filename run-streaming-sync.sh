#!/bin/bash
# Lance la synchro streaming TMDB (lit la clé dans .env)
cd "$(dirname "$0")"
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi
if [ -z "$TMDB_API_KEY" ]; then
  echo "Clé TMDB manquante. Ajoutez TMDB_API_KEY=xxx dans le fichier .env"
  exit 1
fi
echo "Lancement de la synchro TMDB..."
node scripts/sync-tmdb-streaming.js
exit $?
