import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
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


class Complainant(Base):
    __tablename__ = "complainants"

    complainant_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)

    # Address fields as required by the execution plan
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    postcode = Column(String(20), nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Indexes for performance
    __table_args__ = (
        Index('idx_complainant_email', 'email'),
        Index('idx_complainant_postcode', 'postcode'),
        Index('idx_complainant_city', 'city'),
    )

    def __repr__(self):
        return (f"<Complainant(complainant_id={self.complainant_id}, "
                f"name='{self.name}')>")


class Complaint(Base):
    __tablename__ = "complaints"

    complaint_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    description = Column(Text, nullable=False)
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("complaint_categories.category_id"),
        nullable=False
    )
    complainant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("complainants.complainant_id"),
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
    complainant = relationship("Complainant", backref="complaints")
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
    patient_id = Column(UUID(as_uuid=True),
                        ForeignKey("patients.patient_id"), nullable=False)

    patient = relationship("Patient", backref="cases")

    def __repr__(self):
        return f"<Case(case_id={self.case_id}, reference={self.case_reference})>"
