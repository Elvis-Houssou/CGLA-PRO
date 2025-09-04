from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import Role, User
from app.models.manager_quota import ManagerQuota
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
    prefix = "/wash_records",
    tags= ['wash_records']
)

@router.get('history', status_code=status.HTTP_200_OK)
async def get_manager_history(
    db: DbDependency, 
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Récupère l'historique des managers.
    """
    if current_user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")

    managers = db.query(User).filter(User.role == Role.system_manager).all()
    return {"managers": managers}

# recuperer les quotats des managers
@router.get('/quotas', status_code=status.HTTP_200_OK)
async def get_manager_quotas(
    db: DbDependency, 
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Récupère les quotas des managers.
    """
    if current_user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")

    quotas = db.query(ManagerQuota).all()
    return {"quotas": quotas}

# recuperer les quotats des managers avec les details des managers et des lavages
@router.get('/quotas/details', status_code=status.HTTP_200_OK)
async def get_manager_quotas_details(
    db: DbDependency, 
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Récupère les quotas des managers avec les détails des managers et des lavages.
    """
    if current_user.role != Role.super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès interdit")

    quotas = db.query(ManagerQuota).all()
    quota_details = []
    
    for quota in quotas:
        manager = db.query(User).filter(User.role == Role.system_manager).filter(User.id == quota.user_id).first()
        wash_records = db.query(WashRecord).filter(WashRecord.user_id == quota.user_id).all()
        quota_details.append({
            "manager": manager,
            "quota": quota,
            "wash_records": wash_records
        })
    
    return {"quota_details": quota_details}

# enregistre les lavages ajouter par des managers
@router.post("/wash-records/", status_code=201)
async def create_wash_record(
    wash_id: str,
    db: DbDependency,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can add wash records")
    
    wash_record = WashRecord(
        user_id=current_user.id,
        wash_date=date.today(),
        wash_id=wash_id
    )
    db.add(wash_record)
    db.commit()
    db.refresh(wash_record)
    
    quota = db.query(ManagerQuota).filter(
        ManagerQuota.user_id == current_user.id,
        ManagerQuota.period_start <= date.today(),
        ManagerQuota.period_end >= date.today()
    ).first()
    if quota:
        quota.quota += 1
        db.commit()

    return {"message": "Wash record added", "wash_id": wash_id}