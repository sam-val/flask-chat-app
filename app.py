from chat import db, socketio

@app.shell_context_processor
def make_shell_context():
    return {'User': User, 'db': db}

if __name__ == "__main__":
    socketio.run(app)

