import Game from "./Game";

const
  brickSize = 20,
  boardRows = 22,
  boardCols = 10,
  boardWidth = brickSize * boardCols,
  boardHeight = brickSize * boardRows;

const domElement = document.querySelector('canvas#board');
domElement.width = boardWidth * window.devicePixelRatio;
domElement.height = boardHeight * window.devicePixelRatio;
domElement.style.width = `${boardWidth}px`;
domElement.style.height = `${boardHeight}px`;

const context = domElement.getContext("2d");
context.scale(window.devicePixelRatio, window.devicePixelRatio);

new Game({
  context,
  board: {
    boardWidth, boardHeight, brickSize
  },
  customControls: [[]]
});
