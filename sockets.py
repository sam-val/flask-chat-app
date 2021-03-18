from chat import socketio
import sys

@socketio.on('message')
def message(data):
    print(f'{data}', file=sys.stderr)
    socketio.send(data)