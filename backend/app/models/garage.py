from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import relationship
from typing import Optional, TYPE_CHECKING

# Import conditionnel pour éviter les imports circulaires
if TYPE_CHECKING:
    from .user import User


class GarageBase(SQLModel):
    user_id: int = Field(foreign_key="user.id", nullable=False)
    name: str = Field(nullable=False)
    image: Optional[str] = Field(default=None, nullable=True)
    city: Optional[str] = Field(default=None, nullable=True)
    country: Optional[str] = Field(default=None, nullable=True)
    address: Optional[str] = Field(default=None, nullable=True)

class GarageCreate(GarageBase):
    pass

class GarageUpdate(GarageBase):
    name: Optional[str] = None
    image: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None

class Garage(GarageBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # user: "User" = relationship("User", back_populates="garages")
    user: "User" = Relationship(back_populates="garages")

