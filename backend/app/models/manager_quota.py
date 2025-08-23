from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import date

from app.models.user import User

class CreateQuota(SQLModel):
    quota: int
    period_start: date
    period_end: date # Optional icon for the offer
    remuneration: float
    
class ManagerQuota(SQLModel, table=True):
    __tablename__ = "manager_quota"
    id: Optional[int] = Field(default=None, primary_key=True)
    manager_id: int = Field(foreign_key="user.id", ondelete="CASCADE")  # Lien vers la table User
    quota: int = Field(default=0)  # Nombre de lavages inscrits
    period_start: date
    period_end: date
    remuneration: Optional[float] = Field(default=None)  # Rémunération calculée, si nécessaire

    user: "User" = Relationship(back_populates="quotas")  # Relation avec User