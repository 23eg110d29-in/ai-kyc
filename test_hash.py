from backend.core.security import get_password_hash

try:
    print(get_password_hash("testpass"))
except Exception as e:
    import traceback
    traceback.print_exc()
