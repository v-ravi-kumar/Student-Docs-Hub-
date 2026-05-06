from app import create_app
from extensions import db
from models import Department, DocumentType

app = create_app()

PREDEFINED_DEPTS = [
    {"dept_id": "DEPT-BME", "name": "Biomedical Engineering"},
    {"dept_id": "DEPT-CSE", "name": "Computer Science and Engineering"},
    {"dept_id": "DEPT-ECE", "name": "Electronics and Communication Engineering"},
    {"dept_id": "DEPT-EEE", "name": "Electrical and Electronics Engineering"},
    {"dept_id": "DEPT-IT", "name": "Information Technology"},
    {"dept_id": "DEPT-CIVIL", "name": "Civil Engineering"},
    {"dept_id": "DEPT-MECH", "name": "Mechanical Engineering"},
    {"dept_id": "DEPT-AI&S", "name": "Artificial Intelligence and Data Science"}
]

PREDEFINED_TYPES = [
    "TC", "Marksheet", "10th Marksheet", "12th Marksheet", 
    "Income Certificate", "Community Certificate", "Negative Certificate"
]

with app.app_context():
    for d in PREDEFINED_DEPTS:
        if not Department.query.filter_by(name=d['name']).first():
            db.session.add(Department(dept_id=d['dept_id'], name=d['name']))
    
    for t in PREDEFINED_TYPES:
        if not DocumentType.query.filter_by(name=t).first():
            db.session.add(DocumentType(name=t))
            
    db.session.commit()
    print("Database seeded with predefined departments and document types.")
