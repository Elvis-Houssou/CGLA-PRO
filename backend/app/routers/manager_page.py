from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import Role, User, UserCreate, UserUpdate
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

    if current_user['role'] != Role.manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")
    
    wash_records = db.query(WashRecord).filter(WashRecord.manager_id == current_user["id"]).all()
    users = []
    for wash_record in wash_records: 
        user = db.query(User).filter(
            User.id == wash_record.wash_id, 
            User.role == Role.admin_garage
        ).first()
        if user:
            users.append(user)

    return {
        "message": "Lavage récuperer avec succèss",
        "data": users
    }

@router.get('/details/{wash_id}', status_code=status.HTTP_200_OK)
async def get_wash_record_details_by_manager(wash_id: int, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Recuperer les informations des lavages enregistrer par le manager"""

    if current_user['role'] != Role.manager:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")
    
    wash_record = db.query(WashRecord).filter(WashRecord.wash_id == wash_id, WashRecord.manager_id == current_user['id']).first()
    
    if not wash_record:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cet lavage n'a pas été enregistré par cet utilisateur")
    
    user = db.query(User).filter(User.id == wash_id, User.role == Role.admin_garage).first()

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
    if current_user['role'] != Role.manager:
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

    return {
        "initial_quota": initial_quota,
        "quotas_restant": quotas_restant,
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