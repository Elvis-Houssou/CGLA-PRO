"""Configuration de la base de données PostgreSQL."""
# from sqlalchemy import create_engine
from sqlmodel import create_engine, SQLModel
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Charger les variables d'environnement depuis le fichier .env
load_dotenv(encoding="utf-8")

# Récupérer les identifiants de la base de données depuis les variables d'environnement
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgree2000")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "cgla_db")

# Construire l'URL de la base de données
DATABASE_URL = (
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

# Créer le moteur de connexion à la base de données
engine = create_engine(DATABASE_URL, echo=True) # echo=True pour le débogage, à désactiver en production

# Créer une factory pour les sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Fonction pour initialiser la base de données (créer les tables)
def init_db():
    SQLModel.metadata.create_all(engine)