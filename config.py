import os

base_dir = os.path.abspath(os.path.dirname(__file__))

class Config():
    SECRET_KEY = b'\x05\xe4\x87*\x0e\xc0\xfcP\xf8\xfb\xe3*\xebH&\xbd'

    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(base_dir, "app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False