// MODEL
let boardSquare = {};
let figures = [];

let IdsGiven = 0;
let isFigurePicked = false;

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
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

const figureUnicodes = {
  king: { BLACK: '\u265A', WHITE: '\u2654' },
  queen: { BLACK: '\u265B', WHITE: '\u2655' },
  rook: { BLACK: '\u265C', WHITE: '\u2656' },
  bishop: { BLACK: '\u265D', WHITE: '\u2657' },
  knight: { BLACK: '\u265E', WHITE: '\u2658' },
  pawn: { BLACK: '\u265F', WHITE: '\u2659' }
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
  numbers.reverse();

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
        ctx.fillStyle = 'rgb(94, 57, 19)'
        color = 'brown';
      } else {
        ctx.fillStyle = 'rgb(209, 173, 90)'
        color = 'light'
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
  for (let i = 0; i < 8; i++) {
    let id_w = letters[i] + '1';
    let id_b = letters[i] + '3';
    figureAdd(id_w, 'WHITE');
    figureAdd(id_b, 'BLACK');
    
  }
}
