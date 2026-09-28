import re
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Any

EMAIL_REGEX = re.compile(r"^[\w\.-]+@[\w\.-]+\.\w+$")

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Investigator full name")
    email: str = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v_clean = v.strip()
        if not EMAIL_REGEX.match(v_clean):
            raise ValueError("Invalid email format")
        return v_clean.lower()

class UserLoginRequest(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v_clean = v.strip()
        if not EMAIL_REGEX.match(v_clean):
            raise ValueError("Invalid email format")
        return v_clean.lower()

class UserResponseData(BaseModel):
    id: str
    name: str
    email: str
    role: str = "INVESTIGATOR"

class TokenResponseData(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponseData

class AuthResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error_code: Optional[str] = None
