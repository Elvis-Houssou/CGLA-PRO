from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import relationship
from typing import List, Optional, TYPE_CHECKING
from enum import Enum
from pydantic import BaseModel, EmailStr, field_validator


# Import conditionnel pour éviter les imports circulaires
if TYPE_CHECKING:
    from .garage import Garage
    from .manager_quota import ManagerQuota
    from .wash_record import WashRecord


class Role(str, Enum):
    super_admin = "super_admin"
    manager = "manager" 
    admin_garage = "admin_garage"
    employee_garage = "employee_garage"
    client_garage = "client_garage"

class UserBase(SQLModel):
    username: str = Field(unique=True)
    firstname: str = Field(default=None, nullable=True)
    lastname: str = Field(default=None, nullable=True)
    email: str = Field(unique=True)
    phone: str = Field(default=None, nullable=True)
    age: Optional[int] = Field(default=None, nullable=True)
    role: Role = Field(default=Role.admin_garage) # super_admin, manager, admin, employee, client 
    is_verified: bool = Field(default=False)
    is_active: bool = Field(default=True)
    # garage_id: Optional[int] = Field(default=None, foreign_key="garage.id", nullable=True) # Pour employee_garage
    # is_admin = Column(Boolean, default=False)

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

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: EmailStr
    password: str
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    role: Optional[Role] = None
    
    @field_validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caractères")
        return v

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str = Field(exclude=True)  # Exclu des réponses API
    can_add: bool = Field(default=False)  # Privilège d'ajout
    can_edit: bool = Field(default=False)  # Privilège d'édition
    # garages: List["Garage"] = relationship("Garage", back_populates="user")
    garages: List["Garage"] = Relationship(back_populates="user")
    quotas: List["ManagerQuota"] = Relationship(back_populates="user")  # Nouvelle relation avec ManagerQuota
    wash_records: List["WashRecord"] = Relationship(back_populates="user")
