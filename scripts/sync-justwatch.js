#!/usr/bin/env node
/**
 * Sync JustWatch : interroge l'API JustWatch pour savoir quels films du catalogue
 * sont actuellement disponibles en SVOD (flatrate/free/ads) en France, et met à jour
 * data/streaming.json avec les plateformes réelles.
 *
 * API officielle (recommandée) : Content Partner API, nécessite un token.
 *   Contact : data-partner@justwatch.com
 *   Token : variable d'environnement JUSTWATCH_API_TOKEN
 *
 * Usage : JUSTWATCH_API_TOKEN=xxx node scripts/sync-justwatch.js
 *         ou créer un fichier .env à la racine avec JUSTWATCH_API_TOKEN=xxx
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const FILMS_JSON = path.join(ROOT, 'data', 'films.json');
const STREAMING_JSON = path.join(ROOT, 'data', 'streaming.json');
const LOCALE = 'fr_FR';
const BASE_PARTNER = 'https://apis.justwatch.com/contentpartner/v2/content';

// Mapping des noms JustWatch (clear_name / technical_name) vers nos clés de plateforme
const PROVIDER_TO_KEY = {
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

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
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

async function getProviders(token) {
  const url = `${BASE_PARTNER}/providers/all/locale/${LOCALE}?token=${encodeURIComponent(token)}`;
  const list = await httpsGet(url);
  const byId = {};
  (list || []).forEach((p) => {
    byId[p.id] = {
      id: p.id,
      clear_name: (p.clear_name || '').toLowerCase(),
      technical_name: (p.technical_name || p.slug || '').toLowerCase(),
    };
  });
  return byId;
}

function providerIdToOurKey(providerId, providersById) {
  const p = providersById[providerId];
  if (!p) return null;
  const clear = (p.clear_name || '').trim();
  const tech = (p.technical_name || '').trim();
  for (const [name, key] of Object.entries(PROVIDER_TO_KEY)) {
    if (clear.includes(name) || tech.includes(name)) return key;
  }
  return null;
}

async function getOffersByTitleAndYear(token, title, year) {
  const q = new URLSearchParams({
    title: title,
    release_year: String(year),
    token: token,
  });
  const url = `${BASE_PARTNER}/offers/object_type/movie/locale/${LOCALE}?${q.toString()}`;
  return httpsGet(url);
}

function normalizeTitle(t) {
  return (t || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function slugFromFilm(film) {
  const s = (film.slug || '').trim().toLowerCase().replace(/\.html$/, '');
  return s ? s + '.html' : null;
}

function buildJustWatchUrl(fullPath) {
  if (!fullPath) return null;
  const p = fullPath.startsWith('/') ? fullPath : '/' + fullPath;
  const pathFr = p.replace(/^\/(us|de|gb|en)\//i, '/fr/');
  return 'https://www.justwatch.com' + pathFr;
}

async function main() {
  const token = process.env.JUSTWATCH_API_TOKEN || process.env.JUSTWATCH_TOKEN;
  if (!token) {
    console.error('Variable d’environnement JUSTWATCH_API_TOKEN (ou JUSTWATCH_TOKEN) requise.');
    console.error('Obtenir un token : contacter data-partner@justwatch.com (Content Partner API).');
    console.error('Puis : JUSTWATCH_API_TOKEN=xxx node scripts/sync-justwatch.js');
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

  console.log('Récupération des fournisseurs JustWatch (fr_FR)...');
  let providersById;
  try {
    providersById = await getProviders(token);
    console.log('Fournisseurs chargés:', Object.keys(providersById).length);
  } catch (e) {
    console.error('Erreur fournisseurs:', e.message);
    process.exit(1);
  }

  const filmsWithSlug = films.filter((f) => slugFromFilm(f));
  console.log('Films avec slug à interroger:', filmsWithSlug.length);

  const results = [];
  const svodTypes = ['flatrate', 'free', 'ads'];

  for (let i = 0; i < filmsWithSlug.length; i++) {
    const film = filmsWithSlug[i];
    const slug = slugFromFilm(film);
    const title = film.titre || '';
    const year = getFilmYear(film.date_sortie);

    if (!title) continue;
    const releaseYear = year || new Date().getFullYear();

    process.stdout.write(`[${i + 1}/${filmsWithSlug.length}] ${title} (${releaseYear}) ... `);

    try {
      const data = await getOffersByTitleAndYear(token, title, releaseYear);
      const offers = data.offers || [];
      const svodOffers = offers.filter((o) => svodTypes.includes(o.monetization_type));

      const platformKeys = new Set();
      let firstSvodUrl = null;
      let firstSvodProviderName = null;

      for (const offer of svodOffers) {
        const key = providerIdToOurKey(offer.provider_id, providersById);
        if (key) platformKeys.add(key);
        if (!firstSvodUrl && offer.urls && offer.urls.standard_web) {
          firstSvodUrl = offer.urls.standard_web;
          const p = providersById[offer.provider_id];
          firstSvodProviderName = p ? (p.clear_name || p.technical_name) : null;
        }
      }

      const justwatchUrl = buildJustWatchUrl(data.full_path) || existingBySlug[slug.replace(/\.html$/, '')]?.justwatch_url;

      if (platformKeys.size > 0 || justwatchUrl) {
        const entry = {
          slug,
          justwatch_url: justwatchUrl || `https://www.justwatch.com/fr/film/${slug.replace('.html', '')}`,
          plateformes: Array.from(platformKeys),
        };
        if (firstSvodUrl) {
          entry.svod_url = firstSvodUrl;
          entry.svod_platform = firstSvodProviderName || '';
        }
        results.push(entry);
        console.log('OK → ' + (entry.plateformes.length ? entry.plateformes.join(', ') : 'lien JustWatch seul'));
      } else {
        const existing = existingBySlug[slug.replace(/\.html$/, '')];
        if (existing) {
          results.push(existing);
          console.log('conservé (aucune offre SVOD trouvée)');
        } else {
          console.log('ignoré (pas d’offre SVOD, pas d’entrée existante)');
        }
      }
    } catch (e) {
      const existing = existingBySlug[slug.replace(/\.html$/, '')];
      if (existing) {
        results.push(existing);
        console.log('erreur, entrée existante conservée');
      } else {
        console.log('erreur:', e.message);
      }
    }

    await new Promise((r) => setTimeout(r, 400));
  }

  const out = {
    comment: 'Généré par scripts/sync-justwatch.js. justwatch_url = page JustWatch FR. svod_url = lien direct plateforme si connu. plateformes = SVOD (flatrate/free/ads) en France.',
    films: results,
  };

  fs.writeFileSync(STREAMING_JSON, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log('\nÉcrit:', STREAMING_JSON);
  console.log('Films avec au moins une plateforme ou lien:', results.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
