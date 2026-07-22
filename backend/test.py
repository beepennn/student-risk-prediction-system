from app.auth.password import (
    hash_password,
    verify_password
)

from app.auth.jwt_handler import (
    create_access_token,
    verify_token
)

print("=" * 50)
print("PASSWORD HASHING TEST")
print("=" * 50)

password = "Admin123!"

hashed_password = hash_password(password)

print(f"Original Password: {password}")
print(f"Hashed Password: {hashed_password}")

is_valid = verify_password(
    password,
    hashed_password
)

print(f"Password Verification: {is_valid}")

print("\n" + "=" * 50)
print("JWT TEST")
print("=" * 50)

payload = {
    "sub": "admin@example.com",
    "user_id": 1,
    "role": "ADMIN"
}

token = create_access_token(payload)

print(f"Generated Token:\n{token}")

decoded_payload = verify_token(token)

print("\nDecoded Payload:")
print(decoded_payload)

print("\n" + "=" * 50)
print("TEST COMPLETED")
print("=" * 50)
