#!/usr/bin/env python3
"""
Script de synchronisation Google Sheet → data/films.json
Usage: python sync-films-from-sheet.py
       python sync-films-from-sheet.py --debug   (affiche infos de débogage)
"""

import json
import requests
import sys
import os
from typing import Any, Dict, List, Optional

# ⚙️ CONFIGURATION : Remplace par l'ID de ton Google Sheet
# L'ID se trouve dans l'URL : https://docs.google.com/spreadsheets/d/ID_ICI/edit
# Peut aussi être défini via variable d'environnement GOOGLE_SHEET_ID
SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "1kjBwCJfYIy00l18XrjbIgvc9Wwg5xflvSr0fvJoRHJs")

# Nom de l'onglet dans le Sheet (sensible à la casse). Si vide, utilise le premier onglet.
SHEET_TAB = os.getenv("SHEET_TAB", "Films")

# Le Sheet doit être en mode "Tous ceux qui ont le lien peuvent voir" (public en lecture)
def build_url():
    if SHEET_TAB:
        return f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&sheet={SHEET_TAB}"
    return f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json"

SHEET_URL = build_url()

def parse_google_sheets_json(response_text: str, debug: bool = False) -> List[Dict[str, Any]]:
    """Parse la réponse JSON de Google Sheets"""
    cleaned = response_text
    if cleaned.startswith("/*O_o*/"):
        cleaned = cleaned.split("\n", 1)[1]
    prefix = "google.visualization.Query.setResponse("
    suffix = ");"
    if cleaned.startswith(prefix):
        cleaned = cleaned[len(prefix):]
    if cleaned.endswith(suffix):
        cleaned = cleaned[:-len(suffix)]
    data = json.loads(cleaned)

    table = data.get("table", {})
    cols = table.get("cols", [])
    headers_raw = [c.get("label", "") for c in cols]
    rows = table.get("rows", [])

    # Google Sheets renvoie parfois des libellés fusionnés (ex. "titre Out of this World")
    # On utilise le premier mot comme clé (titre, cineaste, date_sortie, etc.)
    def norm_key(h: str) -> Optional[str]:
        s = (h or "").strip()
        return s.split()[0] if s else None

    headers = [norm_key(h) for h in headers_raw]
    if debug:
        print(f"   En-têtes normalisés: {[h for h in headers if h]}")
        print(f"   Nombre de lignes brutes: {len(rows)}")

    films = []
    for row in rows:
        if not row or "c" not in row:
            continue
        cells = row.get("c", [])
        if not cells:
            continue
        film = {}
        for i, key in enumerate(headers):
            if not key:
                continue
            value_cell = cells[i] if i < len(cells) else None
            value = value_cell.get("v") if value_cell else None
            fmt = (value_cell.get("f") or "").strip() if value_cell else ""

            if value is None:
                if key.lower() in ["casting", "nationalites", "categories", "thematiques"]:
                    film[key] = []
                elif key.lower() == "duree_minutes":
                    film[key] = None
                else:
                    film[key] = ""
            else:
                if key.lower() in ["casting", "nationalites", "categories", "thematiques"]:
                    film[key] = [x.strip() for x in str(value).split(",") if x.strip()]
                elif key.lower() in ["date_sortie", "date"]:
                    # Affichage "année seule" (ex. 2025) → on stocke "YYYY" pour que le site ne l’affiche pas en nouveautés
                    if fmt and len(fmt) == 4 and fmt.isdigit():
                        film[key] = fmt
                    elif isinstance(value, (int, float)) and 1900 <= value <= 2100 and value == int(value):
                        film[key] = str(int(value))
                    else:
                        film[key] = str(value)
                else:
                    film[key] = str(value)

        # Le site lit film.status ; si le Sheet a une colonne "Statut", on la mappe vers "status"
        if "Statut" in film:
            film["status"] = film.pop("Statut", "")
        elif "statut" in film and "status" not in film:
            film["status"] = film.pop("statut", "")

        titre = (film.get("titre") or film.get("Titre") or "").strip()
        slug = (film.get("slug") or "").strip()
        # Garder les lignes avec un titre, ou avec un slug (on déduit le titre du slug si besoin)
        if titre:
            films.append(film)
        elif slug:
            # Ligne avec slug mais sans titre (ex. dernières lignes mal parsées) : déduire le titre
            slug_base = slug.replace(".html", "").replace("-", " ").strip()
            if slug_base == "outofthisworld":
                film["titre"] = "Out of this World"
            elif slug_base == "hautefaye":
                film["titre"] = "Hautefaye"
            else:
                film["titre"] = slug_base.title()
            films.append(film)

    return films

def main():
    debug = "--debug" in sys.argv or "-d" in sys.argv
    if debug:
        print(f"🔧 Mode debug")
        print(f"   SHEET_ID: {SHEET_ID}")
        print(f"   Onglet: {SHEET_TAB or '(premier onglet)'}")
        print(f"   URL: {SHEET_URL[:80]}...")

    print("📥 Récupération des données depuis Google Sheets...")

    try:
        response = requests.get(SHEET_URL, timeout=15)
        response.raise_for_status()
        if debug:
            print(f"   Réponse HTTP: {response.status_code}, taille: {len(response.text)} caractères")

        films = parse_google_sheets_json(response.text, debug=debug)

        # Slugs à ne jamais supprimer : si présents dans le JSON local mais pas dans le Sheet, on les garde
        KEEP_SLUGS = {"outofthisworld.html", "hautefaye.html"}
        output_path = os.path.join(os.path.dirname(__file__) or ".", "data", "films.json")
        if os.path.exists(output_path):
            try:
                with open(output_path, "r", encoding="utf-8") as f:
                    existing = json.load(f)
                existing_films = existing.get("films") or []
                sheet_slugs = {f.get("slug", "").strip() for f in films}
                for ef in existing_films:
                    s = (ef.get("slug") or "").strip()
                    if s in KEEP_SLUGS and s not in sheet_slugs:
                        films.append(ef)
                        if debug:
                            print(f"   Conservé (absent du Sheet): {s}")
            except Exception:
                pass

        if not films:
            print("⚠️  Aucun film trouvé dans le Sheet.")
            print("   Vérifie que:")
            print("   - La 1ère ligne contient les en-têtes (dont une colonne 'titre' ou 'Titre')")
            print("   - L’onglet s’appelle bien 'Films' (ou définis SHEET_TAB)")
            print("   - Le partage est 'Tous ceux qui ont le lien peuvent voir'")
            if not debug:
                print("   Relance avec: python3 sync-films-from-sheet.py --debug")
            sys.exit(1)

        output = {"films": films}
        output_path = os.path.join(os.path.dirname(__file__) or ".", "data", "films.json")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print(f"✅ {len(films)} film(s) synchronisé(s) → {output_path}")

    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur réseau: {e}")
        print("   Vérifie ta connexion et que le Sheet est bien public.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erreur: {e}")
        if debug:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
