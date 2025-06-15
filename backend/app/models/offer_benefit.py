from sqlmodel import SQLModel, Field
from typing import Optional

class OfferBenefit(SQLModel, table=True):
    offer_id: int = Field(foreign_key="offer.id", primary_key=True)
    benefit_id: int = Field(foreign_key="benefit.id", primary_key=True)