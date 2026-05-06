import sys
import os
sys.path.append(os.getcwd())

from app import create_app
from extensions import db
from models import User

app = create_app()

with app.app_context():
    students = User.query.filter_by(role='student').all()
    print("Resetting Student Passwords...")
    for student in students:
        student.set_password('student123')
        print(f"Password for {student.username} ({student.register_number}) reset to 'student123'")
    db.session.commit()
    print("Done.")
