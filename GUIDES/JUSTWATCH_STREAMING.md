# Synchronisation streaming (SVOD) – TMDB ou JustWatch

Ce guide explique comment mettre à jour **automatiquement** les films du catalogue **disponibles en SVOD** en France, pour la page « À voir en ligne » et le spotlight.

Deux options : **TMDB (gratuit)** ou **JustWatch (token partenaire)**.

---

## Option 1 : TMDB (gratuit, recommandé)

L’**API The Movie Database** est gratuite et fournit les « watch providers » par film et par pays (données de type JustWatch). Aucun contrat à signer.

### Obtenir une clé API

1. Créer un compte sur [themoviedb.org](https://www.themoviedb.org/signup) si besoin.
2. Aller dans [Paramètres → API](https://www.themoviedb.org/settings/api).
3. Demander une **clé API (v3)** – acceptation immédiate pour un usage personnel / projet.

### Lancer la synchro

À la racine du projet, **avec Node.js installé** :

**Option A – Fichier `.env` (recommandé)**  
Créez un fichier `.env` à la racine avec :
```
TMDB_API_KEY=votre_cle_api
```
Puis lancez :
```bash
node scripts/sync-tmdb-streaming.js
```
Ou utilisez le script fourni :
```bash
bash run-streaming-sync.sh
```

**Option B – Variable en une ligne**
```bash
TMDB_API_KEY=xxx node scripts/sync-tmdb-streaming.js
```

Le fichier `.env` est ignoré par git (voir `.gitignore`) pour ne pas commiter la clé.

Le script :

- lit **`data/films.json`** ;
- pour chaque film avec un **slug**, recherche le film sur TMDB (titre + année) ;
- récupère les **watch providers** pour la France (flatrate / free / ads = SVOD) ;
- mappe les noms de plateformes (ARTE, Canal+, MUBI, Prime Video, UniversCiné, France TV, etc.) ;
- écrit **`data/streaming.json`** avec `slug`, `justwatch_url`, `plateformes[]`, et éventuellement `svod_url` (lien TMDB « Où regarder »).

Les entrées déjà présentes dans `streaming.json` sont conservées si un film n’est pas trouvé ou n’a pas d’offre SVOD.

---

## Liens directs vers les plateformes (MUBI, ARTE, etc.)

Par défaut, le bouton « Voir où regarder » renvoie vers JustWatch (ou le lien TMDB si disponible). Pour **renvoyer directement sur la page du film sur la plateforme** (MUBI, ARTE, Canal+, etc.), ajoutez un objet `platform_urls` dans l'entrée du film dans `data/streaming.json` :

```json
{
  "slug": "lamour-fou.html",
  "justwatch_url": "https://www.justwatch.com/fr/film/lamour-fou",
  "plateformes": ["mubi"],
  "platform_urls": {
    "mubi": "https://mubi.com/fr/films/lamour-fou"
  }
}
```

**Clés possibles** (en minuscules) : `arte`, `canal`, `mubi`, `universciné`, `france_tv`, etc.

Exemples d'URLs par plateforme :
- **MUBI** : `https://mubi.com/fr/films/[slug-du-film]`
- **ARTE** : `https://www.arte.tv/fr/videos/[ID-arte]/[titre]/` (l'ID ARTE est propre au film)
- **France TV** : `https://www.france.tv/[categorie]/[slug-du-film].html`

Les URLs doivent être ajoutées **manuellement** (TMDB ne fournit pas ces liens). Le script `sync-tmdb-streaming.js` conserve les `platform_urls` existants lors des mises à jour.

---

## Option 2 : JustWatch (token partenaire)

Si vous avez (ou obtiendrez) un **token Content Partner** JustWatch, vous pouvez utiliser le script dédié pour des données directement issues de JustWatch.

### Obtenir un token

1. Contacter JustWatch : **data-partner@justwatch.com**
2. Demander un accès **Content Partner API**.
3. Après accord, vous recevez un **token unique**.

Référence : [JustWatch API – Content Partner](https://apis.justwatch.com/docs/content_partner/)

### Lancer la synchro

```bash
export JUSTWATCH_API_TOKEN=votre_token
node scripts/sync-justwatch.js
```

Comportement global identique à l’option TMDB : mise à jour de **`data/streaming.json`** avec les plateformes SVOD en France.

---

## Plateformes mappées (TMDB et JustWatch)

Les deux scripts mappent vers les mêmes clés :

- **ARTE**, **Canal+**, **MUBI**, **Prime Video**, **UniversCiné**, **France TV**, Netflix, Disney+, OCS, Apple TV+.

Les libellés et filtres sont gérés dans `streaming.html` et `script.js`.

## Fréquence conseillée

Lancer un des scripts **une fois par semaine** (ou après une grosse mise à jour du catalogue). Possible d’automatiser avec un cron ou un job CI en passant la clé/token en variable d’environnement.

## En résumé

| Méthode   | Clé / Token        | Script                      | Coût        |
|----------|---------------------|-----------------------------|-------------|
| **TMDB** | `TMDB_API_KEY`      | `scripts/sync-tmdb-streaming.js` | Gratuit     |
| JustWatch | `JUSTWATCH_API_TOKEN` | `scripts/sync-justwatch.js`   | Token partenaire |

Sans clé ni token, la page « À voir en ligne » continue d’utiliser le dernier **`data/streaming.json`** disponible (saisi à la main ou généré précédemment).
