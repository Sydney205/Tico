const socket = io('http://localhost:2050');
const roomName = window.location.pathname.substring(1);

socket.emit('ttt_join', roomName);

// Elements
const cells = document.getElementsByClassName('cells');
const comment = document.getElementById('comment');
const restartButton = document.getElementById('restartButton');

const xScore = document.getElementById('xScores');
const yScore = document.getElementById('yScores');

let xCounter = 0;
let yCounter = 0;
let player = 'X';
let isPlayerTurn = true;

xScore.textContent = xCounter;
yScore.textContent = yCounter;
restartButton.style.display = "none";

// Initialize the game board
function updateBoardState(isDisabled) {
  for (let i = 0; i < cells.length; i++) {
    cells[i].disabled = isDisabled;
  }
}

function checkGame(p) {
  const combinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]  // Diagonals
  ];

  for (const [a, b, c] of combinations) {
    if (cells[a].textContent === p && cells[b].textContent === p && cells[c].textContent === p) {
      return true;
    }
  }
  return false;
}

// Socket event handlers
socket.on('ttt_updateGameState', (newGameState) => {
  comment.style.color = "rgb(133, 77, 14)";
  for (let i = 0; i < newGameState.cells.length; i++) {
    cells[i].textContent = newGameState.cells[i];

    if (newGameState.cells[i] !== null && newGameState.cells[i] !== "") {
      cells[i].disabled = true;
    }
  }

  player = newGameState.currentPlayer;
  isPlayerTurn = !isPlayerTurn;

  if (isPlayerTurn) {
    comment.textContent = "It's your turn";
    updateBoardState(false);
  } else {
    comment.textContent = `Waiting for ${player}'s move...`;
    updateBoardState(true);
  }
});

socket.on('ttt_showWinner', (winner) => {
  comment.textContent = `${winner} wins!`;
  comment.style.color = "rgb(22, 163, 74)";
  restartButton.style.display = "flex";

  if (winner === 'X') {
    xCounter++;
    xScore.textContent = xCounter;
  } else {
    yCounter++;
    yScore.textContent = yCounter;
  }

  updateBoardState(true); // Disable the board after game ends
});

socket.on('ttt_draw', () => {
  comment.textContent = "It's a draw!";
  comment.style.color = "rgb(255, 165, 0)";
  restartButton.style.display = "flex";
});

restartButton.addEventListener('click', () => {
  comment.style.color = "rgb(133, 77, 14)";
  socket.emit('ttt_restartGame', roomName);
});

socket.on('ttt_restart', () => {
  restartButton.style.display = "none";
});

socket.on('ttt_occupied', () => {
  navigate('/occupied')
});

// Cell click event
for (let i = 0; i < cells.length; i++) {
  cells[i].addEventListener('click', () => {
    if (!isPlayerTurn || cells[i].textContent !== "") return;

    socket.emit('ttt_play', { index: i, symbol: player, room: roomName });
  });
}

