# Front-end Bibliothèque

Interface Next.js (App Router) pour la gestion de bibliothèque. Elle consomme l'API Django DRF via JWT.

## Prérequis

- Node.js 18+
- Back-end disponible (Django DRF)

## Variables d'environnement

Créer un fichier `.env.local` dans `front-end/` :

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Installation & lancement

```bash
cd front-end
npm install
npm run dev
```

## Pages par rôle

### ADMIN
- `/admin` : tableau de bord
- `/admin/utilisateurs`
- `/admin/ouvrages`
- `/admin/exemplaires`
- `/admin/emprunts`
- `/admin/retards`
- `/admin/penalites`
- `/admin/reservations`
- `/admin/statistiques`

### BIBLIOTHÉCAIRE
- `/bibliothecaire` : tableau de bord
- `/bibliothecaire/emprunts`
- `/bibliothecaire/retours`
- `/bibliothecaire/retards`
- `/bibliothecaire/penalites`
- `/bibliothecaire/reservations`
- `/bibliothecaire/ouvrages`
- `/bibliothecaire/adherents`

### LECTEUR
- `/lecteur` : tableau de bord
- `/lecteur/mes-emprunts`
- `/lecteur/mes-penalites`
- `/lecteur/catalogue`
- `/lecteur/profil`

## Authentification

- `POST /api/auth/token/` : récupération des tokens JWT
- `GET /api/auth/me/` : récupération du profil utilisateur

Les tokens sont stockés en `localStorage` et ajoutés à chaque requête via Axios.

## Notes techniques

- Utilisation des endpoints existants (`/api/catalogue/ouvrages/`, `/api/emprunts/retards/`, etc.).
- Toutes les pages affichent un état de chargement et des erreurs lisibles.
