// Next steps:
// 1. Make a function to make squares avaliable to move;
// 2. Make a function to find all avaliable moves;
const canva = window.canvas;

const history = window.chessHistory;

// MODEL
const gameState = {
  boardSquare: {},
  figures: [],
  currentTurn: 'white',
  enPassantStorage: [], // Can hold up to 2 figures
  arrayOfMoves: [],
  check: false
};

let isFigurePicked = false;

let toButtonsOnPromotion = [false];

function figureAdd (id, color, type, specialFeature) {
  let check = true;

  gameState.figures.forEach(element => {
    if (id === element.id) {
      check = false;
    }
  });

  if (check && specialFeature) {
    gameState.figures.push({
      id,
      type,
      color,
      castling: specialFeature
    });
  } else if (check) {
    gameState.figures.push({
      id,
      type,
      color
    });
  }

  figurePositionChange(id);
  render();
}

function makeCheck () {
  let returnVal;
  Object.entries(gameState.boardSquare).forEach(e => {
    if (e[1].check) delete e[1].check;
  });

  // Find kings
  const kings = {};
  gameState.figures.forEach(e => {
    if (e.type === 'king') {
      if (e.color === 'white') kings.white = e;
      else kings.black = e;
    }
  });

  // Finds king under attack
  Object.entries(kings).forEach(e => {
    const king = e[1];
    delete e[1].check;
    if (gameState.boardSquare[king.id].canMove) {
      gameState.check = true;
      gameState.boardSquare[king.id].check = true;
      returnVal = e[1];
      console.log('biba');
    }
  });
  if (returnVal) {
    return returnVal;
  } else {
    gameState.check = false;
    return kings;
  }
}

function figurePositionChange (toId, fromId) {
  const figureTo = getFigureById(toId);
  toButtonsOnPromotion[0] = false;

  if (toId && fromId) { // goes here on figure's move
    const fromSquare = gameState.boardSquare[fromId];
    const toSquare = gameState.boardSquare[toId];

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
    if (figureFrom !== gameState.enPassantStorage[0] && gameState.enPassantStorage[0]) {
      const id = gameState.enPassantStorage[0].id;
      gameState.figures.forEach(e => {
        if (e.id === id) delete e.enPassant;
      });
      gameState.enPassantStorage.shift();
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
  }

  if (!fromId) { // goes here only on figure's creation
    gameState.boardSquare[toId].occupied = true;
    figureTo.x = gameState.boardSquare[toId].x;
    figureTo.y = gameState.boardSquare[toId].y;
  }
  calculateMoves();
  makeCheck(); // Render is in theis function
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
    gameState.enPassantStorage.push(figureFrom);
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

function figureRemove (id) {
  if (id === 'all') {
    gameState.figures = [];
    Object.entries(gameState.boardSquare).forEach(entry => delete entry[1].occupied);
    turnChange('white');
  }
  gameState.figures = gameState.figures.filter((element) => {
    if (id === element.id) {
      delete gameState.boardSquare[id].occupied;
      return false;
    } else { return true; }
  });

  render();
}

function turnChange (color) {
  const tunrCount = document.getElementById('turnCount');
  if (color) {
    gameState.currentTurn = color;
    tunrCount.innerText = gameState.currentTurn + ' turn!';
    return;
  }
  if (gameState.currentTurn === 'white') {
    gameState.currentTurn = 'black';
  } else {
    gameState.currentTurn = 'white';
  }

  tunrCount.innerText = gameState.currentTurn + ' turn!';
}

function calculateMoves () {
  gameState.arrayOfMoves = [];
  gameState.figures.forEach(e => {
    makeMove(e.id);
  });

  Object.entries(gameState.boardSquare).forEach(entry => {
    if (entry[1].canMove) gameState.arrayOfMoves.push(entry[1].id);
  });
}

// VISUAL

function render () { // erases the screen, updates visual inforamtion
  canva.clear();
  canva.createCheckBoard(); // draws checkbox
  canva.figuresDraw(gameState.figures); // draws figures
}

function makeMove (id) {
  const figure = getFigureById(id);
  const color = figure.color;
  const x = figure.x;
  const y = figure.y;

  const topId = getSquareId(x, (y - 1));
  const rightId = getSquareId((x + 1), y);
  const bottomId = getSquareId(x, (y + 1));
  const leftId = getSquareId((x - 1), y);

  const topRightId = getSquareId((x + 1), (y - 1));
  const bottomRightId = getSquareId((x + 1), (y + 1));
  const bottomLeftId = getSquareId((x - 1), (y + 1));
  const topLeftId = getSquareId((x - 1), (y - 1));

  let moveset = [];

  // Pawn variables
  let direction;
  if (color === 'white') direction = -1;
  else direction = 1;
  const rightDiagonal = getSquareId((x + 1), (y + direction));
  const leftDiagonal = getSquareId((x - 1), y + direction);

  // Knight's moves
  let topRight;
  let topLeft;
  let rightTop;
  let rightBottom;
  let bottomRight;
  let bottomLeft;
  let leftTop;
  let leftBottom;

  switch (figure.type) {
    case 'pawn':
      if (!gameState.boardSquare[topId] && color === 'white') break; // Pawn at the edge of the board
      if (!gameState.boardSquare[bottomId] && color === 'black') break; // Pawn at the edge of the board

      // First double move
      if (figure.y === 6 && color === 'white') {
        if (!gameState.boardSquare[topId].occupied) {
          gameState.boardSquare[topId].canMove = true;
        }
        if (!gameState.boardSquare[getSquareId(x, (y - 2))].occupied) {
          gameState.boardSquare[getSquareId(x, (y - 2))].canMove = true;
        }
      } else if (figure.y === 1 && color === 'black') {
        if (!gameState.boardSquare[bottomId].occupied) {
          gameState.boardSquare[bottomId].canMove = true;
        }
        if (!gameState.boardSquare[getSquareId(x, (y + 2))].occupied) {
          gameState.boardSquare[getSquareId(x, (y + 2))].canMove = true;
        }
      }

      // Regular move
      if (color === 'white') {
        direction = -1;
        if (!gameState.boardSquare[topId].occupied) {
          gameState.boardSquare[topId].canMove = true;
        }
      } else if (color === 'black') {
        direction = 1;
        if (!gameState.boardSquare[bottomId].occupied) {
          gameState.boardSquare[bottomId].canMove = true;
        }
      }

      // Diagonal attack
      if (rightDiagonal) {
        if (gameState.boardSquare[rightDiagonal].occupied && getFigureById(rightDiagonal).color !== color) {
          gameState.boardSquare[rightDiagonal].canMove = true;
        }
      }
      if (leftDiagonal) {
        if (gameState.boardSquare[leftDiagonal].occupied && getFigureById(leftDiagonal).color !== color) {
          gameState.boardSquare[leftDiagonal].canMove = true;
        }
      }

      // En Pasant
      if (rightId) {
        if (gameState.boardSquare[rightId].occupied && getFigureById(rightId).enPassant === true) {
          if (color === 'white') {
            gameState.boardSquare[topRightId].canMove = true;
          } else gameState.boardSquare[bottomRightId].canMove = true;
        }
      }
      if (leftId) {
        if (gameState.boardSquare[leftId].occupied && getFigureById(leftId).enPassant === true) {
          if (color === 'white') {
            gameState.boardSquare[topLeftId].canMove = true;
          } else gameState.boardSquare[bottomLeftId].canMove = true;
        }
      }
      break;
    case 'rook':
      moveset = [
        { id: topId, direction: 'top' },
        { id: rightId, direction: 'right' },
        { id: bottomId, direction: 'bottom' },
        { id: leftId, direction: 'left' }];
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

      moveset = [topRight, topLeft, rightTop, rightBottom, bottomRight, bottomLeft, leftTop, leftBottom];
      moveset.forEach(id => {
        if (id === undefined) return;
        if (!gameState.boardSquare[id].occupied) gameState.boardSquare[id].canMove = true;
        if (gameState.boardSquare[id].occupied && getFigureById(id).color !== color) gameState.boardSquare[id].canMove = true;
      });
      break;
    case 'bishop':
      moveset = [
        { id: topRightId, direction: 'top-right' },
        { id: bottomRightId, direction: 'bottom-right' },
        { id: bottomLeftId, direction: 'bottom-left' },
        { id: topLeftId, direction: 'top-left' }];
      break;
    case 'queen': // CONTINUE add moveset
      moveset = [
        { id: topId, direction: 'top' },
        { id: rightId, direction: 'right' },
        { id: bottomId, direction: 'bottom' },
        { id: leftId, direction: 'left' },
        { id: topRightId, direction: 'top-right' },
        { id: bottomRightId, direction: 'bottom-right' },
        { id: bottomLeftId, direction: 'bottom-left' },
        { id: topLeftId, direction: 'top-left' }];
      break;
    case 'king': // Add one move and Castling
      moveset = [topId, rightId, bottomId, leftId, topRightId, bottomRightId, bottomLeftId, topLeftId];

      // Castling
      if (figure.castling) {
        if (color === 'white') {
          if (!gameState.boardSquare.f1.occupied && !gameState.boardSquare.g1.occupied && getFigureById('h1').castling) {
            gameState.boardSquare.g1.canMove = true;
          } else if (!gameState.boardSquare.d1.occupied && !gameState.boardSquare.c1.occupied && !gameState.boardSquare.b1.occupied && getFigureById('a1').castling) {
            gameState.boardSquare.c1.canMove = true;
          }
        } else if (color === 'black') {
          if (!gameState.boardSquare.f8.occupied && !gameState.boardSquare.g8.occupied && getFigureById('h8').castling) {
            gameState.boardSquare.g8.canMove = true;
          } else if (!gameState.boardSquare.d8.occupied && !gameState.boardSquare.c8.occupied && !gameState.boardSquare.b8.occupied && getFigureById('a8').castling) {
            gameState.boardSquare.c8.canMove = true;
          }
        }
      }

      break;
  }

  // Actual move
  moveset.forEach(move => {
    let localId = move;
    let direction;
    if (figure.type !== 'king' && figure.type !== 'knight') {
      localId = move.id;
      direction = move.direction;
    }
    let index = 1;
    while (localId) {
      if (localId === undefined) break; // {}
      if (!gameState.boardSquare[localId].occupied) gameState.boardSquare[localId].canMove = true;
      if (gameState.boardSquare[localId].occupied) {
        if (getFigureById(localId).color === color) break;
        gameState.boardSquare[localId].canMove = true;
        break;
      }
      if (figure.type === 'king' || figure.type === 'knight') break;
      switch (direction) {
        case 'top':
          localId = getSquareId(x, (y - index));
          break;
        case 'right':
          localId = getSquareId(x + index, (y));
          break;
        case 'bottom':
          localId = getSquareId(x, (y + index));
          break;
        case 'left':
          localId = getSquareId(x - index, (y));
          break;
        case 'top-right':
          localId = getSquareId(x + index, (y - index));
          break;
        case 'bottom-right':
          localId = getSquareId(x + index, (y + index));
          break;
        case 'bottom-left':
          localId = getSquareId(x - index, (y + index));
          break;
        case 'top-left':
          localId = getSquareId(x - index, (y - index));
          break;
      }
      index++;
    }
  });
}

function highLightMoves (id) {
  if (id) {
    const initialSquare = gameState.boardSquare[id];
    canva.fillSquare(initialSquare.x, initialSquare.y, 'rgb(159, 227, 159)');
  }

  Object.entries(gameState.boardSquare).forEach(e => {
    if (e[1].canMove !== true) return;
    const figure = getFigureById(e[1].id);
    const color = e[1].color;
    if (color === 'brown') {
      canva.fillSquare(e[1].x, e[1].y, 'rgb(63, 38, 13)');
    } else if (color === 'light') {
      canva.fillSquare(e[1].x, e[1].y, 'rgb(155, 122, 44)');
    }
    if (e[1].occupied) canva.fillSquare(e[1].x, e[1].y, 'gray');
    if (figure) {
      if (figure.type === 'king') canva.fillSquare(e[1].x, e[1].y, 'red');
    };
  });
  canva.figuresDraw(gameState.figures);
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
  gameState.figures = [];
  history.ResetHistory();
  turnChange('white');
  Object.entries(gameState.boardSquare).forEach(entry => {
    delete entry[1].canMove;
    if (entry[1].occupied) delete entry[1].occupied;
  });

  // PAWNS
  for (let i = 0; i < 8; i++) {
    const idW = canva.letters[i] + '2';
    const idB = canva.letters[i] + '7';
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
  let figColor;
  if (getFigureById(squareId)) {
    figColor = getFigureById(squareId).color;
  }
  if (!squareId) return;
  if (figColor !== gameState.currentTurn) return;

  // if square occupied, then find figure on the square
  if (gameState.boardSquare[squareId].occupied && isFigurePicked === false) {
    isFigurePicked = true; // UNMUTE!!!!!!!!!!!!!!!!!
    canva.clear();
    canva.createCheckBoard();
    makeMove(squareId);
    highLightMoves(squareId);

    // highlightMove(squareId);

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

  Object.entries(gameState.boardSquare).forEach(entry => {
    const element = entry[1];
    if (x === element.x && y === element.y) returnId = element.id;
  });

  return returnId;
}

function figureMove (idIn) {
  const element = getFigureById(idIn);
  if (element.color !== gameState.currentTurn) {
    isFigurePicked = false;
    return;
  }
  canva.addEventListener('click', (e) => {
    const squareId = getSquareId(e.offsetX, e.offsetY);

    if (!squareId) { // Click on not a square
      isFigurePicked = false;
      render();
      return;
    }
    if (gameState.boardSquare[squareId].canMove) { // Square is open for move
      figurePositionChange(squareId, idIn);
    }

    isFigurePicked = false;
    render();
  }, { once: true });
}

function getFigureById (id) {
  let returnElement;
  gameState.figures.forEach(element => {
    if (id === element.id) {
      returnElement = element;
    }
  });
  return returnElement;
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
  const square = gameState.boardSquare[toId];
  delete figure.castling;
  figure.x = square.x;
  figure.y = square.y;
  figure.id = square.id;
  square.occupied = true;
  delete gameState.boardSquare[fromId].occupied;
}

function promQuest (id) {
  if (!gameState.boardSquare[id]) return;
  const pixCoords = canva.numberToPixels(gameState.boardSquare[id].x, gameState.boardSquare[id].y);
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
