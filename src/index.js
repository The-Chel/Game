// MODEL
// Figure must have Coordiantes on creation, as well as type and id
// It may be jsut be one function of figureAdd()
// It'll just initially add the figure to the array of objects
// Then it must be drawn on coresponding field with another function figureDraw()
// whitch will get location form boardSquare element by id and pass to figure
// only changing coordinates

let boardSquare = {};
// {
//   id, //a1, a2, a3... h8
//   x,
//   licalY
// };
const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
const idInput = document.getElementById('idInput');
const typeInput = document.getElementById('dropDownFigures');

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

let figure = [];
//locationX, locationY, id, type
function figureAdd(id) {
  let x;
  let y;
  let coords;
  let check = true;


  // x = coords[0];
  // y = coords[1];

  figure.forEach(element => {
    if (id === element.id) {
      check = false;
    }
  });

  if (check) {
      figure.push({
        // x: x,
        // y: y,
        id: id,
        type: typeInput.value
      });
    }
  figurePositionChange(id);
  render();
}

function figurePositionChange(toId, fromId) {
  let returnArray = []; //[0] = x. [1] = y.
  //draw__
  if (fromId) {
      const element = boardSquare[fromId];
      returnArray[0] = element.x;
      returnArray[1] = element.y;
      element.isEmpty = true;
  }
  const element2 = boardSquare[toId];
  returnArray[0] = element2.x;
  returnArray[1] = element2.y;
  element2.isEmpty = false;
  figure.forEach(element => {
    if (toId === element.id) {
      element.x = returnArray[0];
      element.y = returnArray[1];
      if (fromId !== undefined) {
        element.id = fromId;
      } else element.id = toId;
    }
  });
  // return returnArray;
}

// VISUAL

const canvas = document.getElementById('myCanvas');
canvas.style.backgroundColor = 'rgb(148, 106, 62)';

const ctx = canvas.getContext('2d');


function render() { // erases the screen, updates visual inforamtion
  console.log('render is done');
  ctx.clearRect(0, 0, canvas.width, canvas.height); // deletes evrything
  createCheckBoard(); // draws checkbox
  figureDraw(); // draws figures
  }


function figureDraw() {

  figure.forEach(element => {
    switch (element.type) {
      case 'king':
        ctx.fillStyle = 'pink';
        break;
    
      default: ctx.fillStyle = 'cyan';
        break;
    }
    ctx.fillRect(25+element.x, 25+element.y, 50, 50);
  });
}

function createCheckBoard() {
  let isBlack = true;
  let id;
  let x;
  let y;

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
      // Gives Id's
      giveId(i, a, incrI, incrA);
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
    console.log('The square is NOT empty');
    figureMove(squareId);
  } else { console.log('the square is  empty');}

     // wait until next mouse input, move figure to other square if is Empty = true
})
//finds clicked square
function findSquareId(clickX, clickY) {
  let returnId;
  Object.entries(boardSquare).forEach(entry => {
    const element = empty[1];
    if (clickX > element.x && clickX < (element.x+100) && clickY > element.y && clickY < (element.y+100)) {
      returnId = element.id;
      console.log(element.id);
    }
  });
  return returnId;
}

function isEmpty(id) {
  return boardSquare[id].isEmpty;
}

function figureMove(idIn) {
  figure.forEach(element => {
    if (idIn === element.id) {
      canvas.addEventListener('click', (e) => {
        const squareId = findSquareId(e.offsetX, e.offsetY);
        if (isEmpty(squareId) !== false) {
          figurePositionChange(idIn, squareId);
          figureRemove(idIn);
        }       
      }, {once : true})
    }
  });
}

function figureRemove(id) {
  // figure = figure.filter((e) => {
  //   if (id === e.id) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // });

  boardSquare[id].isEmpty = true;

  render();
}

function onButtonFigureDraw() {
  const id = idInput.value;
  figureAdd(id);
}
