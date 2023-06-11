import ParkMiller from 'park-miller';
import Board from './Board';
import IGameConfig from './IGameConfig';
import Joystick, { Button } from './Joystick';
import Recorder from './Recorder';
import CanvasRenderer from './rendering/CanvasRenderer';
import IRenderer from './rendering/IRenderer';
import VirtualRenderer from './rendering/VirtualRenderer';
import ScoreManager from './ScoreManager';
import FallCommand from './shape/commands/FallCommand';
import IShapeCommand from './shape/IShapeCommand';
import MoveLeftCommand from './shape/commands/MoveLeftCommand';
import MoveRightCommand from './shape/commands/MoveRightCommand';
import RotateCommand from './shape/commands/RotateCommand';
import DropCommand from './shape/commands/DropCommand';

type Clock = (cb: () => void) => void;

export default class Game {
  public turboMode = false;

  private _frameCount = 0;
  get frameCount(): number {
    return this._frameCount;
  }

  public onProceedCb?: CallableFunction = undefined;

  public readonly scoreManager = new ScoreManager();
  public readonly renderer: IRenderer;
  public readonly joystick = new Joystick();
  public readonly recorder = new Recorder(this.joystick, this);

  private randomSeed = +new Date();
  private fallCommand = new FallCommand();
  private randomNumberGenerator: ParkMiller;
  private board: Board;

  private readonly commandMap: { [key in Button]: IShapeCommand } = {
    ArrowDown: new DropCommand(),
    ArrowLeft: new MoveLeftCommand(),
    ArrowRight: new MoveRightCommand(),
    ArrowUp: new RotateCommand(),
  };

  public readonly clocks: { [key: string]: Clock } = {
    gpu: requestAnimationFrame.bind(window),
    timeout: setTimeout.bind(window),
  };

  private clock = this.clocks.gpu;

  stop() {
    const tape = this.recorder.stopRecording();
    const lastFrame = this._frameCount;
    this.restart();
    this.joystick.disconnect();

    this.onProceedCb = () => {
      if (this._frameCount !== lastFrame) {
        this.drawReplay();

        if (tape.length && this._frameCount === tape[0].frame) {
          this.joystick.lastPressedButton = tape.shift().key;
        }
      } else {
        this.onProceedCb = undefined;
        this.setRandomSeed(+new Date());
        this.restart();
      }
    };
  }

  constructor(private readonly config: IGameConfig) {
    this.joystick.connect();

    addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code !== 'Escape') {
        return;
      } else {
        e.preventDefault();
        this.stop();
      }
    });

    if (config.onScreenControls) {
      config.onScreenControls({
        left: () => this.joystick.postButtonPress('ArrowLeft'),
        right: () => this.joystick.postButtonPress('ArrowRight'),
        up: () => this.joystick.postButtonPress('ArrowUp'),
        down: () => this.joystick.postButtonPress('ArrowDown'),
        escape: () => this.stop(),
      });
    }

    this.recorder.startRecording();

    if (config.debug === true) {
      this.renderer = new VirtualRenderer(this, config.spy);
    } else if (config.context) {
      this.renderer = new CanvasRenderer(config.context);
    } else {
      throw new Error('No renderer selected!');
    }

    this.randomNumberGenerator = new ParkMiller(this.randomSeed);

    this.board = new Board(
      this,
      config.board.boardWidth,
      config.board.boardHeight,
      config.board.brickSize,
      this.randomNumberGenerator,
    );

    this.mainLoop();
  }

  public setClock(d: string) {
    if (d === 'timeout') {
      this.clock = this.clocks.timeout;
    } else {
      this.clock = this.clocks.gpu;
    }
  }

  public drawReplay() {
    this.renderer.drawReplay();
  }

  public restart() {
    this.randomNumberGenerator = new ParkMiller(this.randomSeed);
    this.scoreManager.setScore(0);
    this._frameCount = 0;
    this.turboMode = false;
    this.board = new Board(
      this,
      this.config.board.boardWidth,
      this.config.board.boardHeight,
      this.config.board.brickSize,
      this.randomNumberGenerator,
    );
    this.joystick.connect();
    this.recorder.startRecording();
  }

  public setRandomSeed(newSeed: number) {
    this.randomSeed = newSeed;
  }

  public proceed() {
    this._frameCount++;
    this.renderer.drawBoard(this.board);

    if (this.onProceedCb) {
      this.onProceedCb();
    }

    this.readNextCommand();

    this.board.checkCollisions((collisions: any) => {
      this.board.activeShape.isFrozen = collisions.bottom;
    });

    if (this.board.activeShape.isFrozen) {
      for (let i = 0; i < 4; ++i) {
        this.board.staticBricks.push(this.board.activeShape.bricks.pop());
      }

      this.board.checkFilledRegions();
      this.turboMode = false;
      this.board.activeShape = this.board.spawnShape();

      if (this.board.isFull()) {
        this.restart();
      }
    } else {
      if (this.gravityIsActive()) {
        this.fallCommand.execute.call(this.board.activeShape, this.board);
      }

      this.board.activeShape.bricks.forEach((brick) =>
        this.renderer.drawBrick(brick),
      );
    }

    this.renderer.drawScore(this.scoreManager.getScore());
    this.board.staticBricks.forEach((brick) => this.renderer.drawBrick(brick));
  }

  private mainLoop() {
    this.proceed();
    this.clock(this.mainLoop.bind(this));
  }

  private gravityIsActive() {
    const gameSpeeds = [null, 32, 16, 8, 4, 2];

    return (
      this.turboMode ||
      this._frameCount % gameSpeeds[this.scoreManager.getLevel()] === 0
    );
  }

  private readNextCommand() {
    const button = this.joystick.lastPressedButton;

    if (!button) {
      return;
    }

    this.joystick.lastPressedButton = null;

    this.commandMap[button].execute.call(this.board.activeShape, this.board);
  }
}
