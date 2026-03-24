/**
 * LES FILMS DU LOSANGE - Style A24
 * JavaScript principal
 */

document.addEventListener('DOMContentLoaded', function() {
    initMenu();
    initSearch();
    initFilmFilters();
    initShowtimes();
    if (document.body.classList.contains('page-home')) {
        loadHomeNewsFromJson().then(() => initNewsSlider());
    } else {
        initNewsSlider();
    }
    loadFilmsFromJson();
    loadHomeFilms();
    loadActualitesFromJson();
    if (document.body.classList.contains('page-streaming')) {
        loadStreamingPage().then(() => initStreamingFilters());
    }
    if (document.body.classList.contains('page-home')) {
        loadStreamingSpotlight();
    }
    // Carousel : chargé depuis data/carousel.json sur la homepage, puis init
    if (document.body.classList.contains('page-home')) {
        loadCarouselFromJson().then(() => {
            initCarousel();
            initAutoSlide();
        });
    } else {
        initCarousel();
        initAutoSlide();
    }
    if (document.body.classList.contains('page-film-individuel')) {
        loadRohmerFilmHero();
        hideStreamingButtonIfActuellementOrProchainement();
        initShowtimesFilmFiche();
    }
    initNewsletterPopup();
});

// === Popup Newsletter : création, affichage, fréquence ===
var newsletterPopupShown = false;
function initNewsletterPopup() {
    var STORAGE_KEY = 'newsletter_popup_closed';
    var COOKIE_DAYS = 7;
    var DELAY_MS = 18000;   // 18 secondes avant premier affichage
    var EXIT_INTENT_MIN_TIME = 5000; // exit intent pris en compte après 5 s sur la page

    function shouldShow() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return true;
            var t = parseInt(raw, 10);
            if (isNaN(t)) return true;
            return (Date.now() - t) > COOKIE_DAYS * 24 * 60 * 60 * 1000;
        } catch (e) {
            return true;
        }
    }
    function markClosed() {
        try {
            localStorage.setItem(STORAGE_KEY, String(Date.now()));
        } catch (e) {}
    }

    var backdrop = document.createElement('div');
    backdrop.className = 'newsletter-popup-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML =
        '<div class="newsletter-popup" role="dialog" aria-labelledby="newsletter-popup-title" aria-modal="true">' +
        '<button type="button" class="newsletter-popup-close" aria-label="Fermer">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
        '</button>' +
        '<h2 id="newsletter-popup-title" class="newsletter-popup-title">Vous voulez plus de Losange ?</h2>' +
        '<p class="newsletter-popup-text">Inscrivez-vous à notre newsletter. Actualités, sorties en salles, avant-premières. Pas trop souvent — juste ce qu\'il faut.</p>' +
        '<div class="newsletter-popup-success" id="newsletter-popup-success"><p>Merci, vous êtes inscrit·e.</p></div>' +
        '<form class="newsletter-popup-form" id="newsletter-popup-form">' +
        '<div class="newsletter-popup-row">' +
        '<div class="newsletter-popup-field"><label>Prénom <span class="optional">(facultatif)</span></label><input type="text" name="prenom" placeholder="Prénom" autocomplete="given-name"></div>' +
        '<div class="newsletter-popup-field"><label>Nom <span class="optional">(facultatif)</span></label><input type="text" name="nom" placeholder="Nom" autocomplete="family-name"></div>' +
        '</div>' +
        '<div class="newsletter-popup-field">' +
        '<label>Adresse mail <span style="color:rgba(255,255,255,0.6)">(obligatoire)</span></label>' +
        '<input type="email" name="email" placeholder="votre@email.fr" required autocomplete="email">' +
        '</div>' +
        '<div class="newsletter-popup-submit-wrap">' +
        '<button type="submit" class="newsletter-popup-submit">S\'inscrire</button>' +
        '<p class="newsletter-popup-privacy">J\'accepte que mes données soient utilisées conformément à la <a href="#">politique de confidentialité</a> du site.</p>' +
        '</div>' +
        '</form>' +
        '</div>';
    document.body.appendChild(backdrop);

    var form = backdrop.querySelector('#newsletter-popup-form');
    var successEl = backdrop.querySelector('#newsletter-popup-success');
    var emailInput = form.querySelector('input[name="email"]');

    function show() {
        if (newsletterPopupShown) return;
        newsletterPopupShown = true;
        backdrop.classList.add('is-visible');
        backdrop.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function hide() {
        backdrop.classList.remove('is-visible');
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        markClosed();
    }

    backdrop.querySelector('.newsletter-popup-close').addEventListener('click', function() {
        hide();
    });
    backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) hide();
    });
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var email = (emailInput.value || '').trim();
        var prenom = (form.querySelector('input[name="prenom"]').value || '').trim();
        var nom = (form.querySelector('input[name="nom"]').value || '').trim();
        form.querySelectorAll('input').forEach(function(inp) { inp.classList.remove('error'); });
        var errEl = form.querySelector('.newsletter-popup-error');
        if (errEl) errEl.remove();
        if (!email) {
            emailInput.classList.add('error');
            emailInput.focus();
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailInput.classList.add('error');
            emailInput.focus();
            return;
        }
        var btn = form.querySelector('.newsletter-popup-submit');
        var btnText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Envoi…';
        fetch('/.netlify/functions/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, prenom: prenom || undefined, nom: nom || undefined })
        }).then(function(r) {
            return r.json().then(function(data) { return { ok: r.ok, data: data }; });
        }).then(function(result) {
            if (result.ok) {
                form.classList.add('is-hidden');
                successEl.classList.add('is-visible');
                markClosed();
                setTimeout(hide, 2000);
            } else {
                var msg = (result.data && result.data.error) || 'Une erreur est survenue. Réessayez plus tard.';
                var p = document.createElement('p');
                p.className = 'newsletter-popup-error';
                p.style.cssText = 'color:#f88;font-size:0.85rem;margin-top:0.5rem;';
                p.textContent = msg;
                form.querySelector('.newsletter-popup-submit-wrap').appendChild(p);
                btn.disabled = false;
                btn.textContent = btnText;
            }
        }).catch(function() {
            var p = document.createElement('p');
            p.className = 'newsletter-popup-error';
            p.style.cssText = 'color:#f88;font-size:0.85rem;margin-top:0.5rem;';
            p.textContent = 'Connexion impossible. Réessayez plus tard.';
            form.querySelector('.newsletter-popup-submit-wrap').appendChild(p);
            btn.disabled = false;
            btn.textContent = btnText;
        });
    });

    function tryShow() {
        if (!shouldShow() || newsletterPopupShown) return;
        show();
    }

    setTimeout(function() {
        if (!newsletterPopupShown && shouldShow()) tryShow();
    }, DELAY_MS);

    document.addEventListener('mouseout', function exitIntent(e) {
        if (newsletterPopupShown || !shouldShow()) return;
        if (e.clientY <= 0 && e.relatedTarget === null) {
            var now = Date.now();
            if (now - (window._newsletterPageLoad || 0) < EXIT_INTENT_MIN_TIME) return;
            tryShow();
        }
    });
    window._newsletterPageLoad = Date.now();
}

// === Hero fiches films Rohmer : afficher affiche_photos (photogrammes) à la place des affiches ===
async function loadRohmerFilmHero() {
    const heroImg = document.querySelector('.film-hero-video .film-hero-image img');
    if (!heroImg) return;
    const slug = window.location.pathname.split('/').pop() || '';
    if (!slug) return;
    const segments = window.location.pathname.split('/').filter(Boolean);
    const jsonPath = segments.length > 1 ? '../data/films.json' : 'data/films.json';
    try {
        const res = await fetch(jsonPath, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const films = Array.isArray(data.films) ? data.films : [];
        function norm(s) {
            return (s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ');
        }
        const film = films.find(function(f) {
            var s = (f.slug || '').trim();
            return s === slug || s.endsWith('/' + slug) || s === slug.replace(/\.html$/, '') || s.endsWith(slug);
        });
        if (!film || norm(film.cineaste || '') !== norm('Eric Rohmer')) return;
        var photos = (film.affiche_photos || '').trim();
        if (!photos) return;
        var src = photos;
        if (!/^https?:\/\//.test(src)) src = '../' + src;
        heroImg.src = src;
    } catch (e) {
        console.error('loadRohmerFilmHero:', e);
    }
}

// === Showtimes sur fiches films (Father Mother, Victor, etc.) : bouton → widget embed ===
function initShowtimesFilmFiche() {
    const url = document.body.getAttribute('data-showtimes-url');
    const clipOffset = document.body.getAttribute('data-showtimes-clip-offset') || '-400';
    if (!url || !url.trim()) return;

    const btn = document.querySelector('.page-film-individuel .film-actions-card a[href="#showtimes"]');
    const modal = document.querySelector('.showtimes-film-fiche-modal');
    const embedWrapper = document.getElementById('showtimes-film-fiche-wrapper');
    const bubbleOverlay = document.getElementById('showtimes-film-fiche-overlay');
    const iframe = document.getElementById('showtimes-film-fiche-iframe');
    const openLink = document.getElementById('showtimes-film-fiche-open-link');
    const clipEl = document.getElementById('showtimes-film-fiche-clip');
    if (!btn || !embedWrapper || !iframe) return;

    function openBubble() {
        if (modal) modal.classList.add('is-open');
        embedWrapper.classList.remove('is-closing');
        embedWrapper.hidden = false;
        if (bubbleOverlay) {
            bubbleOverlay.hidden = false;
            bubbleOverlay.setAttribute('aria-hidden', 'false');
        }
        requestAnimationFrame(function() {
            void embedWrapper.offsetHeight;
            requestAnimationFrame(function() {
                embedWrapper.classList.add('is-open');
                if (bubbleOverlay) bubbleOverlay.classList.add('is-visible');
            });
        });
    }

    function closeBubble() {
        if (!embedWrapper.classList.contains('is-open')) {
            embedWrapper.hidden = true;
            embedWrapper.classList.remove('is-closing');
            if (bubbleOverlay) {
                bubbleOverlay.hidden = true;
                bubbleOverlay.classList.remove('is-visible');
                bubbleOverlay.setAttribute('aria-hidden', 'true');
            }
            iframe.removeAttribute('src');
            if (openLink) openLink.href = '#';
            if (modal) modal.classList.remove('is-open');
            return;
        }
        if (modal) modal.classList.remove('is-open');
        embedWrapper.classList.remove('is-open');
        embedWrapper.classList.add('is-closing');
        if (bubbleOverlay) bubbleOverlay.classList.remove('is-visible');
        embedWrapper.addEventListener('transitionend', function onEnd(e) {
            if (e.target !== embedWrapper || e.propertyName !== 'max-height') return;
            embedWrapper.hidden = true;
            embedWrapper.classList.remove('is-closing');
            if (bubbleOverlay) {
                bubbleOverlay.hidden = true;
                bubbleOverlay.setAttribute('aria-hidden', 'true');
            }
            iframe.removeAttribute('src');
            if (openLink) openLink.href = '#';
            if (modal) modal.classList.remove('is-open');
        }, { once: true });
    }

    btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (clipEl) clipEl.style.setProperty('--showtimes-clip-offset', clipOffset + 'px');
        iframe.src = url;
        if (openLink) {
            openLink.href = url;
            openLink.hidden = false;
        }
        openBubble();
    });

    if (bubbleOverlay) {
        bubbleOverlay.addEventListener('click', closeBubble);
    }
}

// === Masquer "Voir en ligne" sur fiches films actuellement / prochainement ===
async function hideStreamingButtonIfActuellementOrProchainement() {
    const streamBtn = document.querySelector('.page-film-individuel .film-actions-card a[href="#streaming"]');
    if (!streamBtn) return;
    const slug = (window.location.pathname.split('/').pop() || '').trim().toLowerCase().replace(/\.html$/, '');
    if (!slug) return;
    const segments = window.location.pathname.split('/').filter(Boolean);
    const jsonPath = segments.length > 1 ? '../data/films.json' : 'data/films.json';
    try {
        const res = await fetch(jsonPath, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const films = Array.isArray(data.films) ? data.films : [];
        const film = films.find(f => {
            const s = (f.slug || '').trim().toLowerCase().replace(/\.html$/, '');
            return s === slug;
        });
        if (film && (film.status === 'actuellement' || film.status === 'prochainement')) {
            streamBtn.style.display = 'none';
        }
    } catch (e) {
        console.error('hideStreamingButtonIfActuellementOrProchainement:', e);
    }
}

// === Menu Fullscreen ===
function initMenu() {
    const menu = document.querySelector('.fullscreen-menu');
    const menuCloseBtn = document.querySelector('.menu-close-btn');
    
    if (!menu) return;
    
    const menuBtnHtmlClosed = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.5"/>
                <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.5"/>
                <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <span class="header-menu-label">MENU / FILMS</span>
        `;

    // Fonction pour fermer le menu
    function closeMenu() {
        const btn = document.querySelector('.menu-btn');
        if (btn) btn.innerHTML = menuBtnHtmlClosed;
        menu.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    // Bouton de fermeture (X)
    menuCloseBtn?.addEventListener('click', closeMenu);
    
    // Délégation au niveau document en phase capture : intercepte le clic avant tout autre handler (fix catalogue)
    document.addEventListener('click', function(e) {
        const menuBtn = e.target.closest('.menu-btn');
        if (!menuBtn) return;
        e.preventDefault();
        e.stopPropagation();
        menu.classList.toggle('open');
        document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
        if (menu.classList.contains('open')) {
            menuBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.5"/>
                </svg>
            `;
        } else {
            menuBtn.innerHTML = menuBtnHtmlClosed;
        }
    }, true);
    
    // Close menu on link click
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
            closeMenu();
        }
    });
}

// === Search Overlay - Recherche films, cinéastes, thématiques, acteurs ===
var searchFilmsCache = null;
var searchDebounceTimer = null;
var SEARCH_DEBOUNCE_MS = 200;

// Cinéastes avec fiche dédiée (comme catalogue.js)
var CINEASTE_FICHE_URL = { 'Eric Rohmer': 'Fiches Films/eric-rohmer.html' };
function cineasteNameMatches(a, b) {
    var n = function(s) { return (s || '').trim().toLowerCase().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
    return n(a) === n(b);
}
function getCineasteFicheUrl(cineaste) {
    var key = Object.keys(CINEASTE_FICHE_URL).find(function(k) { return cineasteNameMatches(k, cineaste); });
    return key ? CINEASTE_FICHE_URL[key] : null;
}

function getSearchBasePath() {
    return (window.location.pathname || '').indexOf('Fiches Films') !== -1 ? '../' : '';
}

function normalizeSearch(s) {
    return (s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
}

function filmMatchesQuery(film, q) {
    var nq = normalizeSearch(q);
    if (!nq || nq.length < 2) return false;
    if (normalizeSearch(film.titre).indexOf(nq) !== -1) return true;
    if (normalizeSearch(film.cineaste).indexOf(nq) !== -1) return true;
    if (Array.isArray(film.thematiques) && film.thematiques.some(function(t) { return normalizeSearch(t).indexOf(nq) !== -1; })) return true;
    if (Array.isArray(film.casting) && film.casting.some(function(c) { return normalizeSearch(c).indexOf(nq) !== -1; })) return true;
    return false;
}

function runSearch(films, q) {
    var qn = normalizeSearch(q);
    if (!qn || qn.length < 2) return { films: [], cineastes: [], thematiques: [], acteurs: [] };
    var results = { films: [], cineastes: [], thematiques: [], acteurs: [] };
    var cineasteSet = {};
    var thematiqueSet = {};
    var acteurFilms = {};
    films.forEach(function(film) {
        if (normalizeSearch(film.titre).indexOf(qn) !== -1) results.films.push(film);
        if (film.cineaste && normalizeSearch(film.cineaste).indexOf(qn) !== -1) cineasteSet[film.cineaste] = true;
        if (Array.isArray(film.thematiques)) {
            film.thematiques.forEach(function(t) {
                if (t && normalizeSearch(t).indexOf(qn) !== -1) thematiqueSet[t] = true;
            });
        }
        if (Array.isArray(film.casting)) {
            film.casting.forEach(function(c) {
                if (c && normalizeSearch(c).indexOf(qn) !== -1 && film.slug) acteurFilms[c] = film;
            });
        }
    });
    results.cineastes = Object.keys(cineasteSet).sort(function(a, b) { return a.localeCompare(b, 'fr'); });
    results.thematiques = Object.keys(thematiqueSet).sort(function(a, b) { return a.localeCompare(b, 'fr'); });
    results.acteurs = Object.keys(acteurFilms).map(function(name) { return { name: name, film: acteurFilms[name] }; }).sort(function(a, b) { return a.name.localeCompare(b.name, 'fr'); });
    return results;
}

function renderSearchResults(results, basePath) {
    var inFiches = basePath === '../';
    var filmHref = function(slug) { return inFiches ? (slug || '') : ('Fiches Films/' + (slug || '')); };
    var html = '';
    if (results.films.length > 0) {
        html += '<div class="search-results-section"><span class="search-results-label">Films</span><div class="search-results-list">';
        results.films.slice(0, 8).forEach(function(f) {
            var href = basePath + filmHref(f.slug);
            html += '<a href="' + href + '" class="search-result-link">' + (f.titre || '').replace(/</g, '&lt;') + '</a>';
        });
        html += '</div></div>';
    }
    if (results.cineastes.length > 0) {
        html += '<div class="search-results-section"><span class="search-results-label">Cinéastes</span><div class="search-results-list">';
        results.cineastes.slice(0, 6).forEach(function(c) {
            var ficheUrl = getCineasteFicheUrl(c);
            var href = ficheUrl ? (basePath + (inFiches ? ficheUrl.replace('Fiches Films/', '') : ficheUrl)) : (basePath + 'collections-cineaste.html?cineaste=' + encodeURIComponent(c));
            html += '<a href="' + href + '" class="search-result-link">' + c.replace(/</g, '&lt;') + '</a>';
        });
        html += '</div></div>';
    }
    if (results.thematiques.length > 0) {
        html += '<div class="search-results-section"><span class="search-results-label">Thématiques</span><div class="search-results-list">';
        results.thematiques.slice(0, 6).forEach(function(t) {
            var href = basePath + 'thematiques.html?tag=' + encodeURIComponent(t);
            html += '<a href="' + href + '" class="search-result-link">' + t.replace(/</g, '&lt;') + '</a>';
        });
        html += '</div></div>';
    }
    if (results.acteurs.length > 0) {
        html += '<div class="search-results-section"><span class="search-results-label">Acteurs / Actrices</span><div class="search-results-list">';
        results.acteurs.slice(0, 6).forEach(function(a) {
            var href = basePath + filmHref(a.film.slug);
            html += '<a href="' + href + '" class="search-result-link">' + a.name.replace(/</g, '&lt;') + ' <span class="search-result-film">→ ' + (a.film.titre || '').replace(/</g, '&lt;') + '</span></a>';
        });
        html += '</div></div>';
    }
    return html || '<p class="search-no-results">Aucun résultat. Tapez au moins 2 caractères.</p>';
}

function initSearch() {
    var searchBtn = document.querySelector('.search-btn');
    var searchOverlay = document.querySelector('.search-overlay');
    var searchClose = document.querySelector('.search-close');
    var searchInput = document.querySelector('#site-search') || document.querySelector('.search-input');
    var suggestionsEl = searchOverlay ? searchOverlay.querySelector('.search-suggestions') : null;

    if (!searchBtn || !searchOverlay) return;

    function loadFilmsAndSearch() {
        var q = (searchInput && searchInput.value || '').trim();
        var basePath = getSearchBasePath();
        if (!suggestionsEl) return;
        if (!q) {
            suggestionsEl.innerHTML = '<span class="search-suggestion-label">Tapez pour rechercher un film, un cinéaste, une thématique ou un acteur</span>';
            return;
        }
        function doSearch(films) {
            var results = runSearch(films, q);
            suggestionsEl.innerHTML = renderSearchResults(results, basePath);
        }
        if (searchFilmsCache) {
            doSearch(searchFilmsCache);
        } else {
            var jsonPath = basePath + 'data/films.json';
            fetch(jsonPath, { cache: 'no-store' }).then(function(r) { return r.ok ? r.json() : null; }).then(function(data) {
                var films = Array.isArray(data && data.films) ? data.films : [];
                searchFilmsCache = films;
                doSearch(films);
            }).catch(function() {
                suggestionsEl.innerHTML = '<p class="search-no-results">Impossible de charger la collection.</p>';
            });
        }
    }

    searchBtn.addEventListener('click', function() {
        searchOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(function() {
            if (searchInput) searchInput.focus();
            loadFilmsAndSearch();
        }, 300);
    });

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(loadFilmsAndSearch, SEARCH_DEBOUNCE_MS);
        });
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                var firstLink = suggestionsEl && suggestionsEl.querySelector('.search-result-link');
                if (firstLink) firstLink.click();
            }
        });
    }

    searchClose && searchClose.addEventListener('click', function() {
        searchOverlay.classList.remove('open');
        document.body.style.overflow = '';
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
            searchOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    });

    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}

// === Carousel (données depuis data/carousel.json sur la homepage) ===
let currentSlide = 0;
let totalSlides = 0;
let autoSlideInterval = null;

async function loadCarouselFromJson() {
    const container = document.querySelector('.hero-carousel .carousel-container');
    const dotsWrap = document.querySelector('.hero-carousel .carousel-dots');
    const counterTotal = document.querySelector('.hero-carousel .carousel-counter .total');
    if (!container || !dotsWrap) return;

    try {
        const response = await fetch('data/carousel.json', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        const slides = Array.isArray(data.slides) ? data.slides : [];
        if (slides.length === 0) return;

        container.innerHTML = '';
        dotsWrap.innerHTML = '';

        slides.forEach((s, i) => {
            const href = s.slug ? ('Fiches Films/' + s.slug) : '#';
            const activeClass = s.active ? ' carousel-slide active' : ' carousel-slide';
            const titleBlock = s.title_image
                ? `<img src="${s.title_image}" alt="${(s.alt || '').replace(/"/g, '&quot;')}" class="film-title-logo">`
                : `<h1 class="film-title">${s.title || ''}</h1>`;
            const slideHtml = `
<a href="${href}" class="carousel-slide-link">
  <div class="${activeClass.trim()}" data-index="${i}">
    <div class="slide-background">
      <img src="${s.image}" alt="${(s.alt || '').replace(/"/g, '&quot;')}">
    </div>
    <div class="slide-content">
      <span class="film-tag">${s.tag || ''}</span>
      ${titleBlock}
      ${s.director ? `<p class="film-director">${s.director}</p>` : ''}
    </div>
  </div>
</a>`;
            container.insertAdjacentHTML('beforeend', slideHtml.trim());

            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'dot' + (s.active ? ' active' : '');
            dot.setAttribute('data-index', String(i));
            dot.setAttribute('aria-label', `Slide ${i + 1}`);
            dotsWrap.appendChild(dot);
        });

        if (counterTotal) counterTotal.textContent = String(slides.length);
    } catch (e) {
        console.error('Erreur chargement carousel:', e);
    }
}

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const links = document.querySelectorAll('.carousel-slide-link');
    const currentCounter = document.querySelector('.carousel-counter .current');
    
    totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
    // Initialiser les z-index des liens (seule la slide active doit être cliquable)
    links.forEach((link, i) => {
        const slide = link.querySelector('.carousel-slide');
        if (slide && slide.classList.contains('active')) {
            link.style.zIndex = '5';
        } else {
            link.style.zIndex = '1';
        }
    });
    
    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetAutoSlide();
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoSlide();
        }
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    const carousel = document.querySelector('.hero-carousel');
    
    carousel?.addEventListener('touchstart', (e) => {
        // Ne pas capturer les touches sur les liens
        if (e.target.closest('.carousel-slide-link')) {
            return;
        }
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carousel?.addEventListener('touchend', (e) => {
        // Ne pas capturer les touches sur les liens
        if (e.target.closest('.carousel-slide-link')) {
            return;
        }
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            resetAutoSlide();
        }
    }
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const links = document.querySelectorAll('.carousel-slide-link');
    const currentCounter = document.querySelector('.carousel-counter .current');
    
    // Remove active from all
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active to current
    currentSlide = index;
    slides[currentSlide]?.classList.add('active');
    dots[currentSlide]?.classList.add('active');
    
    // Update z-index for links (only active link should be on top)
    links.forEach((link, i) => {
        if (i === currentSlide) {
            link.style.zIndex = '5';
        } else {
            link.style.zIndex = '1';
        }
    });
    
    // Update counter
    if (currentCounter) {
        currentCounter.textContent = currentSlide + 1;
    }
}

function nextSlide() {
    const next = (currentSlide + 1) % totalSlides;
    goToSlide(next);
}

function prevSlide() {
    const prev = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(prev);
}

function initAutoSlide() {
    autoSlideInterval = setInterval(() => {
        nextSlide();
    }, 8000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    initAutoSlide();
}

// === Intersection Observer for header style ===
const lightSections = document.querySelectorAll('.news-section, .catalog-section, .about-section');
const darkSections = document.querySelectorAll('.hero-carousel, .showtimes-section, .footer');

// Observer for light background sections
const lightObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.body.classList.add('light-header');
        }
    });
}, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });

// Observer for dark background sections
const darkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.body.classList.remove('light-header');
        }
    });
}, { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' });

lightSections.forEach(section => lightObserver.observe(section));
darkSections.forEach(section => darkObserver.observe(section));

// === Smooth scroll for anchor links ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// === Actualités (page actualités : chargement depuis data/actualites.json) ===
async function loadActualitesFromJson() {
    if (!document.body.classList.contains('page-actualites')) return;
    const featuredWrap = document.querySelector('.actualites-featured-wrap');
    const grid = document.querySelector('.actualites-page .news-grid');
    if (!featuredWrap || !grid) return;

    try {
        const response = await fetch('data/actualites.json', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        const articles = Array.isArray(data.articles) ? data.articles : [];
        if (articles.length === 0) return;

        const featured = articles.find(a => a.featured) || articles[0];
        const rest = articles.filter(a => a !== featured);

        const isExternal = (url) => /^https?:\/\//i.test(url);
        const linkAttrs = (url) => {
            if (!url || url === '#') return { href: '#' };
            const attrs = { href: url };
            if (isExternal(url)) {
                attrs.target = '_blank';
                attrs.rel = 'noopener noreferrer';
            }
            return attrs;
        };

        // Article à la une
        const a = featured;
        const fa = linkAttrs(a.url);
        featuredWrap.innerHTML = `
<article class="news-featured">
  <a href="${fa.href}" class="news-featured-link" ${fa.target ? `target="${fa.target}" rel="${fa.rel || ''}"` : ''}>
    <div class="news-featured-image">
      <img src="${a.image || ''}" alt="${(a.title || '').replace(/"/g, '&quot;')}">
    </div>
    <div class="news-featured-content">
      <span class="news-category">${a.category || ''}</span>
      <span class="news-date">${a.date || ''}</span>
      <h2 class="news-featured-title">${a.title || ''}</h2>
      <p class="news-featured-excerpt">${a.excerpt || ''}</p>
      <span class="news-cta">lire l'article →</span>
    </div>
  </a>
</article>`;

        // Grille d'articles
        grid.innerHTML = '';
        rest.forEach(art => {
            const la = linkAttrs(art.url);
            const card = document.createElement('article');
            card.className = 'news-card-item';
            card.innerHTML = `
<a href="${la.href}" ${la.target ? `target="${la.target}" rel="${la.rel || ''}"` : ''}>
  <div class="news-card-image">
    <img src="${art.image || ''}" alt="${(art.title || '').replace(/"/g, '&quot;')}">
  </div>
  <div class="news-card-content">
    <span class="news-category">${art.category || ''}</span>
    <span class="news-date">${art.date || ''}</span>
    <h3 class="news-card-title">${art.title || ''}</h3>
    <p class="news-card-excerpt">${art.excerpt || ''}</p>
  </div>
</a>`;
            grid.appendChild(card);
        });
    } catch (e) {
        console.error('Erreur chargement actualités:', e);
    }
}

// === Actualités homepage : slider chargé depuis JSON, tri du plus récent au plus ancien ===
async function loadHomeNewsFromJson() {
    if (!document.body.classList.contains('page-home')) return;
    const track = document.querySelector('.news-section .news-slider-track');
    if (!track) return;

    try {
        const response = await fetch('data/actualites.json', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        let articles = Array.isArray(data.articles) ? data.articles : [];
        if (articles.length === 0) return;

        // Tri : plus récents d'abord (date_iso décroissant)
        articles = [...articles].sort((a, b) => {
            const isoA = a.date_iso || '';
            const isoB = b.date_iso || '';
            return isoB.localeCompare(isoA);
        });

        const isExternal = (url) => /^https?:\/\//i.test(url);
        track.innerHTML = '';

        articles.forEach(art => {
            const href = art.url || '#';
            const target = isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
            const excerptShort = (art.excerpt || '').slice(0, 100) + ((art.excerpt || '').length > 100 ? '...' : '');
            const titleEsc = (art.title || '').replace(/"/g, '&quot;');
            const articleEl = document.createElement('article');
            articleEl.className = 'news-card-item';
            articleEl.innerHTML = `
<a href="${href}" class="news-card"${target}>
  <div class="news-image"><img src="${art.image || ''}" alt="${titleEsc}"></div>
  <div class="news-info">
    <span class="news-date">${art.date || ''}</span>
    <h3 class="news-title">${art.title || ''}</h3>
    <p class="news-excerpt">${excerptShort}</p>
    <span class="news-cta">lire l'article</span>
  </div>
</a>`;
            track.appendChild(articleEl);
        });
    } catch (e) {
        console.error('Erreur chargement actualités homepage:', e);
    }
}

// === Film Filters ===
// === News Slider (homepage) ===
function initNewsSlider() {
    const container = document.querySelector('.news-slider-track-container');
    const track = document.querySelector('.news-slider-track');
    if (!container || !track) return;

    const items = Array.from(track.querySelectorAll('.news-card-item'));
    if (items.length < 2) return;

    // Boucle continue : on duplique une fois la série d'articles.
    items.forEach(item => track.appendChild(item.cloneNode(true)));

    let originalWidth = 0;
    let rafId = null;
    let paused = false;
    const speedPxPerFrame = 0.28; // défilement lent et continu

    function measure() {
        originalWidth = track.scrollWidth / 2;
    }

    function tick() {
        if (!paused) {
            container.scrollLeft += speedPxPerFrame;
            if (container.scrollLeft >= originalWidth) {
                container.scrollLeft -= originalWidth;
            }
        }
        rafId = requestAnimationFrame(tick);
    }

    function start() {
        if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function stop() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
    }

    // Pause légère au survol / toucher pour garder le contrôle utilisateur.
    container.addEventListener('mouseenter', () => { paused = true; });
    container.addEventListener('mouseleave', () => { paused = false; });
    container.addEventListener('touchstart', () => { paused = true; }, { passive: true });
    container.addEventListener('touchend', () => { paused = false; }, { passive: true });

    window.addEventListener('resize', () => {
        measure();
        if (container.scrollLeft >= originalWidth) container.scrollLeft = 0;
    });

    measure();
    start();

    window.addEventListener('beforeunload', stop, { once: true });
}

function initFilmFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filmCards = document.querySelectorAll('.film-card');
    
    if (filterBtns.length === 0) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            // Filter cards with animation
            filmCards.forEach((card, index) => {
                const status = card.dataset.status;
                
                if (filter === 'all' || status === filter) {
                    card.style.display = '';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// === Showtimes : embed des mini-sites par film + menu déroulant personnalisé ===
function initShowtimes() {
    const select = document.getElementById('showtimes-film-select');
    const showtimesSection = document.querySelector('.showtimes-section');
    const embedWrapper = document.getElementById('showtimes-embed-wrapper');
    const bubbleOverlay = document.getElementById('showtimes-bubble-overlay');
    const iframe = document.getElementById('showtimes-iframe');
    const openLink = document.getElementById('showtimes-open-link');
    const dropdown = document.getElementById('showtimes-dropdown');
    const trigger = document.getElementById('showtimes-dropdown-trigger');
    const triggerLabel = trigger ? trigger.querySelector('.showtimes-dropdown-label') : null;
    const listEl = document.getElementById('showtimes-dropdown-list');

    if (!select || !embedWrapper || !iframe) return;

    function normText(s) {
        return (s || '')
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[’']/g, "'")
            .replace(/\s+/g, ' ');
    }

    function splitOptionLabel(label) {
        const txt = (label || '').trim();
        const parts = txt.split(/\s+[-—–]\s+/);
        if (parts.length >= 2) {
            return { title: parts[0].trim(), director: parts.slice(1).join(' - ').trim() };
        }
        return { title: txt, director: '' };
    }

    function findFilmByOptionLabel(films, label) {
        const parsed = splitOptionLabel(label);
        const nTitle = normText(parsed.title);
        return films.find(function(f) {
            const ft = normText(f.titre || '');
            return ft === nTitle || ft.includes(nTitle) || nTitle.includes(ft);
        }) || null;
    }

    function cardImageFromFilm(film) {
        if (!film) return '';
        const src = (film.affiche_photos || film.affiche_image || '').trim();
        if (!src) return '';
        return src;
    }

    function buildShowtimesOptions(films) {
        if (!listEl || !select.options.length) return;
        listEl.innerHTML = '';

        let count = 0;
        for (let i = 0; i < select.options.length; i++) {
            const opt = select.options[i];
            if ((opt.value || '').trim() === '') continue;
            count++;

            const label = opt.textContent.trim();
            const parsed = splitOptionLabel(label);
            const film = findFilmByOptionLabel(films, label);
            const image = cardImageFromFilm(film);
            const director = (film && film.cineaste) ? film.cineaste : parsed.director;

            const div = document.createElement('div');
            div.className = 'showtimes-dropdown-option showtimes-dropdown-card';
            div.setAttribute('role', 'option');
            div.dataset.value = opt.value;
            div.dataset.label = label;
            div.innerHTML = `
                <div class="showtimes-card-thumb">
                    ${image ? `<img src="${image}" alt="${(parsed.title || '').replace(/"/g, '&quot;')}">` : ''}
                </div>
                <div class="showtimes-card-meta">
                    <span class="showtimes-card-title">${parsed.title || ''}</span>
                    <span class="showtimes-card-director">${director || ''}</span>
                </div>
            `;
            listEl.appendChild(div);
        }

        listEl.style.setProperty('--showtimes-items', String(Math.max(1, count)));
    }

    // Construire la liste de vignettes à partir du select + data/films.json
    fetch('data/films.json', { cache: 'no-store' })
        .then(function(res) { return res.ok ? res.json() : null; })
        .then(function(data) {
            const films = data && Array.isArray(data.films) ? data.films : [];
            buildShowtimesOptions(films);
        })
        .catch(function() {
            buildShowtimesOptions([]);
        });

    function getFirstFilmOptionText() {
        for (let i = 0; i < select.options.length; i++) {
            const opt = select.options[i];
            if ((opt.value || '').trim() !== '') return opt.textContent.trim();
        }
        return 'Choisir un film...';
    }

    function updateShowtimesSectionSpacing() {
        if (!showtimesSection || !dropdown || !listEl) return;
        const isOpen = dropdown.classList.contains('is-open') && !listEl.hidden;
        const extra = isOpen ? Math.max(0, listEl.offsetHeight - 52) : 0;
        showtimesSection.style.setProperty('--showtimes-extra-space', extra + 'px');
    }

    function openDropdown() {
        if (!dropdown || !listEl) return;
        dropdown.classList.add('is-open');
        listEl.hidden = false;
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        listEl.classList.add('is-open');
        updateShowtimesSectionSpacing();
    }

    function closeDropdown() {
        if (!dropdown || !listEl) return;
        dropdown.classList.remove('is-open');
        listEl.classList.remove('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        listEl.hidden = true;
        updateShowtimesSectionSpacing();
    }

    // Clic sur le trigger
    if (trigger) {
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            if (dropdown.classList.contains('is-open')) closeDropdown();
            else openDropdown();
        });
    }

    // Clic sur une option : afficher "Titre du film..." et ouvrir la 2e bulle
    if (listEl) {
        listEl.addEventListener('click', function(e) {
            e.stopPropagation();
            const option = e.target.closest('.showtimes-dropdown-option');
            if (!option) return;
            const value = option.dataset.value || '';
            select.value = value;
            if (triggerLabel) {
                triggerLabel.textContent = value ? (option.dataset.label || getFirstFilmOptionText()) : getFirstFilmOptionText();
                triggerLabel.classList.remove('is-placeholder');
            }
            closeDropdown();
            select.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    // Fermer le menu en cliquant à l'extérieur (pas sur le trigger, pas sur la liste)
    document.addEventListener('click', function(e) {
        if (dropdown && dropdown.classList.contains('is-open') && !dropdown.contains(e.target)) {
            closeDropdown();
        }
    });

    function openBubble() {
        embedWrapper.classList.remove('is-closing');
        embedWrapper.hidden = false;
        if (bubbleOverlay) {
            bubbleOverlay.hidden = false;
            bubbleOverlay.setAttribute('aria-hidden', 'false');
        }
        // Laisser le navigateur peindre l'état initial (opacity 0) avant d'ajouter is-open
        requestAnimationFrame(function() {
            void embedWrapper.offsetHeight;
            requestAnimationFrame(function() {
                embedWrapper.classList.add('is-open');
                if (bubbleOverlay) bubbleOverlay.classList.add('is-visible');
            });
        });
    }

    function resetShowtimesSection() {
        select.value = '';
        if (triggerLabel) {
            triggerLabel.textContent = getFirstFilmOptionText();
            triggerLabel.classList.add('is-placeholder');
        }
        iframe.removeAttribute('src');
        if (openLink) {
            openLink.href = '#';
            openLink.hidden = true;
        }
    }

    function closeBubble() {
        if (!embedWrapper.classList.contains('is-open')) {
            embedWrapper.hidden = true;
            embedWrapper.classList.remove('is-closing');
            if (bubbleOverlay) {
                bubbleOverlay.hidden = true;
                bubbleOverlay.classList.remove('is-visible');
                bubbleOverlay.setAttribute('aria-hidden', 'true');
            }
            resetShowtimesSection();
            return;
        }
        embedWrapper.classList.remove('is-open');
        embedWrapper.classList.add('is-closing');
        if (bubbleOverlay) bubbleOverlay.classList.remove('is-visible');
        embedWrapper.addEventListener('transitionend', function onEnd(e) {
            if (e.target !== embedWrapper || e.propertyName !== 'max-height') return;
            embedWrapper.hidden = true;
            embedWrapper.classList.remove('is-closing');
            if (bubbleOverlay) {
                bubbleOverlay.hidden = true;
                bubbleOverlay.setAttribute('aria-hidden', 'true');
            }
            resetShowtimesSection();
        }, { once: true });
    }

    if (bubbleOverlay) {
        bubbleOverlay.addEventListener('click', function() {
            closeBubble();
        });
    }

    if (openLink) {
        openLink.addEventListener('click', function(e) {
            e.stopPropagation();
            const href = (openLink.getAttribute('href') || '').trim();
            if (!href || href === '#') {
                e.preventDefault();
                return;
            }
            // Sécurise l'ouverture dans un nouvel onglet même si un overlay capte mal le focus
            e.preventDefault();
            window.open(href, '_blank', 'noopener,noreferrer');
        });
    }

    select.addEventListener('change', function() {
        const url = (this.value || '').trim();
        const clipEl = document.getElementById('showtimes-iframe-clip');

        if (!url) {
            closeBubble();
            iframe.removeAttribute('src');
            if (openLink) openLink.href = '#';
            if (triggerLabel) triggerLabel.classList.add('is-placeholder');
            return;
        }

        if (triggerLabel) triggerLabel.classList.remove('is-placeholder');

        /* Appliquer le cadrage (décalage) pour ce mini-site : même valeur par défaut pour tous, ou data-clip-offset sur l'option */
        const selectedOpt = this.options[this.selectedIndex];
        const clipOffset = selectedOpt && selectedOpt.hasAttribute('data-clip-offset')
            ? selectedOpt.getAttribute('data-clip-offset') + 'px'
            : '-400px';
        if (clipEl) clipEl.style.setProperty('--showtimes-clip-offset', clipOffset);

        iframe.src = url;
        if (openLink) {
            openLink.href = url;
            openLink.hidden = false;
        }
        openBubble();
    });

    // État initial : afficher le premier film comme suggestion
    if (triggerLabel) {
        triggerLabel.textContent = getFirstFilmOptionText();
        triggerLabel.classList.add('is-placeholder');
    }

    window.addEventListener('resize', updateShowtimesSectionSpacing);
    updateShowtimesSectionSpacing();
}

// === Animated Favicon (Rotating Losange) ===
function initAnimatedFavicon() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 32;
    canvas.width = size;
    canvas.height = size;
    
    const favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'images/favicon.png';
    
    let angle = 0;
    
    img.onload = function() {
        function rotateFavicon() {
            ctx.clearRect(0, 0, size, size);
            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.rotate(angle * Math.PI / 180);
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            ctx.restore();
            
            favicon.href = canvas.toDataURL('image/png');
            
            angle += 2; // Vitesse de rotation
            if (angle >= 360) angle = 0;
        }
        
        // Rotation toutes les 50ms (20 FPS)
        setInterval(rotateFavicon, 50);
    };
}

// === Chargement des fiches films depuis data/films.json (page nouveautés) ===
// Filtre : sortis il y a moins d'un an OU pas encore sortis
function isFilmRecent(film) {
    const ts = parseFilmDate(film.date_sortie);
    if (ts == null) return true; // pas de date = on affiche (à venir ou inconnu)
    const now = Date.now();
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
    return ts >= oneYearAgo || ts > now;
}

function filmHasCategory(film, category) {
    let cats = film.categories;
    if (cats == null) return false;
    if (typeof cats === 'string') cats = [cats];
    if (!Array.isArray(cats)) return false;
    const target = (category || '').toLowerCase();
    return cats.some(c => (c || '').toString().trim().toLowerCase() === target);
}

// Statut normalisé (Sheet peut envoyer "Statut" ou "status", avec espaces/casse)
function getFilmStatus(film) {
    const raw = (film.status ?? film.Statut ?? '').toString().trim().toLowerCase();
    if (raw === 'actuellement') return 'actuellement';
    if (raw === 'prochainement') return 'prochainement';
    return 'catalogue';
}

// Années affichées en ventes internationales / production (nouveautés)
const NOUVEAUTES_YEARS = [2024, 2025, 2026, 2027];

// Production : 4 films affichés en tête (ordre fixe), même s'ils ne sont pas en catégorie production
const PRODUCTION_FIRST_SLUGS = ['six-jours-ce-printemps-la.html', 'raymond-depardon-cineaste.html', 'hautefaye.html', 'outofthisworld.html'];

// Retourne l'année de sortie (nombre) ou null si inconnue. Gère Date(y,m,d), "2024", "2025.0", etc.
function getFilmYear(film) {
    const raw = film.date_sortie;
    if (raw == null || raw === '') return null;
    const ts = parseFilmDate(raw);
    if (ts != null) return new Date(ts).getFullYear();
    const s = String(raw).trim();
    const num = parseInt(s.replace(/\.0$/, ''), 10);
    if (num >= 2020 && num <= 2030) return num;
    const match = s.match(/\b(202[4-7])\b/);
    return match ? parseInt(match[1], 10) : null;
}

// true si le film doit apparaître dans la liste nouveautés (ventes / prod) : année 2024–2027 ou sans date (à venir)
function isFilmInNouveautesYears(film) {
    const y = getFilmYear(film);
    if (y == null) return true; // sans date = à venir, on affiche
    return NOUVEAUTES_YEARS.includes(y);
}

// Tri par date de sortie décroissant (plus récent au plus vieux ; sans date = en fin de liste)
function sortFilmsByDateDesc(films) {
    return [...films].sort((a, b) => {
        const ta = parseFilmDate(a.date_sortie);
        const tb = parseFilmDate(b.date_sortie);
        const tA = ta == null ? -Infinity : ta; // pas de date = à la fin
        const tB = tb == null ? -Infinity : tb;
        if (tB !== tA) return tB - tA; // plus récent en premier
        return ((a.titre || '').localeCompare(b.titre || '', 'fr')) || 0; // puis par titre
    });
}

async function loadFilmsFromJson() {
    if (!document.body.classList.contains('page-films')) return;

    const distActuellementGrid = document.querySelector('.films-grid[data-status="actuellement"][data-category="distribution"]');
    const distProchainementGrid = document.querySelector('.films-grid[data-status="prochainement"][data-category="distribution"]');
    const ventesGrid = document.querySelector('.films-grid[data-category="ventes internationales"]');
    const productionGrid = document.querySelector('.films-grid[data-category="production"]');

    if (!distActuellementGrid || !distProchainementGrid || !ventesGrid || !productionGrid) return;

    try {
        const response = await fetch('data/films.json', { cache: 'no-store' });
        if (!response.ok) {
            console.error('Impossible de charger data/films.json');
            return;
        }
        const data = await response.json();
        const films = Array.isArray(data.films) ? data.films : [];

        // Carte film (réutilisable)
        function createFilmCard(film) {
            const status = getFilmStatus(film);
            const article = document.createElement('article');
            article.className = 'film-card';
            article.dataset.status = status;
            if (Array.isArray(film.thematiques) && film.thematiques.length > 0) {
                article.dataset.thematiques = film.thematiques.join(',');
            }
            const link = document.createElement('a');
            link.className = 'film-card-link';
            link.href = film.slug ? ('Fiches Films/' + film.slug) : '#';
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'film-card-image';
            const img = document.createElement('img');
            img.src = film.affiche_image || 'images/catalogue/l-avenir.jpg';
            img.alt = film.titre || '';
            imageWrapper.appendChild(img);
            const overlay = document.createElement('div');
            overlay.className = 'film-card-overlay';
            const play = document.createElement('span');
            play.className = 'film-card-play';
            play.textContent = '▶';
            overlay.appendChild(play);
            imageWrapper.appendChild(overlay);
            const info = document.createElement('div');
            info.className = 'film-card-info';
            const tags = document.createElement('div');
            tags.className = 'film-card-tags';
            const statusSpan = document.createElement('span');
            statusSpan.className = 'film-card-status';
            if (status === 'prochainement') statusSpan.classList.add('soon');
            statusSpan.textContent =
                status === 'actuellement' ? 'en salles' :
                status === 'prochainement' ? 'prochainement' : 'catalogue';
            tags.appendChild(statusSpan);
            const categorySpan = document.createElement('span');
            categorySpan.className = 'film-card-category';
            categorySpan.textContent = (Array.isArray(film.categories) && film.categories.length > 0)
                ? film.categories.join(' • ') : 'distribution';
            tags.appendChild(categorySpan);
            info.appendChild(tags);
            const title = document.createElement('h3');
            title.className = 'film-card-title';
            title.textContent = (film.titre || '').toUpperCase();
            info.appendChild(title);
            const director = document.createElement('p');
            director.className = 'film-card-director';
            director.textContent = film.cineaste || '';
            info.appendChild(director);
            link.appendChild(imageWrapper);
            link.appendChild(info);
            article.appendChild(link);
            return article;
        }

        // Distribution : tous les films distribution avec statut actuellement ou prochainement (sans filtre date)
        const distributionCurrent = films.filter(f =>
            filmHasCategory(f, 'distribution') &&
            (getFilmStatus(f) === 'actuellement' || getFilmStatus(f) === 'prochainement')
        );
        distActuellementGrid.innerHTML = '';
        distProchainementGrid.innerHTML = '';
        distributionCurrent.forEach(film => {
            const status = getFilmStatus(film);
            if (status === 'actuellement') {
                distActuellementGrid.appendChild(createFilmCard(film));
            } else if (status === 'prochainement') {
                distProchainementGrid.appendChild(createFilmCard(film));
            }
        });

        // Ventes internationales : catégorie + années 2024–2027 (ou sans date) ; si aucun film, afficher tous
        let ventesFiltered = films.filter(f =>
            filmHasCategory(f, 'ventes internationales') && isFilmInNouveautesYears(f)
        );
        if (ventesFiltered.length === 0) {
            ventesFiltered = films.filter(f => filmHasCategory(f, 'ventes internationales'));
        }
        ventesGrid.innerHTML = '';
        sortFilmsByDateDesc(ventesFiltered).forEach(film => ventesGrid.appendChild(createFilmCard(film)));

        // Production : 4 films en tête (Six Jours, Depardon, Hautefaye, Out of this World), puis le reste
        let productionFiltered = films.filter(f =>
            filmHasCategory(f, 'production') && isFilmInNouveautesYears(f)
        );
        if (productionFiltered.length === 0) {
            productionFiltered = films.filter(f => filmHasCategory(f, 'production'));
        }
        const firstSlugSet = new Set(PRODUCTION_FIRST_SLUGS);
        const productionFirst = PRODUCTION_FIRST_SLUGS
            .map(slug => films.find(f => (f.slug || '').toLowerCase().replace(/\.html$/i, '') === slug.toLowerCase().replace(/\.html$/i, '')))
            .filter(Boolean);
        const productionRest = productionFiltered.filter(f => !firstSlugSet.has((f.slug || '').toLowerCase()));
        const productionFinal = [...productionFirst, ...sortFilmsByDateDesc(productionRest)];
        productionGrid.innerHTML = '';
        productionFinal.forEach(film => productionGrid.appendChild(createFilmCard(film)));

        initFilmsPageCategoryNav();
    } catch (error) {
        console.error('Erreur lors du chargement des fiches films :', error);
    }
}

function initFilmsPageCategoryNav() {
    const btns = document.querySelectorAll('.films-page-nav .catalogue-nav-link[data-films-category]');
    const categories = document.querySelectorAll('.films-page-category');
    if (!btns.length || !categories.length) return;

    function setActiveCategory(category) {
        btns.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-films-category') === category);
        });
        categories.forEach(block => {
            block.classList.toggle('active', block.getAttribute('data-category') === category);
        });
    }

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-films-category');
            if (!category) return;
            setActiveCategory(category);
        });
    });

    // Ouvrir l'onglet correspondant au hash (ex: films.html#ventes-internationales)
    const hashToCategory = {
        'distribution': 'distribution',
        'ventes-internationales': 'ventes internationales',
        'production': 'production'
    };
    function applyHash() {
        const hash = (window.location.hash || '').replace(/^#/, '').toLowerCase();
        if (hash && hashToCategory[hash]) setActiveCategory(hashToCategory[hash]);
    }
    applyHash();
    window.addEventListener('hashchange', applyHash);
}

// === Page À voir en ligne (VOD/SVOD) ===
const STREAMING_PLATFORM_LABELS = {
    'arte': 'ARTE',
    'canal': 'Canal+',
    'cinetek': 'Cinetek',
    'mubi': 'MUBI',
    'prime': 'Prime Video',
    'tenk': 'Tenk',
    'universciné': 'UniversCiné',
    'france_tv': 'France TV',
    'netflix': 'Netflix',
    'disney': 'Disney+',
    'ocs': 'OCS',
    'apple': 'Apple TV+'
};
// Logos dans /logos (nom affiché si pas de logo)
const STREAMING_PLATFORM_LOGOS = {
    'arte': 'logos/Arte.png',
    'canal': 'https://upload.wikimedia.org/wikipedia/fr/8/81/Mycanal.png',
    'cinetek': 'logos/cinetek.png',
    'mubi': 'logos/Mubi.png',
    'tenk': 'logos/tenk.png',
    'universciné': 'logos/UniversCiné.png',
    'france_tv': 'logos/FranceTv.png'
};
function getPlatformLogoPath(key) {
    return STREAMING_PLATFORM_LOGOS[key] || null;
}
function getPlatformKeyFromName(name) {
    const n = (name || '').toLowerCase().trim();
    const map = { 'arte': 'arte', 'canal+': 'canal', 'canal plus': 'canal', 'cinetek': 'cinetek', 'mubi': 'mubi', 'prime video': 'prime', 'amazon prime': 'prime', 'tenk': 'tenk', 'universciné': 'universciné', 'universcine': 'universciné', 'france tv': 'france_tv', 'francetv': 'france_tv' };
    for (const [k, v] of Object.entries(map)) { if (n.includes(k) || n === k) return v; }
    return null;
}

function getFilmYear(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const m = dateStr.match(/Date\((\d+)/);
    return m ? m[1] : '';
}

async function loadStreamingPage() {
    const grid = document.getElementById('streaming-grid');
    if (!grid || !document.body.classList.contains('page-streaming')) return;

    try {
        const [filmsRes, streamingRes] = await Promise.all([
            fetch('data/films.json', { cache: 'no-store' }),
            fetch('data/streaming.json', { cache: 'no-store' })
        ]);
        if (!filmsRes.ok || !streamingRes.ok) {
            console.error('Impossible de charger films.json ou streaming.json');
            return;
        }
        const filmsData = await filmsRes.json();
        const streamingData = await streamingRes.json();
        const films = Array.isArray(filmsData.films) ? filmsData.films : [];
        const streamingList = Array.isArray(streamingData.films) ? streamingData.films : [];

        const filmsBySlug = {};
        films.forEach(f => {
            const s = (f.slug || '').trim().toLowerCase();
            if (s) {
                filmsBySlug[s] = f;
                filmsBySlug[s.replace(/\.html$/, '')] = f;
            }
        });

        const DISPLAYED_PLATFORMS = ['arte', 'canal', 'cinetek', 'mubi', 'tenk', 'universciné', 'france_tv'];
        const streamingFiltered = streamingList.filter(entry => {
            const plateformes = Array.isArray(entry.plateformes) ? entry.plateformes : [entry.plateformes].filter(Boolean);
            return plateformes.some(p => DISPLAYED_PLATFORMS.includes((p || '').toLowerCase().trim()));
        });

        streamingFiltered.sort((a, b) => {
            const slugNorm = s => (s || '').trim().toLowerCase().replace(/\.html$/, '');
            const filmFor = e => filmsBySlug[e.slug] || filmsBySlug[slugNorm(e.slug)] || films.find(f => slugNorm(f.slug) === slugNorm(e.slug));
            const titreA = (filmFor(a)?.titre || '').toLowerCase().trim();
            const titreB = (filmFor(b)?.titre || '').toLowerCase().trim();
            return titreA.localeCompare(titreB, 'fr');
        });

        grid.innerHTML = '';
        streamingFiltered.forEach(entry => {
            const slugNorm = (entry.slug || '').trim().toLowerCase().replace(/\.html$/, '');
            const film = filmsBySlug[entry.slug] || filmsBySlug[slugNorm] || films.find(f =>
                (f.slug || '').toLowerCase().replace(/\.html$/, '') === slugNorm
            );
            if (!film) return;

            const plateformes = Array.isArray(entry.plateformes) ? entry.plateformes : [entry.plateformes].filter(Boolean);
            const platformUrls = entry.platform_urls || {};
            const firstPlatformWithUrl = plateformes.find(p => platformUrls[(p || '').toLowerCase().trim()]);
            const directPlatformUrl = firstPlatformWithUrl ? platformUrls[firstPlatformWithUrl.toLowerCase().trim()] : null;
            const directPlatformLabel = firstPlatformWithUrl ? (STREAMING_PLATFORM_LABELS[firstPlatformWithUrl] || firstPlatformWithUrl) : null;
            const svodUrl = directPlatformUrl || entry.svod_url || entry.justwatch_url || '';
            const justwatchUrl = entry.justwatch_url || '';
            const ficheHref = film.slug ? ('Fiches Films/' + film.slug) : '#';
            const year = getFilmYear(film.date_sortie);
            const directorLine = [film.cineaste, year].filter(Boolean).join(' • ');
            const imgSrc = film.affiche_image || 'images/catalogue/l-avenir.jpg';

            const article = document.createElement('article');
            article.className = 'streaming-card';
            article.dataset.platform = plateformes[0] || '';
            article.dataset.platforms = plateformes.join(' ');

            const link = document.createElement('a');
            link.href = ficheHref;

            const imageDiv = document.createElement('div');
            imageDiv.className = 'streaming-card-image';
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = film.titre || '';
            imageDiv.appendChild(img);
            const overlay = document.createElement('div');
            overlay.className = 'streaming-card-overlay';
            overlay.innerHTML = '<svg width="50" height="50" viewBox="0 0 24 24" fill="none"><path d="M10 8v8l6-4-6-4z" fill="currentColor"/></svg>';
            imageDiv.appendChild(overlay);
            plateformes.forEach(p => {
                const tag = document.createElement('span');
                tag.className = 'platform-tag ' + (p || '').toLowerCase();
                tag.textContent = STREAMING_PLATFORM_LABELS[p] || p;
                imageDiv.appendChild(tag);
            });
            link.appendChild(imageDiv);

            const info = document.createElement('div');
            info.className = 'streaming-card-info';
            const title = document.createElement('h3');
            title.className = 'streaming-card-title';
            title.textContent = (film.titre || '').toUpperCase();
            info.appendChild(title);
            const director = document.createElement('p');
            director.className = 'streaming-card-director';
            director.textContent = directorLine;
            info.appendChild(director);
            link.appendChild(info);
            article.appendChild(link);

            if (svodUrl) {
                const streamLink = document.createElement('a');
                streamLink.href = svodUrl;
                streamLink.target = '_blank';
                streamLink.rel = 'noopener noreferrer';
                streamLink.className = 'streaming-card-justwatch';
                streamLink.textContent = directPlatformLabel ? ('Voir sur ' + directPlatformLabel) : (entry.svod_url ? ('Voir sur ' + (entry.svod_platform || '')) : 'Voir où regarder');
                article.appendChild(streamLink);
            }
            grid.appendChild(article);
        });
    } catch (err) {
        console.error('Erreur chargement page streaming:', err);
    }
}

function initStreamingFilters() {
    const btns = document.querySelectorAll('.platform-btn');
    const cards = document.querySelectorAll('.streaming-card');
    if (!btns.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const platform = (btn.dataset.platform || '').trim();
            cards.forEach(card => {
                const platforms = (card.dataset.platforms || '').trim().split(/\s+/).filter(Boolean);
                const show = platform === 'all' || platform === '' || platforms.includes(platform);
                card.style.display = show ? 'block' : 'none';
            });
        });
    });
}

// === Mise en avant du moment (homepage) – SVOD avec lien direct plateforme ===
async function loadStreamingSpotlight() {
    const wrap = document.getElementById('streaming-spotlight');
    if (!wrap || !document.body.classList.contains('page-home')) return;

    try {
        const res = await fetch('data/streaming_spotlight.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data.spotlight) ? data.spotlight : [];
        const item = list[0];
        if (!item || !item.svod_url) return;

        let title = (item.title || '').toUpperCase();
        let director = item.director || '';
        let image = item.image || 'images/catalogue/l-avenir.jpg';
        let meta = item.meta || '';
        let award = item.award || '';
        let releaseDateLabel = '';

        function extractYearLabel(dateStr) {
            if (!dateStr || typeof dateStr !== 'string') return '';
            const s = dateStr.trim();
            let m = s.match(/Date\((\d{4}),\s*\d{1,2},\s*\d{1,2}\)/);
            if (m) return m[1];
            m = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (m) return m[3];
            return '';
        }

        if (item.slug && item.slug.trim()) {
            try {
                const filmsRes = await fetch('data/films.json', { cache: 'no-store' });
                if (filmsRes.ok) {
                    const filmsData = await filmsRes.json();
                    const films = Array.isArray(filmsData.films) ? filmsData.films : [];
                    const film = films.find(f => (f.slug || '').toLowerCase().replace(/\.html$/, '') === (item.slug || '').toLowerCase().replace(/\.html$/, ''));
                    if (film) {
                        title = (film.titre || title).toUpperCase();
                        director = director || ('un film de ' + (film.cineaste || ''));
                        image = film.affiche_image || image;
                        if (!meta && Array.isArray(film.casting) && film.casting.length) meta = film.casting.slice(0, 3).join(' • ');
                        releaseDateLabel = extractYearLabel(film.date_sortie || '');
                    }
                }
            } catch (_) {}
        }

        const platformKey = getPlatformKeyFromName(item.svod_platform || '') || (item.platform_key || '');
        const platformLogoPath = item.platform_logo || (platformKey ? getPlatformLogoPath(platformKey) : null);
        const badgeLabel = item.badge_label || ('disponible sur ' + (item.svod_platform || ''));
        const link = document.createElement('a');
        link.href = item.svod_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'watch-now-card';

        const platformName = item.svod_platform || 'France TV';
        const voirSurText = 'Voir sur ' + platformName;
        const titleWithDate = releaseDateLabel ? (title + ' (' + releaseDateLabel + ')') : title;
        link.innerHTML =
            '<div class="watch-now-video">' +
            '<img src="' + escapeHtmlAttr(image) + '" alt="' + escapeHtmlAttr(item.title || title) + '">' +
            '<div class="play-overlay"><svg width="80" height="80" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="1"/><path d="M10 8v8l6-4-6-4z" fill="currentColor"/></svg></div>' +
            (platformLogoPath ? '<div class="streaming-spotlight-logo-top"><img src="' + escapeHtmlAttr(platformLogoPath) + '" alt="' + escapeHtmlAttr(platformName) + '" class="streaming-spotlight-logo-img"></div>' : '') +
            '<div class="streaming-spotlight-footer"><span class="streaming-spotlight-btn">' + escapeHtml(voirSurText) + '</span></div>' +
            '</div>' +
            '<div class="watch-now-info">' +
            '<span class="watch-now-director">' + escapeHtml(director) + '</span>' +
            '<h2 class="watch-now-title">' + escapeHtml(titleWithDate) + '</h2>' +
            (meta ? '<p class="watch-now-meta">avec: ' + escapeHtml(meta) + '</p>' : '') +
            (award ? '<span class="watch-now-award">' + escapeHtml(award) + '</span>' : '') +
            '</div>';

        wrap.appendChild(link);
    } catch (err) {
        console.error('Erreur chargement streaming spotlight:', err);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text == null ? '' : String(text);
    return div.innerHTML;
}
function escapeHtmlAttr(text) {
    return escapeHtml(text).replace(/"/g, '&quot;');
}

// === Films récents sur la page d'accueil (par catégorie) ===
function parseFilmDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const s = dateStr.trim();
    // Format Date(year, month, day) (mois 0 = janvier)
    let m = s.match(/Date\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) {
        const year = parseInt(m[1], 10);
        const month = parseInt(m[2], 10);
        const day = parseInt(m[3], 10);
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? null : d.getTime();
    }
    // Format DD/MM/YYYY ou D/M/YYYY (jour, mois, année)
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
        const day = parseInt(m[1], 10);
        const month = parseInt(m[2], 10) - 1; // JS : 0 = janvier
        const year = parseInt(m[3], 10);
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? null : d.getTime();
    }
    return null;
}

function createHomeFilmCard(film) {
    const article = document.createElement('article');
    article.className = 'film-card';
    const link = document.createElement('a');
    link.className = 'film-card-link';
    link.href = film.slug ? ('Fiches Films/' + film.slug) : '#';

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'film-card-image';
    const img = document.createElement('img');
    img.src = film.affiche_image || 'images/catalogue/l-avenir.jpg';
    img.alt = film.titre || '';
    img.loading = 'lazy';
    imageWrapper.appendChild(img);

    const overlay = document.createElement('div');
    overlay.className = 'film-card-overlay';
    const play = document.createElement('span');
    play.className = 'film-card-play';
    play.textContent = '▶';
    overlay.appendChild(play);
    imageWrapper.appendChild(overlay);

    const info = document.createElement('div');
    info.className = 'film-card-info';

    const title = document.createElement('h3');
    title.className = 'film-card-title';
    title.textContent = (film.titre || '').toUpperCase();
    info.appendChild(title);

    const director = document.createElement('p');
    director.className = 'film-card-director';
    director.textContent = film.cineaste || '';
    info.appendChild(director);

    link.appendChild(imageWrapper);
    link.appendChild(info);
    article.appendChild(link);
    return article;
}

async function loadHomeFilms() {
    if (!document.body.classList.contains('page-home')) return;

    const grids = document.querySelectorAll('.home-films-grid');
    if (!grids.length) return;

    try {
        const response = await fetch('data/films.json', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        const films = Array.isArray(data.films) ? data.films : [];

        // Liste fixe des 4 films à afficher par onglet (ordre respecté)
        const HOME_FILMS_BY_CATEGORY = {
            'distribution': [
                'Father Mother Sister Brother',
                'Raymond Depardon Cinéaste',
                'Victor comme tout le monde',
                'Le Cri des gardes'
            ],
            'ventes internationales': [
                'Victor comme tout le monde',
                'Resurrection',
                'Oui',
                'The Chronology Of Water'
            ],
            'production': [
                'Hautefaye',
                'Out of this world',
                'Six Jours',
                'Rétrospective Depardon'
            ]
        };

        function findFilmByTitle(filmsList, title) {
            const t = (title || '').toLowerCase().trim().replace(/\s+/g, ' ');
            return filmsList.find(f => {
                const ft = (f.titre || '').toLowerCase().trim().replace(/\s+/g, ' ');
                return ft === t || ft.includes(t) || t.includes(ft) ||
                    ft.replace(/[éèê]/g, 'e').replace(/[àâ]/g, 'a').includes(t) ||
                    (t.includes('depardon') && ft.includes('depardon'));
            });
        }

        const distributionFilms = HOME_FILMS_BY_CATEGORY['distribution']
            .map(title => findFilmByTitle(films, title))
            .filter(Boolean);

        const ventesFilms = HOME_FILMS_BY_CATEGORY['ventes internationales']
            .map(title => findFilmByTitle(films, title))
            .filter(Boolean);

        const productionFilms = HOME_FILMS_BY_CATEGORY['production']
            .map(title => findFilmByTitle(films, title))
            .filter(Boolean);

        const gridByCategory = {
            'distribution': document.querySelector('.home-films-grid[data-category="distribution"]'),
            'ventes internationales': document.querySelector('.home-films-grid[data-category="ventes internationales"]'),
            'production': document.querySelector('.home-films-grid[data-category="production"]')
        };

        [distributionFilms, ventesFilms, productionFilms].forEach((list, i) => {
            const key = ['distribution', 'ventes internationales', 'production'][i];
            const grid = gridByCategory[key];
            if (!grid) return;
            grid.innerHTML = '';
            list.forEach(film => grid.appendChild(createHomeFilmCard(film)));
        });

        initHomeFilmsCategoryNav();
    } catch (error) {
        console.error('Erreur chargement films homepage :', error);
    }
}

function initHomeFilmsCategoryNav() {
    const btns = document.querySelectorAll('.home-films-nav .catalogue-nav-link');
    const categories = document.querySelectorAll('.home-films-category');
    if (!btns.length || !categories.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-home-category');
            if (!category) return;

            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            categories.forEach(block => {
                if (block.getAttribute('data-category') === category) {
                    block.classList.add('active');
                } else {
                    block.classList.remove('active');
                }
            });
        });
    });
}

// Lancer l'animation du favicon
document.addEventListener('DOMContentLoaded', initAnimatedFavicon);
