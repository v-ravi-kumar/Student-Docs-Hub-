from app import create_app
from models import User

app = create_app()
with app.app_context():
    users = User.query.all()
    print("Username | Register Number | Role")
    print("-" * 40)
    for u in users:
        print(f"{u.username} | {u.register_number} | {u.role}")
