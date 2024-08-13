import { setupTicTacToeSockets } from '../games/tictactoe/socketEvents.js';
import { setupChessSockets } from '../games/chess/socketEvents.js';

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    setupTicTacToeSockets(io, socket);
    setupChessSockets(io, socket);

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
}

