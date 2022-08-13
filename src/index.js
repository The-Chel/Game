// MODEL
let boardSquare = {};
let figures = [];

let IdsGiven = 0;
let isFigurePicked = false;

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const numbers = [8, 7, 6, 5, 4, 3, 2, 1];





// fills array 'boardSquare' with objects contining ID and location of square
function giveId(i, a, incrI, incrA, color) {
  id = '' + letters[i] + numbers[a];
  x = 25+incrI;
  y = 25+incrA;
  boardSquare[id] = ({ //canMove = false;
    id,
    x,
    y,
    color
  });
}
// for (let canMove in boardSquare) {}
// delete boardSquare.canMove;

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
  const figureTo = figureFind(toId);
  const figureFrom = figureFind(fromId);

  if (toId && fromId) { // goes here on figure's move
    const fromSquare = boardSquare[fromId];
    const toSquare = boardSquare[toId];
    
    figureFrom.x = toSquare.x;
    figureFrom.y = toSquare.y;
    figureFrom.id = toSquare.id;
    toSquare.isEmpty = false;
    fromSquare.isEmpty = true;

    addHistory(fromId, toId, figureFrom.color, figureFrom.type);
    
  } else if (toId) { // goes here only on figure's creation
    boardSquare[toId].isEmpty = false;
    figureTo.x = boardSquare[toId].x;
    figureTo.y = boardSquare[toId].y;
  }
  render();
  
}

function figureRemove(id, all) {
  figures = figures.filter((element) => {
    if (id === element.id) {
      return false;
    } else { return true;}
  });
  if (all) {
    figures = [];
  }
  render();
}





// VISUAL

const canvas = document.getElementById('myCanvas');
canvas.style.backgroundColor = 'rgb(148, 106, 62)';

const ctx = canvas.getContext('2d');

const square = 100; // 100px
const figureUnicodes = {
  king: { black: '\u265A', white: '\u2654' },
  queen: { black: '\u265B', white: '\u2655' },
  rook: { black: '\u265C', white: '\u2656' },
  bishop: { black: '\u265D', white: '\u2657' },
  knight: { black: '\u265E', white: '\u2658' },
  pawn: { black: '\u265F', white: '\u2659' }
}

function render() { // erases the screen, updates visual inforamtion
  ctx.clearRect(0, 0, canvas.width, canvas.height); // deletes evrything
  createCheckBoard(); // draws checkbox
  figureDraw(); // draws figures

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

  Object.entries(boardSquare).forEach(entry => {
    delete entry[1].canMove;
    if (entry[1].isEmpty) delete entry[1].isEmpty;
  })
}

function movesDraw(id, direction, oneMove) {
  let localId = id;
  index = 0;
  if (oneMove) {
    index = 7;
  }
  try {
    while (index<8) {
      if (boardSquare[localId].isEmpty === false) {
        index = 10;
        ctx.fillStyle = 'rgb(135, 135, 135)'
        ctx.fillRect(boardSquare[localId].x, boardSquare[localId].y, 100, 100);
        console.log('Figure on', direction);
        return;
      }

      boardSquare[localId].canMove = true;

      let squareColor = boardSquare[localId].color;
      if (squareColor === 'brown') {
        ctx.fillStyle = 'rgb(63, 38, 13)';
      } else if (squareColor === 'light') {
        ctx.fillStyle = 'rgb(155, 122, 44)';
      }
      ctx.fillRect(boardSquare[localId].x, boardSquare[localId].y, 100, 100);

      switch (direction) {
        case 'top':
          localId = findSquareId((boardSquare[localId].x+1), (boardSquare[localId].y-square+1));
          break;
        case 'top-right':
          localId = findSquareId((boardSquare[localId].x+square+1), (boardSquare[localId].y-square+1));
          break;
        case 'right':
          localId = findSquareId((boardSquare[localId].x+square+1), (boardSquare[localId].y+1));
          break;
        case 'bottom-right':
          localId = findSquareId((boardSquare[localId].x+square+1), (boardSquare[localId].y+square+1));
          break;
        case 'bottom':
          localId = findSquareId((boardSquare[localId].x+1), (boardSquare[localId].y+square+1));
          break;
        case 'bottom-left':
          localId = findSquareId((boardSquare[localId].x-square+1), (boardSquare[localId].y+square+1));
          break;
        case 'left':
          localId = findSquareId((boardSquare[localId].x-square+1), (boardSquare[localId].y+1));
          break;
        case 'top-left':
          localId = findSquareId((boardSquare[localId].x-square+1), (boardSquare[localId].y-square+1));
          break;
        case 'knight': //CONTINUE
          localId = findSquareId((boardSquare[localId].x-square+1), (boardSquare[localId].y-square+1));
          break;

        default: console.log('somehow default');
          break;
      }
      
      index++
    }
  } catch (error) {
    console.log('End of board at', direction);
  }
}

function onButtonFigureDraw() {

  const idInput = document.getElementById('idInput');
  const figureType = document.getElementById('dropDownFigures').value;
  const color = document.querySelector('input[type="radio"][name="color"]:checked').value

  let id = 'a8';
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

function addHistory(fromId, toId, color, type) {
  const HistoryHolder = document.getElementById('historyHolder');
  const historyMove = document.createElement('div');
  const colorTo = color.charAt(0).toUpperCase()+color.slice(1);
  historyMove.innerText = colorTo + ' ' + type + ' moved from "' + fromId + '" to "' + toId +'"'
  historyMove.id = 'history'
  HistoryHolder.appendChild(historyMove);
}





// CALCULATION

canvas.addEventListener('click', (e) => {
  const squareId = findSquareId(e.offsetX, e.offsetY);
  // if square isEmpty = false, then find figure on the square
  if (isEmpty(squareId) === false && isFigurePicked === false) {
    console.log('Occupied');

    isFigurePicked = true;
    highlightMove(squareId);
    figureMove(squareId);
  } else { console.log('Empty');}
     // wait until next mouse input, move figure to other square if is Empty = true
})

//finds clicked square
function findSquareId(x, y) {
  let returnId;
  Object.entries(boardSquare).forEach(entry => {
    const element = entry[1];
    if (x > element.x && x < (element.x+100) && y > element.y && y < (element.y+100)) {
      returnId = element.id;
    }
  });
  return returnId;
}

function isEmpty(id) {
  try {
    return boardSquare[id].isEmpty;
  } catch (error) {
    console.log('not a square');
  }
}

function figureMove(idIn) {
  let firstColor;
  let secondColor;
  let element = figureFind(idIn);
  let secondElement;

  firstColor = element.color;
  canvas.addEventListener('click', (e) => {
    const squareId = findSquareId(e.offsetX, e.offsetY);
    secondElement = figureFind(squareId);

    if (idIn === squareId) { // same square
      console.log('clicked the same square');
    } else if (isEmpty(squareId) !== false && boardSquare[squareId].canMove) { // free square
      console.log('square was not occupied');
      figurePositionChange(squareId, idIn);
    } else {
      console.log('square was occupied'); // occupied square

      secondColor = secondElement.color

      if (firstColor !== secondColor && boardSquare[squareId].canMove) {
        console.log('by enemy');
        figureRemove(squareId);
        figurePositionChange(squareId, idIn);
      } else {console.log('by ally');}
    }
    isFigurePicked = false;
    render();
  }, {once : true})
}

function highlightMove(id) {
  //  first half of render() to redraw board with no figures
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  createCheckBoard();
  let element = figureFind(id);
 
  let topId = findSquareId((element.x+1), (element.y-square+1));
  let rightId = findSquareId((element.x+square+1), (element.y+1));
  let bottomId = findSquareId((element.x+1), (element.y+square+1));
  let leftId = findSquareId((element.x-square+1), (element.y+1));

  let topRightId = findSquareId((element.x+square+1), (element.y-square+1));
  let bottomRightId = findSquareId((element.x+square+1), (element.y+square+1));
  let bottomLeftId = findSquareId((element.x-square+1), (element.y+square+1));
  let topLeftId = findSquareId((element.x-square+1), (element.y-square+1));
  
  let oneMove = false;
  
  switch (element.type) {
    case 'bishop':
      console.log(element.type);

      movesDraw(topRightId, 'top-right');
      movesDraw(bottomRightId, 'bottom-right');
      movesDraw(bottomLeftId, 'bottom-left');
      movesDraw(topLeftId, 'top-left');
      break;
      case 'knight':
        console.log(element.type);
      break;
      case 'rook':
        console.log(element.type);

        movesDraw(topId, 'top');
        movesDraw(rightId, 'right');
        movesDraw(bottomId, 'bottom');
        movesDraw(leftId, 'left');            
      break;
      case 'queen':
        console.log(element.type);

        movesDraw(topId, 'top');
        movesDraw(rightId, 'right');
        movesDraw(bottomId, 'bottom');
        movesDraw(leftId, 'left');  

        movesDraw(topRightId, 'top-right');
        movesDraw(bottomRightId, 'bottom-right');
        movesDraw(bottomLeftId, 'bottom-left');
        movesDraw(topLeftId, 'top-left');

      break;
      case 'king':
        console.log(element.type);
        oneMove = true;

        movesDraw(topId, 'top', oneMove);
        movesDraw(rightId, 'right', oneMove);
        movesDraw(bottomId, 'bottom', oneMove);
        movesDraw(leftId, 'left', oneMove);  

        movesDraw(topRightId, 'top-right', oneMove);
        movesDraw(bottomRightId, 'bottom-right', oneMove);
        movesDraw(bottomLeftId, 'bottom-left', oneMove);
        movesDraw(topLeftId, 'top-left', oneMove);
      break;
    
    default: 
      console.log(element.type);
      oneMove = true;
      if (element.color === 'white') {
        movesDraw(topId, 'top', oneMove);
      } else movesDraw(bottomId, 'bottom', oneMove);
      break;
  }


  // second pard of render() for figures only
  figureDraw();
}

function figureFind(id) {
  let returnElement;
  figures.forEach(element => {
    if (id === element.id) {
      returnElement = element;
    }
  });
  return returnElement;
}

render();
figDef();
// alert("There are a couple of bugs I haven't fixed yet. No move highlight for Knights. Figures are drawn with every click on any figure. Sometimes figures are not drawn over the new square");