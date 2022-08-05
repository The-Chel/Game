// MODEL
// Figure must have Coordiantes on creation, as well as type and id
// It may be jsut be one function of figureAdd()
// It'll just initially add the figure to the array of objects
// Then it must be drawn on coresponding field with another function figureDraw()
// whitch will get location form boardSquare element by id and pass to figure
// only changing coordinates

let boardSquare = {};
let figures = [];

let IdsGiven = 0;

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
const idInput = document.getElementById('idInput');
const figureType = document.getElementById('dropDownFigures');

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


//locationX, locationY, id, type
function figureAdd(id) {
  let check = true;


  // x = coords[0];
  // y = coords[1];

  figures.forEach(element => {
    if (id === element.id) {
      check = false;
    }
  });

  if (check) {
      figures.push({
        id: id,
        type: figureType.value
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

  // if (fromId) {
  //     const element = boardSquare[fromId];
  //     coordinatesArray[0] = element.x;
  //     coordinatesArray[1] = element.y;
  //     element.isEmpty = true;
  // }
  // const element2 = boardSquare[toId];
  // coordinatesArray[0] = element2.x;
  // coordinatesArray[1] = element2.y;
  // element2.isEmpty = false;
  // figures.forEach(element => {
  //   if (toId === element.id) {
  //     element.x = coordinatesArray[0];
  //     element.y = coordinatesArray[1];
  //     if (fromId !== undefined) {
  //       element.id = fromId;
  //     } else element.id = toId;
  //   }
  // });
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

  figures.forEach(element => {
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

      // Gives Ids only once on first draw, never changes Ids again
      if (IdsGiven < 64) {
        giveId(i, a, incrI, incrA);
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
    console.log('The square is NOT empty');
    figureMove(squareId);
  } else { console.log('the square is  empty');}

     // wait until next mouse input, move figure to other square if is Empty = true
})
//finds clicked square
function findSquareId(clickX, clickY) {
  let returnId;
  Object.entries(boardSquare).forEach(entry => {
    const element = entry[1];
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
  figures.forEach(element => {
    if (idIn === element.id) {
      canvas.addEventListener('click', (e) => {
        const squareId = findSquareId(e.offsetX, e.offsetY);
        if (isEmpty(squareId) !== false) {
          console.log('not false');
          figurePositionChange(squareId, idIn);
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
