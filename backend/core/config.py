from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI KYC Backend"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "kyc_db"
    SECRET_KEY: str = "supersecretkey_please_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    OPENAI_API_KEY: str = "your_openai_api_key_here"
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    TESSERACT_CMD: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    class Config:
        env_file = ".env"

settings = Settings()

def get_settings():
    return settings
