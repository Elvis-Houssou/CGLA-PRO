from sqlmodel import SQLModel, Field
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .user import User
    from .car_wash import CarWash

class CarWashEmployee(SQLModel, table=True):
    __tablename__ = "car_wash_employee"
    car_wash_id: int = Field(foreign_key="car_wash.id", primary_key=True)
    employee_id: int = Field(foreign_key="employees.id", primary_key=True)