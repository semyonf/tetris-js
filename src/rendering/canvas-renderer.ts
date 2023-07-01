import Board from '../board';
import Brick from '../brick';
import Renderer from './renderer';

export default class CanvasRenderer extends Renderer {
  private readonly context: CanvasRenderingContext2D;

  frameClock = requestAnimationFrame.bind(window);

  constructor(context: CanvasRenderingContext2D) {
    super();
    this.context = context;
  }

  public drawBoard(board: Board) {
    this.context.fillStyle = board.game.turboMode
      ? board.colors.turbo
      : board.colors.normal;
    this.context.fillRect(0, 0, 150, 300);
  }

  public drawReplay() {
    this.context.fillStyle = 'white';
    this.context.font = '12px Courier';
    this.context.fillText('REPLAY...', 0, 20);
  }

  public drawScore(score: number) {
    this.context.fillStyle = 'white';
    this.context.font = '12px Courier';
    this.context.fillText(`Score: ${score}`, 0, 10);
  }

  public drawBrick(brick: Brick) {
    this.context.fillStyle = brick.colorRgb;
    this.context.beginPath();
    this.context.moveTo(brick.x * 15, brick.y * 15);
    this.context.lineTo(brick.x * 15 + 15 - 1, brick.y * 15);
    this.context.lineTo(brick.x * 15, brick.y * 15 + 15 - 1);
    this.context.closePath();
    this.context.fill();

    this.context.fillStyle = this.modifyRgb(brick.colorRgb, 0.9);
    this.context.beginPath();
    this.context.moveTo(brick.x * 15 + 15 - 1, brick.y * 15);
    this.context.lineTo(brick.x * 15, brick.y * 15 + 15 - 1);
    this.context.lineTo(brick.x * 15, brick.y * 15 + 15 - 1);
    this.context.lineTo(brick.x * 15 + 15 - 1, brick.y * 15 + 15 - 1);
    this.context.closePath();
    this.context.fill();
  }

  /**
   * A function to darken or lighten rgb color strings
   * @param {string} color
   * @param {number} factor
   * @returns {string}
   */
  private modifyRgb(color: string, factor: number) {
    const regexp = /rgb\((\d+) ?, ?(\d+) ?, ?(\d+)\)/g;
    const matches = regexp.exec(color);

    const colors = [matches[1], matches[2], matches[3]];

    colors.forEach((c, index, arr) => {
      // @ts-expect-error hack
      arr[index] = Math.floor(c * factor);
    });

    return `rgb(${colors[0]},${colors[1]},${colors[2]})`;
  }
}
