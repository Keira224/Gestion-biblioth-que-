import tkinter as tk
from tkinter import ttk
from typing import Callable

from ui.theme import COLORS


def make_card(parent: tk.Widget) -> tk.Frame:
    frame = tk.Frame(parent, bg=COLORS["card"], highlightbackground=COLORS["border"], highlightthickness=1)
    return frame


def make_button(parent: tk.Widget, text: str, command: Callable, variant: str = "primary") -> tk.Button:
    color = COLORS["primary"] if variant == "primary" else COLORS["card"]
    fg = "#ffffff" if variant == "primary" else COLORS["text"]
    btn = tk.Button(
        parent,
        text=text,
        command=command,
        bg=color,
        fg=fg,
        activebackground=COLORS["primary_dark"],
        relief="flat",
        padx=12,
        pady=6,
    )
    return btn


def make_table(parent: tk.Widget, columns: list[str]) -> ttk.Treeview:
    tree = ttk.Treeview(parent, columns=columns, show="headings")
    for col in columns:
        tree.heading(col, text=col)
        tree.column(col, anchor="w", width=120)
    return tree
