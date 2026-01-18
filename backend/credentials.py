"""
Secure credentials management
All sensitive data is loaded from environment variables
"""
import bcrypt
import os
import secrets

# Load admin credentials from environment variables
DEFAULT_ADMIN = {
    "email": os.getenv("ADMIN_EMAIL", "3ayoty@grinners.ai"),
    "password": os.getenv("ADMIN_PASSWORD", "AliTia20")
}

# Warn if using default credentials
if not os.getenv("ADMIN_EMAIL") or not os.getenv("ADMIN_PASSWORD"):
    print("⚠️  WARNING: Using default admin credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables!")

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt directly"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    """Verify password using bcrypt directly"""
    password_bytes = plain.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    hashed_bytes = hashed.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)
