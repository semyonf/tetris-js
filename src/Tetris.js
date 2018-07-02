import Joystick from './Joystick';
import KeyMap from './KeyMap';
import Recorder from "./Recorder";
import Game from "./Game";

const
  brickSize = 20,
  boardRows = 22,
  boardCols = 10,
  boardWidth = brickSize * boardCols,
  boardHeight = brickSize * boardRows,

  keyMaps = [
    new KeyMap('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'),
    new KeyMap('KeyA', 'KeyD', 'KeyW', 'KeyS'), // W-A-S-D
    new KeyMap('KeyH', 'KeyL', 'KeyK', 'KeyJ')  // VIM
  ],
  keyMap = Object.assign(...keyMaps),
  domElement = document.querySelector('canvas#board'),
  context = domElement.getContext("2d");

// noinspection JSUndefinedPropertyAssignment
domElement.width = boardWidth * window.devicePixelRatio;
// noinspection JSUndefinedPropertyAssignment
domElement.height = boardHeight * window.devicePixelRatio;
domElement.style.width = `${boardWidth}px`;
domElement.style.height = `${boardHeight}px`;
context.scale(window.devicePixelRatio, window.devicePixelRatio);

const joystick = new Joystick(keyMap);
const game = new Game(joystick, {
  width: boardWidth, height: boardHeight, brickSize: brickSize
}, context);
const recorder = new Recorder(joystick, game);

joystick.start();
recorder.start();

function mainLoop() {
  game.proceed();
  requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);
