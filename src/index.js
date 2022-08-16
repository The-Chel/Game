const canva = window.canvas;
// MODEL
const boardSquare = {};
let figures = [];

let IdsGiven = 0;
let isFigurePicked = false;

const historyArrayBlack = [];
const historyArrayWhite = [];

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

  if (check && specialFeature) {
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

  if (toId && fromId) { // goes here on figure's move
    const fromSquare = boardSquare[fromId];
    const toSquare = boardSquare[toId];

    const figureFrom = getFigureById(fromId);

    let result;
    let check = true;

    let moveType = 'regular';
    if (toSquare.isEmpty === false) {
      moveType = 'capture';
    }
    figureRemove(toId);

    // Spetial moves for Pawns
    if (figureFrom.type === 'pawn') {
      // Pawn to Queen
      check = pawnToQueen(figureFrom, toId, check, fromId);
      // En Passan
      result = enPassant(fromId, toId, check); // BUG HERE
      // Pawn gets enPassant tag on double move and can be removed
      check = result[0];
      console.log(check);
    }
    if (result) enPassantRemove(result[1]);
    else enPassantRemove(); // Need to figure out what to do with enPasant flag

    // CASTLING
    if (figureFrom.type === 'rook') {
      delete figureFrom.castling;
    }
    if (figureFrom.type === 'king') {
      delete figureFrom.castling;
      check = castlingKing(figureFrom, toId, check);
    }

    // History addition
    if (check) addHistory(moveType, fromId, toId);

    // Actual move
    figureFrom.x = toSquare.x;
    figureFrom.y = toSquare.y;
    figureFrom.id = toSquare.id;
    toSquare.isEmpty = false;
    delete fromSquare.isEmpty;

    turnChange();
  } else if (toId) { // goes here only on figure's creation
    boardSquare[toId].isEmpty = false;
    figureTo.x = boardSquare[toId].x;
    figureTo.y = boardSquare[toId].y;
  }
  render();
}

function enPassant (fromId, toId, check) {
  const figureFrom = getFigureById(fromId);
  const moveDistance = Math.abs((Number(fromId[1]) - Number(toId[1])));
  const returnValue = [];
  let removeId;
  let returnCheck = check;
  returnValue[0] = returnCheck;

  if (moveDistance > 1) {
    figureFrom.enPassant = true;
    returnValue[1] = true;
    return returnValue;
  }

  if (fromId[0] !== toId[0]) {
    if (figureFrom.color === 'white') {
      removeId = toId[0] + (Number(toId[1]) - 1);
      if (!getFigureById(removeId)) return returnValue;
      if (getFigureById(removeId).color !== 'white' && getFigureById(removeId).enPassant) {
        figureRemove(removeId);
      }
    } else {
      removeId = toId[0] + (Number(toId[1]) + 1);
      if (!getFigureById(removeId)) return returnValue;
      console.log('fifst');
      if (getFigureById(removeId).color !== 'black' && getFigureById(removeId).enPassant) {
        figureRemove(removeId);
        console.log('second');
      }
    }
    if (returnCheck) {
      addHistory('capture', fromId, toId);
      returnCheck = false;
      returnValue[0] = returnCheck;
      returnValue.push(returnValue);
    }
  }

  return returnValue;
}

function enPassantRemove (moveThisTurn) {
  if (moveThisTurn) return;
  figures.forEach(element => {
    if (element.type === 'pawn' && element.enPassant) {
      delete element.enPassant;
    }
  });
}
function pawnToQueen (figureFrom, toId, checkFrom, fromId) {
  let check = checkFrom;
  if ((figureFrom.color === 'white' && toId[1] === '8') || (figureFrom.color === 'black' && toId[1] === '1')) {
    figureFrom.type = 'queen';
    if (check && boardSquare[toId].isEmpty === false) {
      addHistory('capture-promotion', fromId, toId);
      check = false;
    } else if (check) {
      addHistory('promotion', fromId, toId);
      check = false;
    }
  }
  return check;
}

function castlingKing (figureFrom, toId, checkFrom) {
  let check = checkFrom;
  const fromId = figureFrom.id;
  if (figureFrom.color === 'white') {
    if (fromId === 'e1' && toId === 'g1') {
      castling('f1', 'h1');

      addHistory('castling-king', figureFrom.id, figureFrom.id);
      check = false;
    } else if (fromId === 'e1' && toId === 'c1') {
      castling('d1', 'a1');

      addHistory('castling-queen', figureFrom.id, figureFrom.id);
      check = false;
    }
  } else if (figureFrom.color === 'black') {
    if (fromId === 'e8' && toId === 'g8') {
      castling('f8', 'h8');

      addHistory('castling-king', figureFrom.id, figureFrom.id);// 0-0-0
      check = false;
    } else if (fromId === 'e8' && toId === 'c8') {
      castling('d8', 'a8');

      addHistory('castling-queen', figureFrom.id, figureFrom.id); // 0-0
      check = false;
    }
  }
  return check;
}
function castling (toId, fromId) {
  const figure = getFigureById(fromId);
  const square = boardSquare[toId];
  delete figure.castling;
  figure.x = square.x;
  figure.y = square.y;
  figure.id = square.id;
  square.isEmpty = false;
  delete boardSquare[fromId].isEmpty;
}

function figureRemove (id) {
  if (id === 'all') {
    figures = [];
    Object.entries(boardSquare).forEach(entry => delete entry[1].isEmpty);
  }
  figures = figures.filter((element) => {
    if (id === element.id) {
      delete boardSquare[id].isEmpty;
      return false;
    } else { return true; }
  });

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

function movesDraw (id, direction, movingFigure, amountOfMoves, enPassant) {
  let localId = id;
  let index = 0;
  let toFigureColor;

  const fromFigureColor = movingFigure.color;
  if (amountOfMoves) {
    index = 8 - amountOfMoves;
  }
  try {
    while (index < 8) {
      try {
        toFigureColor = getFigureById(localId).color;
      } catch (error) {
      }
      if ((boardSquare[localId].isEmpty === false && toFigureColor !== fromFigureColor) || enPassant) {
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
    figureAdd(idW, 'white', 'pawn');
    figureAdd(idB, 'black', 'pawn');
  }
  figureAdd('a1', 'white', 'rook', true);
  figureAdd('h1', 'white', 'rook', true);
  figureAdd('a8', 'black', 'rook', true);
  figureAdd('h8', 'black', 'rook', true);

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

function addHistory (historyType, fromId, toId) {
  const element = getFigureById(fromId);
  const color = element.color;

  const historyHolderBlack = document.getElementById('blackHistory');
  historyHolderBlack.innerHTML = '';
  const historyHolderWhite = document.getElementById('whiteHistory');
  historyHolderWhite.innerHTML = '';

  let type = element.type[0].toUpperCase();

  if (element.type === 'knight') {
    type = 'N';
  }
  if (historyHolderBlack.length > 35) {
    historyHolderBlack.shift();
  }
  if (historyHolderWhite.length > 35) {
    historyHolderWhite.shift();
  }
  let pushValue;

  switch (historyType) {
    case 'regular':
      if (element.type !== 'pawn') {
        pushValue = type + toId;
      } else {
        pushValue = toId;
      }
      break;
    case 'capture':
      if (element.type !== 'pawn') {
        pushValue = type + ':' + toId;
      } else {
        pushValue = fromId[0] + ':' + toId;
      }
      break;
    case 'capture-promotion':
      pushValue = fromId[0] + ':' + toId + 'Q';
      break;
    case 'promotion':
      pushValue = toId + 'Q';
      break;
    case 'castling-queen':
      if (color === 'white') pushValue = '0-0-0';
      break;
    case 'castling-king':
      pushValue = '0-0';
      break;

    default:
      break;
  }

  if (color === 'white') {
    historyArrayWhite.push(pushValue);
  } else historyArrayBlack.push(pushValue);

  historyArrayBlack.forEach(e => {
    const historyMove = document.createElement('div');
    historyMove.innerText = e;
    historyMove.id = 'history';
    historyHolderBlack.appendChild(historyMove);
  });
  historyArrayWhite.forEach(e => {
    const historyMove = document.createElement('div');
    historyMove.innerText = e;
    historyMove.id = 'history';
    historyHolderWhite.appendChild(historyMove);
  });
}

// CALCULATION

canva.addEventListener('click', (e) => {
  const squareId = getSquareId(e.offsetX, e.offsetY);
  if (!squareId) return;
  // if square isEmpty = false, then find figure on the square
  if (boardSquare[squareId].isEmpty === false && isFigurePicked === false) {
    isFigurePicked = true;
    highlightMove(squareId);
    figureMove(squareId);
  }
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

function figureMove (idIn) {
  const element = getFigureById(idIn);
  if (element.color !== turn) {
    isFigurePicked = false;
    return;
  }

  canva.addEventListener('click', (e) => {
    const squareId = getSquareId(e.offsetX, e.offsetY);

    if (!squareId) {
      isFigurePicked = false;
      render();
      return;
    }
    if (boardSquare[squareId].canMove) {
      figurePositionChange(squareId, idIn);
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
    canva.figuresDraw(figures);
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

  const topRight = getSquareId((element.x + square + 1), (element.y - 2 * square + 1));
  const topLeft = getSquareId((element.x - square + 1), (element.y - 2 * square + 1));
  const rightTop = getSquareId((element.x + 2 * square + 1), (element.y - square + 1));
  const rightBottom = getSquareId((element.x + 2 * square + 1), (element.y + square + 1));
  const bottomRight = getSquareId((element.x + square + 1), (element.y + 2 * square + 1));
  const bottomLeft = getSquareId((element.x - square + 1), (element.y + 2 * square + 1));
  const leftTop = getSquareId((element.x - 2 * square + 1), (element.y - square + 1));
  const leftBottom = getSquareId((element.x - 2 * square + 1), (element.y + square + 1));

  switch (element.type) {
    case 'bishop':

      movesDraw(topRightId, 'top-right', element);
      movesDraw(bottomRightId, 'bottom-right', element);
      movesDraw(bottomLeftId, 'bottom-left', element);
      movesDraw(topLeftId, 'top-left', element);
      break;
    case 'knight':

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

      movesDraw(topId, 'top', element);
      movesDraw(rightId, 'right', element);
      movesDraw(bottomId, 'bottom', element);
      movesDraw(leftId, 'left', element);
      break;
    case 'queen':

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

      movesDraw(topId, 'top', element, 1);
      movesDraw(rightId, 'right', element, 1);
      movesDraw(bottomId, 'bottom', element, 1);
      movesDraw(leftId, 'left', element, 1);

      movesDraw(topRightId, 'top-right', element, 1);
      movesDraw(bottomRightId, 'bottom-right', element, 1);
      movesDraw(bottomLeftId, 'bottom-left', element, 1);
      movesDraw(topLeftId, 'top-left', element, 1);

      // Castling
      if (element.castling) {
        if (element.color === 'white') {
          if (boardSquare.f1.isEmpty !== false && boardSquare.g1.isEmpty !== false && getFigureById('h1').castling) {
            console.log('Castling Right is AVALIABLE');
            movesDraw('g1', '', element, 1);
          } else if (boardSquare.d1.isEmpty !== false && boardSquare.c1.isEmpty !== false && boardSquare.b1.isEmpty !== false && getFigureById('a1').castling) {
            movesDraw('c1', '', element, 1);
          }
        } else if (element.color === 'black') {
          if (boardSquare.f8.isEmpty !== false && boardSquare.g8.isEmpty !== false && getFigureById('h8').castling) {
            console.log('Castling Right is AVALIABLE');
            movesDraw('g8', '', element, 1);
          } else if (boardSquare.d8.isEmpty !== false && boardSquare.c8.isEmpty !== false && boardSquare.b8.isEmpty !== false && getFigureById('a8').castling) {
            movesDraw('c8', '', element, 1);
          }
        }
      }

      break;

    default:
      // First double move
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
      // diagonal attack
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
      try {
        if (boardSquare[rightId].isEmpty === false && getFigureById(rightId).enPassant === true) {
          if (element.color === 'white') {
            movesDraw(topRightId, 'top-right', element, 1, true);
          } else movesDraw(bottomRightId, 'bottom-right', element, 1, true);
        }
      } catch (e) {}
      try {
        if (boardSquare[leftId].isEmpty === false && getFigureById(leftId).enPassant === true) {
          if (element.color === 'white') {
            movesDraw(topLeftId, 'top-left', element, 1, true);
          } else movesDraw(bottomLeftId, 'bottom-left', element, 1, true);
        }
      } catch (e) {}

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
