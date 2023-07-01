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
import TapeItem from './tape-item';

export default class Game {
  public turboMode = false;

  private _frameCount = 0;
  get frameCount(): number {
    return this._frameCount;
  }

  private readonly joystick = new Joystick();
  private readonly fallCommand = new FallCommand();
  private prng: ParkMiller;
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

  private ejectedTape?: TapeItem[];
  private previouslastFrame?: number;
  private replay = false;

  stopAndReplay() {
    this.ejectedTape = this.recorder.finishRecording();
    this.previouslastFrame = this._frameCount;
    this.restart();
    this.joystick.disconnect();
    this.replay = true;
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
        if (!this.replay) {
          this.stopAndReplay();
        }
      }
    });

    if (config.onScreenControls) {
      config.onScreenControls({
        left: () => this.joystick.postButtonPress('ArrowLeft'),
        right: () => this.joystick.postButtonPress('ArrowRight'),
        up: () => this.joystick.postButtonPress('ArrowUp'),
        down: () => this.joystick.postButtonPress('ArrowDown'),
        escape: () => this.stopAndReplay(),
      });
    }

    this.recorder.startRecording();
    this.prng = new ParkMiller(this.randomSeed);

    this.board = new Board(this, this.prng);

    this.mainLoop();
  }

  public drawReplay() {
    this.renderer.drawReplay();
  }

  public restart() {
    this.prng = new ParkMiller(this.randomSeed);
    this.scoreManager.setScore(0);
    this._frameCount = 0;
    this.turboMode = false;
    this.board = new Board(this, this.prng);
    this.joystick.connect();
    this.recorder.startRecording();
  }

  public setRandomSeed(newSeed: number) {
    this.randomSeed = newSeed;
  }

  public proceed() {
    this._frameCount++;
    this.renderer.drawBoard(this.board);

    if (this.replay) {
      if (this._frameCount !== this.previouslastFrame) {
        this.drawReplay();
        const tape = this.ejectedTape;

        // TODO: handle frame drops
        if (tape.length && this._frameCount >= tape[0].frame) {
          this.joystick.lastPressedButton = tape.shift().key;
        }
      } else {
        this.replay = false;
        this.setRandomSeed(+new Date());
        this.restart();
      }
    }

    this.readNextCommand();

    if (this.gravityIsActive()) {
      this.fallCommand.execute.call(this.board.activeShape, this.board);
    }

    for (const brick of this.board.activeShape.bricks) {
      this.renderer.drawBrick(brick);
    }

    this.renderer.drawScore(this.scoreManager.getScore());
    this.board.frozenBricks.forEach((brick) => this.renderer.drawBrick(brick));
  }

  public handleFrozen() {
    this.turboMode = false;
    this.board.frozenBricks.push(...this.board.activeShape.bricks);
    this.board.checkForFilledRegions();
    this.board.activeShape = this.board.spawnShape();

    if (this.board.isFull()) {
      this.restart();
    }
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
