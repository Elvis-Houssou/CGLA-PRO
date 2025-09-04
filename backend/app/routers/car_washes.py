from fastapi import Depends, APIRouter, HTTPException, status
from app.models.car_wash import CarWash, CarWashCreate, CarWashUpdate
from app.models.car_wash_employee import CarWashEmployee
from app.models.user import RoleUser
from app.models.employee import Employee, RoleEmployee, EmployeeCreate
from app.models.offer import Offer
from app.models.user import User, UserCreate
from app.dependencies import DbDependency, bcrypt_context, create_access_token, check_superadmin, check_advantage, get_advantage_checker, get_current_user
from typing import Annotated, Dict, Any, List
from copy import deepcopy
from pydantic import BaseModel
from datetime import timedelta

router = APIRouter(
    prefix="/car-wash",
    tags=['CarWashes']
)

@router.get('/', status_code=status.HTTP_200_OK)
async def get_all_stations(db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Voir tous les lavages de l'utilisateur connecté."""

    if current_user['role'] != 'station_owner':
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vous n'êtes pas autorisé à voir tous les lavages"
        )
    car_wash = db.query(CarWash).filter(CarWash.user_id == current_user['id']).all()
    return {
        "message": "Lavages récupérés avec succès",
        "data": car_wash
    }

@router.get("/{wash_id}", status_code=status.HTTP_200_OK)
async def get_one_station_info(wash_id: int, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Récupère les information d'un lavage de l'utilisateur connecté"""
    car_wash = db.query(CarWash).filter(CarWash.id == wash_id).first()

    if not car_wash:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lavage non trouvé"
        )
    car_wash_employees = db.query(CarWashEmployee).filter(CarWashEmployee.car_wash_id == car_wash.id).all()

    employees = []
    for employee in car_wash_employees:
        employee_info = db.query(Employee).filter(Employee.id == employee.employee_id).first()
        employees.append(employee_info)
    
    return {
        "message": "Lavage récupéré avec succès",
        "lavage": car_wash,
        "employees": employees
    }


@router.post('/create', status_code=status.HTTP_201_CREATED)
async def create_station(db: DbDependency, washing_data: CarWashCreate, current_user: Annotated[User, Depends(get_current_user)]):
    """Créer un lavage."""
    new_station = CarWash(
        user_id=current_user['id'],
        name=washing_data.name,
        image=washing_data.image,
        city=washing_data.city,
        country=washing_data.country,
        address=washing_data.address
    )
    try:
        db.add(new_station)
        db.commit()
        db.refresh(new_station)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'offre: {str(e)}"
        )
    
    return {
        "message": "Lavage créé avec succès",
        "data": new_station
    }


@router.post('/create/{wash_id}/employee', status_code=status.HTTP_201_CREATED)
async def create_user_employee_for_station(db: DbDependency, wash_id: int, user_data: EmployeeCreate, current_user: Annotated[User, Depends(get_current_user)]):
    """
        Créer un compte employer pour un lavage spécifique.
        Seuls les station_owner propriétaires du lavage peuvent effectuer cette action.
    """
    
    # Vérifier si le lavage existe
    car_wash = db.query(CarWash).filter(CarWash.id == wash_id).first()
    if not car_wash:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lavage not found"
        )
    
    # Vérifier si l'utilisateur actuel est le propriétaire du lavage
    if car_wash.user_id != current_user['id']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à créer des employés pour cette station"
        )
    
    # Vérifier si un utilisateur avec le même username ou email existe
    existing_user = db.query(Employee).filter(
        (Employee.username == user_data.username) | (User.email == user_data.email)
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
        username = user_data.username,
        email = user_data.email,
        hashed_password = bcrypt_context.hash(user_data.password),
        firstname = user_data.firstname if user_data.firstname else None,
        lastname = user_data.lastname if user_data.lastname else None,
        phone = user_data.phone if user_data.phone else None,
        age = user_data.age if user_data.age else None,
        role = user_data.role if user_data.role else RoleEmployee.car_washer,
        is_verified=False,  # Nécessite une vérification par email
        is_active=True,  # Actif par défaut
        can_add=False,  # Permissions par défaut
        can_edit=False
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)  # Rafraîchir pour obtenir les valeurs générées (par exemple, id)

        car_wash_employee = CarWashEmployee(
            car_wash_id = car_wash.id,
            employee_id = new_user.id
        )
        db.add(car_wash_employee)
        db.commit()
        db.refresh(car_wash_employee)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création de l'utilisateur"
        )
    return {
        "message": "User created successfully", 
        "data": { 
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

@router.get('/{wash_id}/employee', status_code=status.HTTP_200_OK)
async def get_all_employee_from_station(db: DbDependency, wash_id: int, current_user: Annotated[User, Depends(get_current_user)]):
    """Voir tous les  employee d'un lavage spécifique."""
    car_wash = db.query(CarWash).filter(CarWash.id == wash_id).first()
    if not car_wash:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Lavage not found'
        )
    
    try:
        car_wash_employees = db.query(CarWashEmployee).filter(CarWashEmployee.car_wash_id == car_wash.id).all()
        if not car_wash_employees:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No employees found"
            )
        
        employees_list = []
        for employees in car_wash_employees:
            user = db.query(User).filter(User.id == employees.employee_id).first()
            employees_list.append(user)

        return {
            "message": "Employees retrieved successfully",
            "data": employees_list
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