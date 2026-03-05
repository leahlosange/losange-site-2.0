# Newsletter : intégration Brevo (pop-up + Netlify)

Le pop-up newsletter du site envoie les inscriptions vers **Brevo** (ex-Sendinblue) via une fonction serverless Netlify, sans exposer la clé API dans le navigateur.

## 1. Côté Brevo

1. Créez une **liste** (ex. « Newsletter site Losange ») dans Brevo : **Contacts > Listes**.
2. Notez l’**ID de la liste** (visible dans l’URL ou les paramètres de la liste).
3. Générez une **clé API v3** : **Paramètres > SMTP & API > Clés API** → Créer une clé API.

## 2. Déploiement Netlify

1. Déployez le site sur **Netlify** (connexion au dépôt Git ou import du dossier).
2. Dans **Paramètres du site > Variables d’environnement**, ajoutez :
   - **BREVO_API_KEY** : votre clé API Brevo (v3).
   - **BREVO_LIST_IDS** (optionnel) : IDs des listes séparés par des virgules, ex. `2` ou `2,5`.  
     Si vide, le contact est créé sans être ajouté à une liste (vous pourrez l’ajouter manuellement ou via une automation Brevo).

3. Redéployez après avoir enregistré les variables.

## 3. Comportement

- Le formulaire du pop-up envoie **email** (obligatoire), **prénom** et **nom** (facultatifs).
- La fonction `netlify/functions/newsletter.js` appelle l’API Brevo `POST /v3/contacts` avec `updateEnabled: true` (mise à jour si l’email existe déjà).
- En cas de succès : message « Merci, vous êtes inscrit·e » puis fermeture du pop-up.
- En cas d’erreur (email invalide, erreur Brevo, etc.) : un message d’erreur s’affiche sous le bouton.

## 4. Hébergement autre que Netlify

Si vous n’utilisez pas Netlify, vous pouvez :

- Créer une **fonction équivalente** (Vercel, AWS Lambda, etc.) qui reçoit `POST` avec `email`, `prenom`, `nom` et appelle `https://api.brevo.com/v3/contacts` avec votre clé API.
- Adapter dans `script.js` l’URL utilisée dans le `fetch` (remplacer `/.netlify/functions/newsletter` par l’URL de votre fonction).

En **local** (`file://` ou serveur sans fonctions), l’appel échouera : le pop-up affichera « Connexion impossible. Réessayez plus tard. » C’est normal ; après déploiement sur Netlify avec les variables configurées, l’inscription fonctionnera.
