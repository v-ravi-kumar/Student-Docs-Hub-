from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    register_number = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student') # 'student' or 'admin'
    email = db.Column(db.String(120), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    department_id = db.Column(db.String(50), nullable=True)
    dob = db.Column(db.String(20), nullable=True)
    qualification = db.Column(db.String(100), nullable=True)
    year_of_joining = db.Column(db.Integer, nullable=True)
    year_of_passing_out = db.Column(db.Integer, nullable=True)
    profile_pic = db.Column(db.String(255), nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    student_name = db.Column(db.String(100), nullable=True)
    department = db.Column(db.String(100), nullable=True)
    doc_type = db.Column(db.String(50), nullable=False) # e.g., 'Marksheet', 'TC'
    file_path = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='approved') # 'pending', 'approved', 'rejected'
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    student = db.relationship('User', backref=db.backref('documents', lazy=True))

class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    dept_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)

class DocumentType(db.Model):
    __tablename__ = 'document_types'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    username = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(20), nullable=True)
    action = db.Column(db.String(50), nullable=False)
    details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

