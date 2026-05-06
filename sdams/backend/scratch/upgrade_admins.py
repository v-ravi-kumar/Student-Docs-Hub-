from app import create_app
from extensions import db
from models import User

app = create_app()

def fix_admin_roles():
    with app.app_context():
        # Update 'admin' user
        admin = User.query.filter_by(register_number='admin').first()
        if admin:
            print(f"Updating user '{admin.username}' role from '{admin.role}' to 'root_admin'")
            admin.role = 'root_admin'
        
        # Update 'ravi kumar' user
        ravi = User.query.filter_by(register_number='ravi kumar').first()
        if ravi:
            print(f"Updating user '{ravi.username}' role from '{ravi.role}' to 'root_admin'")
            ravi.role = 'root_admin'
            
        db.session.commit()
        print("Database update complete.")

if __name__ == "__main__":
    fix_admin_roles()
