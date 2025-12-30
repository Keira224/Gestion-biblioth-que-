# Système de gestion de bibliothèque

## A) Visualiser les données Django dans SQL Server (SSMS)

### 1) Identifier la base utilisée par Django
1. Ouvrir `config/settings/dev.py` et vérifier `DB_NAME`, `DB_HOST`, etc.
2. Dans SSMS, se connecter au serveur SQL Server (`DB_HOST`) puis ouvrir la base `DB_NAME`.

### 2) Tables utiles
- Utilisateurs Django : `auth_user`
- Profil/roles : `users_userprofile`
- Lecteurs (adherents) : `adherents_adherent`
- Ouvrages : `ouvrages_ouvrage`
- Exemplaires : `exemplaires_exemplaire`
- Emprunts : `emprunts_emprunt`
- Pénalités : `emprunts_penalite`
- Réservations : `emprunts_reservation`
- Demandes de livres : `ouvrages_demandelivre`
- E-books : `ouvrages_ebook`
- Paiements : `core_paiement`

### 3) Requêtes SSMS utiles

1. **Lister toutes les tables**
```sql
SELECT TABLE_SCHEMA, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_SCHEMA, TABLE_NAME;
```

2. **Voir les utilisateurs Django**
```sql
SELECT id, username, email, is_active, date_joined
FROM auth_user
ORDER BY id DESC;
```

3. **Voir les rôles/profils**
```sql
SELECT u.username, p.role
FROM users_userprofile p
JOIN auth_user u ON u.id = p.user_id
ORDER BY u.username;
```

4. **Voir emprunts + pénalités**
```sql
SELECT e.id AS emprunt_id, u.username, ex.code_barre, e.statut, p.montant, p.payee
FROM emprunts_emprunt e
JOIN adherents_adherent a ON a.id = e.adherent_id
JOIN auth_user u ON u.id = a.user_id
JOIN exemplaires_exemplaire ex ON ex.id = e.exemplaire_id
LEFT JOIN emprunts_penalite p ON p.emprunt_id = e.id
ORDER BY e.id DESC;
```

5. **Voir réservations**
```sql
SELECT r.id, u.username, o.titre, r.date_debut, r.date_fin, r.statut, r.montant_estime
FROM emprunts_reservation r
JOIN adherents_adherent a ON a.id = r.adherent_id
JOIN auth_user u ON u.id = a.user_id
JOIN ouvrages_ouvrage o ON o.id = r.ouvrage_id
ORDER BY r.id DESC;
```

---

## B) Stratégie DEV (SQL Server) / PROD (PostgreSQL)

### Structure multi-environnements
Les settings sont séparés :
- `config/settings/base.py`
- `config/settings/dev.py`
- `config/settings/prod.py`

Par défaut, le projet utilise `config.settings.dev`. En production, définir :
```bash
export DJANGO_SETTINGS_MODULE=config.settings.prod
```

### Variables d'environnement
Créer :
- `.env.dev` (SQL Server)
- `.env.prod` (PostgreSQL)

**Exemple `.env.dev`**
```bash
DJANGO_DEBUG=True
DB_NAME=BibliothequeDB
DB_USER=sa
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=1433
DB_DRIVER=ODBC Driver 17 for SQL Server
```

**Exemple `.env.prod`**
```bash
DJANGO_DEBUG=False
PG_NAME=bibliotheque_prod
PG_USER=bibliotheque_user
PG_PASSWORD=strong_password
PG_HOST=127.0.0.1
PG_PORT=5432
```

### Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Migration des données (si nécessaire)
- Utiliser `dumpdata` / `loaddata` pour déplacer les données entre bases.
- **Ne pas** exporter des mots de passe en clair (Django stocke des hashes).

```bash
python manage.py dumpdata --exclude auth.permission --exclude contenttypes > data.json
python manage.py loaddata data.json
```

### Déploiement local “prod-like” (optionnel)
- Lancer PostgreSQL local (Docker conseillé).
- Variables `.env.prod` + `DJANGO_SETTINGS_MODULE=config.settings.prod`.
- Lancer Django + Next.js localement.

### Agnostic DB
- Éviter le SQL brut spécifique SQL Server.
- Utiliser l’ORM Django (déjà le cas dans ce repo).

---

## C) Seed demo

Un script de seed est disponible :
```bash
python scripts/seed_demo_clean.py
```

Il crée :
- 1 admin, 1 bibliothécaire, 2 lecteurs
- 5 ouvrages, 2 e-books
- 3 réservations, 2 demandes de livre
- 1 paiement simulé

---

## D) Front-end

Voir `front-end/README.md` pour les routes et les variables `NEXT_PUBLIC_API_BASE_URL`.
