import sys
import os
sys.path.append(os.getcwd())

from app import create_app
from models import User

app = create_app()

with app.app_context():
    users = User.query.all()
    print("User List:")
    print(f"{'ID (Register No)':<20} | {'Username':<20} | {'Role':<10}")
    print("-" * 60)
    for user in users:
        print(f"{user.register_number:<20} | {user.username:<20} | {user.role:<10}")
