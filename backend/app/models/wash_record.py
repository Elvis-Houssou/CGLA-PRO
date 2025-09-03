from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import date

from app.models.user import User

class WashRecord(SQLModel, table=True):
    __tablename__ = "wash_record"
    id: Optional[int] = Field(default=None, primary_key=True)
    manager_id: int = Field(foreign_key="user.id", ondelete="CASCADE")
    wash_date: date
    wash_id: int = Field(foreign_key="user.id", unique=True, nullable=True)  # Unique identifier for the wash record

    # user: "User" = Relationship(back_populates="wash_records")

    # Relations
    system_manager: "User" = Relationship(
        back_populates="manager_wash_records",
        sa_relationship_kwargs={"foreign_keys": "[WashRecord.manager_id]"}
    )

    owner_station: Optional["User"] = Relationship(
        back_populates="owner_wash_records",
        sa_relationship_kwargs={"foreign_keys": "[WashRecord.wash_id]"}
    )