from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import relationship
from typing import Optional, TYPE_CHECKING, List
from importlib import import_module

# Import conditionnel pour éviter les imports circulaires
if TYPE_CHECKING:
    from .employee import Employee
    from .car_wash_employee import CarWashEmployee
    from .stock_managment import StockManagment


class CarWashBase(SQLModel):
    user_id: int = Field(foreign_key="user.id", nullable=False)
    name: str = Field(nullable=False)
    image: Optional[str] = Field(default=None, nullable=True)
    city: Optional[str] = Field(default=None, nullable=True)
    country: Optional[str] = Field(default=None, nullable=True)
    address: Optional[str] = Field(default=None, nullable=True)

class CarWashCreate(CarWashBase):
    name: str = Field(nullable=False)
    image: Optional[str] = Field(default=None, nullable=True)
    city: Optional[str] = Field(default=None, nullable=True)
    country: Optional[str] = Field(default=None, nullable=True)
    address: Optional[str] = Field(default=None, nullable=True)

class CarWashUpdate(CarWashBase):
    name: Optional[str] = None
    image: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None

class CarWash(CarWashBase, table=True):
    __tablename__ = "car_wash"
    id: Optional[int] = Field(default=None, primary_key=True)
    # user: "User" = Relationship(back_populates="car_wash")
   
    employees: List["Employee"] = Relationship(
        back_populates="assigned_station",
        # link_model=import_module("app.models.car_wash_employee").xCarWashEmployee
        sa_relationship_kwargs={"secondary": "car_wash_employee"}
    )
    stocks: List["StockManagment"] = Relationship(back_populates="station")

