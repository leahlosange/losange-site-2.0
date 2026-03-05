/**
 * Netlify Function : inscription newsletter → Brevo
 * Variables d'environnement Netlify :
 *   BREVO_API_KEY (obligatoire) — Clé API v3 Brevo (Paramètres > SMTP & API)
 *   BREVO_LIST_IDS (optionnel) — IDs de listes séparés par des virgules, ex: "2,5"
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/contacts';

function parseListIds(env) {
    if (!env || typeof env !== 'string') return [];
    return env.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
}

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.error('BREVO_API_KEY manquant');
        return { statusCode: 500, body: JSON.stringify({ error: 'Configuration serveur manquante' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Corps de requête invalide' }) };
    }

    const email = (body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Adresse email invalide' }) };
    }

    const prenom = (body.prenom || '').trim();
    const nom = (body.nom || '').trim();
    const listIds = parseListIds(process.env.BREVO_LIST_IDS);

    const payload = {
        email,
        updateEnabled: true,
        attributes: {},
    };
    if (prenom) payload.attributes.FNAME = prenom;
    if (nom) payload.attributes.LNAME = nom;
    if (listIds.length > 0) payload.listIds = listIds;

    const res = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error('Brevo API error:', res.status, errText);
        return {
            statusCode: res.status >= 500 ? 502 : 400,
            body: JSON.stringify({ error: 'Inscription impossible. Réessayez plus tard.' }),
        };
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
    };
};
