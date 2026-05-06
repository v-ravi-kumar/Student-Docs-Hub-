from app import create_app
from extensions import db
from models import Department

def seed_departments():
    app = create_app()
    with app.app_context():
        depts = [
            ("CSE", "Computer Science Engineering"),
            ("IT", "Information Technology"),
            ("ECE", "Electronics and Communication Engineering"),
            ("MECH", "Mechanical Engineering"),
            ("CIVIL", "Civil Engineering"),
            ("EEE", "Electrical and Electronics Engineering"),
            ("CHEM", "Chemical Engineering"),
            ("AGRI", "Agriculture Engineering"),
            ("BIOMED", "Biomedical Engineering")
        ]
        
        for dept_id, name in depts:
            if not Department.query.filter_by(dept_id=dept_id).first():
                new_dept = Department(dept_id=dept_id, name=name)
                db.session.add(new_dept)
                print(f"Added department: {name}")
            else:
                print(f"Department already exists: {name}")
                
        db.session.commit()
        print("Seeding complete.")

if __name__ == "__main__":
    seed_departments()
