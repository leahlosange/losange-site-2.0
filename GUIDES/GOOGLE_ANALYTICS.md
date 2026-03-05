# Guide Google Analytics (GA4) – Les Films du Losange

## Intégration

Le tag GA4 (ID `G-6MVM86CRDW`) est installé sur toutes les pages du site :
- **Pages principales** : index, films, about, actualités, streaming, contact, catalogue, thématiques
- **Fiches films** : toutes les pages dans `Fiches Films/`

---

## Accéder à Analytics

1. Rendez-vous sur [analytics.google.com](https://analytics.google.com)
2. Connectez-vous avec le compte Google associé à la propriété
3. Sélectionnez la propriété **Les Films du Losange** (ID `G-6MVM86CRDW`)

---

## Rapports utiles

### Rapports temps réel
**Rapports > Temps réel**

- Voir les visiteurs en direct
- Pages vues actuellement
- Géolocalisation des visiteurs
- Utile pour vérifier que le tracking fonctionne après un déploiement

### Acquisition
**Rapports > Acquisition > Acquisition de trafic**

- **Source/Support** : d’où viennent les visiteurs (Google, direct, réseaux sociaux, etc.)
- **Campagnes** : performances des campagnes UTM si vous en utilisez

### Engagement
**Rapports > Engagement > Pages et écrans**

- Pages les plus consultées
- Temps passé par page
- Taux de rebond

---

## Suivre des actions spécifiques (événements)

### Newsletter (Brevo)
Pour mesurer les inscriptions à la newsletter, ajoutez un appel `gtag` après validation du formulaire :

```javascript
gtag('event', 'newsletter_signup', {
  method: 'popup'  // ou 'footer', 'page_contact', etc.
});
```

### Clics importants
Exemples : bouton « Voir en streaming », liens externes, téléchargement de dossiers de presse :

```javascript
gtag('event', 'click', {
  event_category: 'streaming',
  event_label: 'nom-du-film'
});
```

### Téléchargements
```javascript
gtag('event', 'file_download', {
  file_name: 'dossier-presse-film.pdf'
});
```

---

## Bonnes pratiques

1. **Attendre 24–48 h** après installation pour des données fiables
2. **Consulter régulièrement** Acquisition et Engagement pour ajuster le contenu
3. **Comparer les mois** pour suivre l’évolution du trafic
4. **Créer des conversions** dans Admin > Événements : marquez les événements importants (ex. `newsletter_signup`) comme conversions

---

## Vérifier que ça fonctionne

1. Ouvrez le site en navigation privée
2. Allez dans Analytics > Temps réel
3. Si vous apparaissez en tant que visiteur actif, le tracking fonctionne
