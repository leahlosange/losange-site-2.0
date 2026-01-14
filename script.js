/**
 * LES FILMS DU LOSANGE - Style A24
 * JavaScript principal
 */

document.addEventListener('DOMContentLoaded', function() {
    initMenu();
    initSearch();
    initCarousel();
    initAutoSlide();
    initFilmFilters();
    initShowtimes();
});

// === Menu Fullscreen ===
function initMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const menu = document.querySelector('.fullscreen-menu');
    const menuLinks = document.querySelectorAll('.menu-link');
    const menuCloseBtn = document.querySelector('.menu-close-btn');
    
    if (!menuBtn || !menu) return;
    
    // Fonction pour fermer le menu
    function closeMenu() {
        menu.classList.remove('open');
        document.body.style.overflow = '';
        menuBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.5"/>
                <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.5"/>
                <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="1.5"/>
            </svg>
        `;
    }
    
    // Bouton de fermeture (X)
    menuCloseBtn?.addEventListener('click', closeMenu);
    
    menuBtn.addEventListener('click', () => {
        menu.classList.toggle('open');
        document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
        
        // Animate menu icon
        if (menu.classList.contains('open')) {
            menuBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.5"/>
                </svg>
            `;
        } else {
            menuBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="1.5"/>
                </svg>
            `;
        }
    });
    
    // Close menu on link click
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            document.body.style.overflow = '';
            menuBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="1.5"/>
                </svg>
            `;
        });
    });
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
            menu.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}

// === Search Overlay ===
function initSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchClose = document.querySelector('.search-close');
    const searchInput = document.querySelector('.search-input');
    
    if (!searchBtn || !searchOverlay) return;
    
    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => searchInput?.focus(), 300);
    });
    
    searchClose?.addEventListener('click', () => {
        searchOverlay.classList.remove('open');
        document.body.style.overflow = '';
    });
    
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
            searchOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
    
    // Close on overlay click
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            searchOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}

// === Carousel ===
let currentSlide = 0;
let totalSlides = 0;
let autoSlideInterval = null;

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const currentCounter = document.querySelector('.carousel-counter .current');
    
    totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
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
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carousel?.addEventListener('touchend', (e) => {
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
    const currentCounter = document.querySelector('.carousel-counter .current');
    
    // Remove active from all
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active to current
    currentSlide = index;
    slides[currentSlide]?.classList.add('active');
    dots[currentSlide]?.classList.add('active');
    
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
const darkSections = document.querySelectorAll('.hero-carousel, .watch-now-section, .showtimes-section, .footer');

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

// === Film Filters ===
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

// === Showtimes Allociné Integration ===
function initShowtimes() {
    const form = document.getElementById('showtimes-form');
    const filmSelect = document.getElementById('film-select');
    const cityInput = document.getElementById('city-input');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const filmValue = filmSelect.value;
        const city = cityInput.value.trim();
        
        if (!filmValue) {
            alert('Veuillez sélectionner un film');
            return;
        }
        
        let allocineUrl;
        
        // Vérifier si c'est un ID numérique ou un nom de film
        if (/^\d+$/.test(filmValue)) {
            // ID numérique → page séances directe
            allocineUrl = `https://www.allocine.fr/seance/film-${filmValue}/`;
            if (city) {
                allocineUrl += `pres-de-${encodeURIComponent(city)}/`;
            }
        } else {
            // Nom de film → recherche Allociné
            const searchTerm = filmValue.replace(/-/g, ' ') + (city ? ' ' + city : '');
            allocineUrl = `https://www.allocine.fr/rechercher/?q=${encodeURIComponent(searchTerm)}`;
        }
        
        // Ouvrir dans un nouvel onglet
        window.open(allocineUrl, '_blank');
    });
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

// Lancer l'animation du favicon
document.addEventListener('DOMContentLoaded', initAnimatedFavicon);
