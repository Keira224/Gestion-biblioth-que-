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

## Comment tester rapidement ?
1. **Vérifier la syntaxe** :
   ```bash
   python -m compileall app
   ```
2. **Lancer l'application en local** (SQLite par défaut) :
   ```bash
   python -m app.main
   ```
   Connectez-vous avec l'un des comptes de démonstration, créez un emprunt (onglet "Prêts/Retours" avec l'ID adhérent = 1 et l'ID exemplaire = 1 ou 2), puis testez un retour pour voir le calcul de pénalité affiché.
3. **Tester avec SQL Server** :
   - Installez le driver ODBC 17 pour SQL Server sur votre machine.
   - Exportez l'URL de connexion avant de lancer l'app :
     ```bash
     export DATABASE_URL="mssql+pyodbc://user:password@host:1433/dbname?driver=ODBC+Driver+17+for+SQL+Server"
     python -m app.main
     ```
   - Au démarrage, le schéma est créé automatiquement et les données de démonstration sont injectées si la base est vide.

## Remarques
Ce prototype vise à illustrer les concepts du cahier de charges. Pour une mise en production, prévoir la gestion fine des états des exemplaires, des transactions SQL Server et des tests automatisés.
