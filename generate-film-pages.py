#!/usr/bin/env python3
"""
Script pour générer les pages films individuelles à partir du JSON
Usage: python3 generate-film-pages.py
"""

import json
import re
from pathlib import Path
from urllib.parse import urlparse, parse_qs

# Configuration
FILMS_JSON = "data/films.json"
TEMPLATE_FILE = "templates/film-page.html"

def extract_youtube_id(url):
    """Extrait l'ID YouTube d'une URL"""
    if not url:
        return None
    
    # Patterns pour différentes formes d'URL YouTube
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None

def format_date(date_str):
    """Formate la date depuis le format Google Sheets"""
    if not date_str or date_str == "None":
        return None
    
    # Format Google Sheets: Date(2025,6,1) -> année, mois-1, jour
    if date_str.startswith("Date("):
        try:
            # Extraire les valeurs: Date(2025,6,1)
            import re
            match = re.match(r'Date\((\d+),(\d+),(\d+)\)', date_str)
            if match:
                year, month, day = match.groups()
                # Formater la date en français
                months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                         'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
                month_name = months[int(month) - 1]
                return f"{day} {month_name} {year}"
        except:
            pass
    
    # Si c'est déjà une date formatée, la retourner
    return date_str

def generate_film_page(film, template_content):
    """Génère le HTML d'une page film"""
    
    # Remplacer les placeholders
    html = template_content
    
    # Titre et description
    titre = film.get('titre', '')
    html = html.replace('{{TITLE}}', titre)
    html = html.replace('{{DESCRIPTION}}', film.get('synopsis', '')[:160] or f"{titre} - Les Films du Losange")
    
    # Titre du film
    html = html.replace('{{FILM_TITLE}}', titre.upper())
    html = html.replace('{{FILM_TITLE_LOWERCASE}}', titre.lower())
    
    # Réalisateur
    cineaste = film.get('cineaste', '')
    html = html.replace('{{CINEASTE}}', cineaste)
    
    # Date
    date_sortie = format_date(film.get('date_sortie', ''))
    if date_sortie:
        html = html.replace('{{DATE_SEPARATOR}}', ' • ')
        html = html.replace('{{DATE_LABEL}}', '<span class="film-date-label">au cinéma le</span> ')
        html = html.replace('{{DATE_SORTIE}}', date_sortie)
    else:
        html = html.replace('{{DATE_SEPARATOR}}', '')
        html = html.replace('{{DATE_LABEL}}', '')
        html = html.replace('{{DATE_SORTIE}}', '')
    
    # Durée (convertir en heures)
    duree_minutes = film.get('duree_minutes', '')
    if duree_minutes and duree_minutes != 'None':
        try:
            duree_int = int(float(duree_minutes))
            heures = duree_int // 60
            minutes = duree_int % 60
            if heures > 0:
                if minutes > 0:
                    duree_text = f'{heures}h{minutes:02d}'
                else:
                    duree_text = f'{heures}h'
            else:
                duree_text = f'{minutes} min'
            html = html.replace('{{DUREE_SEPARATOR}}', ' • ')
            html = html.replace('{{DUREE}}', duree_text)
        except:
            html = html.replace('{{DUREE_SEPARATOR}}', '')
            html = html.replace('{{DUREE}}', '')
    else:
        html = html.replace('{{DUREE_SEPARATOR}}', '')
        html = html.replace('{{DUREE}}', '')
    
    # Casting
    casting = film.get('casting', [])
    if casting and len(casting) > 0:
        casting_html = f'''<div class="film-casting">
                        <h2 class="section-label">Avec</h2>
                        <p class="casting-text">{', '.join(casting)}</p>
                    </div>'''
    else:
        casting_html = ''
    html = html.replace('{{CASTING_SECTION}}', casting_html)
    
    # Synopsis
    synopsis = film.get('synopsis', '')
    if not synopsis:
        synopsis = 'Synopsis à venir.'
    html = html.replace('{{SYNOPSIS}}', synopsis)
    
    # Affiche (pour la section poster)
    affiche = film.get('affiche_image', '')
    if not affiche:
        affiche = 'images/catalogue/l-avenir.jpg'  # Image par défaut
    html = html.replace('{{AFFICHE_IMAGE}}', affiche)
    
    # Player YouTube
    bande_annonce_url = film.get('bande_annonce_url', '')
    youtube_id = extract_youtube_id(bande_annonce_url)
    
    # Utiliser affiche_photos pour la couverture si disponible, sinon affiche_image
    affiche_photos = film.get('affiche_photos', '')
    hero_image = affiche_photos if affiche_photos else affiche
    
    if youtube_id:
        # Afficher d'abord l'image de couverture, puis la vidéo YouTube en overlay
        youtube_player = f'''<div class="film-hero-image">
            <img src="{hero_image}" alt="{titre}">
        </div>
        <div class="youtube-player-container" style="display: none;">
            <iframe 
                src="https://www.youtube.com/embed/{youtube_id}?autoplay=0&rel=0&modestbranding=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
                class="youtube-iframe"
                data-youtube-id="{youtube_id}">
            </iframe>
        </div>'''
    else:
        # Si pas de bande-annonce, utiliser l'image de couverture et masquer le bouton play
        youtube_player = f'''<div class="film-hero-image">
            <img src="{hero_image}" alt="{titre}">
        </div>
        <style>
            .film-play-btn {{ display: none; }}
        </style>'''
    
    html = html.replace('{{YOUTUBE_PLAYER}}', youtube_player)
    
    return html

def main():
    """Fonction principale"""
    print("🎬 Génération des pages films individuelles...\n")
    
    # Charger le template
    template_path = Path(__file__).parent / TEMPLATE_FILE
    if not template_path.exists():
        print(f"❌ Erreur: Le template {TEMPLATE_FILE} n'existe pas!")
        return
    
    template_content = template_path.read_text(encoding='utf-8')
    
    # Charger les films
    films_path = Path(__file__).parent / FILMS_JSON
    if not films_path.exists():
        print(f"❌ Erreur: Le fichier {FILMS_JSON} n'existe pas!")
        return
    
    with open(films_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    films = data.get('films', [])
    if not films:
        print("⚠️  Aucun film trouvé dans le JSON")
        return
    
    # Générer les pages
    generated = 0
    skipped = 0
    
    for film in films:
        slug = film.get('slug', '')
        if not slug:
            # Générer un slug à partir du titre
            titre = film.get('titre', '').lower()
            slug = re.sub(r'[^a-z0-9]+', '', titre.replace(' ', '')) + '.html'
        
        # Générer le HTML
        html_content = generate_film_page(film, template_content)
        
        # Sauvegarder
        output_path = Path(__file__).parent / slug
        output_path.write_text(html_content, encoding='utf-8')
        
        print(f"✅ {slug} généré")
        generated += 1
    
    print(f"\n📊 Résumé:")
    print(f"   ✅ {generated} page(s) générée(s)")
    print(f"   ⚠️  {skipped} page(s) ignorée(s)")
    print(f"\n✨ Terminé!")

if __name__ == "__main__":
    main()
