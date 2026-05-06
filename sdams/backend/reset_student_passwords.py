from app import create_app
from extensions import db
from models import User

app = create_app()
with app.app_context():
    # Find all students
    students = User.query.filter_by(role='student').all()
    
    print(f"Resetting passwords for {len(students)} students to their Register Numbers...")
    
    for s in students:
        # Use register_number as the unique password
        s.set_password(str(s.register_number))
        print(f" - Updated {s.username} (Password set to: {s.register_number})")
    
    db.session.commit()
    print("\nAll student passwords have been reset to their respective Register Numbers.")
