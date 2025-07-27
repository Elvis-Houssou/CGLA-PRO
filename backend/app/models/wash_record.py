from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import date

from app.models.user import User

class WashRecord(SQLModel, table=True):
    __tablename__ = "wash_record"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", ondelete="CASCADE")
    wash_date: date
    wash_id: Optional[int] = Field(default=None, unique=True)  # Unique identifier for the wash record

    user: "User" = Relationship(back_populates="wash_records")