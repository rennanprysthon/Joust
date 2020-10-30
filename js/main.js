var table = document.querySelector('#table');

var black = `<i id="black" class="fas fa-chess-knight"></i>`;
var white = `<i id="white" class="fas fa-chess-knight"></i>`;

var rounds = 0;
var avaliablePositions = [];
var usedPositions = [];
var focused;
var playerWay = 'white';



document.querySelector('main').innerHTML += '<div class="back" onclick="dismiss()"></div>';
document.querySelector('body').innerHTML += `
    <div class="modal">
        <div id="btn" onclick="initGame()">
            Iniciar jogo
        </div>
    </div>
`;

function initGame() {
    var table = document.querySelector('#table');
    dismiss();
    avaliableAll();

    rounds = 0;
    avaliablePositions = [];
    usedPositions = [];
    focused = null;
    playerWay = 'white';

    table.innerHTML = '';   

    for(var i = 1; i <=8; i++) {
        for(var j = 1; j <=8; j++) {
            var el = `<span id="t${i}${j}" class="house" onclick="select(this)"></span>`
            table.innerHTML += el;
        }
    }
    var n1 = Math.floor(Math.random() * 8) + 1;
    var n2 = Math.floor(Math.random() * 8) + 1;
    
    var pos1 = document.querySelector(`#t1${n1}`);
    var pos2 = document.querySelector(`#t8${n2}`);
    
    pos1.innerHTML += black;
    pos2.innerHTML += white;  
}

function select(e) {    
    if (focused) {
        if (avaliablePositions.includes(e)) {
            var horse = focused.firstElementChild;
            focused.innerHTML = ''
            e.appendChild(horse)
            uncheckAll()
            markUsed(focused);
            focused = null;
            rounds++;
            verifyNextPlayer()
        }
    } else {
        if (e.firstElementChild) {    
            var horseName = e.firstElementChild.id;

            if (horseName !== playerWay) return;
            focused = e;
            checkAvaliablePlaces(getValueFromPosition(e))
            if(avaliablePositions.length < 1) {
                if(e.firstElementChild.id) {
                    endGame(e.firstElementChild.id)
                }
            }
        }
    }
}

function verifyNextPlayer () {
    if(rounds % 2 != 0) {
        playerWay = 'black'
    } else {
        playerWay = 'white'
    }
    const name = playerWay === 'black' ? 'Preto' : 'Branco';
    document.querySelector('#player').innerHTML = name
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
    usedPositions.push(e)
    e.classList.add('used')
}

function endGame(e) {
    var name = e === 'white' ? 'BLACK' : 'WHITE';
    showModal(name + ' wins!')
}

function showModal(e) {
    var name = `<h3>${e}</h3>`
    document.querySelector('main').innerHTML += '<div class="back" onclick="dismiss()"></div>';
    document.querySelector('body').innerHTML += `
        <div class="modal">
            ${name}
            <div id="btn" onclick="initGame()">
                Reiniciar jogo
            </div> 
        </div>
    `;
}

function dismiss() {
    document.querySelector('.back').remove();
    document.querySelector('.modal').remove();
}