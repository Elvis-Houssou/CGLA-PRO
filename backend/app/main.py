from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Union
from sqlalchemy import inspect

from app.routers import auth, users, offers, benefits, offer_benefits, subscriptions, garages, manager_quotas

app = FastAPI(title="Système de gestion de lavage auto")

# Configurer le middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Autorise ton frontend
    allow_credentials=True,                   # Autorise les cookies/headers d'authentification
    allow_methods=["*"],                      # Autorise toutes les méthodes (GET, POST, etc.)
    allow_headers=["*"],                      # Autorise tous les headers
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(manager_quotas.router)
app.include_router(offers.router)
app.include_router(benefits.router)
app.include_router(offer_benefits.router)
app.include_router(subscriptions.router)
app.include_router(garages.router)