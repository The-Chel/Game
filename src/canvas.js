function init () {
  const canvas = document.getElementById('myCanvas');
  canvas.style.backgroundColor = 'rgb(148, 106, 62)';

  const ctx = canvas.getContext('2d');

  const squareSize = 100; // 100px
  const figureUnicodes = {
    king: { black: '\u265A', white: '\u2654' },
    queen: { black: '\u265B', white: '\u2655' },
    rook: { black: '\u265C', white: '\u2656' },
    bishop: { black: '\u265D', white: '\u2657' },
    knight: { black: '\u265E', white: '\u2658' },
    pawn: { black: '\u265F', white: '\u2659' }
  };

  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const numbers = [8, 7, 6, 5, 4, 3, 2, 1];

  let IdsGiven = 0;

  function clear () {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // deletes evrything
  };

  function figuresDraw (figures) {
    ctx.save();
    figures.forEach(element => {
      ctx.fillStyle = 'black';
      ctx.font = '100px serif';
      ctx.textAlign = 'center';
      ctx.fillText(figureUnicodes[element.type][element.color], 75 + element.x * squareSize, 110 + element.y * squareSize);
    });
    ctx.restore();
  };

  function createCheckBoard () {
    let isBlack = true;

    for (let a = 0; a < 8; a++) {
      const incrA = a * squareSize;

      ctx.fillStyle = 'black';
      ctx.font = '25px Arial';
      ctx.fillText(letters[a], 68 + incrA, 20);
      ctx.fillText(letters[a], 68 + incrA, 844);
      ctx.fillText(numbers[a], 5, 80 + incrA);
      ctx.fillText(numbers[a], 831, 80 + incrA);

      for (let i = 0; i < 8; i++) {
        const incrI = i * squareSize;
        let color;
        if (isBlack) {
          ctx.fillStyle = 'rgb(209, 173, 90)';
          color = 'light';
        } else {
          ctx.fillStyle = 'rgb(94, 57, 19)';
          color = 'brown';
        }
        if (IdsGiven < 64) {
          giveId(i, a, color);
          IdsGiven++;
        }
        if (IdsGiven === 64) {
          const squareId = letters[i] + numbers[a];
          if (gameState.boardSquare[squareId]) {
            if (gameState.boardSquare[squareId].check) {
              ctx.fillStyle = 'red';
              color = 'brown';
            }
          }
        }


        ctx.fillRect(25 + incrI, 25 + incrA, squareSize, squareSize);

        isBlack = !isBlack;
      }
      isBlack = !isBlack;
    }
    Object.entries(gameState.boardSquare).forEach(entry => {
      delete entry[1].canMove;
    });
  }

  // fills array 'boardSquare' with objects contining ID and location of square
  function giveId (i, a, color) {
    const id = '' + letters[i] + numbers[a];
    const x = i;
    const y = a;
    gameState.boardSquare[id] = ({
      id,
      x,
      y,
      color
    });
  }

  function fillSquare (x, y, color) {
    ctx.fillStyle = color;
    if (x < 10 && y < 10) {
      ctx.fillRect(25 + x * 100, 25 + y * 100, squareSize, squareSize);
    } else ctx.fillRect(x, y, squareSize, squareSize);
  };

  function pixelsToNumbers (xPx, yPx) {
    const x = xPx - 25;
    const y = yPx - 25;
    const localX = Math.trunc(x / squareSize);
    const localY = Math.trunc(y / squareSize);
    const returnArray = [localX, localY];

    return returnArray;
  }

  function numberToPixels (xN, yN) {
    const x = xN * squareSize + 25;
    const y = yN * squareSize + 35;
    const returnArray = [x, y];
    return returnArray;
  }

  return {
    clear,
    figuresDraw,
    createCheckBoard,
    fillSquare,
    pixelsToNumbers,
    numberToPixels,
    addEventListener: (type, listener, options) => canvas.addEventListener(type, listener, options),
    letters

  };
}

window.canvas = init();
