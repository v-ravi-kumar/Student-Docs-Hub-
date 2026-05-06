from app import create_app
from extensions import db
from models import User

app = create_app()
with app.app_context():
    # Update ravikumar
    ravi = User.query.filter_by(username='ravikumar').first()
    if ravi:
        ravi.set_password('ravi21052005')
        print(f"Updated ravikumar password to ravi21052005")
    else:
        # Check by register number if username doesn't match exactly
        ravi = User.query.filter(User.username.ilike('%ravikumar%')).first()
        if ravi:
            ravi.set_password('ravi21052005')
            print(f"Updated {ravi.username} password to ravi21052005")

    # Update sheikdowouth
    sheik = User.query.filter_by(username='sheikdowouth').first()
    if sheik:
        sheik.set_password('sheik123')
        print(f"Updated sheikdowouth password to sheik123")
    else:
        sheik = User.query.filter(User.username.ilike('%sheik%')).first()
        if sheik:
            sheik.set_password('sheik123')
            print(f"Updated {sheik.username} password to sheik123")

    db.session.commit()
    print("Database updated with specific student passwords.")
