# Front-end – Gestion de Bibliothèque

## Prérequis
- Node.js 18+
- NPM

## Variables d'environnement
Créez un fichier `.env.local` dans `front-end/`:

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Installation
```
cd front-end
npm install
```

## Lancer en développement
```
npm run dev
```

## Pages disponibles par rôle
### ADMIN
- `/admin`
- `/admin/utilisateurs`
- `/admin/ouvrages`
- `/admin/exemplaires`
- `/admin/emprunts`
- `/admin/retards`
- `/admin/penalites`
- `/admin/statistiques`

### BIBLIOTHECAIRE
- `/bibliothecaire`
- `/bibliothecaire/emprunts`
- `/bibliothecaire/retours`
- `/bibliothecaire/retards`
- `/bibliothecaire/penalites`
- `/bibliothecaire/ouvrages`
- `/bibliothecaire/adherents`

### LECTEUR
- `/lecteur`
- `/lecteur/mes-emprunts`
- `/lecteur/mes-penalites`
- `/lecteur/catalogue`
- `/lecteur/profil`
