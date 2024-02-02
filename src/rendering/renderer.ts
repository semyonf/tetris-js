import Board from '../board';
import Brick from '../brick';
import Tetris from '../tetris';

export default abstract class Renderer {
  abstract drawBoard(board: Board): void;
  abstract drawBrick(brick: Brick): void;
  abstract drawReplay(): void;
  abstract drawScore(score: number): void;
  abstract readonly frameClock: (cb: () => void) => void;
  setup(_game: Tetris) {}
}
