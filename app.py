from chat import app, db, socketio
from chat.models import User, Message, Room

@app.shell_context_processor
def make_shell_context():
    return {'User': User, 'db': db, 'Message': Message, 'Room': Room}


