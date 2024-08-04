import express from 'express';
const router = express.Router();

// List of games
const gameList = [
  "TicTacToe",
  "Chess"
]

router.get('/', (req, res) => {
  res.render('index.html', { title: "Duo board gaming platform" })
})

router.get('/games', (req, res) => {
  res.render('./games/index.html', { gameList, title: "Games" })
})

router.get('/create-join-room', (req, res) => {
  res.render('create-room.html', { title: "Create game room" })
})

router.get('/occupied', (req, res) => {
  res.render('./redirects/occupied.html')
})

router.get('/nothing', (req, res) => {
  res.render('nothing.html')
})

router.get('/coming_soon', (req, res) => {
  res.render('coming-soon.html')
})

router.get('/:roomName', (req, res) => {
  const { roomName } = req.params.roomName

  res.render('./games/tictactoe.html', { title: `room: ${req.params.roomName}` })
})

export default router;

