import re

with open('main.py', 'r') as f:
    content = f.read()

# Add import
if 'from credentials import' not in content:
    content = content.replace(
        'from passlib.context import CryptContext',
        'from passlib.context import CryptContext\nfrom credentials import DEFAULT_ADMIN, get_password_hash, verify_password'
    )

# Replace password hashing calls
content = re.sub(
    r'pwd_context\.hash\(([^)]+)\)',
    r'get_password_hash(\1)',
    content
)

content = re.sub(
    r'pwd_context\.verify\(([^,]+),\s*([^)]+)\)',
    r'verify_password(\1, \2)',
    content
)

# Fix default admin creation
old_admin = '''    admin_user = User(
        email="admin@grinners.com",
        hashed_password=pwd_context.hash("admin123"),
        name="Admin"
    )'''

new_admin = '''    admin_user = User(
        email=DEFAULT_ADMIN["email"],
        hashed_password=get_password_hash(DEFAULT_ADMIN["password"]),
        name=DEFAULT_ADMIN["name"]
    )'''

content = content.replace(old_admin, new_admin)

with open('main.py', 'w') as f:
    f.write(content)

print("Fixed credentials")
