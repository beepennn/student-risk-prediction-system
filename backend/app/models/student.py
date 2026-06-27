from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database.base import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    student_name = Column(String, nullable=False)

    roll_no = Column(String, unique=True)

    semester = Column(String)

    department = Column(String)

    email = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)