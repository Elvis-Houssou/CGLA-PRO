from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated, Dict, Any, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_
from dotenv import load_dotenv
from app.database import SessionLocal
from app.models.user import User, RoleUser
from app.models.employee import RoleEmployee, Employee
from app.models.subscription import Subscription, Status
from app.models.benefit import Benefit
from app.models.car_wash import CarWash
from app.models.car_wash_employee import CarWashEmployee
from app.models.offer_benefit import OfferBenefit
from pydantic import BaseModel

import os
from fastapi import APIRouter, Request

load_dotenv(encoding="utf-8")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/login")
bearer_scheme = HTTPBearer()
router = APIRouter()

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
        user = db.query(Employee).where((Employee.username == identifier) | (Employee.email == identifier)).first()
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


def create_access_token(user: BaseModel, expires_delta: timedelta = None):
    """Crée un token JWT."""
    encode = {'email': user.email, 'firstname': user.firstname, 'lastname': user.lastname, 'phone': user.phone, 'username': user.username, 'id': user.id, 'role': user.role, 'is_active': user.is_active}
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    encode.update({"exp": expire})
    encoded_jwt = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_access_token(token: str) -> Dict[str, Any]:
    """decoder un token JWT."""
    decoded_jwt = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
    return decoded_jwt


# def get_current_user(token: Annotated[str, Depends(oauth2_bearer)], db: DbDependency) -> User:
#     """Récupère l'utilisateur actuel à partir du token JWT."""
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         identifier: str = payload.get('email')
#         username: str = payload.get('username')
#         user_id: int = payload.get('id')
#         role: str = payload.get('role')
#         if None in (identifier, user_id, role):
#             raise credentials_exception
#     except JWTError:
#         raise credentials_exception
    
#     user = db.query(User).where((User.username == username) | (User.email == identifier)).first()
#     if user is None:
#         raise credentials_exception
#     return user

# def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> Dict[str, Any]:
async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)) -> Dict[str, Any]:
    """Récupère l'utilisateur actuel à partir du token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token incorrect ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        user_data = get_access_token(token)
        if not user_data:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    return user_data

def check_superadmin(current_user: Dict[str, Any] = Depends(get_current_user)):
    # Vérifie que l'utilisateur est actif
    if not current_user['is_active']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    if current_user['role'] != RoleUser.super_admin:
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
    if current_user.role != RoleUser.system_manager:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Privilèges de manager requis"
        )
    return current_user

def check_advantage(db: DbDependency, current_user: Dict[str, Any] = Depends(get_current_user), required_benefit: str = None):
    """Vérifie si l'utilisateur a un abonnement actif avec l'avantage requis."""
    # Vérifier si l'utilisateur est un propriétaire de lavage
    if current_user['role'] != RoleUser.station_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les propriétaires de station lavage peuvent accéder à cette fonctionnalité"
        )
    
    # Récupérer l'abonnement actif
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user['id'],
        Subscription.status == Status.ACTIVE,
        or_(Subscription.end_date.is_(None), Subscription.end_date >= datetime.now(timezone.utc))
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Aucun abonnement actif trouvé"
        )
    
    # Vérifier si le benefit requis est lié à l'offre (join sur offer_benefit et benefit)
    has_benefit = db.query(Benefit).join(
        OfferBenefit, OfferBenefit.benefit_id == Benefit.id
    ).filter(
        OfferBenefit.offer_id == subscription.offer_id,
        Benefit.permission_name == required_benefit  # Assure-toi que 'name' est unique pour les benefits
    ).first()
    
    if not has_benefit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"L'abonnement ne permet pas l'accès à la fonctionnalité : {required_benefit}"
        )
    
    return current_user

def get_benefit_checker(required_benefit: str):
    """Factory pour créer un checker spécifique à un benefit."""
    def checker(db: DbDependency, current_user: Dict[str, Any] = Depends(get_current_user)):
        return check_advantage(db, current_user, required_benefit)
    return checker

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
    
def check_garage_access(db: DbDependency, current_user: Dict[str, Any] = Depends(get_current_user), wash_id: Optional[int] = None):
    """Vérifie l'accès au garage pour station_owner ou station_manager."""
    if current_user['role'] not in [RoleUser.station_owner, RoleEmployee.station_manager]:
        raise HTTPException(403, "Rôle non autorisé pour accéder à un garage")

    if current_user['role'] == RoleUser.station_owner:
        # Vérifier si le garage appartient au propriétaire
        car_wash = db.query(CarWash).filter(CarWash.id == wash_id, CarWash.user_id == current_user['id']).first()
        if not car_wash:
            raise HTTPException(403, "Vous n'êtes pas propriétaire de ce garage")
        # Vérifier le benefit (ex. pour gestion_stock ou autres)
        check_advantage(db, current_user, required_benefit="gestion_stock")
    
    elif current_user['role'] == RoleEmployee.station_manager:
        # Vérifier assignation a la station lavage
        assignment = db.query(CarWashEmployee).filter(
            CarWashEmployee.car_wash_id == wash_id,
            CarWashEmployee.employee_id == current_user['id']
        ).first()
        if not assignment:
            raise HTTPException(403, "Vous n'êtes pas assigné à ce garage")
        # Vérifier que le propriétaire du garage a le benefit nécessaire
        car_wash = db.query(CarWash).filter(CarWash.id == wash_id).first()
        if car_wash:
            owner = db.query(User).filter(User.id == car_wash.user_id).first()
            if owner:
                check_advantage(db, {
                    'id': owner.id,
                    'role': owner.role,
                    'is_active': owner.is_active,
                    'email': owner.email,
                    'firstname': owner.firstname,
                    'lastname': owner.lastname,
                    'phone': owner.phone,
                    'username': owner.username
                }, required_benefit="gestion_stock")
    
    return current_user

def check_stock_access(db: DbDependency, current_user: Dict[str, Any] = Depends(get_current_user), wash_id: int = None):
    """Vérifie l'accès à la gestion de stock pour une station lavage."""
    if current_user['role'] not in [RoleUser.station_owner, RoleEmployee.station_manager]:
        raise HTTPException(403, "Rôle non autorisé")
    
    # Pour propriétaire : Check benefit
    if current_user['role'] == RoleUser.station_owner:
        check_advantage(db, current_user, "stock_managment")
        # Vérifie si c'est le propriétaire du garage
        car_wash = db.query(CarWash).filter(CarWash.id == wash_id, CarWash.user_id == current_user['id']).first()
        if not car_wash:
            raise HTTPException(403, "Non propriétaire du garage")
    
    # Pour employé : Vérifie assignation au garage (pas de benefit perso)
    elif current_user['role'] == RoleEmployee.station_manager:
        assignment = db.query(CarWashEmployee).filter(
            CarWashEmployee.car_wash_id == wash_id,
            CarWashEmployee.employee_id == current_user['id']
        ).first()
        if not assignment:
            raise HTTPException(403, "Non assigné à ce garage")
    
    return current_user