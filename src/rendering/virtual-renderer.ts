import Game from '../game';
import Renderer from './renderer';

export default class VirtualRenderer extends Renderer {
  frameClock = setTimeout;

  constructor(private readonly spy: any) {
    super();
  }

  setup(game: Game) {
    game.setRandomSeed(this.spy.injection.seed);
    game.recorder.tape = this.spy.injection.tape;
    game.stop();
  }

  public drawBoard(): void {
    this.spy.drawBoard();
  }

  public drawBrick(): void {
    this.spy.drawBrick();
  }

  public drawReplay(): void {
    this.spy.drawReplay();
  }

  public drawScore(score: number): void {
    this.spy.drawScore(score);
  }
}
