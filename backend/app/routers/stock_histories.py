from fastapi import Depends, APIRouter, HTTPException, status
from app.models.car_wash import CarWash, CarWashCreate, CarWashUpdate
from app.models.car_wash_employee import CarWashEmployee
from app.models.user import Role
from app.models.stock_history import StockHistory
from app.models.user import User, UserCreate
from app.dependencies import DbDependency, bcrypt_context, create_access_token, check_superadmin, check_advantage, get_advantage_checker, get_current_user
from typing import Annotated, Dict, Any, List
from copy import deepcopy
from sqlmodel import select
from pydantic import BaseModel
from datetime import timedelta

router = APIRouter(
    prefix="/stock_histories",
    tags=['stock_histories']
)

@router.get('/{stock_id}', status_code=status.HTTP_200_OK)
async def get_all_stock_histories(stock_id: int, db: DbDependency, current_user: Annotated[User, Depends(get_current_user)]):
    """Voir tous les historiques de stock de l'utilisateur connecté."""

    if current_user['role'] != 'station_owner':
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vous n'êtes pas autorisé à voir tous les historiques de stock"
        )
    histories = db.query(StockHistory).filter(StockHistory.stock_id == stock_id).all()
    return {
        "message": "Historiques de stock récupérés avec succès",
        "data": histories
    }