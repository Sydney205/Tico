const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const msgBtn = document.getElementById('showMessages');

let chatOpened = false;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat', { msg: input.value, room: roomName });
    input.value = '';
  }
});

msgBtn.addEventListener('click', () => {
  if (chatOpened) {
    messages.style.display = "none";
  } else {
    messages.style.display = "flex";
  }
  chatOpened = !chatOpened;
});

