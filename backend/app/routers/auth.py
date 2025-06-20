from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from jose import jwt
from datetime import timedelta
# from app.models.user import User
from dotenv import load_dotenv
from app.dependencies import DbDependency, create_access_token, authenticate_user, get_current_user



load_dotenv(encoding="utf-8")

router = APIRouter(
    prefix = "/auth",
    tags= ['auth']
)

@router.post('/login', status_code=status.HTTP_200_OK)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: DbDependency):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(user.username, user.id, user.role, timedelta(minutes=600))
    return {
        "access_token": token, 
        "token_type": "bearer", 
        "message": "Connexion réussie", 
        'user': {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }


# @router.post("/logout", status_code=status.HTTP_200_OK)
# async def logout(token: str = Depends(oauth2_scheme)):
#     # Ici, tu peux implémenter une logique pour invalider le token (par exemple, ajouter à une liste noire)
#     logger.info("Utilisateur déconnecté")
#     return {"message": "Déconnexion réussie"}

