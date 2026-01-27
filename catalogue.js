/**
 * Gestion du catalogue de films
 * Regroupement par cinéaste et par thématique
 */

console.log('🎬 catalogue.js chargé !');

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

// Créer une carte film enrichie avec toutes les informations
function createFilmCard(film) {
    const article = document.createElement('article');
    article.className = 'film-card film-card-detailed';
    article.dataset.status = film.status || 'catalogue';
    
    if (Array.isArray(film.thematiques) && film.thematiques.length > 0) {
        article.dataset.thematiques = film.thematiques.join(',');
    }

    // Lien vers la page du film (si slug disponible)
    const filmLink = film.slug ? document.createElement('a') : null;
    if (filmLink) {
        filmLink.href = film.slug;
        filmLink.className = 'film-card-link';
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

// Grouper les films par cinéaste
function groupFilmsByCineaste(films) {
    const grouped = {};
    
    films.forEach(film => {
        const cineaste = film.cineaste || 'Sans réalisateur';
        if (!grouped[cineaste]) {
            grouped[cineaste] = [];
        }
        grouped[cineaste].push(film);
    });
    
    // Trier les cinéastes par ordre alphabétique
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

// Afficher tous les films
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
    
    allFilms.forEach(film => {
        const card = createFilmCard(film);
        grid.appendChild(card);
    });
}

// Créer un élément de liste pour un cinéaste
function createCineasteListItem(cineaste, filmCount) {
    const item = document.createElement('li');
    item.className = 'cineaste-list-item';
    
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'cineaste-list-link';
    link.dataset.cineaste = cineaste;
    
    const name = document.createElement('span');
    name.className = 'cineaste-name';
    name.textContent = cineaste;
    
    const count = document.createElement('span');
    count.className = 'cineaste-count';
    count.textContent = `${filmCount}`;
    
    link.appendChild(name);
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

// Afficher la liste alphabétique des cinéastes
async function displayFilmsByCineaste() {
    console.log('🎯 displayFilmsByCineaste() appelée');
    const container = document.querySelector('.catalogue-container');
    if (!container) {
        console.error('❌ .catalogue-container introuvable !');
        return;
    }
    console.log('✓ Container trouvé');
    
    allFilms = await loadAllFilms();
    console.log('✓ Films chargés:', allFilms.length);
    container.innerHTML = '';
    
    if (allFilms.length === 0) {
        const message = document.createElement('p');
        message.className = 'no-films-message';
        message.textContent = 'Aucun film trouvé.';
        container.appendChild(message);
        return;
    }
    
    const { grouped, sortedCineastes } = groupFilmsByCineaste(allFilms);
    
    // Filtrer les cinéastes vides
    const validCineastes = sortedCineastes.filter(c => c !== 'Sans réalisateur');
    
    // Grouper par lettre
    const byLetter = groupByLetter(validCineastes);
    const letters = Object.keys(byLetter).sort();
    
    // Créer la liste alphabétique
    const listContainer = document.createElement('div');
    listContainer.className = 'cineastes-list-container';
    
    letters.forEach(letter => {
        const section = document.createElement('div');
        section.className = 'letter-section';
        
        const letterHeader = document.createElement('h3');
        letterHeader.className = 'letter-header';
        letterHeader.textContent = letter;
        section.appendChild(letterHeader);
        
        const list = document.createElement('ul');
        list.className = 'cineastes-list';
        
        byLetter[letter].forEach(cineaste => {
            const item = createCineasteListItem(cineaste, grouped[cineaste].length);
            list.appendChild(item);
        });
        
        section.appendChild(list);
        listContainer.appendChild(section);
    });
    
    container.appendChild(listContainer);
    
    // Section pour afficher les films d'un cinéaste sélectionné
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
    
    // Gérer les clics sur les cinéastes
    container.addEventListener('click', (e) => {
        const link = e.target.closest('.cineaste-list-link');
        if (link) {
            e.preventDefault();
            const cineaste = link.dataset.cineaste;
            showCineasteFilms(cineaste, grouped[cineaste], listContainer, filmsSection);
        }
        
        const backBtn = e.target.closest('.back-to-cineastes-btn');
        if (backBtn) {
            hideCineasteFilms(listContainer, filmsSection);
        }
    });
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
    
    // Utiliser l'image du premier film comme illustration
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'thematique-card-image';
    
    const img = document.createElement('img');
    const firstFilmWithImage = films.find(f => f.affiche_image);
    img.src = firstFilmWithImage?.affiche_image || 'images/placeholder-thematique.jpg';
    img.alt = thematique;
    img.loading = 'lazy';
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

// Initialiser selon la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOMContentLoaded - catalogue.js');
    console.log('📋 Classes du body:', document.body.className);
    
    // Forcer le mode grille pour "tous les films"
    if (document.body.classList.contains('page-catalogue-tous') || 
        document.body.classList.contains('page-catalogue')) {
        document.body.classList.add('view-mode-grid');
    }
    
    // Charger les films selon la page - vérifier les classes spécifiques d'abord !
    if (document.body.classList.contains('page-catalogue-cineaste')) {
        console.log('➡️ Chargement: par cinéaste');
        displayFilmsByCineaste();
    } else if (document.body.classList.contains('page-catalogue-thematique')) {
        console.log('➡️ Chargement: par thématique');
        displayFilmsByThematique();
    } else if (document.body.classList.contains('page-catalogue-tous') || 
               document.body.classList.contains('page-catalogue')) {
        console.log('➡️ Chargement: tous les films (mode grille)');
        displayAllFilms();
    } else {
        console.log('⚠️ Aucune classe de catalogue détectée');
    }
});
