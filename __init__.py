from flask import Flask
from chat.config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_socketio import SocketIO

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy(app)
migrate = Migrate(app=app, db=db)

socketio = SocketIO(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login'


from chat import routes
