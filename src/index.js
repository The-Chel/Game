// MODEL
let boardSquare = {};
let figures = [];

let IdsGiven = 0;
let isFigurePicked = false;

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const numbers = [8, 7, 6, 5, 4, 3, 2, 1];
const square = 50; // 50px




// fills array 'boardSquare' with objects contining ID and location of square
function giveId(i, a, incrI, incrA, color) {
  id = '' + letters[i] + numbers[a];
  x = 25+incrI;
  y = 25+incrA;
  boardSquare[id] = ({
    id,
    x,
    y,
    color
  });
}

function figureAdd(id, color, type) {
  let check = true;

  figures.forEach(element => {
    if (id === element.id) {
      check = false;
    }
  });

  if (check) {
      figures.push({
        id: id,
        type: type,
        color: color
      });
    }
  figurePositionChange(id);
  render();
}

function figurePositionChange(toId, fromId) {
  let coordinatesArray = []; //[0] = x. [1] = y.

  if (toId && fromId) { // goes here on figure's move
    const fromSquare = boardSquare[fromId];
    const toSquare = boardSquare[toId];

    figures.forEach(element => {
      if (fromId === element.id) {
        element.x = toSquare.x;
        element.y = toSquare.y;
        element.id = toSquare.id;
        toSquare.isEmpty = false;
        fromSquare.isEmpty = true;
      }
    });
  } else if (toId) { // goes here only on figure's creation
    const element2 = boardSquare[toId];
    coordinatesArray[0] = element2.x;
    coordinatesArray[1] = element2.y;
    element2.isEmpty = false;
    figures.forEach(element => {
      if (toId === element.id) {
        element.x = coordinatesArray[0];
        element.y = coordinatesArray[1];
      }
    });
  }
  render();
}

function figureRemove(id) {
  figures = figures.filter((element) => {
    if (id === element.id) {
      return false;
    } else { return true;}
  });
  render();
}

// VISUAL

const canvas = document.getElementById('myCanvas');
canvas.style.backgroundColor = 'rgb(148, 106, 62)';

const ctx = canvas.getContext('2d');


function render() { // erases the screen, updates visual inforamtion
  ctx.clearRect(0, 0, canvas.width, canvas.height); // deletes evrything
  createCheckBoard(); // draws checkbox
  figureDraw(); // draws figures
}

const figureUnicodes = {
  king: { black: '\u265A', white: '\u2654' },
  queen: { black: '\u265B', white: '\u2655' },
  rook: { black: '\u265C', white: '\u2656' },
  bishop: { black: '\u265D', white: '\u2657' },
  knight: { black: '\u265E', white: '\u2658' },
  pawn: { black: '\u265F', white: '\u2659' }
}

function figureDraw() {
  ctx.save();
  figures.forEach(element => {
  ctx.fillStyle = "black";
  ctx.font = '100px serif';
  ctx.textAlign = 'center';
  ctx.fillText(figureUnicodes[element.type][element.color], 50+element.x, 85+element.y);
  });
  ctx.restore();
}

function createCheckBoard() {
  let isBlack = true;

  for (let a = 0; a < 8; a++) {
    const incrA = a * 100;
    let color = '';
    
    ctx.fillStyle = 'black'
    ctx.font = '25px Arial';
    ctx.fillText (letters[a],68+incrA, 20);
    ctx.fillText (letters[a],68+incrA, 844);
    ctx.fillText (numbers[a], 5, 80+incrA );
    ctx.fillText (numbers[a], 831, 80+incrA );

    for (let i = 0; i < 8; i++) {
      const incrI = i * 100;

      if (isBlack) {
        ctx.fillStyle = 'rgb(209, 173, 90)';
        color = 'light';
      } else {
        ctx.fillStyle = 'rgb(94, 57, 19)';
        color = 'brown';
      }

      ctx.fillRect (25+incrI, 25+incrA, 100, 100);

      // Gives Ids only once on first draw, never changes Ids again
      if (IdsGiven < 64) {
        giveId(i, a, incrI, incrA, color);
        IdsGiven++;
      }

      isBlack = !isBlack;
    }
  isBlack = !isBlack;
  }
}

function highlightMove(id) {
  let avaliableX;
  let avaliableY;
  let figureColor = 1;

  let squareId = '';
  let squareColor = '';

  // let openMoves = {};
  // let amountOfMoves = 0;
  figures.forEach(element => {
    if (id === element.id) {
      if (element.color === 'white') {
        figureColor = -1;
      }
      switch (element.type) {
        case 'bishop':
          console.log(element.type);
          break;
          case 'knight':
            console.log(element.type);
          break;
          case 'rook':
            console.log(element.type);
          break;
          case 'queen':
            console.log(element.type);
          break;
          case 'king':
            console.log(element.type);
          break;
        
        default: console.log(element.type);
        // amountOfMoves = 1;
        avaliableX = element.x;
        avaliableY = element.y + 2*square*figureColor;

        // for (let i = 0; i < amountOfMoves; i++) {
        //   avaliableY = avaliableY + 2*square; 
        //   openMoves[i] = ({avaliableX, avaliableY})
        //   ///////////CONTINUE
        // }
          break;
      }

      squareId = findSquareId(avaliableX+1, avaliableY+1);
      squareColor = boardSquare[squareId].color;

      if (squareColor === 'brown') {
        ctx.fillStyle = 'rgb(63, 38, 13)';
      } else if (squareColor === 'light') {
        ctx.fillStyle = 'rgb(155, 122, 44)';
      }
      //25, 25, 100, 100
      ctx.fillRect(avaliableX, avaliableY, 100, 100);
    }
  })
}

function onButtonFigureDraw() {

  const idInput = document.getElementById('idInput');
  const figureType = document.getElementById('dropDownFigures').value;
  const color = document.querySelector('input[type="radio"][name="color"]:checked').value

  let id = 'a1';
 if (idInput.value) {
  id = idInput.value;
 }
    
  figureAdd(id, color, figureType);
}

function figDef() {
  figures = [];
  // PAWNS
  for (let i = 0; i < 8; i++) {
    let id_w = letters[i] + '2';
    let id_b = letters[i] + '7';
    figureAdd(id_w, 'white', 'pawn');
    figureAdd(id_b, 'black', 'pawn');
  }
  figureAdd('a1', 'white', 'rook');
  figureAdd('h1', 'white', 'rook');
  figureAdd('a8', 'black', 'rook');
  figureAdd('h8', 'black', 'rook');

  figureAdd('b1', 'white', 'knight');
  figureAdd('g1', 'white', 'knight');
  figureAdd('b8', 'black', 'knight');
  figureAdd('g8', 'black', 'knight');

  figureAdd('c1', 'white', 'bishop');
  figureAdd('f1', 'white', 'bishop');
  figureAdd('c8', 'black', 'bishop');
  figureAdd('f8', 'black', 'bishop');

  figureAdd('d1', 'white', 'queen');
  figureAdd('e1', 'white', 'king');
  figureAdd('d8', 'black', 'queen');
  figureAdd('e8', 'black', 'king');
  
}

// CALCULATION

canvas.addEventListener('click', (e) => {
  const squareId = findSquareId(e.offsetX, e.offsetY);
  // if square isEmpty = false, then find figure on the square
  if (isEmpty(squareId) === false) {
    console.log('Occupied');

    highlightMove(squareId);
    figureMove(squareId);
  } else { console.log('Empty');}
     // wait until next mouse input, move figure to other square if is Empty = true
})

//finds clicked square
function findSquareId(clickX, clickY) {
  let returnId;
  Object.entries(boardSquare).forEach(entry => {
    const element = entry[1];
    if (clickX > element.x && clickX < (element.x+100) && clickY > element.y && clickY < (element.y+100)) {
      returnId = element.id;
    }
  });
  return returnId;
}

function isEmpty(id) {
  return boardSquare[id].isEmpty;
}

function figureMove(idIn) {
  let firstColor;
  let secondColor;

  figures.forEach(element => {
    if (idIn === element.id) {
      firstColor = element.color;
      canvas.addEventListener('click', (e) => {
        const squareId = findSquareId(e.offsetX, e.offsetY);
        if (idIn === squareId) {
          console.log('clicked the same square');
          return;
        } else if (isEmpty(squareId) !== false) { // can I just remove !== false??
          console.log('square was not occupied');
          figurePositionChange(squareId, idIn);
        } else {
          console.log('square was occupied');

          figures.forEach(secondElement => {
            if (squareId === secondElement.id) {
              secondColor = secondElement.color
            }
          });
          if (firstColor !== secondColor) {
            console.log('by enemy');
            figureRemove(squareId);
            figurePositionChange(squareId, idIn);
            return;
          }
        }
      }, {once : true})
    }
  });
}

render();