// MODEL
let boardSquare = {};
let figures = [];

let IdsGiven = 0;
let isFigurePicked = false;

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
const idInput = document.getElementById('idInput');
const figureType = document.getElementById('dropDownFigures');



// fills array 'boardSquare' with objects contining ID and location of square
function giveId(i, a, incrI, incrA) {
  id = '' + letters[i] + numbers[a];
  x = 25+incrI;
  y = 25+incrA;
  boardSquare[id] = ({
    id,
    x,
    y
  });
}

function figureAdd(id, color) {
  let check = true;
  let defaultColor = white;
  let localColor; 


  figures.forEach(element => {
    if (id === element.id) {
      check = false;
    }
  });

  if (check) {
      figures.push({
        id: id,
        type: figureType.value,
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

      ctx.fillStyle = 'black'
      ctx.font = '25px Arial';
      ctx.fillText (letters[a],68+incrA, 20);
      ctx.fillText (numbers[a],5, 80+incrA);

    for (let i = 0; i < 8; i++) {
      const incrI = i * 100;

      if (isBlack) {
        ctx.fillStyle = 'rgb(94, 57, 19)'
      } else {
        ctx.fillStyle = 'rgb(209, 173, 90)'
      }

      ctx.fillRect (25+incrI, 25+incrA, 100, 100);

      // Gives Ids only once on first draw, never changes Ids again
      if (IdsGiven < 64) {
        giveId(i, a, incrI, incrA);
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
  if (isEmpty(squareId) === false && isFigurePicked === false) {
    console.log('Occupied');
    isFigurePicked = true;
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
  isFigurePicked = false;
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
  let id = 'a1';
 if (idInput.value) {
  id = idInput.value;
 }
    
  const color = document.querySelector('input[type="radio"][name="color"]:checked').value

  figureAdd(id, color);
}
