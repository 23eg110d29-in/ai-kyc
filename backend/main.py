from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.database import connect_to_mongo, close_mongo_connection
from backend.core.config import settings

from backend.routers.auth import router as auth_router
from backend.routers.documents import router as documents_router
from backend.routers.verify import router as verify_router
from backend.routers.admin import router as admin_router

import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# CORS configuration — origins set via ALLOWED_ORIGINS env variable
allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(documents_router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(verify_router, prefix="/api/v1/verify", tags=["verify"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["admin"])

@app.get("/")
async def root():
    return {"message": "Welcome to AI KYC Backend API"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "api_version": "v1"
    }

@app.get("/api/v1")
async def api_v1_root():
    return {
        "message": "AI KYC Backend API v1 is running",
        "status": "healthy",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

@app.get("/api/v1/health")
async def api_v1_health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "api_version": "v1"
    }
