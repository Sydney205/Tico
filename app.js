import express from 'express';
import { fileURLToPath } from 'url' 
import { dirname, join } from 'path'
import { createServer } from 'http';
import { Server } from 'socket.io';
import nunjucks from 'nunjucks';
import routes from './routes.js';
import { setupSocket } from './config/socket.js';

const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express();
const server = createServer(app);
const io = new Server(server);

// Configure Nunjucks
nunjucks.configure('views', {
  autoscape: true,
  express: app
});

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));
app.use('/', routes);

setupSocket(io);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

