# Comment alimenter la page Actualités

La page **Actualités** (`actualites.html`) est alimentée par le fichier **`data/actualites.json`**. Pour ajouter ou modifier des articles, il suffit d’éditer ce fichier.

## Renvoyer vers un article externe (recommandé)

Chaque article peut pointer vers **n’importe quelle URL** (article de presse, site de festival, AlloCiné, etc.). Le lien s’ouvre dans un **nouvel onglet** pour les URLs externes.

### Structure d’un article dans `data/actualites.json`

```json
{
  "title": "TITRE EN MAJUSCULES (affiché tel quel)",
  "date": "10 décembre 2025",
  "category": "sortie en salles",
  "excerpt": "Un court résumé ou extrait affiché sous le titre.",
  "url": "https://www.example.com/article",
  "image": "images/films/mon-film.jpg",
  "featured": false
}
```

| Champ      | Obligatoire | Description |
|-----------|-------------|-------------|
| `title`   | oui         | Titre de l’article (en majuscules si vous voulez le style actuel). |
| `date`    | oui         | Date affichée (ex. "10 décembre 2025"). |
| `category`| oui         | Catégorie : "sortie en salles", "festival", "rétrospective", "annonce", "restauration", etc. |
| `excerpt` | oui         | Court texte sous le titre (une ou deux phrases). |
| `url`     | oui         | Lien vers l’article. **URL externe** → ouverture dans un nouvel onglet. |
| `image`   | recommandé  | Chemin vers l’image (relative : `images/...` ou URL complète). |
| `featured`| non         | `true` pour un seul article = mis « à la une » en haut de page. Par défaut le premier de la liste est à la une. |
| `date_iso`| recommandé  | Date au format **YYYY-MM-DD** (ex. `2026-02-02`) pour le tri. Sur la homepage, les actualités s’affichent du **plus récent au plus ancien** grâce à ce champ. |

### Exemple : ajouter un lien vers un article des Inrocks

```json
{
  "title": "LE CRI DES GARDES : CLAIRE DENIS À CANNES",
  "date": "18 mai 2026",
  "category": "festival",
  "excerpt": "Le nouveau film de Claire Denis présenté en compétition à Cannes.",
  "url": "https://www.lesinrocks.com/cinema/le-cri-des-gardes-claire-denis-2026/",
  "image": "images/films/cridesgardes.jpg",
  "featured": false,
  "date_iso": "2026-05-18"
}
```

Ajoutez ce bloc dans le tableau `"articles"` de `data/actualites.json` (après une virgule, avant le `]` final). L’ordre du tableau = ordre d’affichage (le premier ou celui avec `"featured": true` est en « à la une »).

## Écrire un article à la main (sans lien externe)

Si vous n’avez pas encore de lien à mettre :

- Mettez `"url": "#"` pour que le lien ne mène nulle part (ou une future page interne).
- Rédigez `title`, `date`, `category` et `excerpt` comme d’habitude.

Exemple :

```json
{
  "title": "NOTRE PROCHAIN ÉVÉNEMENT",
  "date": "1 mars 2026",
  "category": "événement",
  "excerpt": "Texte de votre actualité rédigé à la main. Il s’affichera sous le titre sur la page.",
  "url": "#",
  "image": "images/evenement.jpg",
  "featured": false
}
```

## Résumé

1. Ouvrir **`data/actualites.json`**.
2. Dans le tableau **`articles`**, ajouter un objet avec `title`, `date`, `category`, `excerpt`, `url`, `image` (et optionnellement `featured`).
3. Pour un **lien vers le web** : mettre l’URL complète dans `url` → le lien s’ouvrira dans un nouvel onglet.
4. Sauvegarder le fichier et recharger la page Actualités.

Aucun déploiement particulier : le site charge le JSON au chargement de la page.
