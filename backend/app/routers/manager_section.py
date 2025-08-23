from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import Role, User, UserCreate, UserUpdate
from app.models.manager_quota import ManagerQuota, CreateQuota
from app.models.wash_record import WashRecord
from datetime import date
from app.dependencies import DbDependency, bcrypt_context, check_manager, check_superadmin, get_current_user
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select as sa_select
import logging

# Configurer les logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix = "/manager_section",
    tags= ['manager_section']
)

@router.get('/all', status_code=status.HTTP_200_OK)
async def get_managers( db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """
    Récupère la liste des managers.
    """
    if current_user['role'] != Role.super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")

    managers = db.query(User).filter(User.role == Role.manager).all()

    manager_details = []
    for manager in managers:
        quota = db.query(ManagerQuota).filter(ManagerQuota.user_id == manager.id).first()
        wash_records = db.query(WashRecord).filter(WashRecord.manager_id == manager.id).all()
        manager_details.append({
            "manager": manager,
            "quota": quota,
            "wash_records": wash_records,
            'count_wash_records': len(wash_records)
        })
    return {"managers": manager_details}

@router.get("/details/{manager_id}", status_code=status.HTTP_200_OK)
async def get_manager_detail_with_quota_and_record(manager_id: int, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Récuperer un manager et ses informations"""

    if current_user["role"] != Role.super_admin:
        raise HTTPException(status_code=403, detail="Privilège reserver au superadmin ")
    

    manager = db.query(User).filter(User.id == manager_id, User.role == Role.manager).first()

    if not manager:
        raise HTTPException(status_code=403, detail="Cet id n'existe pas")

    quota = db.query(ManagerQuota).filter(ManagerQuota.manager_id == manager_id).first()

    wash_records = db.query(WashRecord).filter(WashRecord.manager_id == manager_id).all()

    return {
        "message": "Les infos du manager ont étés recupérer avec succès",
        "manager": manager,
        "quota": quota,
        "wash_records": wash_records
    }

@router.post("/quota_assign/{manager_id}", status_code=status.HTTP_200_OK)
async def create_manager_quotas(manager_id: int, quota_data: CreateQuota, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Créer un quota pour un utilisateur"""

    if current_user["role"] != Role.super_admin:
        raise HTTPException(status_code=403, detail="Vous n'avez pas accès a ce prilivège")
    
    user = db.query(User).filter(User.id == manager_id).first()

    if not user:
        raise HTTPException(status_code=403, detail="Cet manageur n'existe pas")
    
    if user.role != Role.manager:
        raise HTTPException(status_code=403, detail="Cet utilisateur n'est pas un manageur")
    
    new_quota = ManagerQuota(
        manager_id = manager_id,
        quota = quota_data.quota,
        period_start = quota_data.period_start,
        period_end = quota_data.period_end,
        remuneration = quota_data.remuneration
    )

    try:
        db.add(new_quota)
        db.commit()
        db.refresh(new_quota)  # Rafraîchir pour obtenir les valeurs générées (par exemple, id)
    except Exception as e:
        logger.error(f"Erreur lors de la création du quota manager : {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du quota manager")
    
    return {
        "message": "Quota created successfully", 
        "quota": new_quota
    }
# recuperer les quotats des managers avec les details des managers et des lavages
# @router.get('/quotas/details', status_code=status.HTTP_200_OK)
# async def get_manager_quotas_details(
#     db: DbDependency, 
#     current_user: Annotated[User, Depends(get_current_user)]
# ):
#     """
#     Récupère les quotas des managers avec les détails des managers et des lavages.
#     """
#     if current_user['role'] != Role.super_admin:
#         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")

#     quotas = db.query(ManagerQuota).all()
#     quota_details = []
    
#     for quota in quotas:
#         manager = db.query(User).filter(User.role == Role.manager).filter(User.id == quota.user_id).first()
#         wash_records = db.query(WashRecord).filter(WashRecord.manager_id == quota.user_id).all()
#         quota_details.append({
#             "manager": manager,
#             "quota": quota,
#             "wash_records": wash_records
#         })
    
#     return {"quota_details": quota_details}