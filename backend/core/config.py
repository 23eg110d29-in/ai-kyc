import os
import shutil
import platform

from pydantic_settings import BaseSettings

def get_default_tesseract_cmd() -> str:
    # Check if in PATH
    in_path = shutil.which("tesseract")
    if in_path:
        return in_path
    
    # Check common Windows path
    if platform.system() == "Windows":
        win_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        if os.path.exists(win_path):
            return win_path
            
    # Default for Linux / Vercel / Render
    return "/usr/bin/tesseract"

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI KYC Backend"
    MONGODB_URL: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = "kyc_db"
    SECRET_KEY: str = os.getenv("JWT_SECRET", "supersecretkey_please_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OPENAI_API_KEY: str = "your_openai_api_key_here"
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    # On Windows dev: set this to Tesseract path. On Render (Linux): /usr/bin/tesseract
    TESSERACT_CMD: str = get_default_tesseract_cmd()
    # Comma-separated list of allowed CORS origins
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()

def get_settings():
    return settings

