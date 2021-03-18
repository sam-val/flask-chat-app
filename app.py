from chat import app, db, socketio

@app.shell_context_processor
def make_shell_context():
    return {'User': User, 'db': db}


