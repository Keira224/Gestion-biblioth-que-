# Connexion SQL Server (Python + Tkinter)

Ce guide explique comment connecter l'application Tkinter à SQL Server via `pyodbc`.

## Pré-requis

- SQL Server installé et accessible (localhost ou serveur distant)
- Driver ODBC 17 (ou 18) installé
- Paquet Python `pyodbc`

Installation :
```bash
pip install pyodbc
```

## Exemple d'utilisation

```python
from desktop_app.db import Database, SqlServerConfig

config = SqlServerConfig(
    server="127.0.0.1",
    database="BibliothequeDB",
    user="sa",
    password="YourStrongPassword",
    driver="ODBC Driver 17 for SQL Server",
)

db = Database(config)
connection = db.connect()

cursor = connection.cursor()
cursor.execute("SELECT TOP 10 username, email FROM auth_user")
rows = cursor.fetchall()
for row in rows:
    print(row.username, row.email)

connection.close()
```

## Intégration dans Tkinter

- Créer une instance `Database` au démarrage.
- Stocker la connexion dans le `AppShell` ou un service global.
- Utiliser des méthodes dédiées pour récupérer les données et alimenter les tableaux.

## Bonnes pratiques

- Utiliser des requêtes paramétrées pour éviter les injections SQL.
- Fermer la connexion à la fermeture de l'application.
- Centraliser la configuration dans un fichier `.env` si besoin.
