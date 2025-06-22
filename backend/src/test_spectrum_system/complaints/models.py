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

    def __repr__(self):
        return f"<Complaint(complaint_id={self.complaint_id})>"
