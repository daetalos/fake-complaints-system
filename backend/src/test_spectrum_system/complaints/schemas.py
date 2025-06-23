import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ComplaintBase(BaseModel):
    description: str


# Complainant Schemas
class ComplainantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    address_line1: str = Field(..., min_length=1, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    postcode: str = Field(..., min_length=1, max_length=20)


class ComplainantCreate(ComplainantBase):
    pass


class ComplainantSummary(BaseModel):
    complainant_id: uuid.UUID
    name: str
    email: str
    address_line1: str
    address_line2: Optional[str]
    city: str
    postcode: str

    model_config = ConfigDict(from_attributes=True)


class Complainant(ComplainantBase):
    complainant_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintCreate(ComplaintBase):
    category_id: uuid.UUID
    complainant_id: uuid.UUID
    patient_id: uuid.UUID
    case_id: uuid.UUID


class SubCategory(BaseModel):
    id: uuid.UUID = Field(alias="category_id")
    name: str = Field(alias="sub_category")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ComplaintCategory(BaseModel):
    main_category: str
    sub_categories: list[SubCategory]


class PatientSummary(BaseModel):
    patient_id: uuid.UUID
    name: str
    dob: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseSummary(BaseModel):
    case_id: uuid.UUID
    case_reference: str
    patient_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class Complaint(ComplaintBase):
    complaint_id: uuid.UUID
    category_id: uuid.UUID
    complainant_id: uuid.UUID
    patient_id: uuid.UUID
    case_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    complainant: ComplainantSummary
    patient: PatientSummary
    case: CaseSummary

    model_config = ConfigDict(from_attributes=True)
