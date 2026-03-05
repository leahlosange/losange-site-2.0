#!/usr/bin/env node
/**
 * Sync streaming via TMDB (gratuit)
 *
 * Utilise l’API The Movie Database pour savoir quels films du catalogue
 * sont disponibles en SVOD (flatrate / gratuit / pub) en France.
 * Les données "watch providers" TMDB viennent de JustWatch.
 *
 * Clé API gratuite : https://www.themoviedb.org/settings/api
 * Variable d’environnement : TMDB_API_KEY
 *
 * Usage : TMDB_API_KEY=xxx node scripts/sync-tmdb-streaming.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const FILMS_JSON = path.join(ROOT, 'data', 'films.json');
const STREAMING_JSON = path.join(ROOT, 'data', 'streaming.json');
const TMDB_BASE = 'https://api.themoviedb.org/3';

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    });
  } catch (_) {}
}

// Mapping noms TMDB (provider_name) → nos clés (insensible à la casse)
const PROVIDER_NAME_TO_KEY = {
  'arte': 'arte',
  'artetv': 'arte',
  'canal+': 'canal',
  'canal plus': 'canal',
  'cinetek': 'cinetek',
  'mubi': 'mubi',
  'tenk': 'tenk',
  'amazon prime video': 'prime',
  'prime video': 'prime',
  'universcine': 'universciné',
  'universciné': 'universciné',
  'france tv': 'france_tv',
  'francetv': 'france_tv',
  'netflix': 'netflix',
  'disney+': 'disney',
  'ocs': 'ocs',
  'apple tv plus': 'apple',
  'apple tv+': 'apple',
};

function getFilmYear(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const m = dateStr.match(/Date\((\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function slugToJustWatchPath(slug) {
  if (!slug) return null;
  const s = slug.replace(/\.html$/, '').trim();
  return s ? `https://www.justwatch.com/fr/film/${s}` : null;
}

function normalizeProviderName(name) {
  return (name || '').toLowerCase().trim().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function providerToKey(providerName) {
  const n = normalizeProviderName(providerName);
  for (const [key, ourKey] of Object.entries(PROVIDER_NAME_TO_KEY)) {
    if (n.includes(key) || n === key) return ourKey;
  }
  return null;
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function tmdbSearchMovie(apiKey, title, year) {
  const q = new URLSearchParams({
    api_key: apiKey,
    query: title,
    language: 'fr-FR',
    include_adult: 'false',
  });
  if (year) q.set('year', String(year));
  const url = `${TMDB_BASE}/search/movie?${q.toString()}`;
  const data = await httpsGet(url);
  const results = data.results || [];
  if (results.length === 0) return null;
  return results[0];
}

async function tmdbMovieWatchProviders(apiKey, movieId) {
  const url = `${TMDB_BASE}/movie/${movieId}/watch/providers?api_key=${apiKey}`;
  const data = await httpsGet(url);
  return data.results || {};
}

function collectSvodProviders(results) {
  const fr = results.FR || results.fr || {};
  const flatrate = fr.flatrate || [];
  const free = fr.free || [];
  const ads = fr.ads || [];
  const all = [...flatrate, ...free, ...ads];
  const platformKeys = new Set();
  let firstLink = fr.link || null;
  let firstProviderName = null;
  for (const p of all) {
    const name = p.provider_name || p.provider_name_en;
    const key = providerToKey(name);
    if (key) platformKeys.add(key);
    if (!firstProviderName && name) firstProviderName = name;
  }
  return {
    platformKeys: Array.from(platformKeys),
    tmdbWatchLink: firstLink,
    firstProviderName: firstProviderName || null,
  };
}

async function main() {
  loadEnv();
  const apiKey = process.env.TMDB_API_KEY || process.env.TMDB_API_KEY_V3;
  if (!apiKey) {
    console.error('Variable d’environnement TMDB_API_KEY requise.');
    console.error('Clé gratuite : https://www.themoviedb.org/settings/api');
    console.error('Puis : TMDB_API_KEY=xxx node scripts/sync-tmdb-streaming.js');
    process.exit(1);
  }

  let films;
  try {
    films = JSON.parse(fs.readFileSync(FILMS_JSON, 'utf8')).films || [];
  } catch (e) {
    console.error('Impossible de lire data/films.json:', e.message);
    process.exit(1);
  }

  let existingStreaming = { films: [] };
  if (fs.existsSync(STREAMING_JSON)) {
    try {
      existingStreaming = JSON.parse(fs.readFileSync(STREAMING_JSON, 'utf8'));
    } catch (_) {}
  }

  const existingBySlug = {};
  (existingStreaming.films || []).forEach((f) => {
    const s = (f.slug || '').toLowerCase().replace(/\.html$/, '');
    if (s) existingBySlug[s] = f;
  });

  const filmsWithSlug = films.filter((f) => (f.slug || '').trim());
  console.log('Films avec slug à interroger (TMDB) :', filmsWithSlug.length);

  const results = [];

  for (let i = 0; i < filmsWithSlug.length; i++) {
    const film = filmsWithSlug[i];
    const slug = film.slug.trim().replace(/\.html$/, '') + '.html';
    const title = film.titre || '';
    const year = getFilmYear(film.date_sortie);

    if (!title) continue;

    process.stdout.write(`[${i + 1}/${filmsWithSlug.length}] ${title} (${year || '?'}) ... `);

    try {
      const searchResult = await tmdbSearchMovie(apiKey, title, year);
      if (!searchResult || !searchResult.id) {
        const existing = existingBySlug[slug.replace(/\.html$/, '')];
        if (existing) {
          results.push(existing);
          console.log('non trouvé TMDB, entrée conservée');
        } else {
          console.log('non trouvé TMDB');
        }
        await new Promise((r) => setTimeout(r, 260));
        continue;
      }

      const providers = await tmdbMovieWatchProviders(apiKey, searchResult.id);
      const { platformKeys, tmdbWatchLink, firstProviderName } = collectSvodProviders(providers);

      const justwatchUrl = slugToJustWatchPath(slug);

      if (platformKeys.length > 0 || justwatchUrl) {
        const existing = existingBySlug[slug.replace(/\.html$/, '')];
        const entry = {
          slug,
          justwatch_url: justwatchUrl,
          plateformes: platformKeys,
        };
        if (tmdbWatchLink) {
          entry.svod_url = tmdbWatchLink;
          entry.svod_platform = firstProviderName || '';
        }
        if (existing && existing.platform_urls && typeof existing.platform_urls === 'object') {
          entry.platform_urls = existing.platform_urls;
        }
        results.push(entry);
        console.log('OK → ' + (platformKeys.length ? platformKeys.join(', ') : 'lien seul'));
      } else {
        const existing = existingBySlug[slug.replace(/\.html$/, '')];
        if (existing) {
          results.push(existing);
          console.log('aucune offre SVOD, entrée conservée');
        } else {
          console.log('aucune offre SVOD');
        }
      }
    } catch (e) {
      const existing = existingBySlug[slug.replace(/\.html$/, '')];
      if (existing) {
        results.push(existing);
        console.log('erreur, entrée conservée');
      } else {
        console.log('erreur:', e.message);
      }
    }

    await new Promise((r) => setTimeout(r, 260));
  }

  const out = {
    comment: 'Généré par scripts/sync-tmdb-streaming.js (API TMDB gratuite). plateformes = SVOD en France (flatrate/free/ads).',
    films: results,
  };

  fs.writeFileSync(STREAMING_JSON, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log('\nÉcrit :', STREAMING_JSON);
  console.log('Films avec au moins une plateforme ou lien :', results.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
