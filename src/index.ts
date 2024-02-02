import Tetris from './tetris';

const brickSize = 15;
const boardRows = 20;
const boardCols = 10;
const boardWidth = brickSize * boardCols;
const boardHeight = brickSize * boardRows;

const canvas = document.querySelector('canvas#board') as HTMLCanvasElement;
canvas.width = boardWidth * window.devicePixelRatio;
canvas.height = boardHeight * window.devicePixelRatio;
canvas.style.width = `${boardWidth}px`;

canvas.style.height = `${boardHeight}px`;
const context = canvas.getContext('2d') as CanvasRenderingContext2D;

context.scale(window.devicePixelRatio, window.devicePixelRatio);

const buttonLeft = document.querySelector('.left') as HTMLButtonElement;
const buttonRight = document.querySelector('.right') as HTMLButtonElement;
const buttonUp = document.querySelector('.top') as HTMLButtonElement;
const buttonDown = document.querySelector('.bottom') as HTMLButtonElement;
const buttonEscape = document.querySelector('.escape') as HTMLButtonElement;

new Tetris({
  context,
  onScreenControls(a) {
    buttonLeft.addEventListener('click', () => void a.left());
    buttonRight.addEventListener('click', () => void a.right());
    buttonUp.addEventListener('click', () => void a.up());
    buttonDown.addEventListener('click', () => void a.down());
    buttonEscape.addEventListener('click', () => void a.escape());
  },
});
