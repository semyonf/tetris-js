import Board from '../Board';
import Brick from '../Brick';

export default interface IRenderer {
  drawBoard(board: Board): void;
  drawBrick(brick: Brick): void;
  drawReplay(): void;
  drawScore(score: number): void;
}
