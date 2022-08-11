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

// VISUAL

const canvas = document.getElementById('myCanvas');
canvas.style.backgroundColor = 'rgb(148, 106, 62)';

const ctx = canvas.getContext('2d');


function render() { // erases the screen, updates visual inforamtion
  ctx.clearRect(0, 0, canvas.width, canvas.height); // deletes evrything
  createCheckBoard(); // draws checkbox
  figureDraw(); // draws figures
  }


function figureDraw() {
  figures.forEach(element => {
  if (element.color === 'WHITE') {
    ctx.fillStyle = 'white';
    ctx.fillRect(25+element.x, 25+element.y, 50, 50);
  } else {
    ctx.fillStyle = 'black';
    ctx.fillRect(25+element.x, 25+element.y, 50, 50);
  }
  switch (element.type) {
    case 'bishop':
      ctx.fillStyle = 'blue';
      break;
      case 'knight':
      ctx.fillStyle = 'silver';
      break;
      case 'rook':
      ctx.fillStyle = 'darkgoldenrod';
      break;
      case 'queen':
      ctx.fillStyle = 'gold';
      break;
      case 'king':
      ctx.fillStyle = 'lightcoral';
      break;
    
    default: ctx.fillStyle = 'darkgreen';
      break;
  }
  ctx.fillRect(39+element.x, 39+element.y, 22, 22);
  
  });
}

function createCheckBoard() {
  let isBlack = true;

  // draws checkboard
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

render();
// CALCULATION

// on click sends cursor's location to function


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

function highlightMove(id) {
  let avaliableX;
  let avaliableY;

  let squareId = '';
  let squareColor = '';

  // let openMoves = {};
  // let amountOfMoves = 0;
  figures.forEach(element => {
    if (id === element.id) {
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
        avaliableY = element.y + 2*square;

        // for (let i = 0; i < amountOfMoves; i++) {
        //   avaliableY = avaliableY + 2*square; 
        //   openMoves[i] = ({avaliableX, avaliableY})
        //   ///////////CONTINUE
        // }
          break;
      }
      squareId = findSquareId(avaliableX+1, avaliableY+1);

      Object.entries(boardSquare).forEach(entry => {
        let element2 = entry[1];
        if (element2.id === squareId) {
          squareColor = element2.color
        }
      });

      if (squareColor === 'brown') {
        ctx.fillStyle = 'rgb(63, 38, 13)';
      } else if (squareColor === 'light') {
        ctx.fillStyle = 'rgb(155, 122, 44)';
      }


     
      // // 25, 25, 100, 100
      ctx.fillRect(avaliableX, avaliableY, 100, 100);
      
      
    }
  })
}

function figureRemove(id) {
  figures = figures.filter((element) => {
    if (id === element.id) {
      return false;
    } else { return true;}
  });
  render();
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
  // PAWNS
  for (let i = 0; i < 8; i++) {
    let id_w = letters[i] + '2';
    let id_b = letters[i] + '7';
    figureAdd(id_w, 'WHITE');
    figureAdd(id_b, 'BLACK');
  }
  figureAdd('a1', 'WHITE', 'rook');
  figureAdd('h1', 'WHITE', 'rook');
  figureAdd('a8', 'BLACK', 'rook');
  figureAdd('h8', 'BLACK', 'rook');

  figureAdd('b1', 'WHITE', 'knight');
  figureAdd('g1', 'WHITE', 'knight');
  figureAdd('b8', 'BLACK', 'knight');
  figureAdd('g8', 'BLACK', 'knight');

  figureAdd('c1', 'WHITE', 'bishop');
  figureAdd('f1', 'WHITE', 'bishop');
  figureAdd('c8', 'BLACK', 'bishop');
  figureAdd('f8', 'BLACK', 'bishop');

  figureAdd('d1', 'WHITE', 'queen');
  figureAdd('e1', 'WHITE', 'king');
  figureAdd('d8', 'BLACK', 'queen');
  figureAdd('e8', 'BLACK', 'king');
  
}