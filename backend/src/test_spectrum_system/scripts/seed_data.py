import asyncio
import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from test_spectrum_system.complaints.models import Case, ComplaintCategory, Patient
from test_spectrum_system.db.database import AsyncSessionLocal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Seed data definitions
CATEGORIES = [
    {"main_category": "Clinical", "sub_category": "Diagnosis"},
    {"main_category": "Clinical", "sub_category": "Medication"},
    {"main_category": "Clinical", "sub_category": "Quality of Care"},
    {"main_category": "Administrative", "sub_category": "Billing"},
    {"main_category": "Administrative", "sub_category": "Appointment"},
    {"main_category": "Administrative", "sub_category": "Communication"},
    {"main_category": "Technical", "sub_category": "Website Issue"},
    {"main_category": "Technical", "sub_category": "Equipment"},
]

PATIENTS = [
    {"name": "John Smith", "dob": datetime(1985, 3, 15, tzinfo=timezone.utc)},
    {"name": "Sarah Johnson", "dob": datetime(1990, 7, 22, tzinfo=timezone.utc)},
    {"name": "Michael Brown", "dob": datetime(1978, 11, 8, tzinfo=timezone.utc)},
    {"name": "Emily Davis", "dob": datetime(1995, 1, 30, tzinfo=timezone.utc)},
    {"name": "Robert Wilson", "dob": datetime(1982, 9, 12, tzinfo=timezone.utc)},
    {"name": "Lisa Garcia", "dob": datetime(1987, 5, 18, tzinfo=timezone.utc)},
]

# Cases will be generated based on patients
CASE_TEMPLATES = [
    "CASE-{year}-{patient_num:03d}-001",
    "CASE-{year}-{patient_num:03d}-002",
]


async def seed_categories(db: AsyncSession):
    """Seeds the complaint_categories table with initial data."""
    logger.info("Seeding complaint categories...")

    # Check if categories already exist
    result = await db.execute(select(ComplaintCategory))
    existing_categories = result.scalars().all()

    if existing_categories:
        logger.info(f"Found {len(existing_categories)} existing categories. Skipping category seeding.")
        return

    count = 0
    for category_data in CATEGORIES:
        category = ComplaintCategory(**category_data)
        db.add(category)
        count += 1

    try:
        await db.commit()
        logger.info(f"Successfully seeded {count} complaint categories.")
    except Exception as e:
        await db.rollback()
        logger.error(f"Error seeding categories: {e}")
        raise


async def seed_patients(db: AsyncSession):
    """Seeds the patients table with initial data."""
    logger.info("Seeding patients...")

    # Check if patients already exist
    result = await db.execute(select(Patient))
    existing_patients = result.scalars().all()

    if existing_patients:
        logger.info(f"Found {len(existing_patients)} existing patients. Skipping patient seeding.")
        return existing_patients

    patients = []
    for patient_data in PATIENTS:
        patient = Patient(**patient_data)
        db.add(patient)
        patients.append(patient)

    try:
        await db.commit()
        # Refresh to get IDs
        for patient in patients:
            await db.refresh(patient)
        logger.info(f"Successfully seeded {len(patients)} patients.")
        return patients
    except Exception as e:
        await db.rollback()
        logger.error(f"Error seeding patients: {e}")
        raise


async def seed_cases(db: AsyncSession, patients):
    """Seeds the cases table with initial data."""
    logger.info("Seeding cases...")

    # Check if cases already exist
    result = await db.execute(select(Case))
    existing_cases = result.scalars().all()

    if existing_cases:
        logger.info(f"Found {len(existing_cases)} existing cases. Skipping case seeding.")
        return

    current_year = datetime.now().year
    case_count = 0

    for i, patient in enumerate(patients, 1):
        # Create 1-2 cases per patient
        for template in CASE_TEMPLATES[:2]:  # Limit to 2 cases per patient
            case_reference = template.format(year=current_year, patient_num=i)
            case = Case(
                case_reference=case_reference,
                patient_id=patient.patient_id
            )
            db.add(case)
            case_count += 1

    try:
        await db.commit()
        logger.info(f"Successfully seeded {case_count} cases.")
    except Exception as e:
        await db.rollback()
        logger.error(f"Error seeding cases: {e}")
        raise


async def seed_all_data(db: AsyncSession):
    """Seeds all tables with initial data."""
    logger.info("Starting comprehensive data seeding...")

    # Seed categories first
    await seed_categories(db)

    # Seed patients and get the list for case creation
    patients = await seed_patients(db)

    # If we got existing patients, fetch them properly
    if not patients or len(patients) == 0:
        result = await db.execute(select(Patient))
        patients = result.scalars().all()

    # Seed cases using the patients
    await seed_cases(db, patients)

    logger.info("Comprehensive data seeding complete!")


async def main():
    """Main function to connect to the database and run the seeding process."""
    logger.info("Establishing database connection for seeding...")
    async with AsyncSessionLocal() as session:
        await seed_all_data(session)
    logger.info("Database connection closed.")


if __name__ == "__main__":
    asyncio.run(main())
