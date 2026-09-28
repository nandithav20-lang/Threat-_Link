import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    AuthResponse,
)
from app.services.auth_service import AuthService
from app.dependencies.auth import get_current_user

logger = logging.getLogger("threatlink.routes.auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New Investigator",
    description="Registers a new investigator account with hashed password and unique email check."
)
def register(request_data: UserRegisterRequest):
    try:
        success, message, user_data, error_code = AuthService.register_user(
            name=request_data.name,
            email=request_data.email,
            password=request_data.password
        )
        if not success:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "message": message,
                    "error_code": error_code or "REGISTRATION_FAILED",
                    "data": None
                }
            )

        return AuthResponse(
            success=True,
            message=message,
            data={"user": user_data}
        )
    except Exception as err:
        logger.error(f"Registration exception: {err}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Unable to complete registration.",
                "data": None
            }
        )

@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Login Investigator",
    description="Authenticates investigator credentials and returns JWT bearer access token."
)
def login(request_data: UserLoginRequest):
    try:
        success, message, token_data = AuthService.authenticate_user(
            email=request_data.email,
            password=request_data.password
        )
        if not success:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "message": message,
                    "data": None
                }
            )

        return AuthResponse(
            success=True,
            message=message,
            data=token_data
        )
    except Exception as err:
        logger.error(f"Login exception: {err}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Unable to connect to authentication service.",
                "data": None
            }
        )

@router.get(
    "/me",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile",
    description="Returns profile information for the authenticated investigator."
)
def get_me(current_user: dict = Depends(get_current_user)):
    return AuthResponse(
        success=True,
        message="Current user profile retrieved successfully",
        data={
            "id": current_user.get("id"),
            "name": current_user.get("name"),
            "email": current_user.get("email"),
            "role": current_user.get("role", "INVESTIGATOR")
        }
    )
