import SeededRandom from "./SeededRandom";
import Board from "./Board";
import KeyMap from "./KeyMap";
import Joystick from "./Joystick";
import Recorder from "./Recorder";
import FallCommand from './shape/commands/FallCommand';

export default function Game(config) {
  const context = config.context;

  const keyMaps = [
    new KeyMap('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'),
    new KeyMap('KeyA', 'KeyD', 'KeyW', 'KeyS'), // W-A-S-D
    new KeyMap('KeyH', 'KeyL', 'KeyK', 'KeyJ')  // VIM
  ];
  const keyMap = Object.assign(...keyMaps);

  // todo: custom controls would go somewhere here...

  const joystick = new Joystick(keyMap);
  const recorder = new Recorder(joystick, this);

  joystick.start();
  recorder.start();

  this.randomSeed = +(new Date());
  this.random = new SeededRandom(this.randomSeed);

  this.playerScore = (() => {
    let _playerScore = 0;
    const scoreThresholds = [149, 49, 39, 9, 0];

    return {
      get() {
        return _playerScore;
      },
      set(newScore) {
        _playerScore = newScore;

        scoreThresholds.some((threshold, index) => {
          if (newScore >= threshold) {
            difficulty = 5 - index;

            return true;
          }
        });
      },
      add(extraScore) {
        this.set(_playerScore + extraScore);
      }
    };
  })();

  let board = new Board(
    this,
    config.board.boardWidth,
    config.board.boardHeight,
    config.board.brickSize,
    this.random
  );
  let frameCount = 0;
  this.onProceed = undefined;
  let difficulty = 1;
  this.turboMode = false;

  const gravityIsActive = () => {
    const gameSpeeds = [null, 27, 24, 16, 12, 8];

    return this.turboMode || frameCount % gameSpeeds[difficulty] === 0;
  };

  this.drawReplay = () => {
    board.drawReplay(context);
  };

  this.getFrameCount = () => frameCount;

  this.restart = () => {
    this.random = new SeededRandom(this.randomSeed);
    this.playerScore.set(0);
    frameCount = 0;
    difficulty = 1;
    this.turboMode = false;
    board = new Board(this, config.board.boardWidth, config.board.boardHeight, config.board.brickSize, this.random);
  };

  this.setRandomSeed = (newSeed) => {
    this.randomSeed = newSeed;
  };

  const readCommand = () => {
    const nextKey = joystick.keyQueue.shift();
    const command = joystick.keyMap[nextKey]

    if (command) {
      command.execute.call(board.activeShape, board)
    }
  };

  this.proceed = () => {
    ++frameCount;
    board.drawBackground(context);

    if (this.onProceed !== undefined) {
      this.onProceed();
    }

    readCommand();

    board.checkCollisions((collisions) => {
      board.activeShape.isFrozen = collisions.bottom;
    });

    if (board.activeShape.isFrozen) {
      for (let i = 0; i < 4; ++i) {
        board.staticBricks.push(board.activeShape.bricks.pop());
      }

      board.checkFilledRegions();
      this.turboMode = false;
      board.activeShape = board.spawnShape();

      if (board.isFull()) {
        this.restart();
      }
    } else {
      if (gravityIsActive()) {
        (new FallCommand()).execute.call(board.activeShape, board)
      }

      board.activeShape.draw(context);
    }

    board.drawStaticBricks(context);
    board.drawScore(context);
  };

  const mainLoop = () => {
    this.proceed();
    requestAnimationFrame(mainLoop);
  };

  requestAnimationFrame(mainLoop);
}
