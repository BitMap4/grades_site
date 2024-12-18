import uvicorn
from app.config import HOST_BASE_URL

HOST_PORT = HOST_BASE_URL.split("://")[1] if "://" in HOST_BASE_URL else HOST_BASE_URL
HOST, PORT = HOST_PORT.split(":") if ":" in HOST_PORT else (HOST_PORT, 8000)
DEBUG = True

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=HOST,
        port=int(PORT),
        reload=DEBUG,
        log_level="info" if DEBUG else "error"
    )