import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ComplaintBase(BaseModel):
    description: str


class ComplaintCreate(ComplaintBase):
    category_id: uuid.UUID


class SubCategory(BaseModel):
    id: uuid.UUID = Field(alias="category_id")
    name: str = Field(alias="sub_category")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ComplaintCategory(BaseModel):
    main_category: str
    sub_categories: list[SubCategory]


class Complaint(ComplaintBase):
    complaint_id: uuid.UUID
    category_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
