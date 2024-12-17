from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List
from .config import SessionLocal
from .models import GradeDB, Grade, UserDB
from .auth import get_current_user, router

app = FastAPI()

app.include_router(router, prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@app.get("/courses")
async def get_courses():
    return [
        {"id": "MA6.101", "name": "Probability and Statistics"},
        {"id": "CS2.203", "name": "Language and Society"},
        {"id": "CL3.202", "name": "Computational Linguistics-2"},
        {"id": "CS1.301", "name": "Algorithm Analysis and Design"},
        {"id": "CS1.302", "name": "Automata Theory"},
        {"id": "CS4.301", "name": "Data and Applications"}
    ]

@app.post("/grades")
async def submit_grade(
    grade: Grade, 
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    existing_grade = db.query(GradeDB).filter(
        GradeDB.course_id == grade.course_id,
        GradeDB.user_id == current_user.id
    ).first()
    
    if existing_grade:
        existing_grade.total_marks = grade.total_marks
        existing_grade.grade = grade.grade
        db.commit()
        db.refresh(existing_grade)
        return {"status": "updated", "id": existing_grade.id}
    
    db_grade = GradeDB(
        course_id=grade.course_id,
        total_marks=grade.total_marks,
        grade=grade.grade,
        user_id=current_user.id
    )
    
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    
    return {"status": "created", "id": db_grade.id}

@app.get("/grades/{course_id}", response_model=List[Grade])
async def get_grades(
    course_id: str, 
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    grades = db.query(GradeDB.course_id, GradeDB.grade, GradeDB.total_marks).filter(GradeDB.course_id == course_id).all()
    return grades