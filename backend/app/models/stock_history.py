from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, TYPE_CHECKING, List

# Import conditionnel pour éviter les imports circulaires
if TYPE_CHECKING:
    from .stock_managment import StockManagment

class StockHistoryBase(SQLModel):
    stock_id: int = Field(foreign_key="stock_managments.id", nullable=False)
    name: str = Field(unique=True, nullable=False)
    operation: Optional[str] = None
    operator_name: Optional[str] = None
    quantity: int = Field(default=0, ge=0)  # Quantité en stock
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class StockHistory(StockHistoryBase, table=True):
    __tablename__ = "stock_histories"
    id: Optional[int] = Field(default=None, primary_key=True)
    stock: "StockManagment" = Relationship(back_populates="history")