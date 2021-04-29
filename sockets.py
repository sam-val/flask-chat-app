from chat import socketio, db
from flask_socketio import join_room, leave_room
from flask import request, session
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
    room_code = data['room_id']

    message = data['text']
    user = User.query.filter_by(username=data['username']).first()
    m = Message(room_id=room_code, user_id=user.id, content=data['text'])

    db.session.add(m)
    db.session.commit()


    socketio.emit('message_created', { 'username': data['username'], 'text': data['text'] }, to=room_code)

@socketio.on('load_history')
def load_history(room_id):
    pass

@socketio.on('generate_room')
def generate_room(data):
    user = User.query.filter_by(username=data['username']).first()
    room = Room()
    room.name = data['room_name']

    user.rooms.append(room)

    db.session.commit()

    message = Message(user_id=user.id,room_id=room.id,content=f"{user.username} just created room <b>{room.id}</b>")

    db.session.add(message)

    db.session.commit()

    socketio.emit('room_created_sucessfully', {'room_id': room.id, \
                                                'room_name':room.name \
                                                }, to=request.sid)

    join_room(room.id)
                                        


@socketio.on('leave_room')
def escape_room(data):
    user = User.query.filter_by(username=data['username']).first()
    # user = User.query.filter_by(username=current_user.username).first()
    room = Room.query.filter_by(id=data['room_id']).first()
    # print(f'before: {room.users}', file=sys.stderr)
    message = None

    for u in room.users:
        print(f'{u}', file=sys.stderr)
        if u.id == user.id:
            room.users.remove(u)

            message = Message(user_id=user.id,room_id=room.id,content=f" just left chat.")

            db.session.add(message)

            db.session.commit()

            break
    else:
        return

    if len(room.users) <= 0:
        for m in room.messages:
            db.session.delete(m)

        db.session.delete(room)

    db.session.commit()
    
    print(f'after: {room.users}', file=sys.stderr)

    socketio.emit("leave_room_success", {'room_id': data['room_id'], 'username': data['username'], 'message': message.content }, to=data['room_id'])



@socketio.on('enter_room')
def enter_room(data):
    user = User.query.filter_by(username=data['username']).first()
    # user = User.query.filter_by(username=current_user.username).first()
    room = Room.query.filter_by(id=data['room_id']).first()

    if room == None:
        print(f"room not found", file=sys.stderr)
        return

    room_name = room.name
    message = None

    if room not in user.rooms:
        user.rooms.append(room)
        db.session.commit()

        message = Message(user_id=user.id,room_id=room.id,content=f" just joined chat.")

        db.session.add(message)

        db.session.commit()

    else:
        print(f"user's aldready in room", file=sys.stderr)



    socketio.emit('enter_room_success', {'room_id': room.id, 'room_name': room_name, 'username': data['username'], \

                                        'message': message.content}, room=data['room_id'])



@socketio.on('request_messages')
def re_messages(data):
    limit = data['limit']
    offset = data['offset']
    room_id = int(data['room_id'])

    messages = Message.query.\
        filter_by(room_id=room_id).\
        order_by(Message.time_stamp.desc()).\
        offset(offset).\
        limit(limit).\
        all()

    print(f'offset: {offset}, limit: {limit}, messages are: {messages}')

    json_data = {'concat': data['concat'], 'mes': [] }

    for message in messages:
        content = message.content
        username = message.user.username;
        json_data['mes'].append({'content':content, 'username': username})
    
    # print(json_data['mes'], file=sys.stderr)
    socketio.emit('messages_requested', json.dumps(json_data), to=request.sid)


@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room_id']
    print(f'{username} joined room {room}', file=sys.stderr)
    join_room(room, sid=request.sid)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room_id']
    print(f'{username} left room {room}')
    leave_room(room, sid=request.sid)