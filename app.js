import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { nunjucksConfig } from "./config/nunjucks.js";

// Routes...
import roots from "./routes/index.js";
import tttRoutes from "./routes/tictactoe.js";
import chessRoutes from "./routes/chess.js";

import { setupSocket } from "./config/socket.js";

const PORT = process.env.PORT || 2050;

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url))
const server = createServer(app);
const io = new Server(server);

nunjucksConfig(app);

app.use(express.json());
app.use(express.static(join(__dirname, "public")));

app.use("/", roots);
app.use("/tictactoe", tttRoutes);
app.use("/chess", chessRoutes);

setupSocket(io);

server.listen(PORT, () => {
  console.log(`\n Tico is running on port ${PORT}`);
});
