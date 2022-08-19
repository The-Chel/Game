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

  function clear () {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // deletes evrything
  };

  function figuresDraw (figures) {
    ctx.save();
    figures.forEach(element => {
      ctx.fillStyle = 'black';
      ctx.font = '100px serif';
      ctx.textAlign = 'center';
      ctx.fillText(figureUnicodes[element.type][element.color], 50 + element.x, 85 + element.y);
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

        if (isBlack) {
          ctx.fillStyle = 'rgb(209, 173, 90)';
        } else {
          ctx.fillStyle = 'rgb(94, 57, 19)';
        }

        ctx.fillRect(25 + incrI, 25 + incrA, squareSize, squareSize);

        isBlack = !isBlack;
      }
      isBlack = !isBlack;
    }
  }

  function fillSquare (x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, squareSize, squareSize);
  };

  return {
    clear,
    figuresDraw,
    createCheckBoard,
    fillSquare,
    addEventListener: (type, listener, options) => canvas.addEventListener(type, listener, options)
  };
}

window.canvas = init();
