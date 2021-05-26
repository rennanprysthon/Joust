const socket = io('/')

var table = document.querySelector('#table');

const BLACK = `<i id="black" class="fas fa-chess-knight"></i>`;
const WHITE = `<i id="white" class="fas fa-chess-knight"></i>`;

for(var i = 1; i <=8; i++) {
  for(var j = 1; j <=8; j++) {
    var el = `<span id="t${i}${j}" class="house" onclick="select(this)"></span>`
    table.innerHTML += el;
  }
}

var rounds = 0;
var avaliablePositions = [];
var usedPositions = [];
var focused;
var playerWay = 'white';

document.querySelector('main').innerHTML += '<div class="back" onclick="dismiss(false)"></div>';
document.querySelector('body').innerHTML += `
  <div class="modal">
    <div id="btn" onclick="initGame()">
      Iniciar jogo
    </div>
  </div>
`;

socket.on('game-full', () => {
  document.querySelector('main').innerHTML = '<div class="back" onclick="dismiss(false)"></div>';
  document.querySelector('body').innerHTML = `
  <div class="modal">
    Jogo já esta cheio
  </div>
`;
})

socket.on('put-white', position => {
  let pos = document.querySelector(`#t8${position}`);
  pos.innerHTML += WHITE;
})

socket.on('put-black', position => {
  let pos = document.querySelector(`#t1${position}`);
  pos.innerHTML += BLACK;
})

socket.on('update-positions', (pUsedPositions) => {
  usedPositions = pUsedPositions
})

socket.on('show-winner', value => {
  var name = value === 'white' ? 'black' : 'white';
  showModal(name + ' wins!')
  socket.emit('reset-server-values')
})

socket.on('update-all', (positions) => {
  positions.map(p => {
    let element = document.querySelector(`#${p}`);
    usedPositions.push(element)
    element.classList.add('used')
  })
}) 

socket.on('reset-all-values', () => {

  usedPositions.map(p => {
    let element = document.querySelector(`#${p.id}`);
    element.classList.remove('used')
  })

  document.querySelector('#black').remove()
  document.querySelector('#white').remove()

  rounds = 0;
  avaliablePositions = [];
  usedPositions = [];
  focused = null
  playerWay = 'white';
  
  table.innerHTML = ''

  for(var i = 1; i <=8; i++) {
    for(var j = 1; j <=8; j++) {
      var el = `<span id="t${i}${j}" class="house" onclick="select(this)"></span>`
      table.innerHTML += el;
    }
  }
})

socket.on('update-horse', (pos1, pos2, pPlayerWay, pRounds) => {
  let deOndeVeio = document.querySelector(`#${pos1}`)
  let paraOndeVai = document.querySelector(`#${pos2}`)

  let horse = deOndeVeio.firstElementChild;
  paraOndeVai.appendChild(horse)

  deOndeVeio.innerHTML = ''
  deOndeVeio.classList.remove('focused')
  playerWay = pPlayerWay;

  uncheckAll()

  rounds = pRounds;

  const name = playerWay === 'black' ? 'Preto' : 'Branco';
  document.querySelector('#player').innerHTML = name
})

socket.on('start-game', () => {
  avaliableAll();

  rounds = 0;
  avaliablePositions = [];
  usedPositions = [];
  focused = null;
  playerWay = 'white';

  document.querySelector('.back').remove();
  document.querySelector('.modal').remove();
})

function initGame() {
  socket.emit('enter-player', '')
}

function select(e) {    
  if (e === focused) {
    uncheckAll()
    focused = null;
    return;
  }
  if (focused) {
    if (avaliablePositions.includes(e)) {
      socket.emit('change-horse', focused.id, e.id, rounds)
      socket.emit('mark-position', focused.id)
      focused = null;
      return;
    }
  } else {
    if (e.firstElementChild) {    
      var horseName = e.firstElementChild.id;

      if (horseName !== playerWay) return;
      focused = e;
      focused.classList.add('focused')
      checkAvaliablePlaces(getValueFromPosition(e))
      if(avaliablePositions.length < 1) {
        if(e.firstElementChild.id) {
          socket.emit('end-game', e.firstElementChild.id)
        }
      }
    }
  }
}

const getValueFromPosition = (e) => ({p1: e.id.substring(1, 2), p2: e.id.substring(2, 3)});
const getElementFrom = (n1, n2) => document.querySelector(`#t${n1}${n2}`);

function checkAvaliablePlaces({ p1, p2 }) {
  var x = Number(p1);
  var y = Number(p2)

  isAvaliable(x+1,y-2);
  isAvaliable(x+2,y-1);
  isAvaliable(x-1,y-2);
  isAvaliable(x+1,y+2);
  isAvaliable(x-1,y+2);
  isAvaliable(x-2,y-1);
  isAvaliable(x+2,y+1);
  isAvaliable(x-2,y+1);
}

function isAvaliable(n1, n2) {
  var pos = getElementFrom(n1, n2);
  if (usedPositions.includes(pos)) {
    return;
  }
  if (pos != undefined && !(pos.firstElementChild !== null)) {
    getElementFrom(n1, n2).classList.add('avaliable')
    avaliablePositions.push(pos);
  }
}

function uncheckAll() {
  avaliablePositions.map(element => {
    element.classList.remove('avaliable')
  })
  avaliablePositions = []
}

function avaliableAll() {
  usedPositions.map(element => {
    element.classList.remove('used')
  });
  usedPositions = [];
}

function markUsed(e) {
  socket.emit('mark-position', e.id)
}


function showModal(e) {
  var name = `<h3>${e}</h3>`
  document.querySelector('main').innerHTML += '<div class="back" onclick="dismiss(true)"></div>';
  document.querySelector('body').innerHTML += `
    <div class="modal">
      ${name}
      <div id="btn" onclick="initGame()">
        Reiniciar jogo
      </div> 
    </div>
  `;
}

function dismiss(canDismiss) {
  if (!canDismiss) return
  document.querySelector('.back').remove();
  document.querySelector('.modal').remove();
}