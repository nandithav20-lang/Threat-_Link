from fastapi import FastAPI
from routes import router

app = FastAPI(title="ThreatLink AI Backend")

app.include_router(router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to ThreatLink AI API"}
