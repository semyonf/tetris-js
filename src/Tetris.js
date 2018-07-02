import Game from "./Game";

const domElement = document.querySelector('canvas#board');
const config = {
  domElement,
  board: {
    rows: 22,
    cols: 10,
    brickSize: 20
  }
};

const tetris = new Game(config);

const
  brickSize = config.board.brickSize,
  boardRows = config.board.rows,
  boardCols = config.board.cols,
  boardWidth = brickSize * boardCols,
  boardHeight = brickSize * boardRows;

domElement.width = boardWidth * window.devicePixelRatio;
domElement.height = boardHeight * window.devicePixelRatio;
domElement.style.width = `${boardWidth}px`;
domElement.style.height = `${boardHeight}px`;

domElement.getContext("2d").scale(window.devicePixelRatio, window.devicePixelRatio);