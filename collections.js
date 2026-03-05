/**
 * Gestion du catalogue de films
 * Regroupement par cinéaste et par thématique
 */

console.log('🎬 catalogue.js chargé !');

let allFilms = [];

// Image de remplacement pour un cinéaste (en attendant les fiches)
const CINEASTE_COVER_OVERRIDES = {
    'Lars Von Trier': 'https://filmsdulosange.com/wp-content/uploads/sites/2/2019/02/photo-9-melancholia.jpg',
    'Otar Iosseliani': 'images/chassepapillons.jpg'
};

// Cinéastes avec une fiche dédiée : clic → ouverture de la fiche au lieu de la liste des films
const CINEASTE_FICHE_URL = {
    'Eric Rohmer': 'Fiches Films/eric-rohmer.html'
};
function getCineasteFicheUrl(cineaste) {
    const key = Object.keys(CINEASTE_FICHE_URL).find(k => cineasteNameMatches(k, cineaste));
    return key ? CINEASTE_FICHE_URL[key] : null;
}

// 15 cinéastes mis en avant (grille de 5), ordre d'affichage
const FEATURED_CINEASTES = [
    'Raymond Depardon',
    'Jean Eustache',
    'Tony Gatlif',
    'Alain Guiraudie',
    'Michael Haneke',
    'Mia Hansen-Løve',
    'Otar Iosseliani',
    'Joachim Lafosse',
    'Christian Petzold',
    'Nicolas Philibert',
    'Jacques Rivette',
    'Eric Rohmer',
    'Barbet Schroeder',
    'Lars Von Trier',
    'Wim Wenders'
];

// Comparaison souple (Éric / Eric, espaces)
function cineasteNameMatches(a, b) {
    const n = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return n(a) === n(b);
}

// Charger tous les films
async function loadAllFilms() {
    try {
        const response = await fetch('data/films.json', { cache: 'no-store' });
        if (!response.ok) {
            console.error('Impossible de charger data/films.json :', response.status);
            return [];
        }
        const data = await response.json();
        return Array.isArray(data.films) ? data.films : [];
    } catch (error) {
        console.error('Erreur lors du chargement des films :', error);
        return [];
    }
}

// Créer une carte film enrichie avec toutes les informations
// opts.useAfficheImageOnly = true : page A-Z uniquement, couverture = affiche_image
function createFilmCard(film, opts) {
    const useAfficheImageOnly = opts && opts.useAfficheImageOnly;
    const article = document.createElement('article');
    article.className = 'film-card film-card-detailed';
    article.dataset.status = film.status || 'catalogue';
    
    if (Array.isArray(film.thematiques) && film.thematiques.length > 0) {
        article.dataset.thematiques = film.thematiques.join(',');
    }

    // Lien vers la page du film (dans Fiches Films/)
    const filmLink = film.slug ? document.createElement('a') : null;
    if (filmLink) {
        filmLink.href = 'Fiches Films/' + film.slug;
        filmLink.className = 'film-card-link';
    }

    // Image : A-Z = affiche_image uniquement ; cinéaste/thématique = affiche_photos en priorité
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'film-card-image';
    const img = document.createElement('img');
    const coverFallback = film.affiche_image || 'images/catalogue/l-avenir.jpg';
    img.src = useAfficheImageOnly ? coverFallback : (getAffichePhotos(film) || coverFallback);
    img.alt = film.titre || '';
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.onerror = function() {
        this.onerror = null;
        this.src = coverFallback;
    };
    imageWrapper.appendChild(img);

    const overlay = document.createElement('div');
    overlay.className = 'film-card-overlay';
    const play = document.createElement('span');
    play.className = 'film-card-play';
    play.textContent = '▶';
    overlay.appendChild(play);
    imageWrapper.appendChild(overlay);
    
    // Ajouter l'image au lien ou directement à l'article
    if (filmLink) {
        filmLink.appendChild(imageWrapper);
    } else {
        article.appendChild(imageWrapper);
    }

    // Infos détaillées
    const info = document.createElement('div');
    info.className = 'film-card-info';

    // Tags et statut
    const tags = document.createElement('div');
    tags.className = 'film-card-tags';

    const statusSpan = document.createElement('span');
    statusSpan.className = 'film-card-status';
    if (film.status === 'prochainement') {
        statusSpan.classList.add('soon');
    }
    statusSpan.textContent =
        film.status === 'actuellement'
            ? 'en salles'
            : film.status === 'prochainement'
            ? 'prochainement'
            : 'catalogue';
    tags.appendChild(statusSpan);

    const categorySpan = document.createElement('span');
    categorySpan.className = 'film-card-category';
    if (Array.isArray(film.categories) && film.categories.length > 0) {
        categorySpan.textContent = film.categories.join(' • ');
    } else {
        categorySpan.textContent = 'distribution';
    }
    tags.appendChild(categorySpan);

    info.appendChild(tags);

    // Titre
    const title = document.createElement('h3');
    title.className = 'film-card-title';
    title.textContent = (film.titre || '').toUpperCase();
    info.appendChild(title);

    // Réalisateur
    const director = document.createElement('p');
    director.className = 'film-card-director';
    director.textContent = film.cineaste || '';
    info.appendChild(director);

    // Métadonnées (durée, nationalités)
    const metaInfo = [];
    if (film.duree_minutes) {
        metaInfo.push(`${Math.floor(film.duree_minutes)} min`);
    }
    if (Array.isArray(film.nationalites) && film.nationalites.length > 0) {
        metaInfo.push(film.nationalites.join(', '));
    }
    if (metaInfo.length > 0) {
        const meta = document.createElement('p');
        meta.className = 'film-card-meta';
        meta.textContent = metaInfo.join(' • ');
        info.appendChild(meta);
    }

    // Casting
    if (Array.isArray(film.casting) && film.casting.length > 0) {
        const castingDiv = document.createElement('div');
        castingDiv.className = 'film-card-casting';
        const castingLabel = document.createElement('strong');
        castingLabel.textContent = 'Avec : ';
        castingDiv.appendChild(castingLabel);
        const castingText = document.createTextNode(film.casting.slice(0, 4).join(', '));
        castingDiv.appendChild(castingText);
        if (film.casting.length > 4) {
            castingDiv.appendChild(document.createTextNode('...'));
        }
        info.appendChild(castingDiv);
    }

    // Synopsis
    if (film.synopsis && film.synopsis.trim()) {
        const synopsis = document.createElement('p');
        synopsis.className = 'film-card-synopsis';
        // Limiter à 200 caractères pour éviter des cartes trop longues
        const synopsisText = film.synopsis.length > 200 
            ? film.synopsis.substring(0, 200) + '...' 
            : film.synopsis;
        synopsis.textContent = synopsisText;
        info.appendChild(synopsis);
    }

    // Thématiques
    if (Array.isArray(film.thematiques) && film.thematiques.length > 0) {
        const thematiquesDiv = document.createElement('div');
        thematiquesDiv.className = 'film-card-thematiques';
        film.thematiques.forEach(them => {
            const tag = document.createElement('span');
            tag.className = 'thematique-tag';
            tag.textContent = them;
            thematiquesDiv.appendChild(tag);
        });
        info.appendChild(thematiquesDiv);
    }

    // Boutons de téléchargement et actions
    const actions = document.createElement('div');
    actions.className = 'film-card-actions';

    // Le bouton "voir la fiche" n'est plus nécessaire car toute la carte est cliquable
    // Les autres boutons (DP, photos, BA) restent pour des actions spécifiques

    // Fonction pour empêcher la propagation du clic vers le lien principal
    const stopPropagation = (e) => {
        e.stopPropagation();
    };

    if (film.dossier_presse) {
        const dpLink = document.createElement('a');
        dpLink.href = film.dossier_presse;
        dpLink.className = 'film-action-btn';
        dpLink.textContent = 'dossier de presse';
        dpLink.download = '';
        dpLink.addEventListener('click', stopPropagation);
        actions.appendChild(dpLink);
    }

    if (film.affiche_photos) {
        const photosLink = document.createElement('a');
        photosLink.href = film.affiche_photos;
        photosLink.className = 'film-action-btn';
        photosLink.textContent = 'affiche & photos';
        photosLink.download = '';
        photosLink.addEventListener('click', stopPropagation);
        actions.appendChild(photosLink);
    }

    if (film.bande_annonce_url) {
        const baUrlLink = document.createElement('a');
        baUrlLink.href = film.bande_annonce_url;
        baUrlLink.className = 'film-action-btn';
        baUrlLink.textContent = 'voir la BA';
        baUrlLink.target = '_blank';
        baUrlLink.addEventListener('click', stopPropagation);
        actions.appendChild(baUrlLink);
    } else if (film.bande_annonce_fichier) {
        const baFileLink = document.createElement('a');
        baFileLink.href = film.bande_annonce_fichier;
        baFileLink.className = 'film-action-btn';
        baFileLink.textContent = 'télécharger la BA';
        baFileLink.download = '';
        baFileLink.addEventListener('click', stopPropagation);
        actions.appendChild(baFileLink);
    }

    if (actions.children.length > 0) {
        info.appendChild(actions);
    }

    // Ajouter l'info au lien ou directement à l'article
    if (filmLink) {
        filmLink.appendChild(info);
        article.appendChild(filmLink);
    } else {
        article.appendChild(info);
    }
    
    return article;
}

// Séparer une chaîne "A et B" ou "A, B" en cinéastes individuels, normaliser les noms
function splitAndNormalizeCineastes(str) {
    if (!str || !str.trim()) return ['Sans réalisateur'];
    const parts = str.split(/\s+et\s+|\s*&\s*|\s*,\s*|\s+and\s+/i).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return ['Sans réalisateur'];
    return parts.map(normalizeCineasteName);
}

// Capitaliser correctement : "VERENA PARAVEL" → "Verena Paravel", "CASTAING-TAYLOR" → "Castaing-Taylor"
function normalizeCineasteName(name) {
    return name.split(/\s+/).map(word =>
        word.split('-').map(part =>
            part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join('-')
    ).join(' ');
}

// Grouper les films par cinéaste (sépare les multi-cinéastes : Verena Paravel + Lucien Castaing-Taylor)
function groupFilmsByCineaste(films) {
    const grouped = {};
    
    films.forEach(film => {
        const raw = film.cineaste || 'Sans réalisateur';
        const cineastes = splitAndNormalizeCineastes(raw);
        cineastes.forEach(cineaste => {
            if (!grouped[cineaste]) grouped[cineaste] = [];
            grouped[cineaste].push(film);
        });
    });
    
    const sortedCineastes = Object.keys(grouped).sort((a, b) => {
        if (a === 'Sans réalisateur') return 1;
        if (b === 'Sans réalisateur') return -1;
        return a.localeCompare(b, 'fr');
    });
    
    return { grouped, sortedCineastes };
}

// Grouper les films par thématique
function groupFilmsByThematique(films) {
    const grouped = {};
    
    films.forEach(film => {
        if (Array.isArray(film.thematiques) && film.thematiques.length > 0) {
            film.thematiques.forEach(thematique => {
                const them = thematique.trim();
                if (them) {
                    if (!grouped[them]) {
                        grouped[them] = [];
                    }
                    grouped[them].push(film);
                }
            });
        }
    });
    
    // Trier les thématiques par ordre alphabétique
    const sortedThematiques = Object.keys(grouped).sort((a, b) => 
        a.localeCompare(b, 'fr')
    );
    
    return { grouped, sortedThematiques };
}

// Afficher tous les films (tri alphabétique par titre)
async function displayAllFilms() {
    const grid = document.querySelector('.films-grid');
    if (!grid) return;
    
    allFilms = await loadAllFilms();
    grid.innerHTML = '';
    
    if (allFilms.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-films-message';
        message.textContent = 'Aucun film trouvé.';
        grid.appendChild(message);
        return;
    }
    
    const sorted = [...allFilms].sort((a, b) =>
        (a.titre || '').localeCompare(b.titre || '', 'fr', { sensitivity: 'base' })
    );
    sorted.forEach(film => {
        const card = createFilmCard(film, { useAfficheImageOnly: true });
        grid.appendChild(card);
    });
}

// Valeur affiche_photos (ou "affiche" si la colonne sheet s'appelle "affiche photos")
function getAffichePhotos(film) {
    const v = film.affiche_photos ?? film.affiche ?? film.Affiche;
    const s = v && String(v).trim();
    return s || null;
}

// Photo de couverture : affiche_photos (sheet, URL internet ou chemin local) en priorité, sinon affiche_image
function getCoverImage(films, fallback) {
    const def = fallback || 'images/catalogue/l-avenir.jpg';
    const firstWithPhoto = films.find(f => getAffichePhotos(f));
    const url = firstWithPhoto ? getAffichePhotos(firstWithPhoto) : null;
    if (url) return url;
    const firstWithImage = films.find(f => f.affiche_image);
    return firstWithImage?.affiche_image || def;
}

// Repli si l'image ne charge pas (URL bloquée par l'hébergeur, 403, etc.)
function getCoverImageFallback(films, fallback) {
    const def = fallback || 'images/catalogue/l-avenir.jpg';
    const firstWithImage = films.find(f => f.affiche_image);
    return firstWithImage?.affiche_image || def;
}

// Carte cinéaste pour la grille des 15 (image + nom)
function createCineasteCard(cineaste, filmCount, films) {
    const card = document.createElement('article');
    card.className = 'cineaste-card';
    const link = document.createElement('a');
    const ficheUrl = getCineasteFicheUrl(cineaste);
    link.href = ficheUrl || '#';
    link.className = 'cineaste-card-link';
    link.dataset.cineaste = cineaste;
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'cineaste-card-image';
    const img = document.createElement('img');
    const overrideKey = Object.keys(CINEASTE_COVER_OVERRIDES).find(k => cineasteNameMatches(k, cineaste));
    const overrideUrl = overrideKey ? CINEASTE_COVER_OVERRIDES[overrideKey] : null;
    img.src = overrideUrl || getCoverImage(films);
    img.alt = cineaste;
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.onerror = function() {
        this.onerror = null;
        this.src = getCoverImageFallback(films, 'images/catalogue/l-avenir.jpg');
    };
    imageWrapper.appendChild(img);
    const overlay = document.createElement('div');
    overlay.className = 'cineaste-card-overlay';
    const name = document.createElement('h3');
    name.className = 'cineaste-card-name';
    name.textContent = cineaste;
    overlay.appendChild(name);
    imageWrapper.appendChild(overlay);
    link.appendChild(imageWrapper);
    card.appendChild(link);
    return card;
}

// Créer un élément de liste pour un cinéaste
// opts.withCenteredLetter = true : prénom | LETTRE | reste du nom (lettre centrée)
function createCineasteListItem(cineaste, filmCount, opts) {
    const item = document.createElement('li');
    item.className = 'cineaste-list-item';
    
    const link = document.createElement('a');
    const ficheUrl = getCineasteFicheUrl(cineaste);
    link.href = ficheUrl || '#';
    link.className = 'cineaste-list-link';
    link.dataset.cineaste = cineaste;
    
    if (opts && opts.withCenteredLetter) {
        const words = cineaste.trim().split(/\s+/);
        const lastName = words[words.length - 1] || '';
        const firstLetter = lastName.charAt(0).toUpperCase();
        const before = words.slice(0, -1).join(' ') + (words.length > 1 ? ' ' : '');
        const after = lastName.slice(1);
        const inner = document.createElement('span');
        inner.className = 'cineaste-name-inner';
        const spanBefore = document.createElement('span');
        spanBefore.className = 'name-before';
        spanBefore.textContent = before;
        const spanLetter = document.createElement('span');
        spanLetter.className = 'name-letter';
        spanLetter.textContent = firstLetter;
        const spanAfter = document.createElement('span');
        spanAfter.className = 'name-after';
        spanAfter.textContent = after;
        inner.appendChild(spanBefore);
        inner.appendChild(spanLetter);
        inner.appendChild(spanAfter);
        link.appendChild(inner);
    } else {
        const name = document.createElement('span');
        name.className = 'cineaste-name';
        name.textContent = cineaste;
        link.appendChild(name);
    }
    
    const count = document.createElement('span');
    count.className = 'cineaste-count';
    count.textContent = `${filmCount}`;
    link.appendChild(count);
    item.appendChild(link);
    
    return item;
}

// Extraire le nom de famille (dernier mot)
function getLastName(fullName) {
    const words = fullName.trim().split(/\s+/);
    return words[words.length - 1];
}

// Grouper par première lettre du nom de famille
function groupByLetter(items) {
    const grouped = {};
    
    items.forEach(item => {
        const lastName = getLastName(item);
        const firstLetter = lastName.charAt(0).toUpperCase();
        if (!grouped[firstLetter]) {
            grouped[firstLetter] = [];
        }
        grouped[firstLetter].push(item);
    });
    
    return grouped;
}

// Afficher la page par cinéaste : grille des 15 (5 colonnes) + liste tout A-Z
async function displayFilmsByCineaste() {
    console.log('🎯 displayFilmsByCineaste() appelée');
    const container = document.querySelector('.catalogue-container');
    if (!container) {
        console.error('❌ .catalogue-container introuvable !');
        return;
    }
    allFilms = await loadAllFilms();
    container.innerHTML = '';
    if (allFilms.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-films-message';
        message.textContent = 'Aucun film trouvé.';
        container.appendChild(message);
        return;
    }
    const { grouped, sortedCineastes } = groupFilmsByCineaste(allFilms);
    const validCineastes = sortedCineastes.filter(c => c !== 'Sans réalisateur');
    const byLetter = groupByLetter(validCineastes);
    const letters = Object.keys(byLetter).sort();

    // Toujours 15 cartes : ajouter une entrée vide pour les cinéastes vedette absents des données
    FEATURED_CINEASTES.forEach(name => {
        const key = validCineastes.find(c => cineasteNameMatches(c, name));
        if (!key) grouped[name] = [];
    });

    // Trouver pour chaque nom "vedette" le cinéaste correspondant (Éric vs Eric, etc.)
    const featuredWithData = FEATURED_CINEASTES.map(name => {
        const key = validCineastes.find(c => cineasteNameMatches(c, name)) || name;
        return { displayName: name, key, films: grouped[key] || [] };
    });

    // Contenu principal (grille 15 + liste A-Z) à masquer quand on affiche les films d'un cinéaste
    const listContainer = document.createElement('div');
    listContainer.className = 'cineastes-main';

    // Grille des 15 cinéastes (5 colonnes)
    const featuredGrid = document.createElement('div');
    featuredGrid.className = 'cineastes-featured-grid';
    featuredWithData.forEach(({ key, films }) => {
        featuredGrid.appendChild(createCineasteCard(key, films.length, films));
    });
    listContainer.appendChild(featuredGrid);

    // Titre section tout A-Z
    const azTitle = document.createElement('h2');
    azTitle.className = 'cineastes-az-title';
    azTitle.textContent = 'Tout A-Z';
    listContainer.appendChild(azTitle);

    // Liste simple : lettre du nom de famille centrée à l'intérieur de chaque nom
    const listWrapper = document.createElement('ul');
    listWrapper.className = 'cineastes-list-container cineastes-list-simple';
    letters.forEach(letter => {
        byLetter[letter].forEach(cineaste => {
            listWrapper.appendChild(createCineasteListItem(cineaste, grouped[cineaste].length, { withCenteredLetter: true }));
        });
    });
    listContainer.appendChild(listWrapper);
    container.appendChild(listContainer);

    // Section films d'un cinéaste sélectionné
    const filmsSection = document.createElement('div');
    filmsSection.className = 'cineaste-films-section hidden';
    filmsSection.innerHTML = `
        <div class="cineaste-films-header">
            <button class="back-to-cineastes-btn">← Retour aux cinéastes</button>
            <h2 class="cineaste-films-title"></h2>
        </div>
        <div class="films-grid"></div>
    `;
    container.appendChild(filmsSection);

    container.addEventListener('click', (e) => {
        const cardLink = e.target.closest('.cineaste-card-link');
        if (cardLink) {
            if (cardLink.getAttribute('href') !== '#') return; // fiche dédiée : laisser la navigation
            e.preventDefault();
            const cineaste = cardLink.dataset.cineaste;
            showCineasteFilms(cineaste, grouped[cineaste], listContainer, filmsSection);
        }
        const listLink = e.target.closest('.cineaste-list-link');
        if (listLink) {
            if (listLink.getAttribute('href') !== '#') return; // fiche dédiée : laisser la navigation
            e.preventDefault();
            const cineaste = listLink.dataset.cineaste;
            showCineasteFilms(cineaste, grouped[cineaste], listContainer, filmsSection);
        }
        const backBtn = e.target.closest('.back-to-cineastes-btn');
        if (backBtn) {
            hideCineasteFilms(listContainer, filmsSection);
        }
    });

    // Ouvrir automatiquement les films si ?cineaste= présent dans l'URL
    openCineasteFromURL(grouped);
}

// Afficher les films d'un cinéaste
function showCineasteFilms(cineaste, films, grid, filmsSection) {
    grid.classList.add('hidden');
    filmsSection.classList.remove('hidden');
    
    const title = filmsSection.querySelector('.cineaste-films-title');
    title.textContent = `${cineaste} — ${films.length} film${films.length > 1 ? 's' : ''}`;
    
    const filmsGrid = filmsSection.querySelector('.films-grid');
    filmsGrid.innerHTML = '';
    
    films.forEach(film => {
        const card = createFilmCard(film);
        filmsGrid.appendChild(card);
    });
    
    // Scroll vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Retour aux cartes de cinéastes
function hideCineasteFilms(grid, filmsSection) {
    filmsSection.classList.add('hidden');
    grid.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Créer une carte visuelle pour une thématique
function createThematiqueCard(thematique, filmCount, films) {
    const card = document.createElement('article');
    card.className = 'thematique-card';
    
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'thematique-card-link';
    link.dataset.thematique = thematique;
    
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'thematique-card-image';
    
    const img = document.createElement('img');
    const thematiqueFallback = 'images/placeholder-thematique.jpg';
    img.src = getCoverImage(films, thematiqueFallback);
    img.alt = thematique;
    img.loading = 'lazy';
    img.referrerPolicy = 'no-referrer';
    img.onerror = function() {
        this.onerror = null;
        this.src = getCoverImageFallback(films, thematiqueFallback);
    };
    imageWrapper.appendChild(img);

    const overlay = document.createElement('div');
    overlay.className = 'thematique-card-overlay';
    
    const overlayText = document.createElement('div');
    overlayText.className = 'thematique-card-overlay-text';
    overlayText.innerHTML = `<h3>${thematique}</h3>`;
    overlay.appendChild(overlayText);
    
    imageWrapper.appendChild(overlay);
    
    link.appendChild(imageWrapper);
    card.appendChild(link);
    
    return card;
}

// Afficher la grille de thématiques avec photos
async function displayFilmsByThematique() {
    console.log('🎯 displayFilmsByThematique() appelée');
    const container = document.querySelector('.catalogue-container');
    if (!container) {
        console.error('❌ .catalogue-container introuvable !');
        return;
    }
    
    allFilms = await loadAllFilms();
    container.innerHTML = '';
    
    if (allFilms.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-films-message';
        message.textContent = 'Aucun film trouvé.';
        container.appendChild(message);
        return;
    }
    
    const { grouped, sortedThematiques } = groupFilmsByThematique(allFilms);
    
    if (sortedThematiques.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-films-message';
        message.textContent = 'Aucune thématique trouvée.';
        container.appendChild(message);
        return;
    }
    
    // Créer la grille de cartes de thématiques
    const grid = document.createElement('div');
    grid.className = 'thematiques-grid';
    
    sortedThematiques.forEach(thematique => {
        const card = createThematiqueCard(thematique, grouped[thematique].length, grouped[thematique]);
        grid.appendChild(card);
    });
    
    container.appendChild(grid);
    
    // Section pour afficher les films d'une thématique sélectionnée
    const filmsSection = document.createElement('div');
    filmsSection.className = 'thematique-films-section hidden';
    filmsSection.innerHTML = `
        <div class="thematique-films-header">
            <button class="back-to-thematiques-btn">← Retour aux thématiques</button>
            <h2 class="thematique-films-title"></h2>
        </div>
        <div class="films-grid"></div>
    `;
    container.appendChild(filmsSection);
    
    // Gérer les clics sur les cartes de thématiques
    container.addEventListener('click', (e) => {
        const card = e.target.closest('.thematique-card-link');
        if (card) {
            e.preventDefault();
            const thematique = card.dataset.thematique;
            showThematiqueFilms(thematique, grouped[thematique], grid, filmsSection);
        }
        
        const backBtn = e.target.closest('.back-to-thematiques-btn');
        if (backBtn) {
            hideThematiqueFilms(grid, filmsSection);
        }
    });
}

// Afficher les films d'une thématique
function showThematiqueFilms(thematique, films, grid, filmsSection) {
    grid.classList.add('hidden');
    filmsSection.classList.remove('hidden');
    
    const title = filmsSection.querySelector('.thematique-films-title');
    title.textContent = `${thematique} — ${films.length} film${films.length > 1 ? 's' : ''}`;
    
    const filmsGrid = filmsSection.querySelector('.films-grid');
    filmsGrid.innerHTML = '';
    
    films.forEach(film => {
        const card = createFilmCard(film);
        filmsGrid.appendChild(card);
    });
    
    // Scroll vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Retour aux cartes de thématiques
function hideThematiqueFilms(grid, filmsSection) {
    filmsSection.classList.add('hidden');
    grid.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Ouvrir automatiquement les films d'un cinéaste si ?cineaste= est présent dans l'URL
function openCineasteFromURL(grouped) {
    var params = new URLSearchParams(window.location.search);
    var cineasteParam = params.get('cineaste');
    if (!cineasteParam || !grouped) return;
    var films = grouped[cineasteParam];
    var displayName = cineasteParam;
    if (!films) {
        var key = Object.keys(grouped).find(function(k) { return cineasteNameMatches(k, cineasteParam); });
        if (key) { films = grouped[key]; displayName = key; }
    }
    if (!films) return;
    var grid = document.querySelector('.cineastes-main');
    var filmsSection = document.querySelector('.cineaste-films-section');
    if (grid && filmsSection) showCineasteFilms(displayName, films, grid, filmsSection);
}

// Initialiser selon la page
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Forcer le mode grille pour "tous les films"
        if (document.body.classList.contains('page-catalogue-tous') || 
            document.body.classList.contains('page-catalogue')) {
            document.body.classList.add('view-mode-grid');
        }
        
        // Charger les films selon la page - vérifier les classes spécifiques d'abord !
        if (document.body.classList.contains('page-catalogue-cineaste')) {
            displayFilmsByCineaste();
        } else if (document.body.classList.contains('page-catalogue-thematique')) {
            displayFilmsByThematique();
        } else if (document.body.classList.contains('page-catalogue-tous') || 
                   document.body.classList.contains('page-catalogue')) {
            displayAllFilms();
        }
    } catch (e) {
        console.error('Erreur catalogue:', e);
        var container = document.querySelector('.catalogue-container, .films-grid');
        if (container) {
            container.innerHTML = '<p class="no-films-message">Erreur de chargement. Ouvrez la console (F12) pour plus de détails. Assurez-vous de lancer le site avec un serveur local (ex: ./start-dev.sh).</p>';
        }
    }
});
