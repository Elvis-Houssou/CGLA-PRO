from sqlmodel import SQLModel, Field
from typing import Optional

class BenefitBase(SQLModel):
    name: Optional[str] = Field(default=None, nullable=True)
    permission_name: Optional[str] = Field(default=None, nullable=True)
    description: Optional[str] = Field(default=None, nullable=True)
    icon: Optional[str] = Field(default=None, nullable=True)

class BenefitCreate(BenefitBase):
    pass

class BenefitUpdate(SQLModel):
    name: Optional[str] = None
    permission_name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None

class Benefit(BenefitBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)