/**
 * SCRAPER COMPLET - LES FILMS DU LOSANGE
 * Récupère TOUS les films (200+) en parcourant toutes les pages
 * 
 * Instructions :
 * 1. Ouvrez https://filmsdulosange.com/ dans Chrome/Safari
 * 2. Ouvrez les outils de développement (Cmd+Option+I sur Mac)
 * 3. Allez dans l'onglet "Console"
 * 4. Copiez-collez tout ce code et appuyez sur Entrée
 * 5. Attendez la fin du scraping (peut prendre plusieurs minutes)
 * 6. Les données seront téléchargées en JSON
 */

(async function scrapeAllFilms() {
    console.log("🎬 Scraping COMPLET Les Films du Losange...");
    console.log("⏱️  Cela peut prendre plusieurs minutes...");
    
    const BASE_URL = "https://filmsdulosange.com";
    const allFilms = new Map(); // Utiliser Map pour éviter les doublons
    
    // Fonction pour attendre
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    
    // Scraper une page de liste avec pagination
    async function scrapeCategoryPage(url, category, page = 1) {
        try {
            const pageUrl = page > 1 ? `${url}page/${page}/` : url;
            console.log(`  📄 Page ${page}: ${pageUrl}`);
            
            const response = await fetch(pageUrl);
            if (!response.ok) {
                console.log(`  ⚠️  Page ${page} non trouvée (fin de pagination)`);
                return { films: [], hasMore: false };
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const films = [];
            const links = new Set();
            
            // Chercher tous les liens vers des pages de films
            const filmLinks = doc.querySelectorAll('a[href*="/film/"], a[href*="/films/"]');
            
            filmLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && !href.includes('#') && !links.has(href)) {
                    links.add(href);
                }
            });
            
            // Chercher aussi dans les articles/cards
            const cards = doc.querySelectorAll('article, [class*="film"], [class*="movie"], [class*="post"]');
            cards.forEach(card => {
                const link = card.querySelector('a[href*="/film/"], a[href*="/films/"]');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href && !links.has(href)) {
                        links.add(href);
                    }
                }
            });
            
            // Pour chaque lien, extraire les infos de base
            for (const href of links) {
                const fullUrl = href.startsWith('http') ? href : new URL(href, BASE_URL).href;
                
                // Extraire le titre depuis le lien ou la card
                const linkEl = doc.querySelector(`a[href="${href}"]`);
                let title = '';
                if (linkEl) {
                    const titleEl = linkEl.querySelector('h2, h3, h4, .title') || linkEl;
                    title = titleEl.textContent.trim();
                }
                
                // Extraire l'image
                let image = '';
                if (linkEl) {
                    const img = linkEl.closest('article, div').querySelector('img');
                    if (img) image = img.src;
                }
                
                if (title || fullUrl.includes('/film/')) {
                    films.push({
                        title: title || 'À déterminer',
                        url: fullUrl,
                        image: image,
                        category: category
                    });
                }
            }
            
            // Vérifier s'il y a une page suivante
            const nextLink = doc.querySelector('a[class*="next"], a[href*="page/"]');
            const hasMore = nextLink && nextLink.textContent.toLowerCase().includes('suivant');
            
            await wait(500); // Pause pour ne pas surcharger
            
            return { films, hasMore };
        } catch (e) {
            console.error(`  ❌ Erreur page ${page}:`, e);
            return { films: [], hasMore: false };
        }
    }
    
    // Scraper TOUTES les pages d'une catégorie
    async function scrapeAllCategoryPages(baseUrl, category) {
        console.log(`\n📂 Catégorie: ${category}`);
        const allCategoryFilms = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore && page <= 50) { // Limite de sécurité
            const result = await scrapeCategoryPage(baseUrl, category, page);
            allCategoryFilms.push(...result.films);
            hasMore = result.hasMore;
            page++;
            
            if (result.films.length === 0 && page > 1) {
                hasMore = false; // Plus de films
            }
        }
        
        console.log(`  ✅ ${allCategoryFilms.length} films trouvés dans ${category}`);
        return allCategoryFilms;
    }
    
    // Scraper les détails d'un film
    async function scrapeFilmDetails(film) {
        try {
            const response = await fetch(film.url);
            if (!response.ok) return null;
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const details = { ...film };
            
            // Titre
            const title = doc.querySelector('h1, .entry-title, .post-title');
            if (title) details.title = title.textContent.trim();
            
            // Réalisateur
            const bodyText = doc.body.textContent;
            const directorPatterns = [
                /(?:Un film de|Réalisé par|A film by|Directed by)\s*([A-Za-zÀ-ÿ\s-]+)/i,
                /Réalisateur[:\s]+([A-Za-zÀ-ÿ\s-]+)/i,
                /Director[:\s]+([A-Za-zÀ-ÿ\s-]+)/i
            ];
            
            for (const pattern of directorPatterns) {
                const match = bodyText.match(pattern);
                if (match) {
                    details.director = match[1].trim();
                    break;
                }
            }
            
            // Image principale
            const mainImg = doc.querySelector('.wp-post-image, article img, .featured-image img, .post-thumbnail img');
            if (mainImg) details.image = mainImg.src;
            
            // Synopsis
            const synopsis = doc.querySelector('.synopsis, .description, .content, .entry-content p');
            if (synopsis) {
                details.synopsis = synopsis.textContent.trim().substring(0, 1000);
            }
            
            // Date de sortie
            const dateMatch = bodyText.match(/(?:Sortie|Release|Date)[:\s]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
            if (dateMatch) details.release_date = dateMatch[1];
            
            // Durée
            const durationMatch = bodyText.match(/(\d+)\s*(?:min|minutes|min\.)/i);
            if (durationMatch) details.duration = durationMatch[1];
            
            // Bande-annonce
            const iframe = doc.querySelector('iframe[src*="youtube"], iframe[src*="vimeo"]');
            if (iframe) details.trailer = iframe.src;
            
            // Statut (actuellement, prochainement, etc.)
            const statusText = bodyText.toLowerCase();
            if (statusText.includes('actuellement') || statusText.includes('en salles')) {
                details.status = 'actuellement';
            } else if (statusText.includes('prochainement') || statusText.includes('à venir')) {
                details.status = 'prochainement';
            } else {
                details.status = 'catalogue';
            }
            
            await wait(300); // Pause entre chaque film
            
            return details;
        } catch (e) {
            console.error(`  ❌ Erreur détails ${film.url}:`, e);
            return null;
        }
    }
    
    // Scraper toutes les catégories
    console.log("\n📥 Récupération de toutes les pages...");
    
    const categories = [
        { name: 'distribution', url: `${BASE_URL}/films/distribution/` },
        { name: 'production', url: `${BASE_URL}/films/production/` },
        { name: 'ventes internationales', url: `${BASE_URL}/films/ventes-a-linternational/` }
    ];
    
    const allLinks = [];
    
    for (const cat of categories) {
        const films = await scrapeAllCategoryPages(cat.url, cat.name);
        allLinks.push(...films);
    }
    
    console.log(`\n✅ Total: ${allLinks.length} films trouvés`);
    
    // Scraper les détails de chaque film
    console.log("\n📋 Scraping des détails de chaque film...");
    console.log(`⏱️  Cela va prendre environ ${Math.ceil(allLinks.length * 0.3)} secondes...`);
    
    const detailedFilms = [];
    let count = 0;
    
    for (const film of allLinks) {
        count++;
        console.log(`  [${count}/${allLinks.length}] ${film.title}`);
        
        const details = await scrapeFilmDetails(film);
        if (details) {
            // Utiliser le titre comme clé pour éviter les doublons
            const key = details.title.toLowerCase().trim();
            if (!allFilms.has(key)) {
                allFilms.set(key, details);
                detailedFilms.push(details);
            }
        }
    }
    
    // Préparer les données finales
    const data = {
        scraped_at: new Date().toISOString(),
        source: BASE_URL,
        total_films: detailedFilms.length,
        distribution: [],
        production: [],
        international: []
    };
    
    // Organiser par catégorie
    detailedFilms.forEach(film => {
        const filmData = {
            title: film.title,
            director: film.director || '',
            status: film.status || 'catalogue',
            image: film.image || '',
            synopsis: film.synopsis || '',
            release_date: film.release_date || '',
            duration: film.duration || '',
            trailer: film.trailer || ''
        };
        
        if (film.category === 'distribution') {
            data.distribution.push(filmData);
        } else if (film.category === 'production') {
            data.production.push(filmData);
        } else if (film.category === 'ventes internationales') {
            data.international.push(filmData);
        }
    });
    
    // Télécharger le JSON
    console.log("\n💾 Téléchargement des données...");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `losange_films_complet_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    console.log("\n✅ Scraping terminé !");
    console.log(`📊 ${detailedFilms.length} films uniques récupérés`);
    console.log(`   - Distribution: ${data.distribution.length}`);
    console.log(`   - Production: ${data.production.length}`);
    console.log(`   - Ventes internationales: ${data.international.length}`);
    console.log("\n💡 Sauvegarde le fichier JSON téléchargé dans data/losange_films.json");
    
    return data;
})();
