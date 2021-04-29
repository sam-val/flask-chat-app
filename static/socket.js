document.addEventListener('DOMContentLoaded', () => {
    const btn_enter = document.querySelector('#btn-send')
    const chat_display = document.querySelector('#chat_history_display')
    const btn_create_room = document.querySelector('#create_room')
    const btn_join_room = document.querySelector("#btn_join_room")
    const rooms_display = document.querySelector('#rooms_display')
    var text_area = document.querySelector('#text-message')
    
    var current_room = rooms_display.children.length > 0 ? rooms_display.children[0] : null;

    var socket = io.connect('http://' + document.domain + ':' + location.port);

    if (current_room !== null) {
        request_messages(current_room.getAttribute('data-id'))
        current_room.style.backgroundColor = "orange"
    }

    socket.on('connect', data => {
        console.log("connected")
        // loading and adding gui functionality to rooms:
        for (let i = 0; i < rooms_display.children.length; i++) {
            let div = rooms_display.children[i]
            let room_id = div.getAttribute('data-id')
            let delete_btn = div.getElementsByTagName("BUTTON")[0]

            socket.emit('join', {'username': username, 'room_id': room_id });

            // join room by clicking:
            div.addEventListener('click', function (e) {
                if (e.target === this) {
                    join_room(this, room_id, forced_refresh=true)
                }
            })
            delete_btn.addEventListener('click', function(e) {
                if (e.target === this) {
                    leave_room(this, room_id)
                }
            })
            
        }
    }) 


    socket.on("leave_room_success", data => {

        console.log("leave room sucess")


        if (data['username'] != username) {
            print_message(data['username'], data['message'], ontop=false)
            scrollToBottom();
            return;
        }

        socket.emit('leave', {'username': username, 'room_id': data['room_id']})

        var room_div = rooms_display.querySelector(`div[data-id="${data['room_id']}"]`)
        if (current_room === room_div) {
            // current_room = rooms_display.children.length > 0 ? rooms_display.children[0] : null;


            if (rooms_display.children.length > 1) {
                rooms_display.removeChild(room_div)
                let destination_room = rooms_display.children[0]
                join_room(destination_room, destination_room.getAttribute('data-id'))
                return;
            } else {
                current_room = null;
                chat_display.innerHTML = "";
            }
        }

        rooms_display.removeChild(room_div)


    })
    
    socket.on("enter_room_success", data => {
        var room_exist = false

        if (data['username'] !== username) {
            print_message(data['username'], data['message'], ontop=false)
            scrollToBottom();
            return;
        }

        for (let i = 0; i < rooms_display.children.length; i++) {
            let div = rooms_display.children[i]
            let room_id = div.getAttribute('data-id')
            if (room_id == data['room_id']) {
                room_exist = true;
                break;
            }
        }

        if (room_exist) {
            var room_div = rooms_display.querySelector(`div[data-id="${data['room_id']}"]`)
            join_room(room_div, data['room_id'], forced_refresh=true)

        } else {

            make_room(data['room_id'], data['room_name'])
            // chat_display.innerHTML = "";
            // print_message(username, data['message'])
        }

    })

    socket.on("messages_requested", function(json) {
        
        data = JSON.parse(json);

        let before_length = chat_display.children.length;

        if (data['mes'].length < 1) {
            return;
        }

        let concat = data['concat']
        let scrollToBot = false;

        if (!concat) {
            chat_display.innerHTML = "";
            scrollToBot = true;
            for (let i = data['mes'].length - 1; i >= 0; i--) {
                let user = data['mes'][i].username
                let content = data['mes'][i].content
                print_message(user,content, ontop=false)
            }
        } else {
            for (let i = 0; i < data['mes'].length; i++) {
                let user = data['mes'][i].username
                let content = data['mes'][i].content
                print_message(user,content, ontop=true)
            }
        }

        let after_length = chat_display.children.length;

        if (scrollToBot) {
            scrollToBottom();
        } else {
           // maintain where the scroll is percentage wise
           console.log(before_length, after_length) 
           scrollToPercent((after_length - before_length)/after_length);

        }
    })

      socket.on('connect', () => {
        //   var room_id = 0;
        //   console.log('connected');
        //   socket.emit('load_history',room_id);
      })


      socket.on('message', data => {
          console.log(`message received: ${data}`)
      })

    socket.on('message_created', function(data) {

            print_message(data['username'], data['text'])

            if (data['username'] == username) {
                text_area.value = '';
            }

            scrollToBottom();
      })

      socket.on('room_created_sucessfully', data => {
            make_room(data['room_id'], data['room_name']);
      })

    // add events to elements:
      // scrolling up and add old messages:
    let lastKnownScrollPos = -1;
    let ticking = false;
    chat_display.addEventListener('scroll', function() {
        lastKnownScrollPos = this.scrollTop;
        if (!ticking) {
            window.requestAnimationFrame(function() {
                if (lastKnownScrollPos === 0) {
                    request_messages(current_room.getAttribute('data-id'), offset=chat_display.children.length, limit=10, concat=true) 
                }
                ticking = false;
            })
            ticking = true;
        }
    })

    btn_enter.addEventListener('click', function() {
        post_message();
    })

    btn_join_room.addEventListener('click', () => {
        var room_id = prompt("Enter the room ID: ")
        room_id = room_id.trim()
        if (room_id != null && room_id != "") {
            socket.emit('join', {'username': username, 'room_id': room_id})
            socket.emit('enter_room', {room_id: room_id, username: username});
        }
    })

    btn_create_room.addEventListener('click', () => {
        var room_name = prompt("Enter the name of your new room")
        if (room_name != null && room_name.trim() != "") {
            socket.emit('generate_room', {username: username, room_name : room_name});
        }
    })

    function request_messages(room_id, offset=0, limit=10, concat=false) {
        socket.emit('request_messages', {room_id: room_id, offset: offset, limit: limit, concat: concat})
    }

    function post_message() {
        if (current_room != null ) {
            if (text_area.value.trim() !== "" ) {
                let current_text = text_area.value.trim();
                let room_id = current_room.getAttribute("data-id")
                socket.emit('message_created', {username: username, room_id: room_id, text: current_text}); 
            }
        }
    }

    function leave_room(btn, room_id) {
        socket.emit('leave_room', {room_id: room_id, username: username})
    }


    function join_room(div, room_id, forced_refresh=false) {
        if (current_room !== div) {
            request_messages(room_id)
            socket.emit('join', {'username': username, 'room_id': room_id })
            if (current_room) {
                current_room.style.backgroundColor = "grey"
            }
            current_room = div
            current_room.style.backgroundColor = "orange"
            var s = current_room.getElementsByTagName("SPAN")[0]
            // console.log("you're in room " + s.innerHTML.trim())
        }
        else {
            console.log("you're already in it")
            if (forced_refresh) {
                request_messages(room_id)
            }
        }

    }

    function make_room(id, name) {
        var room_div = document.createElement('div')
        room_div.classList.add('room');

        // add span for name:
        var s = document.createElement('span')
        s.innerHTML = name + "id: " + id;
        room_div.appendChild(s);

        room_div.setAttribute('data-id', id);
        room_div.addEventListener('click', function (e) {
            if (e.target == this) {
                join_room(this, id);
            }
        })            

        // add button
        var btn = document.createElement('button');
        btn.innerHTML="Leave Room";
        
        btn.addEventListener('click', function (e) {
            if (e.target == this) {
                leave_room(this, id);
            }
        })

        btn.classList.add('btn', 'btn-danger');

        room_div.appendChild(btn)

        rooms_display.appendChild(room_div);

        // switch current room
        join_room(room_div, id)
    }

    function print_message(user , m, ontop=false) {
        var new_message_div = document.createElement('div');
        new_message_div.innerHTML = `<b>${user}</b>: ${m}`
        if (ontop) {
            chat_display.insertBefore(new_message_div, chat_display.firstChild)
        }
        else {
            chat_display.appendChild(new_message_div);
        }
    }

    function scrollToBottom () {
        chat_display.scrollTo(0, chat_display.scrollHeight);
    }

    function scrollToPercent(p) {
        chat_display.scrollTo(0, chat_display.scrollHeight*p);
    }
    // bind enter button:
    text_area.addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
        }
    })
    text_area.addEventListener('keyup', function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            btn_enter.click();
        }
    })

})
