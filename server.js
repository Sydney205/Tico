import express from 'express'
import { createServer } from 'http' 
import { fileURLToPath } from 'url' 
import { dirname, join } from 'path'
import { Server } from 'socket.io'
import nunjucks from 'nunjucks'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const server = createServer(app)
const io = new Server(server)

// Configure Nunjucks
nunjucks.configure('views', {
  autoscape: true,
  express: app
})

app.use(express.json())
app.use(express.static(join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('index.html')
})

app.get('/occupied', (req, res) => {
  res.sendFile(join(__dirname, 'views', 'occupied.html'))
})

app.get('/:roomName', (req, res) => {
  const { roomName } = req.params.roomName

  res.sendFile(join(__dirname, 'views', 'game.html'))
})

// Game states for several rooms
const gameStates = {}

const initializeGameState = () => {
  return {
    cells: Array(9).fill(null),
    currentPlayer: 'X'
  }
}

io.on('connection', (socket) => {
  console.log('A user arrived on site!')

  socket.on('joinroom', (room) => {

    const currentRoom = io.sockets.adapter.rooms.get(room)
    const clients = currentRoom ? currentRoom.size : 0

    if (clients < 2) {
      socket.join(room)
      if (!gameStates[room]) {
        gameStates[room] = initializeGameState()
      }
      console.log(`${socket.id} just joined room ${room}`)
    } else {
      socket.emit('occupied', room)
      console.log(`User ${socket.id} attempted to join ${room} but it was full`)
    }

    const gameState = gameStates[room]
    socket.to(room).emit('updateGameState', gameState)

    // Delete room, if there are no more connected clients
    socket.on('disconnect', () => {
      if (clients == 0) {
        io.of('/').adapter.rooms.delete(room)
        console.log(`Room \x1b[91m${room}\x1b[0m was deleted, because it's now empty`)
      } else {
        console.log(`User ${socket.id} disconnected`)
      }
    })
  })

  // Chat function
  socket.on('chat', ({ msg, room }) => {
    io.to(room).emit('chat', msg)
  })

  // Play function
  socket.on('play', ({ index, symbol, room }) => {
    const gameState = gameStates[room]
    if (!gameState.cells[index]) { // Check if the cell is empty
      gameState.cells[index] = symbol
      gameState.currentPlayer = symbol == 'X' ? 'O' : 'X'

      io.to(room).emit('updateGameState', gameState) // Emit updated game state to connected clients
    }
  })

  socket.on('endGame', ({ room, player }) => {
    io.to.(room)emit('showWinner', player)
  })

  socket.on('disconnect', () => {
    console.log('A user disconnected: ', socket.id)
  })
})

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000')
})

