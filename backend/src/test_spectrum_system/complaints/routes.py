from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from test_spectrum_system.complaints import schemas
from test_spectrum_system.complaints.models import Complaint
from test_spectrum_system.db.database import get_db

router = APIRouter()


@router.post("/complaints", response_model=schemas.Complaint, status_code=201)
async def create_complaint(
    complaint: schemas.ComplaintCreate, db: AsyncSession = Depends(get_db)
):
    if not complaint.description:
        raise HTTPException(status_code=400, detail="Description cannot be empty")

    new_complaint = Complaint(description=complaint.description)
    db.add(new_complaint)
    await db.commit()
    await db.refresh(new_complaint)
    return new_complaint
