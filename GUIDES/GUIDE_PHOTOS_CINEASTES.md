# Guide : Photos des Cinéastes

## Structure des photos

Les photos des cinéastes doivent être placées dans le dossier :
```
images/cineastes/
```

## Nomenclature des fichiers

Le nom du fichier doit correspondre au nom du cinéaste normalisé (slug) :

| Cinéaste | Nom du fichier |
|----------|----------------|
| Éric Rohmer | `eric-rohmer.jpg` |
| Jim Jarmusch | `jim-jarmusch.jpg` |
| BI Gan | `bi-gan.jpg` |
| Joachim Lafosse | `joachim-lafosse.jpg` |
| Claire Denis | `claire-denis.jpg` |
| Pascal Bonitzer | `pascal-bonitzer.jpg` |
| Kristen Stewart | `kristen-stewart.jpg` |
| Nadav Lapid | `nadav-lapid.jpg` |
| Christian Petzold | `christian-petzold.jpg` |
| Mia Hansen-Løve | `mia-hansen-love.jpg` |
| Arnaud Desplechin | `arnaud-desplechin.jpg` |
| Alain Guiraudie | `alain-guiraudie.jpg` |
| Mati Diop | `mati-diop.jpg` |
| Jacques Rivette | `jacques-rivette.jpg` |
| Patricia Mazuy | `patricia-mazuy.jpg` |

## Règles de normalisation

- Tout en minuscules
- Les espaces deviennent des tirets `-`
- Les accents sont supprimés : `é` → `e`
- Les caractères spéciaux sont supprimés
- Les tirets multiples sont réduits à un seul

### Exemples :
- `Éric Rohmer` → `eric-rohmer`
- `Mia Hansen-Løve` → `mia-hansen-love`
- `BI Gan` → `bi-gan`

## Format recommandé

- **Format** : JPG ou PNG
- **Ratio** : 3:4 (portrait)
- **Résolution** : min. 400x533px
- **Poids** : max. 200KB par image
- **Style** : Photo en noir et blanc ou couleur, fond neutre de préférence

## Image par défaut

Si une photo n'est pas trouvée, l'image par défaut sera utilisée :
```
images/placeholder-cineaste.jpg
```

Créez cette image avec un fond neutre (par exemple un carré gris avec une icône de personne).

## Comment ajouter une nouvelle photo

1. Récupérez une photo du cinéaste
2. Redimensionnez-la au format 3:4 (ex: 400x533px)
3. Normalisez le nom selon les règles ci-dessus
4. Placez le fichier dans `images/cineastes/`
5. Le système détectera automatiquement la photo !

## Vérifier qu'une photo existe

Ouvrez la page "Catalogue > Par cinéaste" dans votre navigateur. Si une photo n'apparaît pas, vérifiez :
1. Que le fichier existe dans `images/cineastes/`
2. Que le nom correspond exactement au format normalisé
3. Que l'extension est `.jpg` (minuscule)
