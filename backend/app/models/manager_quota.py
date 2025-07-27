from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import date

from app.models.user import User


class ManagerQuota(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", ondelete="CASCADE")  # Lien vers la table User
    quota: int = Field(default=0)  # Nombre de lavages inscrits
    period_start: date
    period_end: date
    remuneration: Optional[float] = Field(default=None)  # Rémunération calculée, si nécessaire

    user: "User" = Relationship(back_populates="quotas")  # Relation avec User