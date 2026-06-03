import asyncio
import httpx
import os

async def main():
    async with httpx.AsyncClient() as client:
        # 1. Register
        print("Registering...")
        res = await client.post("http://127.0.0.1:8000/api/v1/auth/register", json={
            "username": "flowuser",
            "email": "flow@example.com",
            "password": "password",
            "full_name": "Flow User",
            "role": "user"
        })
        print("Register:", res.status_code, res.text)
        
        # 2. Login
        print("\nLogging in...")
        res = await client.post("http://127.0.0.1:8000/api/v1/auth/login", data={
            "username": "flow@example.com",
            "password": "password"
        })
        print("Login:", res.status_code, res.text)
        token = res.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # 3. Upload Document
        print("\nUploading document...")
        os.makedirs("uploads", exist_ok=True)
        with open("uploads/dummy.jpg", "wb") as f:
            f.write(b"fake image data")
            
        with open("uploads/dummy.jpg", "rb") as f:
            files = {"file": ("dummy.jpg", f, "image/jpeg")}
            data = {"document_type": "AADHAAR"}
            res = await client.post("http://127.0.0.1:8000/api/v1/documents/", headers=headers, data=data, files=files)
            
        print("Upload:", res.status_code, res.text)
        doc_id = res.json().get("id")
        
        # 4. Trigger Verification
        print("\nTriggering verification...")
        res = await client.post(f"http://127.0.0.1:8000/api/v1/verify/{doc_id}", headers=headers)
        print("Verify:", res.status_code, res.text)
        
        # Wait a bit for background task
        await asyncio.sleep(2)
        
        # 5. Check Document Status
        print("\nChecking status...")
        res = await client.get(f"http://127.0.0.1:8000/api/v1/documents/{doc_id}", headers=headers)
        print("Status:", res.status_code, res.text)

if __name__ == "__main__":
    asyncio.run(main())
