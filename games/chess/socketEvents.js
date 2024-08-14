import { gameStates, initializeGameState } from './gameLogic.js'

export function setupChessSockets(io, socket) {
  socket.on('chess_join', (room) => {
    const roomObject = io.sockets.adapter.rooms.get(room);
    const clients = roomObject ? roomObject.size : 0;

    if (clients < 2) {
      socket.join(room);

      if (!gameStates[room]) {
        gameStates[room] = initializeGameState();
      }

      // gameState.isPlayerTurn = !gameState.isPlayerTurn;
      
      io.to(room).emit('chess_updateGameState', gameStates[room]);
      console.log(`${socket.id} joined room ${room}`);
    } else {
      socket.emit('chess_occupied');
    }
  })

  socket.on('chess_play', ({room, gameState}) => {
    gameStates[room] = gameState;
    // console.log(gameStates[room]);
    io.to(room).emit('chess_updateGameState', gameStates[room]);
  })
  
}
