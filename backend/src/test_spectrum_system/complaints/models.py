import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from test_spectrum_system.db.database import Base


class ComplaintCategory(Base):
    __tablename__ = "complaint_categories"

    category_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    main_category = Column(String, nullable=False)
    sub_category = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint('main_category', 'sub_category', name='uq_main_sub_category'),
    )

    def __repr__(self):
        return (
            f"<ComplaintCategory(main_category='{self.main_category}', "
            f"sub_category='{self.sub_category}')>"
        )


class Complaint(Base):
    __tablename__ = "complaints"

    complaint_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    description = Column(Text, nullable=False)
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("complaint_categories.category_id"),
        nullable=False
    )
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.patient_id"),
        nullable=False
    )
    case_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cases.case_id"),
        nullable=False
    )
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    category = relationship("ComplaintCategory", backref="complaints")
    patient = relationship("Patient", backref="complaints")
    case = relationship("Case", backref="complaints")

    def __repr__(self):
        return f"<Complaint(complaint_id={self.complaint_id})>"


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    dob = Column(DateTime(timezone=True), nullable=False)

    def __repr__(self):
        return f"<Patient(patient_id={self.patient_id}, name={self.name})>"


class Case(Base):
    __tablename__ = "cases"

    case_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_reference = Column(String, nullable=False, unique=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False)

    patient = relationship("Patient", backref="cases")

    def __repr__(self):
        return f"<Case(case_id={self.case_id}, reference={self.case_reference})>"
