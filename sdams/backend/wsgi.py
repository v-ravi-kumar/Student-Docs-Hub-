from app import create_app
import os

app = create_app()

if __name__ == "__main__":
    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run()
