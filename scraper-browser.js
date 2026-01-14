/**
 * SCRAPER LES FILMS DU LOSANGE
 * 
 * Instructions :
 * 1. Ouvrez https://filmsdulosange.com/ dans Chrome/Safari
 * 2. Ouvrez les outils de développement (Cmd+Option+I sur Mac)
 * 3. Allez dans l'onglet "Console"
 * 4. Copiez-collez tout ce code et appuyez sur Entrée
 * 5. Les données seront téléchargées en JSON
 */

(async function scrapeFilmsduLosange() {
    console.log("🎬 Scraping Les Films du Losange...");
    
    const data = {
        films: [],
        news: [],
        scraped_at: new Date().toISOString()
    };
    
    // Scraper les films de la page d'accueil
    function scrapeHomepage() {
        // Films actuellement en salles
        const filmCards = document.querySelectorAll('article, .film-card, [class*="film"], [class*="movie"]');
        
        filmCards.forEach(card => {
            const titleEl = card.querySelector('h2, h3, h4, .title');
            const imgEl = card.querySelector('img');
            const linkEl = card.querySelector('a[href]');
            
            if (titleEl) {
                const film = {
                    title: titleEl.textContent.trim(),
                    image: imgEl ? imgEl.src : null,
                    link: linkEl ? linkEl.href : null
                };
                
                // Éviter les doublons
                if (!data.films.find(f => f.title === film.title)) {
                    data.films.push(film);
                }
            }
        });
        
        // News
        const newsCards = document.querySelectorAll('[class*="news"], [class*="article"], [class*="post"]');
        newsCards.forEach(card => {
            const titleEl = card.querySelector('h2, h3, h4');
            const dateEl = card.querySelector('time, [class*="date"]');
            const imgEl = card.querySelector('img');
            
            if (titleEl) {
                data.news.push({
                    title: titleEl.textContent.trim(),
                    date: dateEl ? dateEl.textContent.trim() : null,
                    image: imgEl ? imgEl.src : null
                });
            }
        });
    }
    
    // Scraper une page de liste de films
    async function scrapeFilmsPage(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const films = [];
            const cards = doc.querySelectorAll('article, [class*="film"], [class*="movie"], .elementor-post');
            
            cards.forEach(card => {
                const titleEl = card.querySelector('h2, h3, h4, .title, .elementor-post__title');
                const imgEl = card.querySelector('img');
                const linkEl = card.querySelector('a[href]');
                
                if (titleEl && titleEl.textContent.trim()) {
                    films.push({
                        title: titleEl.textContent.trim(),
                        image: imgEl ? imgEl.src : null,
                        link: linkEl ? linkEl.href : null
                    });
                }
            });
            
            return films;
        } catch (e) {
            console.error(`Erreur sur ${url}:`, e);
            return [];
        }
    }
    
    // Scraper les détails d'un film
    async function scrapeFilmDetails(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const details = {
                url: url
            };
            
            // Titre
            const title = doc.querySelector('h1');
            if (title) details.title = title.textContent.trim();
            
            // Image principale
            const mainImg = doc.querySelector('.wp-post-image, article img, .elementor-widget-image img');
            if (mainImg) details.image = mainImg.src;
            
            // Chercher le réalisateur
            const bodyText = doc.body.textContent;
            const directorMatch = bodyText.match(/(?:Un film de|Réalisé par|A film by)\s*([A-Za-zÀ-ÿ\s-]+)/i);
            if (directorMatch) details.director = directorMatch[1].trim();
            
            // Synopsis
            const synopsis = doc.querySelector('.synopsis, .description, .content p');
            if (synopsis) details.synopsis = synopsis.textContent.trim().substring(0, 500);
            
            // Bande-annonce YouTube/Vimeo
            const iframe = doc.querySelector('iframe[src*="youtube"], iframe[src*="vimeo"]');
            if (iframe) details.trailer = iframe.src;
            
            return details;
        } catch (e) {
            console.error(`Erreur détails ${url}:`, e);
            return null;
        }
    }
    
    // Exécution
    console.log("📄 Scraping page d'accueil...");
    scrapeHomepage();
    
    console.log("📄 Scraping Distribution...");
    const distribution = await scrapeFilmsPage('/films/distribution/');
    data.distribution = distribution;
    
    console.log("📄 Scraping Production...");
    const production = await scrapeFilmsPage('/films/production/');
    data.production = production;
    
    console.log("📄 Scraping Ventes Internationales...");
    const international = await scrapeFilmsPage('/films/ventes-a-linternational/');
    data.international = international;
    
    // Scraper les détails des 10 premiers films
    console.log("📄 Scraping détails des films...");
    const allFilms = [...distribution, ...production].slice(0, 10);
    data.detailed_films = [];
    
    for (const film of allFilms) {
        if (film.link) {
            console.log(`  → ${film.title}`);
            const details = await scrapeFilmDetails(film.link);
            if (details) data.detailed_films.push(details);
            await new Promise(r => setTimeout(r, 500)); // Pause pour ne pas surcharger
        }
    }
    
    // Télécharger le JSON
    console.log("💾 Téléchargement des données...");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'losange_data.json';
    a.click();
    
    console.log("✅ Scraping terminé !");
    console.log("Données:", data);
    
    return data;
})();

