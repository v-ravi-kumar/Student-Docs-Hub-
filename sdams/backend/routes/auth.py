from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models import User, Department, ActivityLog
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/student/login', methods=['POST'])
def student_login():
    data = request.get_json()
    if not data or not data.get('register_number') or not data.get('password'):
        return jsonify({"msg": "Missing register_number or password"}), 400

    register_number = str(data.get('register_number', '')).strip()
    password = data.get('password', '')

    print(f"DEBUG: Student Login attempt for: {register_number}")
    user = User.query.filter_by(register_number=register_number, role='student').first()
    
    if user and user.check_password(password):
        expires = datetime.timedelta(days=1)
        access_token = create_access_token(identity=str(user.id), expires_delta=expires)
        
        # Log activity
        log = ActivityLog(user_id=user.id, username=user.username, role=user.role, action='LOGIN', details='Student logged in')
        db.session.add(log)
        db.session.commit()
        
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "register_number": user.register_number
            }
        }), 200

    return jsonify({"msg": "Invalid student credentials"}), 401


@auth_bp.route('/student/signup', methods=['POST'])
def student_signup():
    data = request.get_json()
    required_fields = ['register_number', 'password', 'name', 'department_id', 'dob', 'email', 'mobile', 'year_of_joining', 'year_of_passing_out']
    if not data or not all(k in data for k in required_fields):
        return jsonify({"msg": "Missing required signup fields"}), 400

    if User.query.filter_by(register_number=data['register_number']).first():
        return jsonify({"msg": "Student already exists"}), 400

    new_user = User(
        username=data['name'],
        register_number=data['register_number'],
        email=data['email'],
        phone_number=data['mobile'],
        department_id=data['department_id'],
        dob=data['dob'],
        year_of_joining=data['year_of_joining'],
        year_of_passing_out=data['year_of_passing_out'],
        role='student'
    )
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Student registered successfully", "student_id": new_user.id}), 201

@auth_bp.route('/departments', methods=['GET'])
def get_public_departments():
    depts = Department.query.all()
    return jsonify([{"id": d.id, "dept_id": d.dept_id, "name": d.name} for d in depts]), 200

@auth_bp.route('/departments', methods=['POST'])
def add_department():
    data = request.get_json()
    if not data or not data.get('dept_id') or not data.get('name'):
        return jsonify({"msg": "Missing department ID or name"}), 400

    if Department.query.filter_by(dept_id=data['dept_id']).first():
        return jsonify({"msg": f"Department ID '{data['dept_id']}' already exists"}), 400
        
    if Department.query.filter_by(name=data['name']).first():
        return jsonify({"msg": f"Department name '{data['name']}' already exists"}), 400

    new_dept = Department(dept_id=data['dept_id'], name=data['name'])
    db.session.add(new_dept)
    db.session.commit()
    return jsonify({"msg": "Department added successfully", "id": new_dept.id}), 201


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    return jsonify({
        "username": user.username,
        "register_number": user.register_number,
        "role": user.role,
        "email": user.email,
        "phone_number": user.phone_number,
        "department_id": user.department_id,
        "dob": user.dob,
        "qualification": user.qualification,
        "year_of_joining": user.year_of_joining,
        "year_of_passing_out": user.year_of_passing_out,
        "profile_pic": user.profile_pic
    }), 200

@auth_bp.route('/profile/upload', methods=['POST'])
@jwt_required()
def upload_profile_pic():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
        
    if file:
        filename = f"profile_{user_id}_{file.filename}"
        upload_folder = os.path.join(current_app.root_path, 'uploads', 'profiles')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        user.profile_pic = f"/uploads/profiles/{filename}"
        db.session.commit()
        
        return jsonify({"msg": "Profile picture updated", "url": user.profile_pic}), 200

@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    if not data or not data.get('admin_id') or not data.get('password'):
        return jsonify({"msg": "Missing admin_id or password"}), 400



    admin_id = str(data.get('admin_id', '')).strip()
    password = data.get('password', '')

    print(f"DEBUG: Admin Login attempt for: {admin_id}")
    user = User.query.filter_by(register_number=admin_id, role='admin').first()
    
    if user and user.check_password(password):
        expires = datetime.timedelta(days=1)
        access_token = create_access_token(identity=str(user.id), expires_delta=expires)

        # Log activity
        log = ActivityLog(user_id=user.id, username=user.username, role=user.role, action='LOGIN', details='Admin logged in')
        db.session.add(log)
        db.session.commit()

        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "register_number": user.register_number
            }
        }), 200

    return jsonify({"msg": "Invalid admin credentials"}), 401


@auth_bp.route('/register_student', methods=['POST'])
@jwt_required()
def register_student():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Only admins can register students"}), 403

    data = request.get_json()
    required_fields = ['register_number', 'username', 'email', 'phone_number', 'department_id', 'dob', 'year_of_joining', 'year_of_passing_out']
    
    if not data or not all(k in data for k in required_fields):
        return jsonify({"msg": "Missing required student details"}), 400

    if User.query.filter_by(register_number=str(data['register_number'])).first():
        return jsonify({"msg": "Student already exists"}), 400

    new_user = User(
        username=data['username'],
        register_number=str(data['register_number']),
        email=data['email'],
        phone_number=data['phone_number'],
        department_id=data['department_id'],
        dob=data['dob'],
        year_of_joining=data['year_of_joining'],
        year_of_passing_out=data['year_of_passing_out'],
        role='student'
    )
    # Default password to register_number if not provided
    password = data.get('password') or str(data['register_number'])
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Student registered successfully", "student_id": new_user.id, "default_password": password}), 201

@auth_bp.route('/students', methods=['GET'])
@jwt_required()
def get_students():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Only admins can view all students"}), 403

    students = User.query.filter_by(role='student').all()
    res = []
    for s in students:
        res.append({
            "id": s.id,
            "username": s.username,
            "register_number": s.register_number
        })

    return jsonify(res), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    return jsonify({
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "register_number": user.register_number
    }), 200

@auth_bp.route('/admin/register_admin', methods=['POST'])
@jwt_required()
def register_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    # Only the initial admin (admin_id = 'admin') can register new admins
    if not user or user.role != 'admin' or user.register_number not in ['admin', 'ravi kumar']:
        return jsonify({"msg": "Only the initial admin can register other admins"}), 403

    data = request.get_json()
    if not data or not all([data.get('admin_id'), data.get('username'), data.get('password'), data.get('email'), data.get('phone_number'), data.get('department_id')]):
        return jsonify({"msg": "Missing required fields"}), 400

    if User.query.filter_by(register_number=data['admin_id']).first():
        return jsonify({"msg": "Admin ID already exists"}), 400
    if User.query.filter_by(email=data['email']).first():
         return jsonify({"msg": "Email already exists"}), 400

    new_admin = User(
        username=data['username'],
        register_number=data['admin_id'],
        email=data['email'],
        phone_number=data['phone_number'],
        department_id=data['department_id'],
        role='admin'
    )
    new_admin.set_password(data['password'])
    db.session.add(new_admin)
    db.session.commit()

    return jsonify({"msg": "Admin registered successfully", "admin_id": new_admin.id}), 201

@auth_bp.route('/student/forgot-password', methods=['POST'])
def student_forgot_password():
    data = request.get_json()
    if not data or not all(k in data for k in ['register_number', 'dob', 'phone_number', 'new_password']):
        return jsonify({"msg": "Missing required fields: register_number, dob, phone_number, new_password"}), 400

    user = User.query.filter_by(register_number=str(data['register_number']), role='student').first()
    if not user:
        return jsonify({"msg": "Student not found"}), 404

    # Verify security details
    if user.dob != data['dob'] or user.phone_number != data['phone_number']:
        return jsonify({"msg": "Security details (DOB or Phone) do not match"}), 401

    # Update password
    user.set_password(data['new_password'])
    
    # Log activity
    log = ActivityLog(user_id=user.id, username=user.username, role=user.role, action='PASSWORD_RESET', details='Student reset their own password')
    db.session.add(log)
    db.session.commit()

    return jsonify({"msg": "Password updated successfully"}), 200


@auth_bp.route('/admin/reset_student_password', methods=['POST'])
@jwt_required()
def admin_reset_student_password():
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)
    if not admin or admin.role != 'admin':
        return jsonify({"msg": "Only admins can perform this action"}), 403

    data = request.get_json()
    if not data or not all(k in data for k in ['register_number', 'department_id', 'dob', 'username', 'phone_number', 'new_password']):
        return jsonify({"msg": "Missing required fields: register_number, department_id, dob, username, phone_number, new_password"}), 400

    student = User.query.filter_by(register_number=str(data['register_number']), role='student').first()
    if not student:
        return jsonify({"msg": "Student not found with this register number"}), 404

    if student.department_id != data['department_id'] or student.dob != data['dob'] or student.username != data['username'] or student.phone_number != data['phone_number']:
         return jsonify({"msg": "Student validation details do not match the database"}), 400

    student.set_password(data['new_password'])

    # Log activity
    log = ActivityLog(user_id=admin.id, username=admin.username, role=admin.role, action='ADMIN_PASSWORD_RESET', details=f"Admin reset password for student {student.register_number}")
    db.session.add(log)
    db.session.commit()

    return jsonify({"msg": "Student password has been successfully reset"}), 200


@auth_bp.route('/activity_logs', methods=['GET'])
@jwt_required()
def get_activity_logs():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Only admins can view activity logs"}), 403

    logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).all()
    res = []
    for log in logs:
        res.append({
            "id": log.id,
            "user_id": log.user_id,
            "username": log.username,
            "role": log.role,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.isoformat()
        })
    return jsonify(res), 200

