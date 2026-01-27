#!/usr/bin/env python3
"""
Script pour lister tous les cinéastes et les photos nécessaires
"""

import json
import unicodedata
import re

def slugify(text):
    """Convertir un nom en slug"""
    # Normaliser les caractères unicode
    text = unicodedata.normalize('NFD', text)
    # Supprimer les accents
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    # Convertir en minuscules
    text = text.lower()
    # Remplacer les espaces et caractères spéciaux par des tirets
    text = re.sub(r'[^a-z0-9]+', '-', text)
    # Supprimer les tirets en début et fin
    text = text.strip('-')
    return text

def main():
    # Charger le fichier JSON
    with open('data/films.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extraire tous les cinéastes uniques
    cineastes = set()
    for film in data['films']:
        cineaste = film.get('cineaste', '').strip()
        if cineaste and cineaste != 'Sans réalisateur':
            cineastes.add(cineaste)
    
    # Trier par ordre alphabétique
    cineastes_sorted = sorted(cineastes)
    
    print("=" * 60)
    print("LISTE DES CINÉASTES ET PHOTOS NÉCESSAIRES")
    print("=" * 60)
    print(f"\nTotal : {len(cineastes_sorted)} cinéastes\n")
    
    print("| Cinéaste | Nom du fichier |")
    print("|----------|----------------|")
    
    for cineaste in cineastes_sorted:
        slug = slugify(cineaste)
        filename = f"{slug}.jpg"
        print(f"| {cineaste} | `{filename}` |")
    
    print("\n" + "=" * 60)
    print("COMMANDES POUR VÉRIFIER LES PHOTOS MANQUANTES")
    print("=" * 60)
    print("\nPour vérifier quelles photos existent déjà :\n")
    print("ls -1 images/cineastes/*.jpg 2>/dev/null | wc -l")
    
    print("\n\nPour lister les photos manquantes :")
    print("python3 check-photos-cineastes.py")

if __name__ == '__main__':
    main()
