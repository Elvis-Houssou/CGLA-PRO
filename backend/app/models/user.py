from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
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
    username: str = Field(unique=True, index=True)
    firstname: Optional[str] = Field(default=None)
    lastname: Optional[str] = Field(default=None)
    email: EmailStr = Field(unique=True, index=True)
    phone: Optional[str] = Field(default=None)
    age: Optional[int] = Field(default=None)
    role: Role = Field(default=Role.admin_garage)
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
    garages: List["Garage"] = Relationship(back_populates="user")
    quotas: List["ManagerQuota"] = Relationship(back_populates="user")

    manager_wash_records: List["WashRecord"] = Relationship(
        back_populates="manager",
        sa_relationship_kwargs={"foreign_keys": "[WashRecord.manager_id]"}
    )
    admin_wash_records: List["WashRecord"] = Relationship(
        back_populates="admin_garage",
        sa_relationship_kwargs={"foreign_keys": "[WashRecord.wash_id]"}
    )
    # wash_records: List["WashRecord"] = Relationship(back_populates="user")