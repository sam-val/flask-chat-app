document.addEventListener('DOMContentLoaded', () => {
    const btn_enter = document.querySelector('#btn-send')
    const chat_display = document.querySelector('#chat_history_display')
    const btn_create_room = document.querySelector('#create_room')
    const rooms_display = document.querySelector('#rooms_display')
    var text_area = document.querySelector('#text-message')
    
    var current_room = rooms_display.children.length > 0 ? rooms_display.children[0] : null;

    var socket = io.connect('http://' + document.domain + ':' + location.port);

    // add functionality to rooms:
    for (let i = 0; i < rooms_display.children.length; i++) {
        let div = rooms_display.children[i]
        let room_id = div.getAttribute('data-id')
        let delete_btn = div.getElementsByTagName("BUTTON")[0]
        div.addEventListener('click', () => {
            join_room(div, room_id)
        })

        delete_btn.addEventListener('click', () => {

        }) 
        
    }
    
    socket.on("messages_requested", data => {
        chat_display.innerHTML = ""
        for (let i = 0; i < data.length; i++) {
            let user = data[i].username
            let content = data[i].content
            print_message(user,content, backwards=true)
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

      socket.on('message_created_sucessfully', data => {
            print_message(username, data)
            text_area.value = '';
      })

      socket.on('room_created_sucessfully', data => {
            make_room(data['room_id'],data['room_name']);
            chat_display.innerHTML = "";
            print_message(username, data['message'])
      })

    btn_enter.addEventListener('click', ()=> {
        if (current_room != null ) {
            let current_text = text_area.value.trim();
            let room_id = current_room.getAttribute("data-id")
            socket.emit('message_created', {username: username, room_id: room_id, text: current_text}); 
        }
    })

    btn_create_room.addEventListener('click', () => {
        var room_name = prompt("Enter the name of your new room")
        if (room_name != null && room_name.trim() != "") {
            socket.emit('generate_room', {room_name : room_name});
        }
    })


    function join_room(div, room_id) {
        if (current_room !== div) {
            socket.emit('request_messages', room_id)
            current_room = div
            console.log("you're in room " + div.innerText)
        }
        else {
            console.log("you're already in it")
        }

    }

    function make_room(id, name) {
        var room_div = document.createElement('div')
        room_div.classList.add('room');
        room_div.innerHTML = name;
        room_div.setAttribute('data-id', id);
        room_div.addEventListener('click', function () {
            join_room(this, id);
        })            

        // add button
        var btn = document.createElement('button');
        btn.innerHTML="Delete Room";
        btn.classList.add('btn', 'btn-danger');

        room_div.appendChild(btn)

        rooms_display.appendChild(room_div);
    }

    function print_message(user , m, backwards=false) {
        var new_message_div = document.createElement('div');
        new_message_div.innerHTML = `<b>${user}</b>: ${m}`
        if (backwards) {
            chat_display.insertBefore(new_message_div, chat_display.firstChild)
        }
        else {
            chat_display.appendChild(new_message_div);
        }
    }


})