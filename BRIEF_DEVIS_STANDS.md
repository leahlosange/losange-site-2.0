# Brief pour devis – Refonte site Les Films du Losange

**Date :** Février 2026  
**Destinataire :** Stands (Bruno)  
**Expéditeur :** Leah Guez (Losange)

---

## 1. Contexte

Les Films du Losange (société de distribution et production de cinéma d'auteur depuis 1962) lance une **refonte complète de son site**.  
Le **Front-end** est géré en interne par Leah. Nous recherchons un **développeur Back-end** pour compléter le projet et assurer l’hébergement / la mise en production.

**Deux sites concernés :**
- **filmsdulosange.com** – site principal
- **depardoncineaste.com** – site dédié Raymond Depardon (lien externe dans le menu)

---

## 2. État actuel de la maquette / prototype

Une **maquette statique fonctionnelle** existe déjà (HTML / CSS / JavaScript), prête à être reliée à un back-end. Cette maquette peut servir de **mockup de référence** pour le chiffrage.

### Arborescence des pages

| Page | URL | Description |
|------|-----|-------------|
| Accueil | `index.html` | Carousel films à l'affiche, sections "à venir" et "catalogue" |
| Nouveautés | `films.html` | Grille des films en sortie / à venir |
| Collections A–Z | `collections-tous.html` | Catalogue complet par ordre alphabétique |
| Collections par cinéaste | `collections-cineaste.html` | Grille 15 cinéastes + liste A–Z, films par réalisateur |
| Collections par thématique | `collections-thematique.html` | Films regroupés par thématique |
| Actualités | `actualites.html` | Flux d’actualités (articles, sorties, festivals) |
| À voir en ligne | `streaming.html` | Films disponibles en SVOD avec liens plateformes |
| À propos | `about.html` | Présentation de la société |
| Contact | `contact.html` | Formulaire + coordonnées |
| **Fiches films** | `Fiches Films/*.html` | **~155 fiches** détaillées par film |

---

## 3. Structure des données

### 3.1 Catalogue films (`data/films.json`)

Chaque film contient notamment :
- `titre`, `cineaste`, `synopsis`
- `casting`, `nationalites`, `thematiques`
- `date_sortie`, `duree_minutes`
- `status` : `actuellement` | `catalogue` | `a venir`
- `categories` : distribution, production, ventes internationales
- `affiche_image`, `affiche_photos`, `bande_annonce_url`
- `kit_materiel` (lien Google Drive)
- `slug` (identifiant unique de la fiche)

**Ordre de grandeur :** ~150–200 films.

### 3.2 Autres sources de données

- **Carousel** (`data/carousel.json`) : 4–6 slides pour l’accueil
- **Actualités** (`data/actualites.json`) : articles avec titre, date, catégorie, extrait, image, URL
- **Streaming** (`data/streaming.json`) : films en SVOD + JustWatch / TMDB
- **Streaming spotlight** (`data/streaming_spotlight.json`) : mise en avant 1 film "à voir en ligne"

---

## 4. Contenu média (ordre de grandeur)

- **Images** : affiches, visuels de fiches films, photos cinéastes
- **Vidéos** : bandes-annonces YouTube
- **PDF** : documents (possiblement dans `document/`)
- **Polices** : Forma DJR (custom)

**Estimation** : données volumineuses (centaines d’images, possibilité de vidéos hébergées).

---

## 5. Fonctionnalités techniques à intégrer / maintenir

| Fonctionnalité | Détail |
|----------------|--------|
| **Recherche** | Recherche films / réalisateurs (front prêt, back à brancher si nécessaire) |
| **Newsletter** | Inscription (ex. Brevo) – backend à configurer |
| **Google Analytics** | GA4 déjà intégré (G-6MVM86CRDW) |
| **SEO** | Meta, Open Graph, structure HTML adaptée |
| **Responsive** | Mobile, tablette, desktop |
| **Lien vers sites tiers** | JustWatch, TMDB, France TV, MUBI, etc. |

---

## 6. Périmètre proposé pour le devis

### Option 2 : Refonte sur l’installation actuelle
- Migration des données (bases WordPress → nouvelle structure)
- Transfert hébergement + licences au Losange
- Intégration du nouveau front (HTML/CSS/JS) dans l’environnement hébergé
- Mise en place d’un **CMS** pour : films, actualités, carousel, streaming

### Option 3 : Prestation complète Stands
- Tout ce qui précède
- Chiffrage global incluant migration, hébergement, maintenance

### Livrables attendus

1. **Migration des données**
   - Export SQL / API depuis WordPress (fiches films, actualités)
   - Conversion vers JSON ou base cible
   - Migration des médias (images, vidéos, PDF)

2. **CMS / back-office**
   - Gestion des films (CRUD)
   - Gestion des actualités
   - Gestion du carousel
   - Gestion de la section "à voir en ligne" (streaming)

3. **Hébergement et déploiement**
   - Hébergement adapté (statique ou hybride)
   - Nom de domaine, SSL, redirections

4. **Documentation et formation**
   - Guide d’utilisation du CMS
   - Procédure de mise à jour

---

## 7. Contraintes et préférences

- **Langue** : site en français (pas de multilingue prévu)
- **Back-office** : accès simple pour l’équipe interne (mise à jour sans compétences techniques poussées)
- **Coûts** : les abonnements plugins/thèmes/hébergement actuels dépassent le budget annuel → recherche d’une solution plus économique

---

## 8. Planning indicatif

- **Délai de réponse** : souhait d’un devis sous 2–3 semaines  
- **Lancement** : à définir après validation du devis

---

## 9. Fichiers et accès pour le chiffrage

- **Mockup / maquette** : site statique disponible sur demande (dossier du projet ou URL de démo)
- **Exemples de structure de données** : `films.json`, `carousel.json`, `actualites.json`, `streaming.json`
- **Données actuelles** : à récupérer sur les sites WordPress (filmsdulosange.com, depardoncineaste.com) – voir accord avec Bruno pour l’accès

---

## 10. Contact

**Leah Guez**  
l.guez@filmsdulosange.fr

Les Films du Losange  
7–9 rue des Petites Écuries  
75010 Paris
