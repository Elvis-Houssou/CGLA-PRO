from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, EmailStr, field_validator
from importlib import import_module


# Import conditionnel pour éviter les imports circulaires
if TYPE_CHECKING:
    from .user import User
    from .car_wash import CarWash
    from .car_wash_employee import CarWashEmployee
    from .manager_quota import ManagerQuota
    from .wash_record import WashRecord


class RoleEmployee(str, Enum):
    station_manager = "station_manager"
    car_washer = "car_washer"
    station_client = "station_client"


class EmployeeBase(SQLModel):
    username: str = Field(unique=True, index=True)
    firstname: Optional[str] = Field(default=None)
    lastname: Optional[str] = Field(default=None)
    email: EmailStr = Field(unique=True, index=True)
    phone: Optional[str] = Field(default=None)
    age: Optional[int] = Field(default=None)
    role: RoleEmployee = Field(default=RoleEmployee.car_washer)
    is_verified: bool = Field(default=False)
    is_active: bool = Field(default=True)


class EmployeeCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    role: Optional[RoleEmployee] = None  # Champ optionnel pour spécifier le rôle

    @field_validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caractères")
        return v
class EmployeeMe(BaseModel):
    id: str
    first_name: str
    last_name: str
    phone: Optional[str]
    role: RoleEmployee
    created_at: datetime
    updated_at: datetime
    
    

class EmployeeUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    role: Optional[RoleEmployee] = None
    
    @field_validator("password")
    def password_strength(cls, v):
        if v is not None and len(v) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caractères")
        return v


class Employee(EmployeeBase, table=True):
    __tablename__ = "employees"
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: Optional[int] = Field(foreign_key="user.id", nullable=True)  # owner_id est l'id de l'utilisateur de rôle station_owner auquel l'employee est rattaché
    hashed_password: str = Field(exclude=True)
    can_add: bool = Field(default=False)
    can_edit: bool = Field(default=False)
    
    # Relations
    owner: "User" = Relationship(
        back_populates="employees",
        sa_relationship_kwargs={"foreign_keys": "[Employee.owner_id]"}
    )

    assigned_station: List["CarWash"] = Relationship(
        back_populates="employees",
        sa_relationship_kwargs={"secondary": "car_wash_employee"}
    )
