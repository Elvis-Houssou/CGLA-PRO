from sqlmodel import SQLModel, Field
from typing import Optional


class OfferBase(SQLModel):
    name: str = Field(unique=True)
    description: Optional[str]
    price: Optional[float] = Field(ge=0)
    icon: Optional[str] = Field(default=None, nullable=True)  # URL or path to the icon image

class OfferCreate(OfferBase):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    icon: Optional[str] = None  # Optional icon for the offer

class OfferUpdate(OfferBase):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    icon: Optional[str] = None  # Optional icon for the offer

class Offer(OfferBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
