// MODEL

let boardSquare = [];
// {
//   id, //a1, a2, a3... h8
//   x,
//   licalY
// };
const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

// fills array 'boardSquare' with objects contining ID and location of square
function giveId(i, a, incrI, incrA) {
id = '' + letters[i] + numbers[a];
x = 25+incrI;
y = 25+incrA;
boardSquare.push({
  id,
  x,
  y
});
}

let figure = [];
// isPicked, locationX, locationY, id
function figureAdd(id) {
let x;
let y;
let check = true;

boardSquare.forEach(element => {
  if (id === element.id) {
    x = element.x;
    y = element.y;

    element.isEmpty = false;
  }
});

figure.forEach(element => {
  if (id === element.id) {
    check = false;
  }
});
if (check) {
    figure.push({
      x: x,
      y: y,
      id: id
    });
  }

render();
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
// setInterval(render, 1000);

function figureDraw() {
ctx.fillStyle = 'cyan';
// ctx.fillRect(25+x, 25+y, 50, 50);
figure.forEach(element => {
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
    if (boardSquare.length < 64) {
      giveId(i, a, incrI, incrA);
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
  figureFind(squareId);
} else { console.log('the square is  empty');}

     // wait until next mouse input, move figure to other square if is Empty = true
})
//finds clicked square
function findSquareId(clickX, clickY) {
let returnId;
boardSquare.forEach(element => {
  if (clickX > element.x && clickX < (element.x+100) && clickY > element.y && clickY < (element.y+100)) {
    returnId = element.id;
    console.log(element.id);
  }
});
return returnId;
}
function isEmpty(id) {
let returnIsEmpty;
boardSquare.forEach(element => {
  if (id === element.id) {
    returnIsEmpty = element.isEmpty;
  }
});
return returnIsEmpty;
}
function figureFind(idIn) {
figure.forEach(element => {
  if (idIn === element.id) {
    const once = {
      once : true
    };
    canvas.addEventListener('click', (e) => {
      const squareId = findSquareId(e.offsetX, e.offsetY);
      figureAdd(squareId);
      figureRemove(idIn);
      return false;
    }, once)
  }
});
}

function figureRemove(id) {
figure = figure.filter((e) => {
  if (id === e.id) {
    return false;
  } else {
    return true;
  }
});

boardSquare.forEach(e => {
  if (id === e.id) {
    e.isEmpty = true;
  }
});

render();
}

function figureMove() {

}