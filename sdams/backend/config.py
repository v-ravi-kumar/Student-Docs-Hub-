import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-for-sdams-application-2026'
    
    # Using SQLite for easier deployment on Render
    # This creates a file named 'sdams.db' in your backend folder
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'sdams.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-permanent-secret-key-sdams-2026-secure-32chars'
    
    # Permanent Institute ID for Admin Login
    INSTITUTE_ID = 'SDAMS-2026'
    
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB max limit
