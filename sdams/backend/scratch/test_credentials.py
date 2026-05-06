import sys
import os
sys.path.append(os.getcwd())

from app import create_app
from models import User

app = create_app()

def test_login(rid, password, role):
    with app.app_context():
        user = User.query.filter_by(register_number=rid, role=role).first()
        if not user:
            print(f"FAILED: User {rid} with role {role} not found in DB.")
            return
        if user.check_password(password):
            print(f"SUCCESS: Login for {rid} ({role}) worked!")
        else:
            print(f"FAILED: Password mismatch for {rid} ({role}).")

print("Testing Admin Logins:")
test_login('admin', 'admin123', 'admin')
test_login('ravi kumar', 'ravi10000', 'admin')

print("\nTesting Student Logins (after my reset):")
test_login('622622205032', 'student123', 'student')
test_login('622622205022', 'student123', 'student')
