
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from test_spectrum_system.complaints import schemas
from test_spectrum_system.complaints.models import (
    Case,
    Complaint,
    ComplaintCategory,
    Patient,
)
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
    # Validate patient_id
    patient = await db.get(Patient, complaint.patient_id)
    if not patient:
        raise HTTPException(
            status_code=400, detail=f"Invalid patient_id: {complaint.patient_id}"
        )
    # Validate case_id
    case = await db.get(Case, complaint.case_id)
    if not case or case.patient_id != complaint.patient_id:
        raise HTTPException(
            status_code=400, detail=f"Invalid or mismatched case_id: {complaint.case_id}"
        )
    if not complaint.description:
        raise HTTPException(status_code=400, detail="Description cannot be empty")
    new_complaint = Complaint(
        description=complaint.description,
        category_id=complaint.category_id,
        patient_id=complaint.patient_id,
        case_id=complaint.case_id,
    )
    db.add(new_complaint)
    await db.commit()
    await db.refresh(new_complaint)
    # Attach patient and case for response
    new_complaint.patient = patient
    new_complaint.case = case
    return new_complaint


@router.get("/complaints/{complaint_id}", response_model=schemas.Complaint)
async def get_complaint(complaint_id: str, db: AsyncSession = Depends(get_db)):
    complaint = await db.get(Complaint, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    # Fetch patient and case for embedding
    patient = await db.get(Patient, complaint.patient_id)
    case = await db.get(Case, complaint.case_id)
    complaint.patient = patient
    complaint.case = case
    return complaint


@router.get("/patients-test")
async def list_patients_test(db: AsyncSession = Depends(get_db)):
    """Simple test endpoint to debug the issue"""
    try:
        result = await db.execute(select(Patient))
        patients = result.scalars().all()
        return {
            "count": len(patients),
            "patients": [{"patient_id": str(p.patient_id), "name": p.name} for p in patients]
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/patients", response_model=list[schemas.PatientSummary])
async def list_patients(q: str = None, db: AsyncSession = Depends(get_db)):
    stmt = select(Patient)
    if q:
        stmt = stmt.where(Patient.name.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    patients = result.scalars().all() or []
    return [
        {
            "patient_id": p.patient_id,
            "name": p.name,
            "dob": p.dob,
        }
        for p in patients
    ]


@router.get("/cases")
async def list_cases(patient_id: str = None, db: AsyncSession = Depends(get_db)):
    """Get all cases, optionally filtered by patient_id"""
    stmt = select(Case)
    if patient_id:
        stmt = stmt.where(Case.patient_id == patient_id)

    result = await db.execute(stmt)
    cases = result.scalars().all()

    # Return as JSON-serializable format
    return [
        {
            "case_id": str(c.case_id),
            "case_reference": c.case_reference,
            "patient_id": str(c.patient_id)
        }
        for c in cases
    ]
