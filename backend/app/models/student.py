from sqlalchemy import Column, Integer, String, Float
from app.database.base import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    student_name = Column(String, nullable=False)

    attendance = Column(Float)

    internal_marks = Column(Float)

    quiz_score = Column(Float)

    assignment_score = Column(Float)

    risk_level = Column(String)