from dataclasses import dataclass
from typing import Optional

import pyodbc


@dataclass
class SqlServerConfig:
    server: str
    database: str
    user: str
    password: str
    driver: str = "ODBC Driver 17 for SQL Server"


class Database:
    def __init__(self, config: SqlServerConfig) -> None:
        self.config = config
        self.connection: Optional[pyodbc.Connection] = None

    def connect(self) -> pyodbc.Connection:
        if self.connection:
            return self.connection
        conn_str = (
            f"DRIVER={{{self.config.driver}}};"
            f"SERVER={self.config.server};"
            f"DATABASE={self.config.database};"
            f"UID={self.config.user};"
            f"PWD={self.config.password};"
        )
        self.connection = pyodbc.connect(conn_str)
        return self.connection

    def close(self) -> None:
        if self.connection:
            self.connection.close()
            self.connection = None
