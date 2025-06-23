import asyncio
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from test_spectrum_system.complaints.models import ComplaintCategory
from test_spectrum_system.db.database import AsyncSessionLocal

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# NOTE: This script only seeds categories.
# For comprehensive seeding (categories, patients, cases), use seed_data.py
# which runs automatically during container startup.

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

async def seed_data(db: AsyncSession):
    """
    Seeds the complaint_categories table with initial data.
    """
    logger.info("Starting to seed complaint categories...")

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
        logger.error(f"Error seeding data: {e}")
        logger.info("Rolling back transaction.")


async def main():
    """
    Main function to connect to the database and run the seeding process.
    """
    logger.info("Establishing database connection...")
    async with AsyncSessionLocal() as session:
        await seed_data(session)
    logger.info("Database connection closed.")


if __name__ == "__main__":
    asyncio.run(main())
