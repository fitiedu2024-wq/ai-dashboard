"""
Secure credentials management
"""
import os
from passlib.context import CryptContext

# Password hashing with bcrypt 72-byte limit fix
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Default admin credentials
DEFAULT_ADMIN = {
    "email": "3ayoty@gmail.com",
    "password": "AliTia20",
    "name": "Admin"
}

def get_password_hash(password: str) -> str:
    """Hash password - truncate to 72 bytes for bcrypt"""
    if len(password.encode()) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """Verify password"""
    if len(plain.encode()) > 72:
        plain = plain[:72]
    return pwd_context.verify(plain, hashed)
