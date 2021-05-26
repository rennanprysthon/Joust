const express = require('express');
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server)

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.render('index')
})

var players = [];
var usedPositions = [];
var rounds = 0;

io.on('connection', socket => {
  if(players.length == 2) {
    socket.emit('game-full')
  }

  socket.on('enter-player', socket => {
   
    if(players.length == 1){
      players.push('white')
      io.emit('put-white', Math.floor(Math.random() * 8) + 1)
    }
    if (players.length == 0) {
      players.push('black')
      io.emit('put-black', Math.floor(Math.random() * 8) + 1)
    } 
  
    if(players.length == 2) {
      io.emit('start-game')
    }
  })

  socket.on('mark-position', (position) => {
    usedPositions.push(position);

    io.emit('update-all', usedPositions)
  })

  socket.on('change-horse', (pos1, pos2) => {
    rounds++;
    let playerWay = 'white'
    if(rounds % 2 != 0) {
      playerWay = 'black'
    }

    io.emit('update-horse', pos1, pos2, playerWay, rounds)
  })


  socket.on('end-game', (value)=> {
    io.emit('show-winner', value)
  })

  socket.on('reset-server-values', () => {
    rounds = 0
    usedPositions = []
    playerWay = 'white'
    players = []
    io.emit('reset-all-values', '')
  })
})

server.listen(process.env.PORT || 3000, () =>{
  console.log('Server is running...')
})