from chat import socketio
import sys
import json
from flask_login import current_user

@socketio.on('message')
def message(data):
    print(f'{data}', file=sys.stderr)
    socketio.send(data)

@socketio.on('message_created')
def message_created(data):
    print(f'user just made: {data}', file=sys.stderr)
    processed_data = f'<b>{current_user.username}</b>: {data["text"]}'
    socketio.emit('message_created', processed_data)

@socketio.on('load_history')
def load_history(room_id):
    pass