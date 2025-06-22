import uuid
from datetime import datetime

from pydantic import BaseModel


class ComplaintBase(BaseModel):
    description: str


class ComplaintCreate(ComplaintBase):
    pass


class Complaint(ComplaintBase):
    complaint_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
