// MODEL
const boardSquare = {};
let figures = [];

let IdsGiven = 0;
let isFigurePicked = false;

const historyArray = [];
let historyCount = 1;

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const numbers = [8, 7, 6, 5, 4, 3, 2, 1];

// fills array 'boardSquare' with objects contining ID and location of square
function giveId (i, a, incrI, incrA, color) {
  const id = '' + letters[i] + numbers[a];
  const x = 25 + incrI;
  const y = 25 + incrA;
  boardSquare[id] = ({ // canMove = false;
    id,
    x,
    y,
    color
  });
}
// for (let canMove in boardSquare) {}
// delete boardSquare.canMove;

function figureAdd (id, color, type, firstTurn) {
  let check = true;

  figures.forEach(element => {
    if (id === element.id) {
      check = false;
    }
  });

  if (check) {
    figures.push({
      id,
      type,
      color,
      firstTurn
    });
  }
  figurePositionChange(id);
  render();
}

function figurePositionChange (toId, fromId) {
  const figureTo = getFigureById(toId);
  const figureFrom = getFigureById(fromId);

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

function figureRemove (id, all) {
  figures = figures.filter((element) => {
    if (id === element.id) {
      return false;
    } else { return true; }
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
};

function render () { // erases the screen, updates visual inforamtion
  ctx.clearRect(0, 0, canvas.width, canvas.height); // deletes evrything
  createCheckBoard(); // draws checkbox
  figureDraw(); // draws figures
}

function figureDraw () {
  ctx.save();
  figures.forEach(element => {
    ctx.fillStyle = 'black';
    ctx.font = '100px serif';
    ctx.textAlign = 'center';
    ctx.fillText(figureUnicodes[element.type][element.color], 50 + element.x, 85 + element.y);
  });
  ctx.restore();
}

function createCheckBoard () {
  let isBlack = true;

  for (let a = 0; a < 8; a++) {
    const incrA = a * 100;
    let color = '';

    ctx.fillStyle = 'black';
    ctx.font = '25px Arial';
    ctx.fillText(letters[a], 68 + incrA, 20);
    ctx.fillText(letters[a], 68 + incrA, 844);
    ctx.fillText(numbers[a], 5, 80 + incrA);
    ctx.fillText(numbers[a], 831, 80 + incrA);

    for (let i = 0; i < 8; i++) {
      const incrI = i * 100;

      if (isBlack) {
        ctx.fillStyle = 'rgb(209, 173, 90)';
        color = 'light';
      } else {
        ctx.fillStyle = 'rgb(94, 57, 19)';
        color = 'brown';
      }

      ctx.fillRect(25 + incrI, 25 + incrA, 100, 100);

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
  });
}

function movesDraw (id, direction, initialColor, amountOfMoves) {
  let localId = id;
  let index = 0;
  const toFigureColor = getFigureById(localId);
  const fromFigureColor = initialColor;
  if (amountOfMoves) {
    index = 8 - amountOfMoves;
  }
  try {
    while (index < 8) {
      if (boardSquare[localId].isEmpty === false && toFigureColor.color !== fromFigureColor) {
        index = 10;
        ctx.fillStyle = 'rgb(135, 135, 135)';
        ctx.fillRect(boardSquare[localId].x, boardSquare[localId].y, 100, 100);
        console.log('Figure on', direction);
        boardSquare[localId].canMove = true;
        return;
      } else if (boardSquare[localId].isEmpty === false) {
        return;
      }

      boardSquare[localId].canMove = true;

      const squareColor = boardSquare[localId].color;
      if (squareColor === 'brown') {
        ctx.fillStyle = 'rgb(63, 38, 13)';
      } else if (squareColor === 'light') {
        ctx.fillStyle = 'rgb(155, 122, 44)';
      }
      ctx.fillRect(boardSquare[localId].x, boardSquare[localId].y, 100, 100);

      switch (direction) {
        case 'top':
          localId = getSquareId((boardSquare[localId].x + 1), (boardSquare[localId].y - square + 1));
          break;
        case 'top-right':
          localId = getSquareId((boardSquare[localId].x + square + 1), (boardSquare[localId].y - square + 1));
          break;
        case 'right':
          localId = getSquareId((boardSquare[localId].x + square + 1), (boardSquare[localId].y + 1));
          break;
        case 'bottom-right':
          localId = getSquareId((boardSquare[localId].x + square + 1), (boardSquare[localId].y + square + 1));
          break;
        case 'bottom':
          localId = getSquareId((boardSquare[localId].x + 1), (boardSquare[localId].y + square + 1));
          break;
        case 'bottom-left':
          localId = getSquareId((boardSquare[localId].x - square + 1), (boardSquare[localId].y + square + 1));
          break;
        case 'left':
          localId = getSquareId((boardSquare[localId].x - square + 1), (boardSquare[localId].y + 1));
          break;
        case 'top-left':
          localId = getSquareId((boardSquare[localId].x - square + 1), (boardSquare[localId].y - square + 1));
          break;

        default:
          break;
      }

      index++;
    }
  } catch (error) {
    console.log('End of board at', direction);
  }
}

// eslint-disable-next-line no-unused-vars
function onButtonFigureDraw () {
  const idInput = document.getElementById('idInput');
  const figureType = document.getElementById('dropDownFigures').value;
  const color = document.querySelector('input[type="radio"][name="color"]:checked').value;

  let id = 'a8';
  if (idInput.value) {
    id = idInput.value;
  }

  figureAdd(id, color, figureType);
}

function figDef () {
  figures = [];
  // PAWNS
  for (let i = 0; i < 8; i++) {
    const idW = letters[i] + '2';
    const idB = letters[i] + '7';
    figureAdd(idW, 'white', 'pawn', true);
    figureAdd(idB, 'black', 'pawn', true);
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

function addHistory (fromId, toId, color, type) {
  const HistoryHolder = document.getElementById('historyHolder');
  HistoryHolder.innerHTML = '';
  const pushValue = [fromId, toId, color, type, historyCount];

  historyArray.push(pushValue);

  historyArray.forEach(element => {
    const historyMove = document.createElement('div');
    const colorTo = element[2].charAt(0).toUpperCase() + element[2].slice(1);
    historyMove.innerText = element[4] + '. ' + colorTo + ' ' + element[3] + ' moved from "' + element[0] + '" to "' + element[1] + '"';
    historyMove.id = 'history';
    HistoryHolder.appendChild(historyMove);
  });
  if (historyArray.length > 35) {
    historyArray.shift();
  }
  historyCount++;
}

// CALCULATION

canvas.addEventListener('click', (e) => {
  const squareId = getSquareId(e.offsetX, e.offsetY);
  // if square isEmpty = false, then find figure on the square
  if (isEmpty(squareId) === false && isFigurePicked === false) {
    console.log('Occupied');

    isFigurePicked = true;
    highlightMove(squareId);
    figureMove(squareId);
  } else { console.log('Empty'); }
  // wait until next mouse input, move figure to other square if is Empty = true
});

// finds clicked square
function getSquareId (x, y) {
  let returnId;
  Object.entries(boardSquare).forEach(entry => {
    const element = entry[1];
    if (x > element.x && x < (element.x + 100) && y > element.y && y < (element.y + 100)) {
      returnId = element.id;
    }
  });
  return returnId;
}

function isEmpty (id) {
  try {
    return boardSquare[id].isEmpty;
  } catch (error) {
    console.log('not a square');
  }
}

function figureMove (idIn) {
  let secondColor;
  const element = getFigureById(idIn);
  let secondElement;

  const firstColor = element.color;
  canvas.addEventListener('click', (e) => {
    const squareId = getSquareId(e.offsetX, e.offsetY);
    secondElement = getFigureById(squareId);
    try {
      if (idIn === squareId) { // same square
        console.log('clicked the same square');
      } else if (isEmpty(squareId) !== false && boardSquare[squareId].canMove) { // free square
        console.log('square was not occupied');
        figurePositionChange(squareId, idIn);
      } else {
        console.log('square was occupied'); // occupied square

        secondColor = secondElement.color;

        if (firstColor !== secondColor && boardSquare[squareId].canMove) {
          console.log('by enemy');
          figureRemove(squareId);
          figurePositionChange(squareId, idIn);
        } else { console.log('by ally'); }
      }
    } catch (error) {

    }
    isFigurePicked = false;
    render();
  }, { once: true });
}

function highlightMove (id) {
  //  first half of render() to redraw board with no figures
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  createCheckBoard();

  let moves = 1;
  let color;
  let rightSquare;
  let leftSquare;

  const element = getFigureById(id);
  const elementColor = element.color;

  const topId = getSquareId((element.x + 1), (element.y - square + 1));
  const rightId = getSquareId((element.x + square + 1), (element.y + 1));
  const bottomId = getSquareId((element.x + 1), (element.y + square + 1));
  const leftId = getSquareId((element.x - square + 1), (element.y + 1));

  const topRightId = getSquareId((element.x + square + 1), (element.y - square + 1));
  const bottomRightId = getSquareId((element.x + square + 1), (element.y + square + 1));
  const bottomLeftId = getSquareId((element.x - square + 1), (element.y + square + 1));
  const topLeftId = getSquareId((element.x - square + 1), (element.y - square + 1));

  // Knight's moves
  // 'top-right', 'top-left', 'right-top', 'right-bottom'
  // 'bottom-right', 'bottom-left', 'left-top', 'left-bottom'
  const topRight = getSquareId((element.x + square + 1), (element.y - 2 * square + 1));
  const topLeft = getSquareId((element.x - square + 1), (element.y - 2 * square + 1));
  const rightTop = getSquareId((element.x + 2 * square + 1), (element.y - square + 1));
  const rightBottom = getSquareId((element.x + 2 * square + 1), (element.y + square + 1));
  const bottomRight = getSquareId((element.x + square + 1), (element.y + 2 * square + 1));
  const bottomLeft = getSquareId((element.x - square + 1), (element.y + 2 * square + 1));
  const leftTop = getSquareId((element.x - 2 * square + 1), (element.y - square + 1));
  const leftBottom = getSquareId((element.x - 2 * square + 1), (element.y + square + 1));

  // const oneMove = false;

  switch (element.type) {
    case 'bishop':
      console.log(element.type);

      movesDraw(topRightId, 'top-right', elementColor);
      movesDraw(bottomRightId, 'bottom-right', elementColor);
      movesDraw(bottomLeftId, 'bottom-left', elementColor);
      movesDraw(topLeftId, 'top-left', elementColor);
      break;
    case 'knight':
      console.log(element.type);

      movesDraw(topRight, 'top-right', elementColor, 1);
      movesDraw(topLeft, 'top-left', elementColor, 1);
      movesDraw(rightTop, 'right-top', elementColor, 1);
      movesDraw(rightBottom, 'right-bottom', elementColor, 1);

      movesDraw(bottomRight, 'bottom-right', elementColor, 1);
      movesDraw(bottomLeft, 'bottom-left', elementColor, 1);
      movesDraw(leftTop, 'left-top', elementColor, 1);
      movesDraw(leftBottom, 'left-bottom', elementColor, 1);
      break;
    case 'rook':
      console.log(element.type);

      movesDraw(topId, 'top', elementColor);
      movesDraw(rightId, 'right', elementColor);
      movesDraw(bottomId, 'bottom', elementColor);
      movesDraw(leftId, 'left', elementColor);
      break;
    case 'queen':
      console.log(element.type);

      movesDraw(topId, 'top', elementColor);
      movesDraw(rightId, 'right', elementColor);
      movesDraw(bottomId, 'bottom', elementColor);
      movesDraw(leftId, 'left', elementColor);

      movesDraw(topRightId, 'top-right', elementColor);
      movesDraw(bottomRightId, 'bottom-right', elementColor);
      movesDraw(bottomLeftId, 'bottom-left', elementColor);
      movesDraw(topLeftId, 'top-left', elementColor);

      break;
    case 'king':
      console.log(element.type);

      movesDraw(topId, 'top', elementColor, 1);
      movesDraw(rightId, 'right', elementColor, 1);
      movesDraw(bottomId, 'bottom', elementColor, 1);
      movesDraw(leftId, 'left', elementColor, 1);

      movesDraw(topRightId, 'top-right', elementColor, 1);
      movesDraw(bottomRightId, 'bottom-right', elementColor, 1);
      movesDraw(bottomLeftId, 'bottom-left', elementColor, 1);
      movesDraw(topLeftId, 'top-left', elementColor, 1);
      break;

    default:
      console.log(element.type);

      if ((element.id[1] === '2' && element.color === 'white') || (element.id[1] === '7' && element.color === 'black')) {
        moves = 2;
      }

      if (element.color === 'white') {
        movesDraw(topId, 'top', elementColor, moves);
        color = -1;
      } else {
        movesDraw(bottomId, 'bottom', elementColor, moves);
        color = 1;
      }

      try {
        rightSquare = getSquareId((boardSquare[id].x + square + 1), (boardSquare[id].y + square * color + 1));
        leftSquare = getSquareId((boardSquare[id].x - square + 1), (boardSquare[id].y + square * color + 1));
        if (boardSquare[rightSquare].isEmpty === false) {
          if (element.color === 'white') {
            movesDraw(rightSquare, 'top-right', elementColor, 1);
          } else {
            movesDraw(rightSquare, 'bottom-right', elementColor, 1);
          }
        }
        if (boardSquare[leftSquare].isEmpty === false) {
          if (element.color === 'white') {
            movesDraw(leftSquare, 'top-right', elementColor, 1);
          } else {
            movesDraw(leftSquare, 'bottom-right', elementColor, 1);
          }
        }
      } catch (error) {
      }
      break;
  }

  // second pard of render() for figures only
  figureDraw();
}

function getFigureById (id) {
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
