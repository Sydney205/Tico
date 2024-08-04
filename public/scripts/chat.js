const socket = io('http://localhost:3000');
const roomName = window.location.pathname.substring(1);

const form = document.getElementById('form');
const input = document.getElementById('input');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat', { msg: input.value, room: roomName });
    input.value = '';
  }
});
