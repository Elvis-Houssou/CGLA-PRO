from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class Status(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"

class SubscriptionBase(SQLModel):
    user_id: int = Field(foreign_key="user.id")
    offer_id: int = Field(foreign_key="offer.id")
    status: Status = Field(default=Status.PENDING)
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: Optional[datetime] = Field(default=None, nullable=True)

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(SQLModel):
    status: Optional[Status] = None
    end_date: Optional[datetime] = None

class Subscription(SubscriptionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)