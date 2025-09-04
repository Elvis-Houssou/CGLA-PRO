from typing import Annotated, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import User, UserCreate, UserUpdate
from app.models.manager_quota import ManagerQuota
from app.models.wash_record import WashRecord
from app.models.subscription import Subscription
from app.models.offer import Offer
from app.models.car_wash import CarWash
from app.models.stock_managment import StockManagment, StockManagmentCreate, StockManagmentUpdate, StockManagmentQuantityUpdate
from app.models.stock_history import StockHistory
from datetime import date
from app.dependencies import DbDependency, bcrypt_context, check_manager, check_stock_access, get_current_user
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select as sa_select
import logging

router = APIRouter(
    prefix="/stock_managments",
    tags=['stock_managments']
)

@router.get("/{wash_id}/stocks")
def get_stocks(wash_id: int, db: DbDependency, current_user: Dict[str, Any] = Depends(check_stock_access)):
    stocks = db.query(StockManagment).filter(StockManagment.station_id == wash_id).all()
    return {
        "message": "Stocks récupérés avec succès",
        "stocks": stocks
    }

@router.post("/{wash_id}/stocks/create", status_code=status.HTTP_201_CREATED)
def create_stock(wash_id: int, stock_data: StockManagmentCreate, db: DbDependency, current_user: Dict[str, Any] = Depends(check_stock_access)):
    """Créer un stock à un lavage."""
    new_stock = StockManagment(
        station_id=wash_id,
        name=stock_data.name,
        description=stock_data.description,
        unit_price=stock_data.unit_price,
        unit=stock_data.unit,
        quantity=stock_data.quantity,
        last_updated= date.today(),
    )
    try:
        db.add(new_stock)
        db.commit()
        db.refresh(new_stock)
    except IntegrityError as e:
        db.rollback()
        logging.error(f"Erreur d'intégrité lors de l'ajout du stock : {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erreur lors de l'ajout du stock")
    
    return {
        "message": "Stock ajouté avec succès",
        "stock": new_stock
    }

@router.put("/stocks/{stock_id}", status_code=status.HTTP_200_OK)
def update_stock(stock_id: int, stock_data: StockManagmentUpdate, db: DbDependency, current_user: Dict[str, Any] = Depends(check_stock_access)):
    """Mettre à jour un stock existant."""
    stock = db.query(StockManagment).filter(StockManagment.id == stock_id).first()
    
    if not stock:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock non trouvé")
    
    stock.name = stock_data.name if stock_data.name else stock.name
    stock.description = stock_data.description if stock_data.description else stock.description
    stock.unit_price = stock_data.unit_price if stock_data.unit_price else stock.unit_price
    stock.unit = stock_data.unit if stock_data.unit else stock.unit
    stock.quantity = stock_data.quantity if stock_data.quantity is not None else stock.quantity
    stock.last_updated = date.today()
    
    try:
        db.commit()
        db.refresh(stock)
    except IntegrityError as e:
        db.rollback()
        logging.error(f"Erreur d'intégrité lors de la mise à jour du stock : {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erreur lors de la mise à jour du stock")
    
    return {
        "message": "Stock mis à jour avec succès",
        "stock": stock
    }

@router.put("/stocks/{stock_id}/add", status_code=status.HTTP_200_OK)
def add_stock(stock_id: int, stock_data: StockManagmentQuantityUpdate, db: DbDependency, current_user: Dict[str, Any] = Depends(check_stock_access)):
    """Ajouter sur un stock existant."""
    stock = db.query(StockManagment).filter(StockManagment.id == stock_id).first()
    
    if not stock:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock non trouvé")
    
    stock.quantity = stock.quantity + stock_data.quantity if stock_data.quantity else stock.quantity
    stock.last_updated = date.today()
    
    try:
        db.commit()
        db.refresh(stock)

        history_entry = StockHistory(
            stock_id=stock.id,
            name=stock.name,
            operation="addition",
            quantity=stock_data.quantity if stock_data.quantity else 0,
            last_updated=date.today()
        )

        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
    except IntegrityError as e:
        db.rollback()
        logging.error(f"Erreur d'intégrité lors de la mise à jour du stock : {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erreur lors de la mise à jour du stock")
    
    return {
        "message": "Stock mis à jour avec succès",
        "stock": stock
    }

@router.put("/stocks/{stock_id}/remove", status_code=status.HTTP_200_OK)
def remove_stock(stock_id: int, stock_data: StockManagmentQuantityUpdate, db: DbDependency, current_user: Dict[str, Any] = Depends(check_stock_access)):
    """Retirer sur un stock existant."""
    stock = db.query(StockManagment).filter(StockManagment.id == stock_id).first()
    
    if not stock:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock non trouvé")
    
    stock.quantity = stock.quantity - stock_data.quantity if stock_data.quantity else stock.quantity
    stock.last_updated = date.today()
    
    try:
        db.commit()
        db.refresh(stock)

        history_entry = StockHistory(
            stock_id=stock.id,
            name=stock.name,
            operation="substraction",
            quantity=stock_data.quantity if stock_data.quantity else 0,
            last_updated=date.today()
        )

        db.add(history_entry)
        db.commit()
        db.refresh(history_entry)
    except IntegrityError as e:
        db.rollback()
        logging.error(f"Erreur d'intégrité lors de la mise à jour du stock : {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Erreur lors de la mise à jour du stock")
    
    return {
        "message": "Stock mis à jour avec succès",
        "stock": stock
    }