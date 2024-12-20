from fastapi.middleware.cors import CORSMiddleware
from .api import app
from .config import FRONTEND_URL, SessionLocal
from sqlalchemy import inspect
from .models import Base, CourseDB

inspector = inspect(SessionLocal().get_bind())
tables = inspector.get_table_names()

if 'courses' not in tables:
    Base.metadata.create_all(bind=SessionLocal().get_bind())

with open("courses.psv", "r") as f:
    courses = [
        {
            "id_sem": line.split("|")[0],
            "name": line.split("|")[1].strip()
        } for line in f.readlines()
    ]

db = SessionLocal()
try:
    for course in courses:
        existing = db.query(CourseDB).filter(CourseDB.id_sem == course['id_sem']).first()
        if not existing:
            db_course = CourseDB(**course)
            db.add(db_course)
    db.commit()
finally:
    db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)