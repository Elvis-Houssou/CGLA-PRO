from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr, field_validator
from importlib import import_module


# Import conditionnel pour éviter les imports circulaires
if TYPE_CHECKING:
    from .car_wash import CarWash
    from .car_wash_employee import CarWashEmployee
    from .manager_quota import ManagerQuota
    from .wash_record import WashRecord


class Role(str, Enum):
    super_admin = "super_admin" 
    system_manager = "system_manager" 
    station_owner = "station_owner"
    station_manager = "station_manager"
    car_washer = "car_washer"
    station_client = "station_client"


class UserBase(SQLModel):
    username: str = Field(unique=True, index=True)
    firstname: Optional[str] = Field(default=None)
    lastname: Optional[str] = Field(default=None)
    email: EmailStr = Field(unique=True, index=True)
    phone: Optional[str] = Field(default=None)
    age: Optional[int] = Field(default=None)
    role: Role = Field(default=Role.station_owner)
    is_verified: bool = Field(default=False)
    is_active: bool = Field(default=True)


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    role: Optional[Role] = None  # Champ optionnel pour spécifier le rôle

    @field_validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caractères")
        return v
class UserMe(BaseModel):
    id: str
    first_name: str
    last_name: str
    phone: Optional[str]
    role: Role
    created_at: datetime
    updated_at: datetime
    
    

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    role: Optional[Role] = None
    
    @field_validator("password")
    def password_strength(cls, v):
        if v is not None and len(v) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caractères")
        return v


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str = Field(exclude=True)
    can_add: bool = Field(default=False)
    can_edit: bool = Field(default=False)
    
    # Relations
    # CarWash: List["CarWash"] = Relationship(back_populates="user")
    owned_station: List["CarWash"] = Relationship(
        back_populates="owner",
        sa_relationship_kwargs={"foreign_keys": "[CarWash.user_id]"}
    )
    assigned_station: List["CarWash"] = Relationship(
        back_populates="employees",
        link_model=import_module("app.models.car_wash_employee").CarWashEmployee  # Utiliser la classe directement
    )

    quotas: List["ManagerQuota"] = Relationship(back_populates="user")
    
    manager_wash_records: List["WashRecord"] = Relationship(
        back_populates="system_manager",
        sa_relationship_kwargs={"foreign_keys": "[WashRecord.manager_id]"}
    )

    owner_wash_records: List["WashRecord"] = Relationship(
        back_populates="owner_station",
        sa_relationship_kwargs={"foreign_keys": "[WashRecord.wash_id]"}
    )
    # wash_records: List["WashRecord"] = Relationship(back_populates="user")