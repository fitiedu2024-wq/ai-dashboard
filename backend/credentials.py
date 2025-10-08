"""
Secure credentials management - Direct bcrypt usage
"""
import bcrypt

DEFAULT_ADMIN = {
    "email": "3ayoty@gmail.com",
    "password": "AliTia20",
    "name": "Admin"
}

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt directly"""
    # Convert to bytes and truncate to 72 bytes
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Return as string
    return hashed.decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    """Verify password using bcrypt directly"""
    # Convert plain password to bytes and truncate
    password_bytes = plain.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Convert hash to bytes
    hashed_bytes = hashed.encode('utf-8')
    
    # Verify
    return bcrypt.checkpw(password_bytes, hashed_bytes)
