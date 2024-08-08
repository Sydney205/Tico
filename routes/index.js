import express from 'express';
const router = express.Router();

// List of games
const gameList = [
  {
    name: "Tictactoe",
    desc: "Lorem ipsum tssdf sda dasdasdsd asd asdsd",
    route: "tictactoe"
  },
  {
    name: "Chess",
    desc: "Lorem ipsum tssdf sda dasdasdsd asd asdsd",
    route: "chess"
  }
]

router.get('/', (req, res) => {
  res.render('index.html', { title: "Duo board gaming platform" })
})

router.get('/games', (req, res) => {
  res.render('./games/index.html', { gameList, title: "Games" })
})

router.get('/occupied', (req, res) => {
  res.render('./redirects/occupied.html')
})

router.get('/coming_soon', (req, res) => {
  res.render('coming-soon.html')
})

router.get('/nothing', (req, res) => {
  res.render('nothing.html')
})

export default router;
