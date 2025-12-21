# Système de gestion de bibliothèque (Python + SQL)

Prototype minimal d'application bureau respectant le cahier des charges : authentification par rôles (Admin, Bibliothécaire, Lecteur), gestion du catalogue, prêts/retours, réservations et statistiques.

## Technologies
- Python 3
- Tkinter pour l'interface graphique
- SQLAlchemy pour l'accès BD (connexion configurable via `DATABASE_URL`, compatible SQL Server)
- Bcrypt (passlib) pour le hachage des mots de passe

## Installation
```bash
python -m venv .venv
source .venv/bin/activate  # sous Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

Par défaut, l'application crée un fichier SQLite `library.db`. Pour utiliser SQL Server, définir `DATABASE_URL` avant de lancer :
```
export DATABASE_URL="mssql+pyodbc://user:password@host:1433/dbname?driver=ODBC+Driver+17+for+SQL+Server"
```

## Exécution
```
python -m app.main
```
Des comptes de démonstration sont automatiquement créés (login/mot de passe) :
- admin / admin123
- biblio / biblio123
- lecteur / lecteur123

## Fonctionnalités principales
- **Catalogue** : recherche multi-critères, ajout d'ouvrages (Admin)
- **Prêts/retours** : saisie des emprunts et retours, calcul de pénalités
- **Réservations** : les lecteurs peuvent réserver un exemplaire
- **Statistiques (Admin)** : rotation des ouvrages, lecteurs actifs, retards fréquents

## Structure
- `app/db.py` : modèles ORM correspondant au schéma demandé (utilisateurs, adhérents, ouvrages, exemplaires, emprunts, réservations)
- `app/auth.py` : création d'utilisateurs et authentification bcrypt
- `app/services.py` : logique métier (catalogue, prêts, pénalités, statistiques)
- `app/main.py` : interface Tkinter avec tableau de bord selon le rôle

## Remarques
Ce prototype vise à illustrer les concepts du cahier de charges. Pour une mise en production, prévoir la gestion fine des états des exemplaires, des transactions SQL Server et des tests automatisés.
