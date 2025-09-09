from fastapi import Depends, APIRouter, HTTPException, status
from app.models.car_wash import CarWash, CarWashCreate, CarWashUpdate
from app.models.car_wash_employee import CarWashEmployee
from app.models.user import RoleUser
from app.models.employee import Employee, RoleEmployee, EmployeeCreate, EmployeeUpdate
from app.models.offer import Offer
from app.models.user import User, UserCreate
from app.dependencies import DbDependency, bcrypt_context, create_access_token, check_superadmin, check_advantage, get_advantage_checker, get_current_user
from typing import Annotated, Dict, Any, List
from copy import deepcopy
from pydantic import BaseModel
from datetime import timedelta
import logging

# Configurer les logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/employee",
    tags=['Employees']
)


@router.post('/employee/create', status_code=status.HTTP_201_CREATED)
async def create_employee(employee_data: EmployeeCreate, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Créer un employee pour un lavage."""
    if current_user['role'] != RoleUser.station_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les droits pour créer un employee."
        )
    
    existing_employee = db.query(Employee).where(((Employee.username == employee_data.username) | (Employee.email == employee_data.email))).first()
    if existing_employee:
        if existing_employee.username == employee_data.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nom d'utilisateur déjà pris"
            )
        if existing_employee.email == employee_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email déjà utilisé"
            )
    
    # Vérifie si le champ `role` est envoyé
    if employee_data.role:
        role_to_assign = employee_data.role
    else:
        # Valeur par défaut si non précisé
        role_to_assign = RoleEmployee.car_washer

    new_employee = Employee(
        owner_id = current_user['id'],
        username = employee_data.username,
        email = employee_data.email,
        hashed_password = bcrypt_context.hash(employee_data.password),
        firstname = employee_data.firstname if employee_data.firstname else None,
        lastname = employee_data.lastname if employee_data.lastname else None,
        phone = employee_data.phone if employee_data.phone else None,
        age = employee_data.age if employee_data.age else None,
        is_active=True,  # Actif par défaut
        role=role_to_assign  # Rôle par défaut
    )

    # Ajouter et persister dans la base de données
    try:
        db.add(new_employee)
        db.commit()
        db.refresh(new_employee) 
    except Exception as e:
        logger.error(f"Erreur lors de la création de l'employé : {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création de l'employé"
        )
    return {
        "message": "Employé créé avec succès", 
        "user": new_employee
    }

@router.put("/employee/edit/{employee_id}", status_code=status.HTTP_201_CREATED)
async def edit_employee(employee_id: int, employee_data: EmployeeUpdate, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Récupère les informations d'un employee pour l'édition."""
    logger.info(f"Récupération des informations de l'employee ID={employee_id} pour édition")
    if current_user['role'] != RoleUser.station_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les droits pour éditer un employee."
        )
    
    employee = db.query(Employee).filter(Employee.id == employee_id, Employee.owner_id == current_user['id']).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee non trouvé"
        )
    
    employee.username = employee_data.username if employee_data.username else employee.username
    employee.email = employee_data.email if employee_data.email else employee.email
    employee.firstname = employee_data.firstname if employee_data.firstname else employee.firstname
    employee.lastname = employee_data.lastname if employee_data.lastname else employee.lastname
    employee.phone = employee_data.phone if employee_data.phone else employee.phone
    employee.age = employee_data.age if employee_data.age else employee.age
    employee.hashed_password = bcrypt_context.hash(employee_data.password) if employee_data.password else employee.hashed_password
    employee.role = employee_data.role if employee_data.role else employee.role

    try:
        db.commit()
        db.refresh(employee)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise a jour de l'offre: {str(e)}"
        )
    
    return {
        "message": "Employee modifié avec succès",
        "employee": employee
    }

@router.delete("/employee/delete/{employee_id}", status_code=status.HTTP_200_OK)
async def delete_employee(employee_id: int, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Supprime un employee."""
    logger.info(f"Tentative de suppression de l'employee ID={employee_id}")

    if current_user['role'] != RoleUser.station_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les droits pour supprimer un employee."
        )
    
    employee = db.query(Employee).filter(Employee.id == employee_id, Employee.owner_id == current_user['id']).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee non trouvé"
        )
    
    try:
        db.delete(employee)
        db.commit()
        logger.info(f"Employee supprimé : {employee.username}, ID={employee.id}")
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression de l'employee: {str(e)}"
        )
    
    return {
        "message": "Employee supprimé avec succès"
    }

@router.post('/station/assign', status_code=status.HTTP_201_CREATED)
async def assign_employee_to_station(db: DbDependency, car_wash_employee_data: CarWashEmployee, current_user: Annotated[User, Depends(get_current_user)]):
    """Assigner un employee à un lavage."""
    if current_user['role'] != RoleUser.station_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas les droits pour assigner un employee à un lavage."
        )
    
    car_wash = db.query(CarWash).filter(CarWash.id == car_wash_employee_data.car_wash_id, CarWash.user_id == current_user['id']).first()
    if not car_wash:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lavage non trouvé ou vous n'êtes pas le propriétaire"
        )
    
    employee = db.query(Employee).filter(Employee.id == car_wash_employee_data.employee_id, Employee.owner_id == current_user['id']).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee non trouvé ou vous n'êtes pas le propriétaire"
        )
    
    existing_assignment = db.query(CarWashEmployee).filter(
        CarWashEmployee.car_wash_id == car_wash_employee_data.car_wash_id,
        CarWashEmployee.employee_id == car_wash_employee_data.employee_id
    ).first()
    if existing_assignment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet employee est déjà assigné à ce lavage"
        )
    
    new_assignment = CarWashEmployee(
        car_wash_id = car_wash_employee_data.car_wash_id,
        employee_id = car_wash_employee_data.employee_id
    )
    
    try:
        db.add(new_assignment)
        db.commit()
        db.refresh(new_assignment)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'assignation de l'employee au lavage: {str(e)}"
        )
    
    return {
        "message": "Employee assigné au lavage avec succès",
        "assignment": new_assignment
    }