/**
 * Gestion des pages thématiques
 * Charge les films et filtre par thématique
 */

let allFilms = [];

// Charger tous les films
async function loadAllFilms() {
    try {
        const response = await fetch('data/films.json', { cache: 'no-store' });
        if (!response.ok) {
            console.error('Impossible de charger data/films.json');
            return [];
        }
        const data = await response.json();
        return Array.isArray(data.films) ? data.films : [];
    } catch (error) {
        console.error('Erreur lors du chargement des films :', error);
        return [];
    }
}

// Obtenir la thématique depuis l'URL (ex: thematiques.html?tag=Asie)
function getThematiqueFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('tag') || params.get('thematique');
}

// Filtrer les films par thématique
function filterFilmsByThematique(films, thematique) {
    if (!thematique) return films;
    
    return films.filter(film => {
        if (!Array.isArray(film.thematiques) || film.thematiques.length === 0) {
            return false;
        }
        // Normaliser pour comparaison (insensible à la casse)
        const thematiquesLower = film.thematiques.map(t => t.toLowerCase().trim());
        return thematiquesLower.includes(thematique.toLowerCase().trim());
    });
}

// Générer une carte film enrichie avec toutes les informations
function createFilmCard(film) {
    const article = document.createElement('article');
    article.className = 'film-card film-card-detailed';
    article.dataset.status = film.status || 'catalogue';
    
    if (Array.isArray(film.thematiques) && film.thematiques.length > 0) {
        article.dataset.thematiques = film.thematiques.join(',');
    }

    // Image
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

    if (film.slug) {
        const detailsLink = document.createElement('a');
        detailsLink.href = 'Fiches Films/' + film.slug;
        detailsLink.className = 'film-action-btn primary';
        detailsLink.textContent = 'voir la fiche';
        actions.appendChild(detailsLink);
    }

    if (film.dossier_presse) {
        const dpLink = document.createElement('a');
        dpLink.href = film.dossier_presse;
        dpLink.className = 'film-action-btn';
        dpLink.textContent = 'dossier de presse';
        dpLink.download = '';
        actions.appendChild(dpLink);
    }

    if (film.affiche_photos) {
        const photosLink = document.createElement('a');
        photosLink.href = film.affiche_photos;
        photosLink.className = 'film-action-btn';
        photosLink.textContent = 'affiche & photos';
        photosLink.download = '';
        actions.appendChild(photosLink);
    }

    if (film.bande_annonce_url) {
        const baUrlLink = document.createElement('a');
        baUrlLink.href = film.bande_annonce_url;
        baUrlLink.className = 'film-action-btn';
        baUrlLink.textContent = 'voir la BA';
        baUrlLink.target = '_blank';
        actions.appendChild(baUrlLink);
    } else if (film.bande_annonce_fichier) {
        const baFileLink = document.createElement('a');
        baFileLink.href = film.bande_annonce_fichier;
        baFileLink.className = 'film-action-btn';
        baFileLink.textContent = 'télécharger la BA';
        baFileLink.download = '';
        actions.appendChild(baFileLink);
    }

    if (actions.children.length > 0) {
        info.appendChild(actions);
    }

    article.appendChild(imageWrapper);
    article.appendChild(info);
    
    return article;
}

// Afficher les films filtrés par thématique
async function displayFilmsByThematique() {
    const thematique = getThematiqueFromURL();
    if (!thematique) {
        console.error('Aucune thématique spécifiée dans l\'URL');
        return;
    }

    const grid = document.querySelector('.films-grid');
    if (!grid) {
        console.error('Élément .films-grid introuvable');
        return;
    }

    // Mettre à jour le titre de la page
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.textContent = thematique.toUpperCase();
    }

    const pageSubtitle = document.querySelector('.page-subtitle');
    if (pageSubtitle) {
        pageSubtitle.textContent = `Films de la thématique "${thematique}"`;
    }

    // Charger et filtrer les films
    allFilms = await loadAllFilms();
    const filteredFilms = filterFilmsByThematique(allFilms, thematique);

    // Vider la grille
    grid.innerHTML = '';

    if (filteredFilms.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-films-message';
        message.textContent = `Aucun film trouvé pour la thématique "${thematique}".`;
        grid.appendChild(message);
        return;
    }

    // Générer les cartes
    filteredFilms.forEach(film => {
        const card = createFilmCard(film);
        grid.appendChild(card);
    });
}

// Gestion de la bascule grille/liste
function initViewToggle() {
    const toggleBtns = document.querySelectorAll('.view-toggle-btn');
    const body = document.body;
    
    // Récupérer la préférence sauvegardée ou utiliser 'list' par défaut
    const savedView = localStorage.getItem('catalogueView') || 'list';
    setViewMode(savedView);
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            setViewMode(view);
            localStorage.setItem('catalogueView', view);
        });
    });
}

function setViewMode(view) {
    const body = document.body;
    const toggleBtns = document.querySelectorAll('.view-toggle-btn');
    
    // Retirer les anciennes classes
    body.classList.remove('view-mode-list', 'view-mode-grid');
    
    // Ajouter la nouvelle classe
    body.classList.add(`view-mode-${view}`);
    
    // Mettre à jour l'état actif des boutons
    toggleBtns.forEach(btn => {
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Initialiser si on est sur une page thématique
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser la bascule grille/liste
    initViewToggle();
    
    // Vérifier si on est sur une page thématique (classe CSS ou URL)
    if (document.body.classList.contains('page-thematiques') || 
        window.location.pathname.includes('thematiques.html') ||
        getThematiqueFromURL()) {
        displayFilmsByThematique();
    }
});

// Fonction utilitaire pour obtenir toutes les thématiques uniques
async function getAllThematiques() {
    const films = await loadAllFilms();
    const thematiquesSet = new Set();
    
    films.forEach(film => {
        if (Array.isArray(film.thematiques)) {
            film.thematiques.forEach(t => {
                if (t && t.trim()) {
                    thematiquesSet.add(t.trim());
                }
            });
        }
    });
    
    return Array.from(thematiquesSet).sort();
}

// Exporter pour utilisation ailleurs
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadAllFilms,
        filterFilmsByThematique,
        getAllThematiques,
        getThematiqueFromURL
    };
}
