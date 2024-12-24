from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
from .config import SessionLocal, RL_DEFAULT, RL_GRADES
from .models import GradeDB, Grade, UserDB, CourseDB
from .auth import get_current_user, router
from .rate_limit import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.include_router(router, prefix="/auth", tags=["auth"])

dist_path = Path(__file__).parent.parent/"frontend"/"dist"
app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

@app.get("/courses")
@limiter.limit(RL_DEFAULT)
async def get_courses(request: Request, db: Session = Depends(get_db)):
    courses = db.query(CourseDB).order_by(CourseDB.id_sem).all()
    return [
        {
            "id_sem": course.id_sem,
            "name": course.name
        } for course in courses
    ]

@app.post("/grades")
@limiter.limit(RL_GRADES)
async def submit_grade(
    request: Request,
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

@app.get("/get_grades/{course_id}", response_model=List[Grade])
@limiter.limit(RL_DEFAULT)
async def get_grades(
    request: Request,
    course_id: str, 
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    grades = db.query(GradeDB.course_id, GradeDB.grade, GradeDB.total_marks).filter(GradeDB.course_id == course_id).all()
    return grades

@app.exception_handler(429)
async def rate_limit(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=429,
        content={"message": "rate limit exceeded"}
    )