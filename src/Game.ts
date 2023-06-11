import ParkMiller from 'park-miller';
import Board from './Board';
import IGameConfig from './IGameConfig';
import Joystick from './Joystick';
import KeyMap from './KeyMap';
import Recorder from './Recorder';
import CanvasRenderer from './rendering/CanvasRenderer';
import IRenderer from './rendering/IRenderer';
import VirtualRenderer from './rendering/VirtualRenderer';
import ScoreManager from './ScoreManager';
import FallCommand from './shape/commands/FallCommand';

type Clock = (cb: () => void) => void;


export default class Game {
  public scoreManager: ScoreManager = new ScoreManager();
  public turboMode: boolean = false;
  public frameCount: number = 0;
  public onProceed: () => void | undefined = undefined;
  public renderer: IRenderer;
  public readonly clocks: { [key: string]: Clock } = Object.freeze({
    gpu: requestAnimationFrame.bind(window),
    timeout: setTimeout.bind(window),
  });
  public recorder: Recorder;
  public readonly joystick: Joystick;
  private randomSeed: number = +new Date();
  private clock: Clock = this.clocks.gpu;
  private fallCommand = new FallCommand();
  private random: any;
  private config: any;
  private board: Board;

  constructor(config: IGameConfig) {
    this.config = config;

    this.joystick = new Joystick([
      new KeyMap('ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'),
      new KeyMap('KeyH', 'KeyL', 'KeyK', 'KeyJ'),
      new KeyMap('KeyA', 'KeyD', 'KeyW', 'KeyS'),
    ]);

    this.recorder = new Recorder(this.joystick, this);

    this.joystick.connect();
    this.recorder.record();

    if (config.debug === true) {
      this.renderer = new VirtualRenderer(this, config.spy);
    } else if (config.context) {
      this.renderer = new CanvasRenderer(config.context);
    } else {
      throw new Error('No renderer selected!');
    }

    this.random = new ParkMiller(this.randomSeed);

    this.board = new Board(
      this,
      config.board.boardWidth,
      config.board.boardHeight,
      config.board.brickSize,
      this.random,
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
    this.random = new ParkMiller(this.randomSeed);
    this.scoreManager.setScore(0);
    this.frameCount = 0;
    this.turboMode = false;
    this.board = new Board(
      this,
      this.config.board.boardWidth,
      this.config.board.boardHeight,
      this.config.board.brickSize,
      this.random,
    );
  }

  public setRandomSeed(newSeed: number) {
    this.randomSeed = newSeed;
  }

  public proceed() {
    this.frameCount++;
    this.renderer.drawBoard(this.board);

    if (this.onProceed !== undefined) {
      this.onProceed();
    }

    this.readCommand();

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

      this.board.activeShape.bricks.forEach((brick) => {
        this.renderer.drawBrick(brick);
      });
    }

    this.renderer.drawScore(this.scoreManager.getScore());
    this.board.staticBricks.forEach((brick) => {
      this.renderer.drawBrick(brick);
    });
  }

  private mainLoop() {
    this.proceed();
    this.clock(this.mainLoop.bind(this));
  }

  private gravityIsActive() {
    const gameSpeeds = [null, 32, 16, 8, 4, 2];

    return (
      this.turboMode ||
      this.frameCount % gameSpeeds[this.scoreManager.getLevel()] === 0
    );
  }

  private readCommand() {
    const nextKey = this.joystick.keyQueue.shift();
    const command = this.joystick.keyMaps[nextKey];

    if (command) {
      command.execute.call(this.board.activeShape, this.board);
    }
  }
}
