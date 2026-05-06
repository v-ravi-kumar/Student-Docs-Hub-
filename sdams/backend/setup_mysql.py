from app import create_app
from extensions import db
from models import Department, DocumentType

app = create_app()

def setup():
    with app.app_context():
        print("Checking MySQL connection and creating tables...")
        try:
            db.create_all()
            print("Tables created successfully in MySQL!")
            
            # Initial Departments
            depts = [
                ("AGRI-01", "Agriculture Engineering"),
                ("BME-02", "Biomedical Engineering"),
                ("CIVIL-03", "Civil Engineering"),
                ("CSE-04", "Computer Science and Engineering"),
                ("EEE-05", "Electrical and Electronics"),
                ("ECE-06", "Electronics and Communication"),
                ("IT-07", "Information Technology"),
                ("MECH-08", "Mechanical Engineering")
            ]
            
            for dept_id, name in depts:
                if not Department.query.filter_by(dept_id=dept_id).first():
                    new_dept = Department(dept_id=dept_id, name=name)
                    db.session.add(new_dept)
                    print(f"Seeding Department: {name}")

            # Core Document Types
            types = ["Income Certificate", "Community Certificate", "TC", "Marksheet", "Aadhaar", "Student ID Card"]
            for t_name in types:
                if not DocumentType.query.filter_by(name=t_name).first():
                    new_type = DocumentType(name=t_name)
                    db.session.add(new_type)
                    print(f"Seeding Document Type: {t_name}")

            db.session.commit()
            print("\nMySQL Setup Finished Successfully!")
            
        except Exception as e:
            print("\nERROR: Could not connect to MySQL.")
            print(f"Details: {e}")
            print("\nPlease make sure:")
            print("1. Your MySQL server is RUNNING.")
            print("2. You have created the 'sdams' database.")
            print("3. Your username/password in config.py is correct.")

if __name__ == "__main__":
    setup()
