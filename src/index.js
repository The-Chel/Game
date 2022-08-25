const canva = window.canvas;

const history = window.chessHistory;

// MODEL
const boardSquare = {};
let figures = [];

let IdsGiven = 0;
let isFigurePicked = false;

let turn = 'white'; // white or black

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const numbers = [8, 7, 6, 5, 4, 3, 2, 1];

const enPassantStorage = []; // Can hold up to 2 figures

let toButtonsOnPromotion = [false];

// fills array 'boardSquare' with objects contining ID and location of square
function giveId (i, a, color) {
  const id = '' + letters[i] + numbers[a];
  const x = i;
  const y = a;
  boardSquare[id] = ({
    id,
    x,
    y,
    color
  });
}

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
  toButtonsOnPromotion[0] = false;

  if (toId && fromId) { // goes here on figure's move
    const fromSquare = boardSquare[fromId];
    const toSquare = boardSquare[toId];

    const figureFrom = getFigureById(fromId);

    toButtonsOnPromotion = [false, figureFrom.color, fromId, toId]; // information for buttons

    let check = true;

    let moveType = 'regular';
    if (toSquare.occupied) {
      moveType = 'capture';
      toButtonsOnPromotion[0] = true;
    }

    // Spetial moves for Pawns
    if (figureFrom.type === 'pawn') {
      // Pawn to Queen

      check = promotion(figureFrom, toId);
      // En Passan
      check = enPassant(fromId, toId);
      // Pawn gets enPassant tag on double move and can be removed
    }

    // Removes EnPassant flag
    if (figureFrom !== enPassantStorage[0] && enPassantStorage[0]) {
      const id = enPassantStorage[0].id;
      figures.forEach(e => {
        if (e.id === id) delete e.enPassant;
      });
      enPassantStorage.shift();
    }

    // CASTLING
    if (figureFrom.type === 'rook') {
      delete figureFrom.castling;
    }
    if (figureFrom.type === 'king') {
      delete figureFrom.castling;
      check = castlingKing(figureFrom, toId);
    }

    // History addition
    if (check) history.Add(moveType, figureFrom, toId);

    // Actual move
    figureRemove(toId);
    figureFrom.x = toSquare.x;
    figureFrom.y = toSquare.y;
    figureFrom.id = toSquare.id;
    toSquare.occupied = true;
    delete fromSquare.occupied;

    turnChange();
  } else if (toId) { // goes here only on figure's creation
    boardSquare[toId].occupied = true;
    figureTo.x = boardSquare[toId].x;
    figureTo.y = boardSquare[toId].y;
  }
  render();
}

function enPassant (fromId, toId) {
  // Does 2 things
  // 1. Adds EnPassant flag on pawn moved 2 squares
  // 2. Removes captured figure on EnPassant move

  const figureFrom = getFigureById(fromId);
  const moveDistance = Math.abs((Number(fromId[1]) - Number(toId[1])));
  let removeId;

  if (moveDistance > 1) { // Adds flag
    figureFrom.enPassant = true;
    enPassantStorage.push(figureFrom);
    return true;
  }

  if (fromId[0] !== toId[0]) { // Removes figure
    if (figureFrom.color === 'white') {
      removeId = toId[0] + (Number(toId[1]) - 1);
      if (!getFigureById(removeId)) return true;
      if (getFigureById(removeId).color !== 'white' && getFigureById(removeId).enPassant) {
        figureRemove(removeId);
      }
    } else {
      removeId = toId[0] + (Number(toId[1]) + 1);
      if (!getFigureById(removeId)) return true;
      if (getFigureById(removeId).color !== 'black' && getFigureById(removeId).enPassant) {
        figureRemove(removeId);
      }
    }

    history.Add('capture', figureFrom, toId); // addHistory('capture', fromId, toId);
    return false;
  }

  return true;
}

function promotion (figureFrom, toId) {
  if ((figureFrom.color === 'white' && toId[1] === '8') || (figureFrom.color === 'black' && toId[1] === '1')) {
    promQuest(toId);
    return false;
  }
}

// eslint-disable-next-line no-unused-vars
function promotionResponse (e, type) {
  const button = e.target;
  const id = button.dataset.squareId;
  const figure = getFigureById(id);

  const hasAttacked = toButtonsOnPromotion[0];
  const fromColor = toButtonsOnPromotion[1];
  const fromId = toButtonsOnPromotion[2];
  const toId = toButtonsOnPromotion[3];

  if (type === 'yes') {
    figure.type = 'queen';
    if (hasAttacked) {
      history.AddPromotionCapture(fromId, fromColor, toId);
    } else { history.AddPromotion(fromColor, toId); }
  } else {
    if (hasAttacked) {
      history.Add('capture', figure, toId, fromId);
    } else { history.Add('regular', figure, toId); }
  }

  promTurn('no');
  render();
}

function castlingKing (figureFrom, toId) {
  let check = true;
  const fromId = figureFrom.id;
  if (figureFrom.color === 'white') {
    if (fromId === 'e1' && toId === 'g1') {
      castling('f1', 'h1');

      history.Add('castling-king', figureFrom, figureFrom.id); // addHistory('castling-king', figureFrom.id, figureFrom.id);
      check = false;
    } else if (fromId === 'e1' && toId === 'c1') {
      castling('d1', 'a1');

      history.Add('castling-queen', figureFrom, figureFrom.id); // addHistory('castling-queen', figureFrom.id, figureFrom.id);
      check = false;
    }
  } else if (figureFrom.color === 'black') {
    if (fromId === 'e8' && toId === 'g8') {
      castling('f8', 'h8');

      history.Add('castling-king', figureFrom, figureFrom.id); // addHistory('castling-king', figureFrom.id, figureFrom.id);// 0-0-0
      check = false;
    } else if (fromId === 'e8' && toId === 'c8') {
      castling('d8', 'a8');

      history.Add('castling-queen', figureFrom, figureFrom.id); // addHistory('castling-queen', figureFrom.id, figureFrom.id); // 0-0
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
  square.occupied = true;
  delete boardSquare[fromId].occupied;
}

function figureRemove (id) {
  if (id === 'all') {
    figures = [];
    Object.entries(boardSquare).forEach(entry => delete entry[1].occupied);
  }
  figures = figures.filter((element) => {
    if (id === element.id) {
      delete boardSquare[id].occupied;
      return false;
    } else { return true; }
  });

  render();
}

function turnChange (color) {
  const tunrCount = document.getElementById('turnCount');
  if (color) {
    turn = color;
    tunrCount.innerText = turn + ' turn!';
    return;
  }
  if (turn === 'white') {
    turn = 'black';
  } else {
    turn = 'white';
  }

  tunrCount.innerText = turn + ' turn!';
}

// VISUAL

function render () { // erases the screen, updates visual inforamtion
  canva.clear();
  createCheckBoard();
  canva.createCheckBoard(); // draws checkbox
  canva.figuresDraw(figures); // draws figures
}

function createCheckBoard () {
  let isBlack = true;

  for (let a = 0; a < 8; a++) {
    let color = '';
    for (let i = 0; i < 8; i++) {
      if (isBlack) {
        color = 'light';
      } else {
        color = 'brown';
      }

      // Gives Ids only once on first draw, never changes Ids again
      if (IdsGiven < 64) {
        giveId(i, a, color);
        IdsGiven++;
      }

      isBlack = !isBlack;
    }
    isBlack = !isBlack;
  }

  Object.entries(boardSquare).forEach(entry => {
    delete entry[1].canMove;
  });
}

function movesDraw (id, direction, movingFigure, amountOfMoves, enPassant) {
  let localId = id;
  let index = 0;
  let toFigureColor;

  if (!direction) {
    canva.fillSquare(boardSquare[localId].x, boardSquare[localId].y, 'rgb(159, 227, 159)');
    return;
  }

  const fromFigureColor = movingFigure.color;
  if (amountOfMoves) {
    index = 8 - amountOfMoves;
  }

  while (index < 8) {
    if (!localId) return;
    if (getFigureById(localId)) toFigureColor = getFigureById(localId).color;

    if (enPassant || (boardSquare[localId].occupied && toFigureColor !== fromFigureColor)) {
      index = 10;
      if (amountOfMoves === 2) return;
      canva.fillSquare(boardSquare[localId].x, boardSquare[localId].y, 'rgb(135, 135, 135)');
      boardSquare[localId].canMove = true;
      return;
    } else if (boardSquare[localId].occupied) {
      return;
    }

    boardSquare[localId].canMove = true;

    const squareColor = boardSquare[localId].color;
    if (squareColor === 'brown') {
      canva.fillSquare(boardSquare[localId].x, boardSquare[localId].y, 'rgb(63, 38, 13)');
    } else if (squareColor === 'light') {
      canva.fillSquare(boardSquare[localId].x, boardSquare[localId].y, 'rgb(155, 122, 44)');
    }

    switch (direction) { // +1x goes to RIGHT, +1y goes to BOTTOM
      case 'top':
        localId = getSquareId((boardSquare[localId].x), (boardSquare[localId].y - 1));
        break;
      case 'top-right':
        localId = getSquareId((boardSquare[localId].x + 1), (boardSquare[localId].y - 1));
        break;
      case 'right':
        localId = getSquareId((boardSquare[localId].x + 1), (boardSquare[localId].y));
        break;
      case 'bottom-right':
        localId = getSquareId((boardSquare[localId].x + 1), (boardSquare[localId].y + 1));
        break;
      case 'bottom':
        localId = getSquareId((boardSquare[localId].x), (boardSquare[localId].y + 1));
        break;
      case 'bottom-left':
        localId = getSquareId((boardSquare[localId].x - 1), (boardSquare[localId].y + 1));
        break;
      case 'left':
        localId = getSquareId((boardSquare[localId].x - 1), (boardSquare[localId].y));
        break;
      case 'top-left':
        localId = getSquareId((boardSquare[localId].x - 1), (boardSquare[localId].y - 1));
        break;

      default:
        break;
    }
    index++;
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
  history.ResetHistory();
  turnChange('white');
  Object.entries(boardSquare).forEach(entry => {
    delete entry[1].canMove;
    if (entry[1].occupied) delete entry[1].occupied;
  });

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

// CALCULATION

canva.addEventListener('click', (e) => {
  const squareId = getSquareId(e.offsetX, e.offsetY);
  if (!squareId) return;
  // if square occupied, then find figure on the square
  if (boardSquare[squareId].occupied && isFigurePicked === false) {
    isFigurePicked = true;
    highlightMove(squareId);
    figureMove(squareId);
  }
  // wait until next mouse input, move figure to other square if is Empty = true
});

// finds clicked square
function getSquareId (xPx, yPx) {
  let returnId;
  let x = xPx;
  let y = yPx;
  if (x > 10 && y > 10) {
    const XYcoords = canva.pixelsToNumbers(xPx, yPx);
    x = XYcoords[0];
    y = XYcoords[1];
  }

  Object.entries(boardSquare).forEach(entry => {
    const element = entry[1];
    if (x === element.x && y === element.y) returnId = element.id;
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
  //  First half of render() to redraw board with no figures
  canva.clear();
  canva.createCheckBoard();

  // Clicked figure's data
  const element = getFigureById(id);
  const elementColor = element.color;
  const x = element.x;
  const y = element.y;
  if (elementColor !== turn) {
    canva.figuresDraw(figures);
    return;
  }

  // Varaibles for Pawns
  let moves = 1;
  let color;
  let rightSquare;
  let leftSquare;

  movesDraw(id); // Highlights active figure

  const topId = getSquareId(x, (y - 1));
  const rightId = getSquareId((x + 1), y);
  const bottomId = getSquareId(x, (y + 1));
  const leftId = getSquareId((x - 1), y);

  const topRightId = getSquareId((x + 1), (y - 1));
  const bottomRightId = getSquareId((x + 1), (y + 1));
  const bottomLeftId = getSquareId((x - 1), (y + 1));
  const topLeftId = getSquareId((x - 1), (y - 1));

  // Knight's moves
  let topRight;
  let topLeft;
  let rightTop;
  let rightBottom;
  let bottomRight;
  let bottomLeft;
  let leftTop;
  let leftBottom;

  switch (element.type) {
    case 'bishop':

      movesDraw(topRightId, 'top-right', element);
      movesDraw(bottomRightId, 'bottom-right', element);
      movesDraw(bottomLeftId, 'bottom-left', element);
      movesDraw(topLeftId, 'top-left', element);
      break;
    case 'knight':

      topRight = getSquareId((x + 1), (y - 2));
      topLeft = getSquareId((x - 1), (y - 2));
      rightTop = getSquareId((x + 2), (y - 1));
      rightBottom = getSquareId((x + 2), (y + 1));
      bottomRight = getSquareId((x + 1), (y + 2));
      bottomLeft = getSquareId((x - 1), (y + 2));
      leftTop = getSquareId((x - 2), (y - 1));
      leftBottom = getSquareId((x - 2), (y + 1));

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
          if (!boardSquare.f1.occupied && !boardSquare.g1.occupied && getFigureById('h1').castling) {
            movesDraw('g1', '', element, 1);
          } else if (!boardSquare.d1.occupied && !boardSquare.c1.occupied && !boardSquare.b1.occupied && getFigureById('a1').castling) {
            movesDraw('c1', '', element, 1);
          }
        } else if (element.color === 'black') {
          if (!boardSquare.f8.occupied && !boardSquare.g8.occupied && getFigureById('h8').castling) {
            movesDraw('g8', '', element, 1);
          } else if (!boardSquare.d8.occupied && !boardSquare.c8.occupied && !boardSquare.b8.occupied && getFigureById('a8').castling) {
            movesDraw('c8', '', element, 1);
          }
        }
      }

      break;

    default: // Pawn Moves
      // First double move
      if ((element.id[1] === '2' && element.color === 'white') || (element.id[1] === '7' && element.color === 'black')) {
        moves = 2;
      }
      if (!boardSquare[topId] && element.color === 'white') break; // Pawn at the edge of the board
      if (!boardSquare[bottomId] && element.color === 'black') break; // Pawn at the edge of the board
      if (element.color === 'white') {
        color = -1;
        if (!boardSquare[topId].occupied) {
          movesDraw(topId, 'top', element, moves);
        }
      } else if (element.color === 'black') {
        color = 1;
        if (!boardSquare[bottomId].occupied) {
          movesDraw(bottomId, 'bottom', element, moves);
        }
      }

      // Diagonal attack
      rightSquare = getSquareId((boardSquare[id].x + 1), (boardSquare[id].y + color));
      if (rightSquare) {
        if (boardSquare[rightSquare].occupied) {
          if (element.color === 'white') {
            movesDraw(rightSquare, 'top-right', element, 1);
          } else {
            movesDraw(rightSquare, 'bottom-right', element, 1);
          }
        }
      }

      leftSquare = getSquareId((boardSquare[id].x - 1), (boardSquare[id].y + color));
      if (leftSquare) {
        if (boardSquare[leftSquare].occupied) {
          if (element.color === 'white') {
            movesDraw(leftSquare, 'top-left', element, 1);
          } else {
            movesDraw(leftSquare, 'bottom-left', element, 1);
          }
        }
      }
      // En Pasant
      if (rightId) {
        if (boardSquare[rightId].occupied && getFigureById(rightId).enPassant === true) {
          if (element.color === 'white') {
            movesDraw(topRightId, 'top-right', element, 1, true);
          } else movesDraw(bottomRightId, 'bottom-right', element, 1, true);
        }
      }
      if (leftId) {
        if (boardSquare[leftId].occupied && getFigureById(leftId).enPassant === true) {
          if (element.color === 'white') {
            movesDraw(topLeftId, 'top-left', element, 1, true);
          } else movesDraw(bottomLeftId, 'bottom-left', element, 1, true);
        }
      }

      break;
  }

  // Second pard of render() for figures only
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

function promQuest (id) {
  if (!boardSquare[id]) return;
  const pixCoords = canva.numberToPixels(boardSquare[id].x, boardSquare[id].y);
  const x = pixCoords[0];
  const y = pixCoords[1];
  const elemStyle = document.getElementById('promotion').style;
  const yesButton = document.getElementById('yesButton');
  const noButton = document.getElementById('noButton');

  yesButton.dataset.squareId = id;
  noButton.dataset.squareId = id;

  elemStyle.display = 'initial';
  elemStyle.left = x + 'px';
  elemStyle.top = y + 'px';
  promTurn('yes');
}

function promTurn (e) {
  const position = document.getElementById('promotion').style;
  const screenBlock = document.getElementById('screenBlock').style;
  if (e === 'no') {
    position.display = 'none';
    screenBlock.display = 'none';
  } else if (e === 'yes') {
    position.display = 'initial';
    screenBlock.display = 'initial';
  }
}
render();
figDef();
