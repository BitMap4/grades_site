import cas
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from .config import (
    SessionLocal, HOST_BASE_URL, CAS_SERVER_URL, FRONTEND_URL,
    SECRET_KEY, ALGORITHM, LIFETIME, RL_DEFAULT, RL_HAS_LOGIN
)
from .models import UserDB
from .rate_limit import limiter

router = APIRouter()

cas_client = cas.CASClient(
    version=2,
    service_url=f"{HOST_BASE_URL}/auth/login",
    server_url=CAS_SERVER_URL,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=LIFETIME)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(request: Request, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="could not validate credentials"
    )
    
    token = request.cookies.get("auth_token")
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(UserDB).filter(UserDB.email == email).first()
    if not user:
        raise credentials_exception
    return user

@router.get("/login")
@limiter.limit(RL_DEFAULT)
async def login(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("auth_token")
    if token:
        try:
            jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return RedirectResponse(FRONTEND_URL)
        except JWTError:
            pass

    ticket = request.query_params.get("ticket")
    if not ticket:
        return RedirectResponse(url=cas_client.get_login_url())

    user, attributes, _ = cas_client.verify_ticket(ticket)

    if not attributes:
        raise HTTPException(status_code=401, detail="CAS attributes not valid")

    db_user = db.query(UserDB).filter(UserDB.email == user).first()
    if not db_user:
        db_user = UserDB(
            email=attributes.get("E-Mail", user),
            name=attributes.get("Name", ""),
            rollno=attributes.get("RollNo", "")
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    access_token = create_access_token({"sub": user})
    
    response = RedirectResponse(FRONTEND_URL)
    response.set_cookie(
        key="auth_token",
        value=access_token,
        secure=True,
        samesite="none",
        httponly=True
    )
    return response

@router.get("/logout")
@limiter.limit(RL_DEFAULT)
async def logout(request: Request):
    response = RedirectResponse(cas_client.get_logout_url())
    response.delete_cookie(
        key="auth_token",
        secure=True,
        httponly=True
    )
    return response

@router.get("/has_login")
@limiter.limit(RL_HAS_LOGIN)
async def has_login(request: Request):
    token = request.cookies.get("auth_token")
    if not token:
        return {"authenticated": False}
    
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"authenticated": True}
    except JWTError:
        return {"authenticated": False}