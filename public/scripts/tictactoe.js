const socket = io('http://localhost:3000');
const roomName = window.location.pathname.substring(1);

socket.emit('joinroom', `${roomName}`);

// Elements...
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const cells = document.getElementsByClassName('cells');
const comment = document.getElementById('comment'); // The commentator
const restartButton = document.getElementById('restartButton');

const xScore = document.getElementById('xScores');
const yScore = document.getElementById('yScores');

let xCounter = 0;
let yCounter = 0;

xScore.textContent = xCounter;
yScore.textContent = yCounter;

restartButton.style.display = "none";
  
let chatOpened = false;
let player = 'X';
let x_is_next = true;

comment.textContent = `It's ${player}'s turn`;

function showChat() {
  chatOpened = !chatOpened;
  if (chatOpened) {
    messages.style.height = "13rem";
    messages.style.marginTop = "-4rem";
    messages.style.borderWidth = "2px";
    messages.style.padding = "1rem";
  } else {
    messages.style.height = "0px";
    messages.style.marginTop = "none";
    messages.style.borderWidth = "0px";
    messages.style.padding = "0px";
  }

}

function checkGame(p) {
  const combinations = [
     [0, 1, 2], /********/
     [3, 4, 5], /* rows */
     [6, 7, 8], /********/
    
     [0, 3, 6], /***********/
     [1, 4, 7], /* columns */
     [2, 5, 8], /***********/
    
     [0, 4, 8], /* diagonals */
     [2, 4, 6], /*************/
  ];

  for (let i=0;i<combinations.length;i++) {
    const [a, b, c] = combinations[i];
    if (cells[a].textContent == p && cells[b].textContent == p && cells[c].textContent == p) {
      return true;
    }
  }
  return false;
}

function restartGame() {
  socket.emit('restartGame', roomName);
  restartButton.style.display = "none";
  
  comment.textContent = "";
  comment.style.color = "rgb(133, 77, 14)";
}

// Chats...
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat', { msg: input.value, room: roomName });
    input.value = '';
  }
});

// Function to enable/disable cells based on the current player
function updateBoardState(isBlocked) {
  for (let i = 0; i < cells.length; i++) {
    cells[i].disabled = isBlocked;
  }
}

let playerTurn = true;

updateBoardState(true); // Initially disable the board

socket.on('updateGameState', (newGameState) => {
  restartButton.style.display = "none";
  comment.textContent = "";

  // Update the UI based on the game's new state
  for (let i = 0; i < newGameState.cells.length; i++) {
    cells[i].textContent = newGameState.cells[i];
    player = newGameState.currentPlayer;
  }

  updateBoardState(!playerTurn); // Disable board if it's not local player's turn
  playerTurn = !playerTurn;

  if (playerTurn) {
    comment.textContent = `It's ${player}'s turn`;
  }
  
  console.log('Updated boardstate');
});


// Handling player's movements
for (let i = 0; i < cells.length; i++) {
  cells[i].addEventListener('click', () => {
    console.log('Cell clicked:', i); // Log the clicked cell index
    if (cells[i].textContent !== "") {
      console.log('Cell is not empty, returning.'); // Log if cell is not empty
      return;
    }
    
    cells[i].textContent = player;

    socket.emit('play', { index: i, symbol: player, room: roomName });
    
    if (checkGame(player)) {
      console.log(`\x1b[92m${player} wins!\x1b[0m`);
      socket.emit('endGame', { room: roomName, player: player});
    }
    
    x_is_next = !x_is_next;
    player = x_is_next ? 'X' : 'O';
  });
}

socket.on('showWinner', (player) => {
  comment.textContent = `${player} wins`;
  comment.style.color = "rgb(22, 163, 74)";
        
  restartButton.style.display = "flex";

  if (player == 'X') {
    xCounter++;
    xScore.textContent = xCounter;
  } else {
    yCounter++;
    yScore.textContent = yCounter;
  }

  updateBoardState(true);
})

socket.on('chat', (msg) => {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  chatOpened = true;
  messages.style.display = "flex";
  messages.style.height = "13rem";
  messages.style.marginTop = "-4rem";
  messages.style.borderWidth = "2px";
  messages.style.padding = "1rem";
  messages.scrollTo(0, document.body.scrollHeight);

  for (let i=0;i<item.length;i++) {
    if (i % 2 != 0) {
      item[i].style.backgroundColor = "rgb(22, 163, 74)";
      item[i].style.color = "red";
      item[i].style.opacity = 0.5;
    }
  }
});

socket.on('occupied', (roomName) => {
  window.location.href = 'http://localhost:3000/occupied';
})
