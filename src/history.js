class History {
  historyArrayBlack = [];
  historyArrayWhite = [];
  Add (type, fromFigure, toId, fromIdForProm) {
    const figure = fromFigure;
    let figType = figure.type[0].toUpperCase();
    let pushValue;

    if (figure.type === 'knight') {
      figType = 'N';
    }

    switch (type) {
      case 'regular':
        if (figure.type !== 'pawn') {
          pushValue = figType + toId;
        } else {
          pushValue = toId;
        }
        break;
      case 'capture':
        if (figure.type !== 'pawn') {
          pushValue = figType + ':' + toId;
        } else {
          if (fromIdForProm) {
            pushValue = fromIdForProm[0] + ':' + toId;
          } else {
            pushValue = figure.id[0] + ':' + toId;
          }
        }
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

    const color = figure.color;
    if (color === 'white') {
      this.historyArrayWhite.push(pushValue);
    } else this.historyArrayBlack.push(pushValue);

    this.Render();
  }

  AddPromotion (color, toId) { // No capture
    const pushValue = toId + 'Q';

    if (color === 'white') {
      this.historyArrayWhite.push(pushValue);
    } else this.historyArrayBlack.push(pushValue);
    this.Render();
  }
  // COLOR + TO ID
  // FROM ID + FROM COLOR + TO ID

  AddPromotionCapture (fromId, color, toId) {
    const pushValue = fromId[0] + ':' + toId + 'Q';
    if (color === 'white') {
      this.historyArrayWhite.push(pushValue);
    } else this.historyArrayBlack.push(pushValue);
    this.Render();
  }

  Render () {
    const historyHolderBlack = document.getElementById('blackHistory');
    historyHolderBlack.innerHTML = '';
    const historyHolderWhite = document.getElementById('whiteHistory');
    historyHolderWhite.innerHTML = '';

    if (historyHolderBlack.length > 35) {
      historyHolderBlack.shift();
    }
    if (historyHolderWhite.length > 35) {
      historyHolderWhite.shift();
    }

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
