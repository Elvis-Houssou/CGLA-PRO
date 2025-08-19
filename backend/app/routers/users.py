from sqlalchemy.future import select
from typing import Annotated, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import Role, User, UserCreate, UserUpdate
from app.models.manager_quota import ManagerQuota
from app.models.wash_record import WashRecord
from app.models.garage import Garage
from datetime import date
from app.dependencies import DbDependency, bcrypt_context, check_manager, check_superadmin, get_current_user
from sqlalchemy.exc import IntegrityError
import logging

# Configurer les logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix = "/user",
    tags= ['user']
)

# @router.post("/create_manager", status_code=status.HTTP_201_CREATED)
# async def create_manager( user_data: UserCreate,db: DbDependency, current_user: Annotated[User, Depends(check_superadmin)]):
#     """Permet au superadmin de créer un utilisateur avec le rôle manager."""
#     logger.info(f"Tentative de création de manager par superadmin : {user_data.username}, {user_data.email}")

#     if user_data.role and user_data.role != Role.manager:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Le rôle doit être 'manager'"
#         )

#     existing_user = db.query(User).where(
#         (User.username == user_data.username) | (User.email == user_data.email)
#     ).first()
#     if existing_user:
#         if existing_user.username == user_data.username:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Nom d'utilisateur déjà pris"
#             )
#         if existing_user.email == user_data.email:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Email déjà utilisé"
#             )

#     new_user = User(
#         username=user_data.username,
#         email=user_data.email,
#         hashed_password=bcrypt_context.hash(user_data.password),
#         firstname=user_data.firstname if user_data.firstname else None,
#         lastname=user_data.lastname if user_data.lastname else None,
#         phone=user_data.phone,
#         age=user_data.age if user_data.age else None,
#         is_verified=False,
#         is_active=True,
#         can_add=True,  # Managers peuvent créer des admin_garage
#         can_edit=False,
#         role=Role.manager
#     )

#     try:
#         db.add(new_user)
#         db.commit()
#         db.refresh(new_user)
#         logger.info(f"Manager créé : {new_user.username}, ID={new_user.id}")
#     except IntegrityError as e:
#         logger.error(f"Erreur d'intégrité : {str(e)}")
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Nom d'utilisateur ou email déjà pris"
#         )
#     except Exception as e:
#         logger.error(f"Erreur lors de la création du manager : {str(e)}")
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Erreur lors de la création du manager"
#         )

#     return {
#         "message": "Manager créé avec succès",
#         "data": {
#             "id": new_user.id,
#             "username": new_user.username,
#             "email": new_user.email,
#             "firstname": new_user.firstname,
#             "lastname": new_user.lastname,
#             "phone": new_user.phone,
#             "age": new_user.age,
#             "role": new_user.role
#         }
#     }

# @router.post("/create_admin_garage", status_code=status.HTTP_201_CREATED)
# async def create_admin_garage(user_data: UserCreate, db: DbDependency, current_user: Annotated[User, Depends(check_manager)]):
#     """Permet au manager de créer un utilisateur avec le rôle admin_garage."""
#     logger.info(f"Tentative de création d'admin_garage par manager : {user_data.username}, {user_data.email}")

#     if user_data.role and user_data.role != Role.admin_garage:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Le rôle doit être 'admin_garage'"
#         )

#     existing_user = db.query(User).where(
#         (User.username == user_data.username) | (User.email == user_data.email)
#     ).first()
#     if existing_user:
#         if existing_user.username == user_data.username:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Nom d'utilisateur déjà pris"
#             )
#         if existing_user.email == user_data.email:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Email déjà utilisé"
#             )

#     new_user = User(
#         username=user_data.username,
#         email=user_data.email,
#         hashed_password=bcrypt_context.hash(user_data.password),
#         firstname=user_data.firstname,
#         lastname=user_data.lastname,
#         phone=user_data.phone,
#         age=user_data.age,
#         is_verified=False,
#         is_active=True,
#         can_add=False,
#         can_edit=False,
#         role=Role.admin_garage
#     )

#     try:
#         db.add(new_user)
#         db.commit()
#         db.refresh(new_user)
#         logger.info(f"Admin_garage créé : {new_user.username}, ID={new_user.id}")
#     except IntegrityError as e:
#         logger.error(f"Erreur d'intégrité : {str(e)}")
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Nom d'utilisateur ou email déjà pris"
#         )
#     except Exception as e:
#         logger.error(f"Erreur lors de la création de l'admin_garage : {str(e)}")
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Erreur lors de la création de l'admin_garage"
#         )

#     return {
#         "message": "Admin_garage créé avec succès",
#         "data": {
#             "id": new_user.id,
#             "username": new_user.username,
#             "email": new_user.email,
#             "firstname": new_user.firstname,
#             "lastname": new_user.lastname,
#             "phone": new_user.phone,
#             "age": new_user.age,
#             "role": new_user.role
#         }
#     }

@router.get("/all", status_code=status.HTTP_200_OK)
async def get_users_with_garage(db: DbDependency, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Récupère tous les utilisateurs."""
    logger.info("Récupération de tous les utilisateurs")
    if current_user['role'] == Role.super_admin:
        users = db.query(User).filter(User.id != current_user['id']).all()
    elif current_user['role'] == Role.manager:
        users = db.query(User).filter(
            User.id != current_user['id'], 
            User.role.in_([Role.admin_garage])
        ).all()
    elif current_user['role'] == Role.admin_garage:
        users = db.query(User).filter(
            User.id != current_user['id'], 
            User.role.in_([Role.employee_garage])
        ).all()
    if not users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun utilisateur trouvé"
        )
    
    return {
        "message": "Liste des utilisateurs récupérée avec succès",
        "users": users
    }

@router.post('/status', status_code=status.HTTP_200_OK)
async def update_user_status(user_id: int, status: bool, db: DbDependency, current_user: Dict[str, Any] = Depends(check_superadmin)):
    """Met à jour le statut d'un utilisateur (actif/inactif)."""
    logger.info(f"Mise à jour du statut de l'utilisateur ID={user_id} à {'actif' if status else 'inactif'}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    user.is_active = status
    db.commit()
    db.refresh(user)
    return {
        "message": "Statut de l'utilisateur mis à jour avec succès",
        "user": user
    }

@router.post('/role', status_code=status.HTTP_200_OK)
async def update_user_role(user_id: int, role: Role, db: DbDependency, current_user: Annotated[User, Depends(check_superadmin)]):
    """Met à jour le rôle d'un utilisateur."""
    logger.info(f"Mise à jour du rôle de l'utilisateur ID={user_id} à {role}")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    user.role = role
    db.commit()
    db.refresh(user)
    return {
        "message": "Rôle de l'utilisateur mis à jour avec succès",
        "user": user
    }

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    logger.info(f"Tentative de création d'utilisateur : {user_data.username}, {user_data.email}")

    # Vérifie si l'utilisateur actuel a les droits nécessaires
    if current_user['role'] not in [Role.super_admin, Role.manager, Role.admin_garage]:
        logger.warning(f"Utilisateur {current_user['username']} n'a pas les droits pour créer un utilisateur.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les droits pour créer un utilisateur."
        )
    existing_user = db.query(User).where(((User.username == user_data.username) | (User.email == user_data.email))).first()
    if existing_user:
        if existing_user.username == user_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nom d'utilisateur déjà pris"
            )
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email déjà utilisé"
            )
    # Vérifie si le champ `role` est envoyé
    if user_data.role:
        if current_user['role'] == Role.super_admin:
            role_to_assign = user_data.role
        elif current_user['role'] == Role.manager:
            role_to_assign = Role.admin_garage  # Les managers ne peuvent créer que des admin_garage
        elif current_user['role'] == Role.admin_garage:
            role_to_assign = Role.employee_garage  # Les admin_garage ne peuvent créer que des employee_garage
    else:
        # Valeur par défaut si non précisé
        role_to_assign = Role.admin_garage  # remplace par "user" ou ce que tu veux comme rôle de base
    
    new_user = User(
        username = user_data.username,
        email = user_data.email,
        hashed_password = bcrypt_context.hash(user_data.password),
        firstname = user_data.firstname if user_data.firstname else None,
        lastname = user_data.lastname if user_data.lastname else None,
        phone = user_data.phone if user_data.phone else None,
        age = user_data.age if user_data.age else None,
        is_verified=False,  # Nécessite une vérification par email
        is_active=True,  # Actif par défaut
        can_add=False,  # Permissions par défaut
        can_edit=False,
        role=role_to_assign  # Rôle par défaut
    )

    # Ajouter et persister dans la base de données
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)  # Rafraîchir pour obtenir les valeurs générées (par exemple, id)
        if current_user['role'] == Role.manager:
            wash_record = WashRecord(
                user_id=current_user['id'],
                wash_date=date.today(),
                wash_id=new_user.id
            )
            db.add(wash_record)

            # Mettre à jour ou créer un quota
            quota = db.query(ManagerQuota).filter(
                ManagerQuota.user_id == current_user['id'],
                ManagerQuota.period_start <= date.today(),
                ManagerQuota.period_end >= date.today()
            ).first()
            logger.info(f"quota recuperer : {quota}")

            if quota:
                quota.quota += 1
            else:
                new_quota = ManagerQuota(
                    user_id=current_user['id'],
                    period_start=date(date.today().year, date.today().month, 1),
                    period_end=date(date.today().year, date.today().month + 1, 1) - date.resolution,
                    quota=1
                )
                db.add(new_quota)
            db.commit()
        
        logger.info(f"Utilisateur créé : {new_user.username}, ID={new_user.id}")
    except Exception as e:
        logger.error(f"Erreur lors de la création de l'utilisateur : {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création de l'utilisateur"
        )
    return {
        "message": "User created successfully", 
        "user": { 
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "firstname": new_user.firstname,
            "lastname": new_user.lastname,
            "phone": new_user.phone,
            "age": new_user.age,
            "role": new_user.role
        }
    }

@router.put("/edit/{user_id}", status_code=status.HTTP_201_CREATED)
async def edit_user(user_id: int, user_data: UserUpdate, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Récupère les informations d'un utilisateur pour l'édition."""
    logger.info(f"Récupération des informations de l'utilisateur ID={user_id} pour édition")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    user.username = user_data.username if user_data.username else user.username
    user.email = user_data.email if user_data.email else user.email
    user.firstname = user_data.firstname if user_data.firstname else user.firstname
    user.lastname = user_data.lastname if user_data.lastname else user.lastname
    user.phone = user_data.phone if user_data.phone else user.phone
    user.age = user_data.age if user_data.age else user.age
    user.hashed_password = bcrypt_context.hash(user_data.password) if user_data.password else user.hashed_password
    user.role = user_data.role if user_data.role else user.role

    try:
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise a jour de l'offre: {str(e)}"
        )
    
    return {
        "message": "Utilisateur modifié avec succès",
        "user": user
    }


@router.post("/create_user_admin", status_code=status.HTTP_201_CREATED)
async def create_user_admin(
    user_data: UserCreate,
    db: DbDependency,
):
    """Créer un utilisateur super admin."""

    # Vérification email ou username existants
    existing_user = db.execute(
        select(User).where(
            (User.email == user_data.email) | (User.username == user_data.username)
        )
    ).scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email ou ce nom d'utilisateur existe déjà."
        )

    # Création du nouvel utilisateur
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=bcrypt_context.hash(user_data.password),
        firstname=user_data.firstname,
        lastname=user_data.lastname,
        phone=user_data.phone,
        age=user_data.age,
        role=Role.super_admin
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'utilisateur admin : {str(e)}"
        )


@router.delete("/delete/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: int, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Supprime un utilisateur."""
    logger.info(f"Tentative de suppression de l'utilisateur ID={user_id}")
    if current_user.role == Role.employee_garage or current_user.role == Role.client_garage:
        # Si l'utilisateur est un employee_garage ou client_garage, il n'a pas les droits pour supprimer un utilisateur
        logger.warning(f"Utilisateur {current_user.username} n'a pas les droits pour supprimer un utilisateur.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les droits pour supprimer un utilisateur."
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    try:
        db.delete(user)
        db.commit()
        logger.info(f"Utilisateur supprimé : {user.username}, ID={user.id}")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de l'utilisateur: {str(e)}"
        )
    
    return {
        "message": "Utilisateur supprimé avec succès"
    }