const canva = window.canvas;
// MODEL
const boardSquare = {};
let figures = [];

let IdsGiven = 0;
let isFigurePicked = false;

const historyArray = [];
let historyCount = 1;

let turn = 'white'; // white or black

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

function figureAdd (id, color, type, specialFeature) {
  let check = true;

  figures.forEach(element => {
    if (id === element.id) {
      check = false;
    }
  });

  if (check && type === 'pawn') {
    figures.push({
      id,
      type,
      color
    });
  } else if (check && type === 'king') {
    figures.push({
      id,
      type,
      color,
      castling: specialFeature
    });
  } else if (check) {
    figures.push({
      id,
      type,
      color
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

    if (figureFrom.type === 'pawn') {
      if ((figureFrom.color === 'white' && toId[1] === '8') || (figureFrom.color === 'black' && toId[1] === '1')) {
        pawnToQueen(figureFrom);
      }
      if ((Number(fromId[1]) - Number(toId[1]) < -1 && figureFrom.color === 'white') || (Number(fromId[1]) - Number(toId[1]) > 1 && figureFrom.color === 'black')) {
        console.log('En Passant');
        figureFrom.EnPassant = true;
      } else {
        delete figureFrom.EnPassant;
      }
    }

    addHistory(fromId, toId, figureFrom.color, figureFrom.type);
    turnChange();
  } else if (toId) { // goes here only on figure's creation
    boardSquare[toId].isEmpty = false;
    figureTo.x = boardSquare[toId].x;
    figureTo.y = boardSquare[toId].y;
  }
  render();
}

function pawnToQueen (figure) {
  figure.type = 'queen';
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

function turnChange () {
  if (turn === 'white') {
    turn = 'black';
  } else {
    turn = 'white';
  }
  const tunrCount = document.getElementById('turnCount');
  tunrCount.innerText = turn + ' turn!';
}

// VISUAL
const square = 100; // 100px

function render () { // erases the screen, updates visual inforamtion
  canva.clear();
  createCheckBoard();
  canva.createCheckBoard(); // draws checkbox
  canva.figuresDraw(figures); // draws figures
}

function createCheckBoard () {
  let isBlack = true;

  for (let a = 0; a < 8; a++) {
    const incrA = a * 100;
    let color = '';
    for (let i = 0; i < 8; i++) {
      const incrI = i * 100;

      if (isBlack) {
        color = 'light';
      } else {
        color = 'brown';
      }

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

function movesDraw (id, direction, movingFigure, amountOfMoves) {
  let localId = id;
  let index = 0;
  let toFigureColor;

  const fromFigureColor = movingFigure.color;
  if (amountOfMoves) {
    index = 8 - amountOfMoves;
  }
  console.log(localId, toFigureColor, fromFigureColor);
  try {
    while (index < 8) {
      try {
        toFigureColor = getFigureById(localId).color;
      } catch (error) {
      }
      if (boardSquare[localId].isEmpty === false && toFigureColor !== fromFigureColor) {
        index = 10;
        canva.fillSquare(boardSquare[localId].x, boardSquare[localId].y, 'rgb(135, 135, 135)');
        console.log('Figure on', direction);
        boardSquare[localId].canMove = true;
        return;
      } else if (boardSquare[localId].isEmpty === false) {
        return;
      }

      boardSquare[localId].canMove = true;

      const squareColor = boardSquare[localId].color;
      if (squareColor === 'brown') {
        canva.fillSquare(boardSquare[localId].x, boardSquare[localId].y, 'rgb(63, 38, 13)');
      } else if (squareColor === 'light') {
        canva.fillSquare(boardSquare[localId].x, boardSquare[localId].y, 'rgb(155, 122, 44)');
      }

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
  figureAdd('e1', 'white', 'king', true);
  figureAdd('d8', 'black', 'queen');
  figureAdd('e8', 'black', 'king', true);
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

canva.addEventListener('click', (e) => {
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
  const element = getFigureById(idIn);
  if (element.color !== turn) {
    isFigurePicked = false;
    return;
  }

  let secondElement;
  let secondColor;

  const firstColor = element.color;
  canva.addEventListener('click', (e) => {
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
  canva.clear();
  canva.createCheckBoard();

  let moves = 1;
  let color;
  let rightSquare;
  let leftSquare;

  const element = getFigureById(id);
  const elementColor = element.color;
  if (elementColor !== turn) {
    figureDraw();
    return;
  }

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

      movesDraw(topRightId, 'top-right', element);
      movesDraw(bottomRightId, 'bottom-right', element);
      movesDraw(bottomLeftId, 'bottom-left', element);
      movesDraw(topLeftId, 'top-left', element);
      break;
    case 'knight':
      console.log(element.type);

      movesDraw(topRight, 'top-right', element, 1);
      movesDraw(topLeft, 'top-left', element, 1);
      movesDraw(rightTop, 'right-top', element, 1);
      movesDraw(rightBottom, 'right-bottom', element, 1);

      movesDraw(bottomRight, 'bottom-right', element, 1);
      movesDraw(bottomLeft, 'bottom-left', element, 1);
      movesDraw(leftTop, 'left-top', element, 1);
      movesDraw(leftBottom, 'left-bottom', element, 1);
      break;
    case 'rook':
      console.log(element.type);

      movesDraw(topId, 'top', element);
      movesDraw(rightId, 'right', element);
      movesDraw(bottomId, 'bottom', element);
      movesDraw(leftId, 'left', element);
      break;
    case 'queen':
      console.log(element.type);

      movesDraw(topId, 'top', element);
      movesDraw(rightId, 'right', element);
      movesDraw(bottomId, 'bottom', element);
      movesDraw(leftId, 'left', element);

      movesDraw(topRightId, 'top-right', element);
      movesDraw(bottomRightId, 'bottom-right', element);
      movesDraw(bottomLeftId, 'bottom-left', element);
      movesDraw(topLeftId, 'top-left', element);

      break;
    case 'king':
      console.log(element.type);

      movesDraw(topId, 'top', element, 1);
      movesDraw(rightId, 'right', element, 1);
      movesDraw(bottomId, 'bottom', element, 1);
      movesDraw(leftId, 'left', element, 1);

      movesDraw(topRightId, 'top-right', element, 1);
      movesDraw(bottomRightId, 'bottom-right', element, 1);
      movesDraw(bottomLeftId, 'bottom-left', element, 1);
      movesDraw(topLeftId, 'top-left', element, 1);
      break;

    default:
      console.log(element.type);

      if ((element.id[1] === '2' && element.color === 'white') || (element.id[1] === '7' && element.color === 'black')) {
        moves = 2;
      }

      if (element.color === 'white') {
        color = -1;
        if (boardSquare[topId].isEmpty !== false) {
          movesDraw(topId, 'top', element, moves);
        }
      } else if (element.color === 'black') {
        color = 1;
        if (boardSquare[bottomId].isEmpty !== false) {
          movesDraw(bottomId, 'bottom', element, moves);
        }
      }

      try {
        rightSquare = getSquareId((boardSquare[id].x + square + 1), (boardSquare[id].y + square * color + 1));

        if (boardSquare[rightSquare].isEmpty === false) {
          if (element.color === 'white') {
            movesDraw(rightSquare, 'top-right', element, 1);
          } else {
            movesDraw(rightSquare, 'bottom-right', element, 1);
          }
        }
      } catch (e) {}
      try {
        leftSquare = getSquareId((boardSquare[id].x - square + 1), (boardSquare[id].y + square * color + 1));
        if (boardSquare[leftSquare].isEmpty === false) {
          if (element.color === 'white') {
            movesDraw(leftSquare, 'top-right', element, 1);
          } else {
            movesDraw(leftSquare, 'bottom-right', element, 1);
          }
        }
      } catch (e) {}
      // En Pasant

      break;
  }

  // second pard of render() for figures only
  canva.figuresDraw(figures);
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
