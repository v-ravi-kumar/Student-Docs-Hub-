import requests

def test_admin_login(admin_id, password):
    url = "http://127.0.0.1:5000/api/auth/admin/login"
    data = {
        "admin_id": admin_id,
        "password": password
    }
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Testing 'admin' login...")
    test_admin_login("admin", "admin123")
    print("\nTesting 'ravi kumar' login...")
    test_admin_login("ravi kumar", "ravi10000")
