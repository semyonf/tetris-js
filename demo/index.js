const brickSize = 15,
  boardRows = 20,
  boardCols = 10,
  boardWidth = brickSize * boardCols,
  boardHeight = brickSize * boardRows;

const domElement = document.querySelector('canvas#board');
domElement.width = boardWidth * window.devicePixelRatio;
domElement.height = boardHeight * window.devicePixelRatio;
domElement.style.width = `${boardWidth}px`;

domElement.style.height = `${boardHeight}px`;
const context = domElement.getContext('2d');

context.scale(window.devicePixelRatio, window.devicePixelRatio);

const buttonLeft = document.querySelector('.left');
const buttonRight = document.querySelector('.right');
const buttonUp = document.querySelector('.top');
const buttonDown = document.querySelector('.bottom');
const buttonEscape = document.querySelector('.escape');

new Tetris({
  context,
  board: {
    boardWidth,
    boardHeight,
    brickSize,
  },
  onScreenControls(a) {
    buttonLeft.addEventListener('click', () => void a.left());
    buttonRight.addEventListener('click', () => void a.right());
    buttonUp.addEventListener('click', () => void a.up());
    buttonDown.addEventListener('click', () => void a.down());
    buttonEscape.addEventListener('click', () => void a.escape());
  },
});
