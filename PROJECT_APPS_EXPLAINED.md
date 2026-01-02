# PROJECT APPS EXPLAINED

This document explains each application in the project, plus the front-end.

## Django apps (back-end)

### users
- Purpose: authentication, profiles, roles (ADMIN, BIBLIOTHECAIRE, LECTEUR).
- Key files: `users/models.py`, `users/views.py`, `users/serializers.py`, `users/urls.py`.
- Notes: role is stored in `users_userprofile` (linked to Django `auth_user`).

### adherents
- Purpose: reader profiles and contact info (adresse, telephone, cotisation).
- Key files: `adherents/models.py`, `adherents/views.py`, `adherents/serializers.py`, `adherents/urls.py`.
- Used by: emprunts, reservations, penalites.

### ouvrages
- Purpose: catalogue management for books, DVDs, and digital resources.
- Key files: `ouvrages/models.py`, `ouvrages/views.py`, `ouvrages/serializers.py`, `ouvrages/urls.py`.
- Features: CRUD, search filters, demandes de livres, ebooks.

### exemplaires
- Purpose: physical copies of ouvrages (code barre, etat).
- Key files: `exemplaires/models.py`, `exemplaires/views.py`, `exemplaires/serializers.py`, `exemplaires/urls.py`.
- Features: add/delete copies, list by ouvrage, available copies.

### emprunts
- Purpose: loans, returns, penalties, reservations, and statistics.
- Key files: `emprunts/models.py`, `emprunts/views.py`, `emprunts/services.py`, `emprunts/serializers.py`, `emprunts/urls.py`.
- Features: create/return loans, retards, penalites, historique, stats dashboard.
- Automation: `python manage.py recalculer_retards`.

### core
- Purpose: shared models and helpers (system parameters, activities, payments, messages).
- Key files: `core/models.py`, `core/views.py`, `core/serializers.py`, `core/api.py`.
- Used by: emprunts, reservations, stats, messaging, payments.

### config
- Purpose: project configuration (settings, URLs, WSGI/ASGI).
- Key files: `config/settings/base.py`, `config/settings/dev.py`, `config/settings/prod.py`, `config/urls.py`.

## Front-end (Next.js)
- Location: `back-end/front-end/`.
- Purpose: UI for Admin, Bibliothecaire, Lecteur dashboards.
- Key areas:
  - Pages: `front-end/src/app/(dash)/...`
  - Components: `front-end/src/components/...`
  - API client: `front-end/src/lib/api.ts`
  - Navigation: `front-end/src/lib/navigation.ts`

## System scripts
- Seed data: `back-end/scripts/seed_demo_clean.py`
- Retards automation: `python manage.py recalculer_retards`
