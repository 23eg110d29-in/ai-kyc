import requests
import json

data = {
    "username": "varsh",
    "email": "23eg112e59@anurag.edu.in",
    "password": "password",
    "full_name": "varshini",
    "role": "user"
}

res = requests.post("http://127.0.0.1:8000/api/v1/auth/register", json=data)
print("STATUS:", res.status_code)
print("BODY:", res.text)
