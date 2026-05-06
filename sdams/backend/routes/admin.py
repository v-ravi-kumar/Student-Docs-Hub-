import os
from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models import User, Document, ActivityLog, Department, DocumentType
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import or_

admin_bp = Blueprint('admin', __name__)

def get_admin_context(user_id):
    user = User.query.get(user_id)
    if not user or user.role not in ['root_admin', 'admin', 'sub_admin']:
        return None
    return user

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()
    admin = get_admin_context(user_id)
    if not admin:
        return jsonify({"msg": "Admin access required"}), 403

    # Department filter for Root Admin (optional query param)
    target_dept = request.args.get('department_id')
    
    # If Sub Admin, they can ONLY see their department
    if admin.role == 'sub_admin':
        target_dept = admin.department_id

    if target_dept:
        total_students = User.query.filter_by(role='student', department_id=target_dept).count()
        total_docs = Document.query.join(User).filter(User.department_id == target_dept).count()
        dept_name = Department.query.filter_by(dept_id=target_dept).first().name if Department.query.filter_by(dept_id=target_dept).first() else target_dept
        
        # Recent logs for this department
        recent_logs = ActivityLog.query.join(User, ActivityLog.user_id == User.id)\
            .filter(User.department_id == target_dept)\
            .order_by(ActivityLog.timestamp.desc()).limit(5).all()
        
        return jsonify({
            "total_students": total_students,
            "total_documents": total_docs,
            "department_name": dept_name,
            "role": admin.role,
            "assigned_dept": target_dept,
            "recent_activity": [{
                "id": log.id, "username": log.username, "action": log.action, "timestamp": log.timestamp.isoformat()
            } for log in recent_logs]
        }), 200
    else:
        # Root Admin Global Stats
        total_students = User.query.filter_by(role='student').count()
        total_docs = Document.query.count()
        total_depts = Department.query.count()
        total_sub_admins = User.query.filter_by(role='sub_admin').count()
        
        recent_logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(5).all()
        
        return jsonify({
            "total_students": total_students,
            "total_documents": total_docs,
            "total_departments": total_depts,
            "total_sub_admins": total_sub_admins,
            "role": admin.role,
            "recent_activity": [{
                "id": log.id, "username": log.username, "action": log.action, "timestamp": log.timestamp.isoformat()
            } for log in recent_logs]
        }), 200

@admin_bp.route('/departments/detailed', methods=['GET'])
@jwt_required()
def get_departments_detailed():
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)
    if not admin or admin.role not in ['root_admin', 'admin']:
        return jsonify({"msg": "Root Admin access required"}), 403

    departments = Department.query.all()
    res = []
    for d in departments:
        student_count = User.query.filter_by(role='student', department_id=d.dept_id).count()
        doc_count = Document.query.join(User).filter(User.department_id == d.dept_id).count()
        sub_admin = User.query.filter_by(role='sub_admin', department_id=d.dept_id).first()
        
        res.append({
            "id": d.id,
            "dept_id": d.dept_id,
            "name": d.name,
            "student_count": student_count,
            "doc_count": doc_count,
            "sub_admin": {
                "username": sub_admin.username,
                "email": sub_admin.email
            } if sub_admin else None
        })
    return jsonify(res), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    user_id = get_jwt_identity()
    admin = get_admin_context(user_id)
    if not admin:
        return jsonify({"msg": "Admin access required"}), 403

    query = User.query.filter_by(role='student')
    
    # Restriction for Sub Admin
    if admin.role == 'sub_admin':
        query = query.filter_by(department_id=admin.department_id)
    
    # Root Admin can also filter by department
    dept_filter = request.args.get('department_id')
    if dept_filter and admin.role in ['root_admin', 'admin']:
        query = query.filter_by(department_id=dept_filter)

    users = query.all()
    res = []
    for u in users:
        dept = Department.query.filter_by(dept_id=u.department_id).first()
        res.append({
            "id": u.id,
            "username": u.username,
            "register_number": u.register_number,
            "email": u.email,
            "phone_number": u.phone_number,
            "department_id": u.department_id,
            "department_name": dept.name if dept else "N/A"
        })
    return jsonify(res), 200
@admin_bp.route('/users/<int:student_id>', methods=['PUT'])
@jwt_required()
def update_user(student_id):
    user_id = get_jwt_identity()
    admin = get_admin_context(user_id)
    if not admin:
        return jsonify({"msg": "Admin access required"}), 403

    student = User.query.get(student_id)
    if not student or student.role != 'student':
        return jsonify({"msg": "Student not found"}), 404

    # Sub Admin restriction
    if admin.role == 'sub_admin' and student.department_id != admin.department_id:
        return jsonify({"msg": "Access denied to other departments"}), 403

    data = request.get_json()
    
    # Update fields
    student.username = data.get('username', student.username)
    student.email = data.get('email', student.email)
    student.phone_number = data.get('phone_number', student.phone_number)
    student.department_id = data.get('department_id', student.department_id)
    student.dob = data.get('dob', student.dob)
    student.qualification = data.get('qualification', student.qualification)
    student.year_of_joining = data.get('year_of_joining', student.year_of_joining)
    student.year_of_passing_out = data.get('year_of_passing_out', student.year_of_passing_out)
    
    if data.get('password'):
        student.set_password(data['password'])

    # Log action
    log = ActivityLog(
        user_id=admin.id,
        username=admin.username,
        role=admin.role,
        action="UPDATE_STUDENT",
        details=f"Updated profile for student {student.username} (Reg: {student.register_number})"
    )
    db.session.add(log)
    db.session.commit()
    
    return jsonify({"msg": "Student profile updated successfully"}), 200

@admin_bp.route('/users/<int:student_id>', methods=['DELETE'])
@jwt_required()
def delete_user(student_id):
    user_id = get_jwt_identity()
    admin = get_admin_context(user_id)
    if not admin:
        return jsonify({"msg": "Admin access required"}), 403

    student = User.query.get(student_id)
    if not student or student.role != 'student':
        return jsonify({"msg": "Student not found"}), 404

    # Sub Admin restriction
    if admin.role == 'sub_admin' and student.department_id != admin.department_id:
        return jsonify({"msg": "Access denied to other departments"}), 403

    # Log action before deletion
    log = ActivityLog(
        user_id=admin.id,
        username=admin.username,
        role=admin.role,
        action="DELETE_STUDENT",
        details=f"Deleted student {student.username} (Reg: {student.register_number})"
    )
    db.session.add(log)
    
    db.session.delete(student)
    db.session.commit()
    
    return jsonify({"msg": "Student deleted successfully"}), 200

@admin_bp.route('/users/<int:student_id>', methods=['GET'])
@jwt_required()
def get_user_details(student_id):
    user_id = get_jwt_identity()
    admin = get_admin_context(user_id)
    if not admin:
        return jsonify({"msg": "Admin access required"}), 403

    student = User.query.get(student_id)
    if not student or student.role != 'student':
        return jsonify({"msg": "Student not found"}), 404

    # Sub Admin restriction
    if admin.role == 'sub_admin' and student.department_id != admin.department_id:
        return jsonify({"msg": "Access denied to other departments"}), 403

    dept = Department.query.filter_by(dept_id=student.department_id).first()
    docs = Document.query.filter_by(student_id=student_id).all()
    logs = ActivityLog.query.filter_by(user_id=student_id).order_by(ActivityLog.timestamp.desc()).all()

    return jsonify({
        "profile": {
            "id": student.id,
            "username": student.username,
            "register_number": student.register_number,
            "email": student.email,
            "phone_number": student.phone_number,
            "department_id": student.department_id,
            "department_name": dept.name if dept else "N/A",
            "dob": student.dob,
            "qualification": student.qualification,
            "year_of_joining": student.year_of_joining,
            "year_of_passing_out": student.year_of_passing_out,
            "profile_pic": student.profile_pic
        },
        "documents": [{
            "id": d.id, "doc_type": d.doc_type, "file_url": d.file_path, "uploaded_at": d.uploaded_at.isoformat(), "status": d.status
        } for d in docs],
        "activity": [{
            "id": log.id, "action": log.action, "details": log.details, "timestamp": log.timestamp.isoformat()
        } for log in logs]
    }), 200

# Sub Admin Management (Root Admin Only)
@admin_bp.route('/sub_admins', methods=['GET', 'POST'])
@jwt_required()
def manage_sub_admins():
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)
    if not admin or admin.role not in ['root_admin', 'admin']:
         return jsonify({"msg": "Root Admin access required"}), 403

    if request.method == 'GET':
        sub_admins = User.query.filter_by(role='sub_admin').all()
        return jsonify([{
            "id": s.id,
            "username": s.username,
            "register_number": s.register_number,
            "email": s.email,
            "department_id": s.department_id
        } for s in sub_admins]), 200

    if request.method == 'POST':
        data = request.get_json()
        required = ['username', 'email', 'department_id', 'password', 'staff_id']
        if not all(k in data for k in required):
            return jsonify({"msg": "Missing required fields"}), 400
        
        if User.query.filter_by(register_number=data['staff_id']).first():
            return jsonify({"msg": "Staff ID already exists"}), 400

        new_admin = User(
            username=data['username'],
            register_number=data['staff_id'],
            email=data['email'],
            department_id=data['department_id'],
            role='sub_admin'
        )
        new_admin.set_password(data['password'])
        db.session.add(new_admin)
        db.session.commit()
        return jsonify({"msg": "Sub Admin created successfully"}), 201

@admin_bp.route('/sub_admins/<int:admin_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def edit_sub_admin(admin_id):
    user_id = get_jwt_identity()
    admin = User.query.get(user_id)
    if not admin or admin.role not in ['root_admin', 'admin']:
         return jsonify({"msg": "Root Admin access required"}), 403

    target = User.query.get(admin_id)
    if not target or target.role != 'sub_admin':
        return jsonify({"msg": "Sub Admin not found"}), 404

    if request.method == 'DELETE':
        db.session.delete(target)
        db.session.commit()
        return jsonify({"msg": "Sub Admin deleted"}), 200

    if request.method == 'PUT':
        data = request.get_json()
        target.username = data.get('username', target.username)
        target.email = data.get('email', target.email)
        target.department_id = data.get('department_id', target.department_id)
        if data.get('password'):
            target.set_password(data['password'])
        db.session.commit()
        return jsonify({"msg": "Sub Admin updated"}), 200

@admin_bp.route('/documents', methods=['GET'])
@jwt_required()
def list_all_documents():
    user_id = get_jwt_identity()
    admin = get_admin_context(user_id)
    if not admin:
        return jsonify({"msg": "Admin access required"}), 403

    query = Document.query
    
    # Sub Admin restriction
    if admin.role == 'sub_admin':
        query = query.join(User).filter(User.department_id == admin.department_id)
    
    # Optional department filter for root
    dept_filter = request.args.get('department_id')
    if dept_filter and admin.role in ['root_admin', 'admin']:
        query = query.join(User).filter(User.department_id == dept_filter)

    docs = query.all()
    res = []
    for d in docs:
        res.append({
            "id": d.id,
            "student_name": d.student.username if d.student else d.student_name,
            "student_reg_no": d.student.register_number if d.student else "N/A",
            "doc_type": d.doc_type,
            "file_path": d.file_path,
            "uploaded_at": d.uploaded_at.isoformat()
        })
    return jsonify(res), 200

@admin_bp.route('/activity_logs', methods=['GET'])
@jwt_required()
def get_activity_logs():
    user_id = get_jwt_identity()
    admin = get_admin_context(user_id)
    if not admin:
        return jsonify({"msg": "Admin access required"}), 403

    query = ActivityLog.query.order_by(ActivityLog.timestamp.desc())
    
    # Sub Admin can only see logs of students in their department
    if admin.role == 'sub_admin':
        # This is a bit complex since logs only have user_id. 
        # We join with User to filter by department
        query = query.join(User, ActivityLog.user_id == User.id).filter(User.department_id == admin.department_id)

    logs = query.all()
    return jsonify([{
        "id": log.id, "username": log.username, "role": log.role, "action": log.action, "details": log.details, "timestamp": log.timestamp.isoformat()
    } for log in logs]), 200
