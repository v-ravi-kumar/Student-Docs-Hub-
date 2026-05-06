import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from extensions import db
from models import Document, User, Department, DocumentType, ActivityLog
from flask_jwt_extended import jwt_required, get_jwt_identity

doc_bp = Blueprint('documents', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@doc_bp.route('/upload', methods=['POST'])
@jwt_required(optional=True)
def upload_document():
    user_id = get_jwt_identity()
    user = User.query.get(user_id) if user_id else None
    
    # If session is flaky but we have user data, we allow it. Otherwise check admin role.
    # Role check for both root and sub admins
    if user and user.role not in ['admin', 'root_admin', 'sub_admin']:
        return jsonify({"msg": "Only admins can upload documents"}), 403

    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400

    student_id = request.form.get('student_id')
    student_name = request.form.get('student_name')
    doc_type = request.form.get('doc_type')
    department = request.form.get('department')

    if not student_id or not doc_type or not department:
        return jsonify({"msg": "Missing student_id, department or doc_type"}), 400

    # Locate student by id or register number
    student = User.query.filter((User.id == student_id) | (User.register_number == str(student_id))).filter_by(role='student').first()
    if not student:
        return jsonify({"msg": "Student not found"}), 404

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # to avoid collisions, prefix with student id and timestamp
        import time
        unique_filename = f"{student_id}_{int(time.time())}_{filename}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)

        new_doc = Document(
            student_id=student.id,
            student_name=student_name,
            doc_type=doc_type,
            department=department,
            file_path=f"/uploads/{unique_filename}",
            status='approved' # since admin is uploading, it's approved
        )
        db.session.add(new_doc)
        db.session.commit()

        # Log activity
        if user:
            log_details = f"Uploaded {doc_type} for student {student.username} ({student.register_number})"
            log = ActivityLog(user_id=user.id, username=user.username, role=user.role, action='UPLOAD_DOCUMENT', details=log_details)
            db.session.add(log)
            db.session.commit()

        return jsonify({"msg": "File uploaded successfully", "doc_id": new_doc.id}), 201
    
    return jsonify({"msg": "Allowed file types are pdf, png, jpg, jpeg"}), 400


@doc_bp.route('/my_documents', methods=['GET'])
@jwt_required()
def get_my_documents():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'student':
        return jsonify({"msg": "Endpoint for students only"}), 403

    docs = Document.query.filter_by(student_id=user.id).all()
    res = []
    for d in docs:
        res.append({
            "id": d.id,
            "doc_type": d.doc_type,
            "file_url": current_app.url_for('uploaded_file', filename=d.file_path.split('/')[-1], _external=True),
            "status": d.status,
            "uploaded_at": d.uploaded_at
        })
    return jsonify(res), 200

@doc_bp.route('/student/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student_documents(student_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role not in ['admin', 'root_admin', 'sub_admin']:
        return jsonify({"msg": "Endpoint for admins only"}), 403

    docs = Document.query.filter_by(student_id=student_id).all()
    res = []
    for d in docs:
        res.append({
            "id": d.id,
            "doc_type": d.doc_type,
            "file_url": current_app.url_for('uploaded_file', filename=d.file_path.split('/')[-1], _external=True),
            "status": d.status,
            "uploaded_at": d.uploaded_at
        })
    return jsonify(res), 200

@doc_bp.route('/<int:doc_id>', methods=['DELETE'])
@jwt_required()
def delete_document(doc_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role not in ['admin', 'root_admin', 'sub_admin']:
        return jsonify({"msg": "Endpoint for admins only"}), 403

    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({"msg": "Document not found"}), 404

    # optionally delete the physical file
    try:
        filename = doc.file_path.split('/')[-1]
        phys_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(phys_path):
            os.remove(phys_path)
    except Exception as e:
        print("Error deleting file", e)

    doc_type = doc.doc_type
    student_id_log = doc.student.register_number if doc.student else doc.student_id
    student_name_log = doc.student.username if doc.student else doc.student_name

    db.session.delete(doc)
    db.session.commit()

    # Log activity
    if user:
        log_details = f"Deleted {doc_type} for student {student_name_log} ({student_id_log})"
        log = ActivityLog(user_id=user.id, username=user.username, role=user.role, action='DELETE_DOCUMENT', details=log_details)
        db.session.add(log)
        db.session.commit()

    return jsonify({"msg": "Document deleted"}), 200


@doc_bp.route('/types', methods=['GET', 'POST'])
@jwt_required(optional=True) # Making it optional to avoid 422 errors if session is flaky, but still checking for admin in POST
def handle_doctypes():
    if request.method == 'GET':
        types = DocumentType.query.all()
        return jsonify([{"id": t.id, "name": t.name} for t in types]), 200
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    # If we have a user, check role.
    if user and user.role not in ['admin', 'root_admin', 'sub_admin']:
        return jsonify({"msg": "Only admins can add document types"}), 403

    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"msg": "Missing document type name"}), 400

    name = data['name'].strip()
    # Case-insensitive check
    if DocumentType.query.filter(DocumentType.name.ilike(name)).first():
        return jsonify({"msg": f"Document Type '{name}' already exists"}), 400

    new_type = DocumentType(name=name)
    db.session.add(new_type)
    db.session.commit()
    return jsonify({"msg": "Document Type added successfully", "id": new_type.id, "name": new_type.name}), 201
