#!/usr/bin/env python3
"""
Script pour convertir les données scrapées en format Google Sheet
Usage: python convert-scraped-to-sheet.py
"""

import json
import csv
import os
from datetime import datetime

# Fichiers d'entrée
SCRAPED_DATA_FILE = "data/losange_films.json"
OUTPUT_CSV = "data/films_import_sheet.csv"

def load_scraped_data():
    """Charge les données scrapées"""
    if not os.path.exists(SCRAPED_DATA_FILE):
        print(f"❌ Fichier {SCRAPED_DATA_FILE} introuvable")
        return None
    
    with open(SCRAPED_DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def clean_text(text):
    """Nettoie un texte (enlève les \n, espaces multiples, etc.)"""
    if not text:
        return ''
    # Remplacer les \n par des espaces
    text = text.replace('\n', ' ').replace('\r', ' ')
    # Remplacer les espaces multiples par un seul
    import re
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_director(director_text):
    """Extrait le nom du réalisateur - le premier nom propre trouvé après 'Un film de'"""
    if not director_text:
        return ''
    
    import re
    
    # Pattern 1: "Un film de [Nom]" - le plus fiable
    # Chercher dans le texte original (avec \n) pour être plus précis
    match = re.search(r'Un film de\s+([A-Z][A-Za-zÀ-ÿ\s-]+?)(?:\n|Avec|Prochainement|Actuellement|Play|$)', director_text, re.IGNORECASE | re.DOTALL)
    if match:
        name = match.group(1).strip()
        # Nettoyer : enlever les \n et espaces multiples
        name = clean_text(name)
        # Enlever les mots parasites
        name = re.sub(r'\b(Prochainement|Actuellement|Distribution|France|Play|Avec|Un|film|de)\b', '', name, flags=re.IGNORECASE)
        name = clean_text(name)
        if len(name) > 1 and len(name) <= 50:
            return name
    
    # Pattern 2: Chercher dans les premières lignes (avant "Avec" ou "Prochainement")
    lines = director_text.split('\n')
    for line in lines[:10]:  # Regarder les 10 premières lignes
        line = line.strip()
        if not line or len(line) < 2:
            continue
        
        # Chercher "Un film de" dans cette ligne
        match = re.search(r'Un film de\s+([A-Z][A-Za-zÀ-ÿ\s-]+?)(?:\s|$)', line, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            if len(name) > 1 and len(name) <= 50:
                return name
        
        # Sinon, chercher un nom propre complet (Prénom Nom) qui n'est pas un mot parasite
        if re.match(r'^[A-Z][a-zà-ÿ]+(?:\s+[A-Z][a-zà-ÿ]+)+$', line):
            if not re.match(r'^(Prochainement|Actuellement|Distribution|France|Play|Avec|Un|film|de|Father|Mother|Sister|Brother)$', line, re.IGNORECASE):
                if 3 <= len(line) <= 50:
                    return line
    
    # Pattern 3: Chercher le premier nom propre dans le texte nettoyé
    cleaned = clean_text(director_text)
    match = re.search(r'\b([A-Z][a-zà-ÿ]+(?:\s+[A-Z][a-zà-ÿ]+){1,2})\b', cleaned)
    if match:
        name = match.group(1).strip()
        if not re.match(r'^(Prochainement|Actuellement|Distribution|France|Play|Avec|Un|film|de|Father|Mother|Sister|Brother)$', name, re.IGNORECASE):
            if len(name) > 2 and len(name) <= 50:
                return name
    
    return ''

def extract_casting(synopsis_text):
    """Extrait le casting - uniquement les noms propres après 'Avec' ou liste de noms"""
    if not synopsis_text:
        return ''
    
    import re
    
    # Nettoyer le texte
    cleaned = clean_text(synopsis_text)
    
    # Pattern 1: "Avec [noms]" - chercher dans le texte original aussi
    # Chercher "Avec" suivi de noms
    match = re.search(r'Avec\s+([^\.]+?)(?:\.|$|\n)', synopsis_text, re.IGNORECASE | re.DOTALL)
    if match:
        casting_text = match.group(1).strip()
        cleaned = clean_text(casting_text)
    else:
        # Si pas de "Avec", vérifier si c'est juste une liste de noms séparés par des virgules
        # (format typique du casting dans le synopsis)
        if ',' in cleaned and len(cleaned.split(',')) >= 2:
            # Vérifier que ce sont bien des noms propres (commencent par majuscule)
            parts = cleaned.split(',')
            has_proper_names = sum(1 for p in parts if re.search(r'^[A-Z]', p.strip()))
            if has_proper_names >= 2:  # Au moins 2 noms propres
                casting_text = cleaned
            else:
                return ''
        else:
            return ''
    
    # Extraire uniquement les noms propres
    names = []
    
    # Diviser par virgules
    parts = re.split(r',', casting_text)
    
    for part in parts:
        part = part.strip()
        if not part:
            continue
        
        # Chercher des noms propres (commence par majuscule, suivi de lettres, peut contenir traits d'union)
        # Format: "Prénom Nom", "Nom-Prénom", "Prénom Nom-Prénom", etc.
        # Pattern: au moins 2 caractères, commence par majuscule, peut contenir - et espaces
        name_match = re.search(r'^([A-Z][a-zà-ÿ]+(?:[\s-][A-Z][a-zà-ÿ]+){0,3})', part)
        if name_match:
            name = name_match.group(1).strip()
            # Filtrer les mots parasites
            if not re.match(r'^(Avec|Et|And|The|Le|La|Les|Un|Une|Des|Du|De|Distribution|France|Play|Prochainement|Actuellement)$', name, re.IGNORECASE):
                if len(name) >= 2 and len(name) <= 60:  # Augmenté à 60 pour les noms longs
                    names.append(name)
    
    # Retourner les noms séparés par des virgules avec espace
    if names:
        return ', '.join(names)
    
    return ''

def extract_films_from_scraped_data(data):
    """Extrait tous les films des données scrapées"""
    films = []
    seen_titles = set()  # Pour éviter les doublons
    
    # Distribution
    if 'distribution' in data:
        for film in data['distribution']:
            title = film.get('title', '').strip()
            if not title or title.lower() in seen_titles:
                continue
            seen_titles.add(title.lower())
            
            # Convertir release_date si présent
            date_sortie = ''
            if film.get('release_date'):
                date_sortie = film.get('release_date')
            
            # Convertir duration si présent
            duree = film.get('duration', '') or film.get('duree_minutes', '')
            
            # Nettoyer les données
            director = extract_director(film.get('director', ''))
            synopsis_raw = film.get('synopsis', '')
            casting = extract_casting(synopsis_raw)
            # Si le synopsis est en fait le casting, le synopsis reste vide
            synopsis = '' if casting and synopsis_raw.strip() == casting.strip() else synopsis_raw
            
            films.append({
                'titre': title,
                'cineaste': director,
                'casting': casting,
                'date_sortie': date_sortie,
                'duree_minutes': duree,
                'nationalites': '',  # À remplir manuellement
                'synopsis': synopsis,
                'status': film.get('status', 'catalogue'),
                'categories': 'distribution',
                'thematiques': '',  # À remplir manuellement
                'affiche_image': film.get('local_image') or film.get('image', ''),
                'dossier_presse': '',
                'affiche_photos': '',
                'bande_annonce_fichier': '',
                'bande_annonce_url': film.get('trailer', ''),
                'slug': ''
            })
    
    # Production
    if 'production' in data:
        for film in data['production']:
            title = film.get('title', '').strip()
            if not title:
                continue
            
            title_lower = title.lower()
            existing = next((f for f in films if f['titre'].lower() == title_lower), None)
            
            if existing:
                # Ajouter "production" aux catégories
                if 'production' not in existing['categories']:
                    existing['categories'] = f"{existing['categories']}, production"
            else:
                if title_lower not in seen_titles:
                    seen_titles.add(title_lower)
                    
                    date_sortie = ''
                    if film.get('release_date'):
                        date_sortie = film.get('release_date')
                    
                    duree = film.get('duration', '') or film.get('duree_minutes', '')
                    
                    # Nettoyer les données
                    director = extract_director(film.get('director', ''))
                    synopsis_raw = film.get('synopsis', '')
                    casting = extract_casting(synopsis_raw)
                    synopsis = '' if casting and synopsis_raw.strip() == casting.strip() else synopsis_raw
                    
                    films.append({
                        'titre': title,
                        'cineaste': director,
                        'casting': casting,
                        'date_sortie': date_sortie,
                        'duree_minutes': duree,
                        'nationalites': '',
                        'synopsis': synopsis,
                        'status': 'catalogue',
                        'categories': 'production',
                        'thematiques': '',
                        'affiche_image': film.get('local_image') or film.get('image', ''),
                        'dossier_presse': '',
                        'affiche_photos': '',
                        'bande_annonce_fichier': '',
                        'bande_annonce_url': film.get('trailer', ''),
                        'slug': ''
                    })
    
    # Ventes internationales
    if 'international' in data:
        for film in data['international']:
            title = film.get('title', '').strip()
            if not title:
                continue
            
            title_lower = title.lower()
            existing = next((f for f in films if f['titre'].lower() == title_lower), None)
            
            if existing:
                if 'ventes internationales' not in existing['categories']:
                    existing['categories'] = f"{existing['categories']}, ventes internationales"
            else:
                if title_lower not in seen_titles:
                    seen_titles.add(title_lower)
                    
                    date_sortie = ''
                    if film.get('release_date'):
                        date_sortie = film.get('release_date')
                    
                    duree = film.get('duration', '') or film.get('duree_minutes', '')
                    
                    # Nettoyer les données
                    director = extract_director(film.get('director', ''))
                    synopsis_raw = film.get('synopsis', '')
                    casting = extract_casting(synopsis_raw)
                    synopsis = '' if casting and synopsis_raw.strip() == casting.strip() else synopsis_raw
                    
                    films.append({
                        'titre': title,
                        'cineaste': director,
                        'casting': casting,
                        'date_sortie': date_sortie,
                        'duree_minutes': duree,
                        'nationalites': '',
                        'synopsis': synopsis,
                        'status': 'catalogue',
                        'categories': 'ventes internationales',
                        'thematiques': '',
                        'affiche_image': film.get('local_image') or film.get('image', ''),
                        'dossier_presse': '',
                        'affiche_photos': '',
                        'bande_annonce_fichier': '',
                        'bande_annonce_url': film.get('trailer', ''),
                        'slug': ''
                    })
    
    return films

def generate_slug(title):
    """Génère un slug à partir du titre"""
    if not title:
        return ''
    
    # Convertir en minuscules, remplacer espaces et caractères spéciaux
    slug = title.lower()
    slug = slug.replace(' ', '-')
    slug = slug.replace("'", '-')
    slug = slug.replace('é', 'e').replace('è', 'e').replace('ê', 'e')
    slug = slug.replace('à', 'a').replace('â', 'a')
    slug = slug.replace('ç', 'c')
    slug = slug.replace('ù', 'u').replace('û', 'u')
    slug = slug.replace('ô', 'o')
    slug = slug.replace('î', 'i').replace('ï', 'i')
    
    # Nettoyer les caractères non alphanumériques
    import re
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    slug = re.sub(r'-+', '-', slug)  # Remplacer plusieurs - par un seul
    slug = slug.strip('-')
    
    return f"{slug}.html"

def enhance_films_data(films):
    """Améliore les données des films (génère slugs, etc.)"""
    for film in films:
        # Générer le slug si vide
        if not film['slug'] and film['titre']:
            film['slug'] = generate_slug(film['titre'])
        
        # Normaliser le status
        status = film['status'].lower() if film['status'] else 'catalogue'
        if 'actuellement' in status or 'en salles' in status:
            film['status'] = 'actuellement'
        elif 'prochainement' in status:
            film['status'] = 'prochainement'
        else:
            film['status'] = 'catalogue'
    
    return films

def save_to_csv(films, output_file):
    """Sauvegarde les films en CSV pour import Google Sheet"""
    if not films:
        print("❌ Aucun film à exporter")
        return
    
    # En-têtes du Google Sheet
    headers = [
        'titre', 'cineaste', 'casting', 'date_sortie', 'duree_minutes',
        'nationalites', 'synopsis', 'status', 'categories', 'thematiques',
        'affiche_image', 'dossier_presse', 'affiche_photos',
        'bande_annonce_fichier', 'bande_annonce_url', 'slug'
    ]
    
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(films)
    
    print(f"✅ {len(films)} films exportés vers {output_file}")

def main():
    print("🔄 Conversion des données scrapées → Format Google Sheet")
    print("=" * 60)
    
    # Charger les données
    data = load_scraped_data()
    if not data:
        return
    
    # Extraire les films
    print("\n📥 Extraction des films...")
    films = extract_films_from_scraped_data(data)
    print(f"   {len(films)} films trouvés")
    
    # Améliorer les données
    print("\n🔧 Amélioration des données...")
    films = enhance_films_data(films)
    
    # Sauvegarder en CSV
    print("\n💾 Export vers CSV...")
    save_to_csv(films, OUTPUT_CSV)
    
    print("\n✅ Conversion terminée !")
    print(f"\n📋 Prochaines étapes :")
    print(f"   1. Ouvre {OUTPUT_CSV}")
    print(f"   2. Copie tout le contenu (Cmd+A, Cmd+C)")
    print(f"   3. Ouvre ton Google Sheet")
    print(f"   4. Colle les données (Cmd+V)")
    print(f"   5. Complète les colonnes vides (casting, date_sortie, etc.)")
    print(f"   6. Synchronise avec : python3 sync-films-from-sheet.py")

if __name__ == "__main__":
    main()
