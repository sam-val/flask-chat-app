from chat import socketio, db
from flask_socketio import join_room, leave_room
import sys
import json
from chat.models import User, Room, Message
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
    socketio.send(data)

@socketio.on('message_created')
def message_created(data):
    message = data['text']
    m = Message(room_id=None, user_id=None, content=data['text'])

    db.session.add(m)
    db.session.commit()

    socketio.emit('message_created_sucessfully', data['text'])

@socketio.on('load_history')
def load_history(room_id):
    pass

@socketio.on('generate_room')
def generate_room(data):
    user = User.query.filter_by(username=current_user.username).first()
    room = Room()
    room.name = data['room_name']

    
    user.rooms.append(room)

    db.session.commit()

    message = Message(user_id=user.id,room_id=room.id,content=f"I just created room <b>{room.name}</b>")

    db.session.add(message)

    db.session.commit()

    join_room(room.id)
    socketio.emit('room_created_sucessfully', {'room_id':room.id, 
                                                'room_name':room.name,
                                                'message': message.content})

@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room_id']
    join_room(room)
    