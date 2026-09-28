# ThreatLink AI Backend

FastAPI backend foundation with MongoDB database connection for ThreatLink AI.

## Technologies
- **Python** (3.11+)
- **FastAPI**
- **PyMongo** (MongoDB driver)
- **Pydantic**
- **Uvicorn**

## Prerequisites & MongoDB Setup

### 1. MongoDB Requirement
The backend connects to MongoDB (either local instance or MongoDB Atlas cluster).

Default local connection string:
```text
mongodb://localhost:27017
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
APP_NAME=ThreatLink AI
APP_ENV=development
API_PREFIX=/api/v1

MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=threatlink_ai
```

*(Note: For MongoDB Atlas, use your `mongodb+srv://...` URI in `MONGODB_URL`)*

## Running the Application

### 1. Create & Activate Virtual Environment
- **Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
- **Linux / macOS:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Development Server
```bash
uvicorn app.main:app --reload
```

## Available Endpoints & Documentation
- **Root API:** `http://localhost:8000/`
- **Health Check:** `http://localhost:8000/api/v1/health`
- **Database Health:** `http://localhost:8000/api/v1/health/database`
- **Swagger Documentation:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`

## Running Tests
Run pytest from the `backend/` directory:
```bash
pytest
```
