#!/usr/bin/env python3
"""
Script pour récupérer les données du site filmsdulosange.com
Usage: python scraper.py
"""

import requests
from bs4 import BeautifulSoup
import json
import os
import re
from urllib.parse import urljoin, urlparse
import time

BASE_URL = "https://filmsdulosange.com"
OUTPUT_DIR = "data"
IMAGES_DIR = "images/scraped"

def create_dirs():
    """Crée les dossiers nécessaires"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(IMAGES_DIR, exist_ok=True)
    os.makedirs(f"{IMAGES_DIR}/films", exist_ok=True)
    os.makedirs(f"{IMAGES_DIR}/news", exist_ok=True)

def get_soup(url):
    """Récupère le contenu d'une page"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return BeautifulSoup(response.content, 'html.parser')
    except Exception as e:
        print(f"Erreur lors de la récupération de {url}: {e}")
        return None

def download_image(url, filename):
    """Télécharge une image"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"✓ Image téléchargée: {filename}")
        return True
    except Exception as e:
        print(f"✗ Erreur téléchargement {url}: {e}")
        return False

def scrape_homepage():
    """Récupère les données de la page d'accueil"""
    print("\n📄 Scraping de la page d'accueil...")
    soup = get_soup(BASE_URL)
    if not soup:
        return None
    
    data = {
        'films_actuels': [],
        'films_prochains': [],
        'news': []
    }
    
    # Films actuellement en salles
    actuel_section = soup.find('h2', string=re.compile('Actuellement', re.I))
    if actuel_section:
        parent = actuel_section.find_parent('section') or actuel_section.find_parent('div')
        if parent:
            films = parent.find_all(['article', 'a'], class_=re.compile('film|movie|card', re.I))
            for film in films[:10]:  # Limiter à 10
                title = film.find(['h2', 'h3', 'h4'])
                img = film.find('img')
                if title:
                    film_data = {
                        'title': title.get_text(strip=True),
                        'image': img.get('src') if img else None,
                        'link': film.get('href') if film.name == 'a' else film.find('a', href=True).get('href') if film.find('a', href=True) else None
                    }
                    data['films_actuels'].append(film_data)
    
    # News
    news_section = soup.find('h2', string=re.compile('News', re.I))
    if news_section:
        parent = news_section.find_parent('section') or news_section.find_parent('div')
        if parent:
            articles = parent.find_all(['article', 'a', 'div'], class_=re.compile('news|article|post', re.I))
            for article in articles[:5]:
                title = article.find(['h2', 'h3', 'h4'])
                date = article.find(['time', 'span'], class_=re.compile('date', re.I))
                img = article.find('img')
                if title:
                    news_data = {
                        'title': title.get_text(strip=True),
                        'date': date.get_text(strip=True) if date else None,
                        'image': img.get('src') if img else None
                    }
                    data['news'].append(news_data)
    
    return data

def scrape_films_page(category="distribution"):
    """Récupère les films d'une catégorie"""
    url = f"{BASE_URL}/films/{category}/"
    print(f"\n📄 Scraping de {url}...")
    soup = get_soup(url)
    if not soup:
        return []
    
    films = []
    # Chercher tous les éléments de film
    film_elements = soup.find_all(['article', 'div'], class_=re.compile('film|movie|card|post', re.I))
    
    for elem in film_elements:
        title = elem.find(['h2', 'h3', 'h4', 'a'])
        img = elem.find('img')
        link = elem.find('a', href=True)
        
        if title:
            film_data = {
                'title': title.get_text(strip=True),
                'image': urljoin(BASE_URL, img.get('src')) if img and img.get('src') else None,
                'link': urljoin(BASE_URL, link.get('href')) if link else None
            }
            
            # Éviter les doublons
            if film_data['title'] and film_data['title'] not in [f['title'] for f in films]:
                films.append(film_data)
    
    return films

def scrape_film_detail(url):
    """Récupère les détails d'un film"""
    print(f"  📎 Détails: {url}")
    soup = get_soup(url)
    if not soup:
        return None
    
    data = {}
    
    # Titre
    title = soup.find('h1')
    if title:
        data['title'] = title.get_text(strip=True)
    
    # Réalisateur
    director = soup.find(string=re.compile('réalis|director', re.I))
    if director:
        parent = director.find_parent(['p', 'div', 'span'])
        if parent:
            data['director'] = parent.get_text(strip=True).replace('Un film de', '').replace('Réalisé par', '').strip()
    
    # Image principale
    main_img = soup.find('img', class_=re.compile('poster|main|featured', re.I))
    if not main_img:
        main_img = soup.find('article img') or soup.find('.content img')
    if main_img:
        data['image'] = urljoin(BASE_URL, main_img.get('src'))
    
    # Synopsis
    synopsis = soup.find(['div', 'p'], class_=re.compile('synopsis|description|content', re.I))
    if synopsis:
        data['synopsis'] = synopsis.get_text(strip=True)[:500]
    
    # Bande-annonce (YouTube/Vimeo)
    iframe = soup.find('iframe', src=re.compile('youtube|vimeo', re.I))
    if iframe:
        data['trailer'] = iframe.get('src')
    
    time.sleep(0.5)  # Respecter le serveur
    return data

def save_data(data, filename):
    """Sauvegarde les données en JSON"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✓ Données sauvegardées: {filepath}")

def main():
    print("🎬 LES FILMS DU LOSANGE - Scraper")
    print("=" * 50)
    
    create_dirs()
    
    all_data = {
        'homepage': scrape_homepage(),
        'distribution': scrape_films_page('distribution'),
        'production': scrape_films_page('production'),
        'international': scrape_films_page('ventes-a-linternational')
    }
    
    # Scraper les détails de quelques films
    print("\n📄 Scraping des détails des films...")
    detailed_films = []
    
    for category in ['distribution', 'production']:
        for film in all_data.get(category, [])[:5]:  # 5 premiers de chaque
            if film.get('link'):
                details = scrape_film_detail(film['link'])
                if details:
                    details['category'] = category
                    detailed_films.append(details)
    
    all_data['detailed_films'] = detailed_films
    
    # Sauvegarder
    save_data(all_data, 'losange_data.json')
    
    # Télécharger quelques images
    print("\n🖼️  Téléchargement des images...")
    for i, film in enumerate(detailed_films[:10]):
        if film.get('image'):
            ext = os.path.splitext(urlparse(film['image']).path)[1] or '.jpg'
            filename = f"{IMAGES_DIR}/films/{i+1:02d}_{re.sub(r'[^a-z0-9]', '_', film.get('title', 'film').lower())[:30]}{ext}"
            download_image(film['image'], filename)
    
    print("\n✅ Scraping terminé!")
    print(f"   Données: {OUTPUT_DIR}/losange_data.json")
    print(f"   Images: {IMAGES_DIR}/")

if __name__ == "__main__":
    main()

