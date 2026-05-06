import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import create_app

from extensions import db
from models import User

app = create_app()
with app.app_context():
    users = User.query.all()
    print(f"Total users in database: {len(users)}")
    for u in users:
        print(f"Username: {u.username}, Register Number: {u.register_number}, Role: {u.role}")
