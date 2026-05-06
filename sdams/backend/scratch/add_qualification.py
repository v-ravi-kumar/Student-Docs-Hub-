from app import create_app
from extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE users ADD COLUMN qualification VARCHAR(100) NULL;"))
        db.session.commit()
        print("Column qualification added.")
    except Exception as e:
        print("Error or column already exists:", e)
