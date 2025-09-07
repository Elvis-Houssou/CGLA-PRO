from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import RoleUser, User, UserCreate, UserUpdate
from app.models.car_wash import CarWash, CarWashCreate, CarWashUpdate
from app.models.manager_quota import ManagerQuota
from app.models.wash_record import WashRecord
from app.models.subscription import Subscription
from app.models.offer import Offer
from datetime import date
from app.dependencies import DbDependency, bcrypt_context, check_manager, check_superadmin, get_current_user
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select as sa_select
import logging

# Configurer les logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix = "/manager_page",
    tags= ['manager_page']
)


@router.get('/', status_code=status.HTTP_200_OK)
async def get_wash_record_by_manager(db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Recuperer les utilisateurs enregistrer par le manager"""

    if current_user['role'] != RoleUser.system_manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")
    
    wash_records = db.query(WashRecord).filter(WashRecord.manager_id == current_user["id"]).all()
    users = []
    for wash_record in wash_records: 
        user = db.query(User).filter(
            User.id == wash_record.wash_id, 
            User.role == RoleUser.station_owner
        ).first()
        if user:
            users.append(user)

    return {
        "message": "Lavage récuperer avec succèss",
        "data": users
    }

@router.post('/create/car-wash/{user_id}', status_code=status.HTTP_200_OK)
async def create_car_wash_for_user(user_id: int, car_wash_data: CarWashUpdate, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Créer un garage pour un utilisateur donné."""
    
    if current_user['role'] != RoleUser.system_manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")
    
    user = db.query(User).filter(User.id == user_id, User.role == RoleUser.station_owner).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur non trouvé ou n'est pas un station_owner")
    
    new_car_wash = CarWash(
        user_id= user.id,
        name= car_wash_data.name if car_wash_data.name else None,
    )
    
    try:
        db.add(new_car_wash)
        db.commit()
        db.refresh(new_car_wash)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Erreur lors de la création du garage")
    
    return {
        "message": "Garage créé avec succès",
        "car_wash": new_car_wash
    }

@router.get('/details/{wash_id}', status_code=status.HTTP_200_OK)
async def get_wash_record_details_by_manager(wash_id: int, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Recuperer les informations des lavages enregistrer par le manager"""

    if current_user['role'] != RoleUser.system_manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")
    
    wash_record = db.query(WashRecord).filter(WashRecord.wash_id == wash_id, WashRecord.manager_id == current_user['id']).first()
    
    if not wash_record:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cet lavage n'a pas été enregistré par cet utilisateur")
    
    user = db.query(User).filter(User.id == wash_id, User.role == RoleUser.station_owner).first()

    subscription = db.query(Subscription).filter(Subscription.user_id == user.id).first()

    # offer = db.query(Offer).filter(Offer.id == subscription.offer_id).first()

    return {
        "message": "Information recupéré avec succès",
        "user": user,
        "subscription": subscription,
        # "offer": offer,
    }


# recuperer les quotats des managers
@router.get('/quotas', status_code=status.HTTP_200_OK)
async def get_manager_quota(
    db: DbDependency, 
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Récupère le quota du manager et ce qu'il reste à faire pour la période définie par le quota.
    """
    if current_user['role'] != RoleUser.system_manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")

    initial_quota = db.query(ManagerQuota).filter(ManagerQuota.manager_id == current_user['id']).first()

    if not initial_quota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucun quota trouvé pour ce manager.")

    wash_records = db.query(WashRecord).filter(
        WashRecord.manager_id == current_user["id"],
        WashRecord.wash_date >= initial_quota.period_start,
        WashRecord.wash_date <= initial_quota.period_end
    ).all()


    count_wash_record = len(wash_records)
    quotas_restant = initial_quota.quota - count_wash_record

    if initial_quota.quota == 0:
        remuneration_due = 0
    else:
        remuneration_due = (count_wash_record * initial_quota.remuneration) / initial_quota.quota

    return {
        "initial_quota": initial_quota,
        "quotas_restant": quotas_restant,
        "wash_record": count_wash_record,
        "remuneration_due": remuneration_due
    }