import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-for-sdams-application-2026'
    
    # MySQL Connection String: mysql+pymysql://username:password@localhost/database_name
    # For local setup with root and no password:
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'mysql+pymysql://root:ravikumar123@localhost/sdams'
    # If you have a password, use: 'mysql+pymysql://root:YOUR_PASSWORD@localhost/sdams'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-permanent-secret-key-sdams-2026-secure-32chars'
    
    # Permanent Institute ID for Admin Login
    INSTITUTE_ID = 'SDAMS-2026'
    
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB max limit
