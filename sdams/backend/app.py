import os
from flask import Flask, send_from_directory
from flask_cors import CORS

from extensions import db, jwt
from config import Config
from routes.auth import auth_bp
from routes.documents import doc_bp
from routes.admin import admin_bp
from models import User

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)

    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(doc_bp, url_prefix='/api/documents')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Serve static uploads
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Auto-create admin user if it doesn't exist
        if not User.query.filter_by(register_number='admin').first():
            admin = User(
                username='System Admin',
                register_number='admin',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            
            # Also create ravi kumar admin
            ravi = User(
                username='ravi kumar',
                register_number='ravi kumar',
                role='admin'
            )
            ravi.set_password('ravi10000')
            db.session.add(ravi)
            
            db.session.commit()
            print("Admin accounts created automatically.")

    return app

if __name__ == '__main__':
    app = create_app()
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, port=5000)
