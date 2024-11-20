const express = require('express');
const { fileURLToPath } = require('url');
const { dirname, join } = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { nunjucksConfig } = require('./config/nunjucks');


// Routes...
const roots = require('./routes/index');
const tttRoutes = require('./routes/tictactoe');
const chessRoutes = require('./routes/chess');

const { setupSocket } = require('./config/socket');

const PORT = process.env.PORT || 2050;

const app = express();
const server = createServer(app);
const io = new Server(server);

nunjucksConfig(app);

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.use('/', roots);
app.use('/tictactoe', tttRoutes);
app.use('/chess', chessRoutes);

setupSocket(io);

server.listen(PORT, () => {
  console.log(`\n \x1b[92mTi\x1b[0mco is running on port ${PORT}`);
});
