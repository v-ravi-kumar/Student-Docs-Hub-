import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-for-sdams-application-2026'
    
    # Use DATABASE_URL if available (for Render PostgreSQL), otherwise use local SQLite
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI = database_url or \
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'sdams.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-permanent-secret-key-sdams-2026-secure-32chars'
    
    # Permanent Institute ID for Admin Login
    INSTITUTE_ID = 'SDAMS-2026'
    
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB max limit
