#!/usr/bin/env python3
"""
Script de synchronisation Google Sheet → data/films.json
Usage: python sync-films-from-sheet.py
"""

import json
import requests
import sys
from typing import List, Dict, Any

# ⚙️ CONFIGURATION : Remplace par l'ID de ton Google Sheet
# L'ID se trouve dans l'URL du Sheet : https://docs.google.com/spreadsheets/d/ID_ICI/edit
# Peut aussi être défini via variable d'environnement GOOGLE_SHEET_ID
import os
SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "1kjBwCJfYIy00l18XrjbIgvc9Wwg5xflvSr0fvJoRHJs")

# Le Sheet doit être en mode "Tous ceux qui ont le lien peuvent voir" (public en lecture)
SHEET_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&sheet=Films"

def parse_google_sheets_json(response_text: str) -> List[Dict[str, Any]]:
    """Parse la réponse JSON de Google Sheets"""
    # Google Sheets renvoie du JS du type:
    # /*O_o*/
    # google.visualization.Query.setResponse({...});
    cleaned = response_text
    if cleaned.startswith("/*O_o*/"):
        cleaned = cleaned.split("\n", 1)[1]
    prefix = "google.visualization.Query.setResponse("
    suffix = ");"
    if cleaned.startswith(prefix):
        cleaned = cleaned[len(prefix):]
    if cleaned.endswith(suffix):
        cleaned = cleaned[: -len(suffix)]
    data = json.loads(cleaned)
    
    table = data.get("table", {})
    cols = table.get("cols", [])
    headers = [c.get("label", "") for c in cols]
    rows = table.get("rows", [])

    films = []
    for row in rows:
        if not row or "c" not in row:
            continue
        cells = row.get("c", [])
        if not cells or not cells[0] or not cells[0].get("v"):
            continue  # ligne vide

        film = {}
        for i, header in enumerate(headers):
            header = header.strip()
            if not header:
                continue
            value_cell = cells[i] if i < len(cells) else None
            value = value_cell.get("v") if value_cell else None

            if value is None:
                # valeurs par défaut
                if header in ["casting", "nationalites", "categories", "thematiques"]:
                    film[header] = []
                elif header in ["duree_minutes"]:
                    film[header] = None
                else:
                    film[header] = ""
            else:
                if header in ["casting", "nationalites", "categories", "thematiques"]:
                    film[header] = [x.strip() for x in str(value).split(",") if x.strip()]
                else:
                    film[header] = str(value)

        if film.get("titre"):  # Au minimum un titre
            films.append(film)

    return films

def main():
    print(f"📥 Récupération des données depuis Google Sheets...")
    
    try:
        response = requests.get(SHEET_URL, timeout=10)
        response.raise_for_status()
        
        films = parse_google_sheets_json(response.text)
        
        if not films:
            print("⚠️  Aucun film trouvé dans le Sheet. Vérifie que la première ligne contient les en-têtes.")
            sys.exit(1)
        
        output = {"films": films}
        
        output_path = "data/films.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"✅ {len(films)} film(s) synchronisé(s) → {output_path}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur lors de la récupération du Sheet: {e}")
        print("\n💡 Vérifie que:")
        print("   1. Le Sheet est en mode 'Tous ceux qui ont le lien peuvent voir' (public)")
        print("   2. L'ID du Sheet est correct dans le script")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
