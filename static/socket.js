document.addEventListener('DOMContentLoaded', () => {
    const btn_enter = document.querySelector('#btn-send')
    const chat_display = document.querySelector('#chat_history_display')
    const btn_create_room = document.querySelector('#create_room')
    const rooms_display = document.querySelector('#rooms_display')
    var text_area = document.querySelector('#text-message')
 

    var socket = io.connect('http://' + document.domain + ':' + location.port);

    // add functionality to rooms:
    rooms_display.children.forEach( ()=> {
        console.log("hello")
    })
    rooms_display.children.forEach( () =>{
        console.log('working');
        // var room_id = div.getAttribute('data-id')
        // let delete_btn = div.getElementsByTagName("BUTTON")
        // div.addEventListener('click', () => {
        //     console.log(this)
        //     console.log(`you click a room `)
        //     if (current_room !== div) {
        //         socket.emit('request_messages', room_id)
        //     }
        // })

        // delete_btn.addEventListener('click', () => {

        // }) 

    })
    
    socket.on("messages_requested", data => {
        chat_display.innerHTML = ""
        for (let i = 0; i < 10; i++) {
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
        let current_text = text_area.value.trim();

        socket.emit('message_created', {text: current_text}); 
    })

    btn_create_room.addEventListener('click', () => {
        var room_name = prompt("Enter the name of your new room")
        if (room_name != null && room_name.trim() != "") {
            socket.emit('generate_room', {room_name : room_name});
        }
    })


    function send_message() {

    }

    function make_room(id, name) {
        var room_div = document.createElement('div')
        room_div.classList.add('room');
        room_div.innerHTML = name;
        room_div.setAttribute('data-room-id', id);
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