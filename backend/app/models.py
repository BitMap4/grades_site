from sqlalchemy import Column, String, Float
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
import uuid

Base = declarative_base()

class Grade(BaseModel):
    course_id: str
    total_marks: float
    grade: str

    class Config:
        from_attributes = True

class GradeDB(Base):
    __tablename__ = "grades"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, index=True)
    total_marks = Column(Float)
    grade = Column(String)
    user_id = Column(String, index=True)

class UserDB(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    name = Column(String)
    rollno = Column(String, unique=True, index=True)