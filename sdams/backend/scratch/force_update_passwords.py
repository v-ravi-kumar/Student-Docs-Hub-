import sys
import os
sys.path.append(os.getcwd())

from app import create_app
from extensions import db
from models import User

app = create_app()

with app.app_context():
    # Force reset admin passwords
    admin = User.query.filter_by(register_number='admin').first()
    if admin:
        admin.set_password('admin123')
        print("Updated 'admin' password to 'admin123'")
    
    ravi = User.query.filter_by(register_number='ravi kumar').first()
    if ravi:
        ravi.set_password('ravi10000')
        print("Updated 'ravi kumar' password to 'ravi10000'")
        
    db.session.commit()
    print("Database sync complete.")
