from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import Role, User, UserCreate, UserUpdate
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

    if current_user['role'] != Role.system_manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")
    
    wash_records = db.query(WashRecord).filter(WashRecord.manager_id == current_user["id"]).all()
    users = []
    for wash_record in wash_records: 
        user = db.query(User).filter(
            User.id == wash_record.wash_id, 
            User.role == Role.station_owner
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
    
    if current_user['role'] != Role.system_manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")
    
    user = db.query(User).filter(User.id == user_id, User.role == Role.station_owner).first()
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

    if current_user['role'] != Role.system_manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")
    
    wash_record = db.query(WashRecord).filter(WashRecord.wash_id == wash_id, WashRecord.manager_id == current_user['id']).first()
    
    if not wash_record:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cet lavage n'a pas été enregistré par cet utilisateur")
    
    user = db.query(User).filter(User.id == wash_id, User.role == Role.station_owner).first()

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
    if current_user['role'] != Role.system_manager:
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


# enregistre les lavages ajouter par des managers
# @router.post("/wash-records/", status_code=201)
# async def create_wash_record(
#     wash_id: str,
#     db: DbDependency,
#     current_user: User = Depends(get_current_user)
# ):
#     if current_user['role'] != "manager":
#         raise HTTPException(status_code=403, detail="Only managers can add wash records")
    
#     wash_record = WashRecord(
#         manager_id=current_user['id'],
#         wash_date=date.today(),
#         wash_id=wash_id
#     )
#     db.add(wash_record)
#     db.commit()
#     db.refresh(wash_record)
    
#     quota = db.query(ManagerQuota).filter(
#         ManagerQuota.user_id == current_user['id'],
#         ManagerQuota.period_start <= date.today(),
#         ManagerQuota.period_end >= date.today()
#     ).first()
#     if quota:
#         quota.quota += 1
#         db.commit()

#     return {"message": "Wash record added", "wash_id": wash_id}

# @router.get("/get", status_code=status.HTTP_200_OK)
# async def get_all_users_added(db: DbDependency, current_user: User = Depends(get_current_user)):
#     """
#     Récupère les tous les lavages ajouter par le manager.
#     """

#     if current_user['role'] != Role.manager:
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")

#     wash_records = db.query(WashRecord).filter(WashRecord.user_id == current_user['id']).all()
    
#     if not wash_records:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aucun lavage trouvé pour ce manager")


#     all_users = []
#     for wash_record in wash_records:
#         users = db.query(User).filter(User.role == Role.admin_garage).filter(User.id == wash_record.wash_id).all()
#         all_users.extend(users)

#     return {"all_users": all_users, "count_users": len(all_users)}