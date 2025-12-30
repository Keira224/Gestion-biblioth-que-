import os
from dotenv import load_dotenv

from .base import *

load_dotenv(BASE_DIR / ".env.dev")

DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"

DATABASES = {
    "default": {
        "ENGINE": "mssql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT"),
        "OPTIONS": {
            "driver": os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server"),
        },
    }
}
