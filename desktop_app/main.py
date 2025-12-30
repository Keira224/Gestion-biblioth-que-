import tkinter as tk
from ui.app_shell import AppShell


def main() -> None:
    root = tk.Tk()
    root.title("Gestion Bibliothèque - Desktop")
    root.geometry("1200x720")
    root.minsize(960, 640)
    AppShell(root)
    root.mainloop()


if __name__ == "__main__":
    main()
