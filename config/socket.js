const { setupTicTacToeSockets } = require('../games/tictactoe/socketEvents.js');
const { setupChessSockets } = require('../games/chess/socketEvents.js');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    setupTicTacToeSockets(io, socket);
    setupChessSockets(io, socket);

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
};

module.exports = { setupSocket };


