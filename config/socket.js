import { setupTicTacToeSockets } from '../games/tictactoe/socketEvents.js';

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    setupTicTacToeSockets(io, socket);

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
}

