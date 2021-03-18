from chat import db, login_manager
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import UserMixin


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(60), nullable=False, unique=True, index=True)
    hash_password = db.Column(db.String(128), nullable=True)
    email = db.Column(db.String(80), unique=True, index=True)
    # tasks = db.relationship('Task', backref='user', lazy='dynamic')

    def __repr__(self):
        return f'User {self.id} ; name="{self.username}"'

    def set_password(self, pw):
        self.hash_password = generate_password_hash(pw)

    def check_password(self, pw):
        return check_password_hash(self.hash_password, pw)
    

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))
