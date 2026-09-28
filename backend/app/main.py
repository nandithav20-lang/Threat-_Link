from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import connect_db, close_db
from app.services.auth_service import AuthService
from app.services.alert_stream_service import alert_stream_service
from app.dependencies.auth import get_current_user
from app.routes import health, auth, threats, darkweb, fraud_events, correlation, ai, risk, incidents, investigations, evidence, websocket
from app.schemas.common import ApiResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect database on startup
    connect_db()
    AuthService.init_db_indexes()
    await alert_stream_service.start_stream()
    yield
    # Close database on shutdown
    await alert_stream_service.stop_stream()
    close_db()

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Agentic Dark Web Threat Intelligence & Banking Fraud Investigation Platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public Routers
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(websocket.router, prefix=settings.API_PREFIX)

# Protected Investigator Routers
protected_dependency = [Depends(get_current_user)]
app.include_router(threats.router, prefix=settings.API_PREFIX, dependencies=protected_dependency)
app.include_router(darkweb.router, prefix=settings.API_PREFIX, dependencies=protected_dependency)
app.include_router(fraud_events.router, prefix=settings.API_PREFIX, dependencies=protected_dependency)
app.include_router(correlation.router, prefix=settings.API_PREFIX, dependencies=protected_dependency)
app.include_router(ai.router, prefix=settings.API_PREFIX, dependencies=protected_dependency)
app.include_router(risk.router, prefix=settings.API_PREFIX, dependencies=protected_dependency)
app.include_router(incidents.router, prefix=settings.API_PREFIX, dependencies=protected_dependency)
app.include_router(investigations.router, prefix=settings.API_PREFIX, dependencies=protected_dependency)
app.include_router(evidence.router, prefix=settings.API_PREFIX, dependencies=protected_dependency)






@app.get("/", response_model=ApiResponse[None])
def root():
    return ApiResponse(
        success=True,
        message="Welcome to ThreatLink AI API",
        data=None
    )

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "data": None
        }
    )
