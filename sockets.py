from chat import socketio
from flask_socketio import join_room, leave_room
import sys
import json
from flask_login import current_user

@socketio.on('connect')
def connect_hander():
    print('connection established', file=sys.stderr)

    if current_user.is_authenticated:
        pass
    else:
        return False

@socketio.on('message')
def message(data):
    print(f'{data}', file=sys.stderr)
    socketio.send(data, room=)

@socketio.on('message_created')
def message_created(data):
    print(f'user just made: {data}', file=sys.stderr)
    processed_data = f'<b>{current_user.username}</b>: {data["text"]}'
    socketio.emit('message_created_sucessfully', processed_data)

@socketio.on('load_history')
def load_history(room_id):
    pass

@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    