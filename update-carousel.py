#!/usr/bin/env python3
"""
Script pour mettre à jour le carousel sur la page d'accueil
Usage: python3 update-carousel.py
"""

import json
import re
from pathlib import Path

# Configuration
CAROUSEL_DATA = "data/carousel.json"
FILMS_JSON = "data/films.json"
INDEX_FILE = "index.html"

def normalize_title(title):
    """Normalise un titre pour la comparaison"""
    if not title:
        return ''
    # Enlever accents, ponctuation, mettre en minuscule
    title = title.lower().strip()
    # Remplacer les caractères accentués
    replacements = {
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'à': 'a', 'â': 'a', 'ä': 'a',
        'ù': 'u', 'û': 'u', 'ü': 'u',
        'ô': 'o', 'ö': 'o',
        'î': 'i', 'ï': 'i',
        'ç': 'c'
    }
    for old, new in replacements.items():
        title = title.replace(old, new)
    # Enlever toute la ponctuation
    title = re.sub(r'[^\w\s]', '', title)
    return title

def find_film_slug(film_title, films_data):
    """Trouve le slug d'un film à partir de son titre"""
    title_normalise = normalize_title(film_title)
    
    for film in films_data.get('films', []):
        titre = film.get('titre', '')
        titre_normalise = normalize_title(titre)
        
        # Correspondance exacte
        if titre_normalise == title_normalise:
            return film.get('slug', '')
        
        # Correspondance partielle (un titre contient l'autre)
        if titre_normalise and title_normalise:
            if titre_normalise in title_normalise or title_normalise in titre_normalise:
                return film.get('slug', '')
    
    return None

def load_carousel_data():
    """Charge les données du carousel depuis le JSON"""
    data_path = Path(__file__).parent / CAROUSEL_DATA
    if not data_path.exists():
        print(f"❌ Erreur: Le fichier {CAROUSEL_DATA} n'existe pas!")
        return None
    
    with open(data_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_carousel_html(data, films_data):
    """Génère le HTML du carousel à partir des données JSON"""
    slides_html = []
    dots_html = []
    
    for slide in data['slides']:
        # Trouver le slug du film correspondant
        film_slug = find_film_slug(slide.get('alt', ''), films_data)
        
        # Générer le HTML d'une slide
        active_class = ' active' if slide.get('active', False) else ''
        award_html = f'\n                    <span class="film-award">{slide["award"]}</span>' if slide.get('award') else ''
        date_html = f'<span class="film-date">{slide["date"]}</span>' if slide.get('date') else ''
        
        # Générer le titre : image PNG ou texte
        title_html = ''
        if slide.get('title_image'):
            # Utiliser une image PNG pour le titre
            title_html = f'<img src="{slide["title_image"]}" alt="{slide["alt"]}" class="film-title-logo">'
        else:
            # Utiliser le texte du titre
            title_html = f'<h1 class="film-title">{slide["title"]}</h1>'
        
        # Envelopper la slide dans un lien si slug disponible
        if film_slug:
            slide_html = f'''            <!-- {slide["alt"]} -->
            <a href="{film_slug}" class="carousel-slide-link">
                <div class="carousel-slide{active_class}" data-index="{slide["index"]}">
                    <div class="slide-background">
                        <img src="{slide["image"]}" alt="{slide["alt"]}">
                    </div>
                    <div class="slide-content">
                        <span class="film-tag">{slide["tag"]}</span>
                        {title_html}
                        <p class="film-director">{slide["director"]}</p>{award_html}{date_html}
                    </div>
                </div>
            </a>'''
        else:
            slide_html = f'''            <!-- {slide["alt"]} -->
            <div class="carousel-slide{active_class}" data-index="{slide["index"]}">
                <div class="slide-background">
                    <img src="{slide["image"]}" alt="{slide["alt"]}">
                </div>
                <div class="slide-content">
                    <span class="film-tag">{slide["tag"]}</span>
                    {title_html}
                    <p class="film-director">{slide["director"]}</p>{award_html}{date_html}
                </div>
            </div>'''
        
        slides_html.append(slide_html)
        
        # Générer les dots
        dot_active = ' active' if slide.get('active', False) else ''
        dots_html.append(f'                <button class="dot{dot_active}" data-index="{slide["index"]}"></button>')
    
    # Assembler le HTML complet
    total_slides = len(data['slides'])
    
    carousel_html = f'''    <!-- Hero Carousel - Films actuels et à venir -->
    <section class="hero-carousel">
        <div class="carousel-container">
{chr(10).join(slides_html)}
        </div>
        
        <!-- Carousel Navigation -->
        <div class="carousel-nav">
            <div class="carousel-dots">
{chr(10).join(dots_html)}
            </div>
            <div class="carousel-counter">
                <span class="current">1</span>
                <span class="separator">/</span>
                <span class="total">{total_slides}</span>
            </div>
        </div>
    </section>'''
    
    return carousel_html

def update_index_html(new_carousel_html):
    """Met à jour le carousel dans index.html"""
    index_path = Path(__file__).parent / INDEX_FILE
    if not index_path.exists():
        print(f"❌ Erreur: Le fichier {INDEX_FILE} n'existe pas!")
        return False
    
    content = index_path.read_text(encoding='utf-8')
    
    # Pattern pour trouver le carousel (depuis le commentaire jusqu'à la fin de la section)
    import re
    pattern = r'(<!-- Hero Carousel.*?</section>)'
    
    if not re.search(pattern, content, re.DOTALL):
        print(f"⚠️  Carousel non trouvé dans {INDEX_FILE}")
        return False
    
    # Remplacer le carousel
    new_content = re.sub(pattern, new_carousel_html, content, flags=re.DOTALL)
    
    if new_content != content:
        index_path.write_text(new_content, encoding='utf-8')
        print(f"✅ Carousel mis à jour dans {INDEX_FILE}")
        return True
    else:
        print(f"ℹ️  Aucun changement détecté")
        return False

def load_films_data():
    """Charge les données des films pour trouver les slugs"""
    films_path = Path(__file__).parent / FILMS_JSON
    if not films_path.exists():
        print(f"⚠️  Fichier {FILMS_JSON} non trouvé, les slides ne seront pas cliquables")
        return {'films': []}
    
    with open(films_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def main():
    """Fonction principale"""
    print("🔄 Mise à jour du carousel sur la page d'accueil...\n")
    
    # Charger les données
    data = load_carousel_data()
    if not data:
        return
    
    # Charger les films pour trouver les slugs
    films_data = load_films_data()
    
    # Vérifier qu'il y a au moins une slide active
    active_slides = [s for s in data['slides'] if s.get('active', False)]
    if len(active_slides) != 1:
        print(f"⚠️  Attention: {len(active_slides)} slide(s) active(s). Il devrait y en avoir exactement 1.")
        print("   La première slide sera marquée comme active par défaut.")
        # Corriger automatiquement
        for i, slide in enumerate(data['slides']):
            slide['active'] = (i == 0)
    
    # Générer le HTML
    carousel_html = generate_carousel_html(data, films_data)
    
    # Mettre à jour index.html
    if update_index_html(carousel_html):
        print(f"\n✨ Terminé! Le carousel a été mis à jour avec {len(data['slides'])} slide(s).")
    else:
        print(f"\n❌ Échec de la mise à jour.")

if __name__ == "__main__":
    main()
