from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from test_spectrum_system.complaints import schemas
from test_spectrum_system.complaints.models import Complaint, ComplaintCategory
from test_spectrum_system.db.database import get_db

router = APIRouter()


@router.get("/complaint-categories/", response_model=list[schemas.ComplaintCategory])
async def get_complaint_categories(db: AsyncSession = Depends(get_db)):
    """
    Retrieves all complaint categories, grouped by main category.
    """
    result = await db.execute(select(ComplaintCategory))
    categories = result.scalars().all()

    grouped_categories = {}
    for category in categories:
        if category.main_category not in grouped_categories:
            grouped_categories[category.main_category] = []

        sub_cat = {"id": category.category_id, "name": category.sub_category}
        grouped_categories[category.main_category].append(sub_cat)

    response = [
        {"main_category": main, "sub_categories": subs}
        for main, subs in grouped_categories.items()
    ]
    return response


@router.post("/complaints/", response_model=schemas.Complaint, status_code=201)
async def create_complaint(
    complaint: schemas.ComplaintCreate, db: AsyncSession = Depends(get_db)
):
    """
    Creates a new complaint.
    """
    # Validate category_id
    category = await db.get(ComplaintCategory, complaint.category_id)
    if not category:
        raise HTTPException(
            status_code=400, detail=f"Invalid category_id: {complaint.category_id}"
        )

    if not complaint.description:
        raise HTTPException(status_code=400, detail="Description cannot be empty")

    new_complaint = Complaint(
        description=complaint.description, category_id=complaint.category_id
    )
    db.add(new_complaint)
    await db.commit()
    await db.refresh(new_complaint)
    return new_complaint
