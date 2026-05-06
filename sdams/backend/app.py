import os
from flask import Flask, send_from_directory
from flask_cors import CORS

from extensions import db, jwt
from config import Config
from routes.auth import auth_bp
from routes.documents import doc_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)

    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(doc_bp, url_prefix='/api/documents')

    # Serve static uploads
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    with app.app_context():
        # Create all tables
        db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, port=5000)
