import { gameStates, initializeGameState } from './gameLogic.js';

export function setupTicTacToeSockets(io, socket) {
  socket.on('ttt_join', (room) => {
    const roomObject = io.sockets.adapter.rooms.get(room);
    const clients = roomObject ? roomObject.size : 0;

    if (clients < 2) {
      socket.join(room);

      if (!gameStates[room]) {
        gameStates[room] = initializeGameState();
      }

      // gameState.isPlayerTurn = !gameState.isPlayerTurn;
      
      io.to(room).emit('ttt_updateGameState', gameStates[room]);
      console.log(`${socket.id} joined room ${room}`);
    } else {
      socket.emit('ttt_occupied');
    }
  });

  socket.on('ttt_play', ({ index, symbol, room }) => {
    const gameState = gameStates[room];
    if (gameState && !gameState.cells[index] && gameState.currentPlayer === symbol) {
      gameState.cells[index] = symbol;
      gameState.currentPlayer = symbol === 'X' ? 'O' : 'X';

      const winner = checkForWinner(gameState.cells, symbol);
      if (winner) {
        io.to(room).emit('ttt_updateGameState', gameState);
        io.to(room).emit('ttt_showWinner', symbol);
      } else if (gameState.cells.every(cell => cell !== null)) {
        io.to(room).emit('ttt_updateGameState', gameState);
        io.to(room).emit('ttt_draw');
      } else {
        io.to(room).emit('ttt_updateGameState', gameState);
      }
    }
  });

  socket.on('ttt_restartGame', (room) => {
    gameStates[room] = initializeGameState();
    io.to(room).emit('ttt_updateGameState', gameStates[room]);
    io.to(room).emit('ttt_restart');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
}

export function checkForWinner(cells, symbol) {
  const combinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6] 
  ];

  for (const [a, b, c] of combinations) {
    if (cells[a] === symbol && cells[b] === symbol && cells[c] === symbol) {
      return symbol;
    }
  }
  return null;
}

