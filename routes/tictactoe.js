import express from "express";
const router = express.Router();

router.get('/create-join-room', (req, res) => {
  res.render('./rooms/ttt_room.html', { title: "Create or join a tictactoe room" })
})

router.get('/:roomName', (req, res) => {
  const { roomName } = req.params.roomName

  res.render('./games/tictactoe.html', { title: `room: ${req.params.roomName}` })
})

export default router

