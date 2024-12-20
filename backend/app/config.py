from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
from dotenv import load_dotenv
import os

load_dotenv()

# rate limits
RL_GRADES = os.getenv('RL_GRADES')
RL_DEFAULT = os.getenv('RL_DEFAULT')
RL_HAS_LOGIN = os.getenv('RL_HAS_LOGIN')

# CAS config
CAS_SERVER_URL = os.getenv('CAS_SERVER_URL')
HOST_BASE_URL = os.getenv('HOST_BASE_URL')
FRONTEND_URL = os.getenv('FRONTEND_URL')

# JWT config
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = "HS256"
LIFETIME = 15

# database setup
DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)