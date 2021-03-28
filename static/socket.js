document.addEventListener('DOMContentLoaded', () => {
    const btn_enter = document.querySelector('#btn-send')
    const chat_display = document.querySelector('#chat_history_display')
    var text_area = document.querySelector('#text-message')
 
    var socket = io.connect('http://' + document.domain + ':' + location.port);

      socket.on('connect', () => {
        //   var room_id = 0;
        //   console.log('connected');
        //   socket.emit('load_history',room_id);
        print_message(`<b>${username}</b> has joined`);
      })


      socket.on('message', data => {
          console.log(`message received: ${data}`)
      })

      socket.on('message_created_sucessfully', data => {
            print_message(data)
            text_area.value = '';
      })

    btn_enter.addEventListener('click', ()=> {
        let current_text = text_area.value.trim();

        socket.emit('message_created', {text: current_text}); 
    })

    function send_message() {

    }

    function print_message(m) {
        var new_message_div = document.createElement('div');
        new_message_div.innerHTML = m;
        chat_display.appendChild(new_message_div);
    }


})