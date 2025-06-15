from sqlmodel import create_engine
from dotenv import load_dotenv
import os

load_dotenv()

POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password123")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "cgla_db")

DATABASE_URL = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

try:
    engine = create_engine(DATABASE_URL, echo=True)
    with engine.connect() as connection:
        print("Connexion réussie !")
except Exception as e:
    print(f"Erreur de connexion : {e}")