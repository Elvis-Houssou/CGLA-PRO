from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from app.database import SessionLocal
from app.models.user import User, Role
from app.models.subscription import Subscription, Status
from app.models.benefit import Benefit
from app.models.offer_benefit import OfferBenefit

import os

load_dotenv(encoding="utf-8")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_db():
    """Crée et gère une session de base de données."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

DbDependency = Annotated[Session, Depends(get_db)]


def authenticate_user(db: Session, identifier: str, password: str):
    """Authentifie un utilisateur."""
    user = db.query(User).where((User.username == identifier) | (User.email == identifier)).first()
    if not user: 
        return False 
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utilisateur inactif"
        )
    if not bcrypt_context.verify(password, user.hashed_password):
        return None
    
    return user


def create_access_token(username: str, user_id: int, role: str, expires_delta: timedelta = None):
    """Crée un token JWT."""
    encode = {'sub': username, 'id': user_id, 'role': role}
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    encode.update({"exp": expire})
    encoded_jwt = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: Annotated[str, Depends(oauth2_bearer)], db: DbDependency) -> User:
    """Récupère l'utilisateur actuel à partir du token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        identifier: str = payload.get('sub')
        user_id: int = payload.get('id')
        role: str = payload.get('role')
        if None in (identifier, user_id, role):
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).where((User.username == identifier) | (User.email == identifier)).first()
    if user is None:
        raise credentials_exception
    return user


def check_superadmin(db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    # Vérifie que l'utilisateur est actif
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    if current_user.role != Role.super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin privileges required"
        )
    return current_user

def check_manager(db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Vérifie que l'utilisateur est un manager actif."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utilisateur inactif"
        )
    if current_user.role != Role.manager:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Privilèges de manager requis"
        )
    return current_user

def check_advantage(db: DbDependency, user: User = Depends(get_current_user), required_advantage: str = None):
    """Vérifie si l'utilisateur a un abonnement actif avec l'avantage requis."""
    # Vérifier si l'utilisateur est un admin_garage
    if user.role != Role.admin_garage:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les admin_garage peuvent accéder à cette fonctionnalité"
        )
    
    # Récupérer l'abonnement actif
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user.id,
        Subscription.status == Status.ACTIVE
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Aucun abonnement actif trouvé"
        )
    
    # Récupérer les avantages associés à l'offre
    advantages = db.query(Benefit.name).join(
        OfferBenefit, OfferBenefit.benefit_id == Benefit.id
    ).filter(
        OfferBenefit.offer_id == subscription.offer_id
    ).all()
    
    advantage_names = [adv.name for adv in advantages]
    
    # Vérifier si l'avantage requis est présent
    if required_advantage not in advantage_names:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"L'abonnement ne permet pas l'accès à la fonctionnalité : {required_advantage}"
        )
    
    return user

def get_advantage_checker(required_advantage: str):
    def checker(db: DbDependency, current_user: User = Depends(get_current_user)):
        return check_advantage(db, current_user, required_advantage)
    return checker


def check_subscription_status(subscription: Subscription):
    """
    Vérifie l'état de l'abonnement.
    
    :param subscription: L'objet Subscription à vérifier
    :return: "active" si l'abonnement est actif, "expired" si expiré, "pending" si en attente
    """
    if subscription.status == Status.PENDING:
        return "pending"
    elif subscription.end_date and subscription.end_date < datetime.now():
        return "expired"
    elif subscription.status == Status.ACTIVE:
        return "active"
    else:
        return "inactive"