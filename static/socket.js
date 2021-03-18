document.addEventListener('DOMContentLoaded', () => {
    var socket = io.connect('http://' + document.domain + ':' + location.port);

      socket.on('connect', () => {
          console.log('connected');
          socket.send("You're connected");
      })

      socket.on('message', data => {
          console.log(`message received: ${data}`)
      })
})