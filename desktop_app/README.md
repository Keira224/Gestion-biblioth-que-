# Desktop App (Tkinter)

Application desktop inspirée du design web : sidebar fixe, topbar et pages par rôle (ADMIN / BIBLIOTHÉCAIRE / LECTEUR). La version actuelle sert de base UI et structure logique.

## Lancer l'application

```bash
python desktop_app/main.py
```

## Structure

```
desktop_app/
├── main.py
├── db.py
├── README.md
├── DB_CONNECTION.md
├── data/
│   └── navigation.py
└── ui/
    ├── app_shell.py
    ├── pages.py
    ├── theme.py
    └── widgets.py
```

## Fichiers

- `main.py` : point d'entrée de l'application Tkinter.
- `db.py` : helper de connexion SQL Server via `pyodbc`.
- `data/navigation.py` : menus par rôle (même logique que le web).
- `ui/theme.py` : couleurs et dimensions globales (sidebar, cards, etc.).
- `ui/widgets.py` : composants UI réutilisables (cards, boutons, tables).
- `ui/app_shell.py` : layout principal (sidebar + topbar + contenu + rôle actif).
- `ui/pages.py` : pages/écrans pour chaque rôle (placeholders à enrichir).
- `DB_CONNECTION.md` : guide de connexion SQL Server en Python/Tkinter.

## Notes

- Les pages sont des placeholders mais la structure est prête pour brancher la logique métier.
- Les menus suivent la même logique que l'app web actuelle.
