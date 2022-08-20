class History {
  historyArrayBlack = [];
  historyArrayWhite = [];
  Add (type, fromId, toId) {
    const element = getFigureById(fromId);

    const historyHolderBlack = document.getElementById('blackHistory');
    historyHolderBlack.innerHTML = '';
    const historyHolderWhite = document.getElementById('whiteHistory');
    historyHolderWhite.innerHTML = '';

    let figType = element.type[0].toUpperCase();

    if (element.type === 'knight') {
      figType = 'N';
    }
    if (historyHolderBlack.length > 35) {
      historyHolderBlack.shift();
    }
    if (historyHolderWhite.length > 35) {
      historyHolderWhite.shift();
    }
    let pushValue;

    switch (type) {
      case 'regular':
        if (element.type !== 'pawn') {
          pushValue = figType + toId;
        } else {
          pushValue = toId;
        }
        break;
      case 'capture':
        if (element.type !== 'pawn') {
          pushValue = figType + ':' + toId;
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
        pushValue = '0-0-0';
        break;
      case 'castling-king':
        pushValue = '0-0';
        break;

      default:
        break;
    }

    const color = element.color;
    if (color === 'white') {
      this.historyArrayWhite.push(pushValue);
    } else this.historyArrayBlack.push(pushValue);

    this.historyArrayBlack.forEach(e => {
      const historyMove = document.createElement('div');
      historyMove.innerText = e;
      historyMove.id = 'history';
      historyHolderBlack.appendChild(historyMove);
    });
    this.historyArrayWhite.forEach(e => {
      const historyMove = document.createElement('div');
      historyMove.innerText = e;
      historyMove.id = 'history';
      historyHolderWhite.appendChild(historyMove);
    });
  }
}
const historyObj = new History();
window.chessHistory = historyObj;
