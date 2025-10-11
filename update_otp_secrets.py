from app import create_app, db
from models import User
import pyotp

app = create_app()
with app.app_context():
    users = User.query.filter_by(otp_secret='TEMPSECRET').all()
    for u in users:
        u.otp_secret = pyotp.random_base32()
    db.session.commit()
    print(f"Actualizados {len(users)} usuarios.")
