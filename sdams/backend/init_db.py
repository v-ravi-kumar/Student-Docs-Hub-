from app import create_app
from extensions import db
from models import User

app = create_app()

with app.app_context():
    # Regular Admin
    admin = User.query.filter_by(register_number='ravi kumar').first()
    if not admin:
        admin_user = User(
            username='ravi kumar',
            register_number='ravi kumar',
            role='admin'
        )
        admin_user.set_password('ravi10000')
        db.session.add(admin_user)
        print("Admin user created (ravi kumar / ravi10000)")
    
    # Permanent System Admin
    sys_admin = User.query.filter_by(register_number='admin').first()
    if not sys_admin:
        new_sys_admin = User(
            username='System Admin',
            register_number='admin',
            role='admin'
        )
        new_sys_admin.set_password('admin123')
        db.session.add(new_sys_admin)
        print("Permanent admin created (admin / admin123)")
    
    db.session.commit()
