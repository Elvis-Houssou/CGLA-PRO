from fastapi import Depends, APIRouter, HTTPException, status
from app.models.garage import Garage, GarageCreate, GarageUpdate
from app.models.offer import Offer
from app.models.user import User, UserCreate
from app.dependencies import DbDependency, bcrypt_context, check_superadmin, check_advantage, get_advantage_checker
from typing import Annotated

router = APIRouter(
    prefix="/garages",
    tags=['garages']
)

@router.get('/', status_code=status.HTTP_200_OK)
async def get_all_garages(db: DbDependency, current_user: Annotated[User, Depends(check_superadmin)]):
    """Voir tous les garages"""
    garages = db.query(Garage).all()
    return {
        "message": "Garages récupérés avec succès",
        "data": garages
    }

@router.get("/{user_id}", status_code=status.HTTP_200_OK)
async def get_user_garage(user_id: int, db: DbDependency, current_user: User = Depends(get_advantage_checker("numériser garage"))):
    """Récupère le /les garages d'un utilisateur."""
    garages = db.query(Garage).filter(Garage.user_id == user_id).all()
    if not garages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Garage non trouvé"
        )
    
    return {
        "message": "Garage récupéré avec succès",
        "garage": garages
    }


@router.post('/create', status_code=status.HTTP_201_CREATED)
async def create_garage(db: DbDependency, garage_data: GarageCreate, current_user: User = Depends(get_advantage_checker("numériser garage"))):
    """Créer un garage."""
    new_garage = Garage(
        user_id=current_user.id,
        name=garage_data.name,
        image=garage_data.image,
        city=garage_data.city,
        country=garage_data.country,
        address=garage_data.address
    )
    try:
        db.add(new_garage)
        db.commit()
        db.refresh(new_garage)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'offre: {str(e)}"
        )
    
    return {
        "message": "Garage créé avec succès",
        "data": new_garage
    }


@router.post('/{garage_id}/create/employee', status_code=status.HTTP_201_CREATED)
async def create_user_employee_for_garage(db: DbDependency, garage_id: int, user_data: UserCreate, current_user: User = Depends(get_advantage_checker("numériser garage"))):
    """
        Créer un compte employer pour un garage spécifique.
        Seuls les admin_garage propriétaires du garage peuvent effectuer cette action.
    """
    
    # Vérifier si le garage existe
    garage = db.query(Garage).filter(Garage.id == garage_id).first()
    if not garage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Garage not found"
        )
    
    # Vérifier si l'utilisateur actuel est l'admin du garage
    if garage.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à créer des employés pour ce garage"
        )
    
    # Vérifier si un utilisateur avec le même username ou email existe
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()

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
    
    new_user = User(
        garage_id = garage_id,
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
        can_edit=False
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)  # Rafraîchir pour obtenir les valeurs générées (par exemple, id)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création de l'utilisateur"
        )
    return {
        "message": "User created successfully", 
        "data": { 
            "garage_id": new_user.garage_id,
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

@router.get('/{garage_id}/employee', status_code=status.HTTP_200_OK)
async def get_all_employee_from_garage(db: DbDependency, garage_id: int, current_user: User = Depends(get_advantage_checker("numériser garage"))):
    """Voir tous ses employee"""
    garage = db.query(Garage).filter(Garage.id == garage_id).first()
    if not garage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Garage not found'
        )
    
    try:
        users = db.query(User).filter(User.garage_id == garage_id).all()
        if not users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No employees found"
            )
        return {
            "message": "Employees retrieved successfully",
            "data": users
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving employees: {str(e)}"
        )
    
"""pour quant tu seras pret a mettre les abonnements"""
# @router.post("/")
# def create_garage(garage: GarageCreate, db: DbDependency, user: Dict[str, Any] = Depends(get_benefit_checker("creation_garage"))):
#     # Ici, l'accès est déjà validé : l'user a le benefit "creation_garage"
#     # Crée le garage...
#     new_garage = Garage(**garage.dict(), user_id=user['id'])
#     db.add(new_garage)
#     db.commit()
#     db.refresh(new_garage)
    # return new_garage