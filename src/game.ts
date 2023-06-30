import ParkMiller from 'park-miller';
import Board from './board';
import GameConfig from './game-config';
import Joystick, { Button } from './joystick';
import Recorder from './recorder';
import CanvasRenderer from './rendering/canvas-renderer';
import Renderer from './rendering/renderer';
import ScoreManager from './score-manager';
import FallCommand from './shape/commands/fall-command';
import ShapeCommand from './shape/shape-command';
import MoveLeftCommand from './shape/commands/move-left-command';
import MoveRightCommand from './shape/commands/move-right-command';
import RotateCommand from './shape/commands/rotate-command';
import DropCommand from './shape/commands/drop-command';

export default class Game {
  public turboMode = false;

  private _frameCount = 0;
  get frameCount(): number {
    return this._frameCount;
  }

  private readonly joystick = new Joystick();
  private readonly fallCommand = new FallCommand();
  private onProceedCb?: CallableFunction = undefined;
  private randomNumberGenerator: ParkMiller;
  private randomSeed = +new Date();
  private board: Board;

  public readonly scoreManager = new ScoreManager();
  public readonly recorder = new Recorder(this.joystick, this);

  private readonly commandMap: { [key in Button]: ShapeCommand } = {
    ArrowDown: new DropCommand(),
    ArrowLeft: new MoveLeftCommand(),
    ArrowRight: new MoveRightCommand(),
    ArrowUp: new RotateCommand(),
  };

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

  constructor(
    public readonly config: GameConfig,
    public readonly renderer: Renderer = new CanvasRenderer(config.context),
  ) {
    this.joystick.connect();

    renderer.setup(this);

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

    const collisions = this.board.activeShape.checkCollisions(
      this.board.frozenBricks,
      this.board.width,
      this.board.height,
    );

    this.board.activeShape.isFrozen = collisions.bottom;

    if (this.board.activeShape.isFrozen) {
      for (let i = 0; i < 4; ++i) {
        this.board.frozenBricks.push(this.board.activeShape.bricks.pop());
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
    this.board.frozenBricks.forEach((brick) => this.renderer.drawBrick(brick));
  }

  private mainLoop() {
    this.proceed();
    this.renderer.frameClock(this.mainLoop.bind(this));
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
