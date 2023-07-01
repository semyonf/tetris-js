import Board from '../../board';
import ShapeCommand from '../shape-command';
import Shape from '../shape';
import { boardCols, boardRows } from '../../constants';

export default class RotateCommand implements ShapeCommand {
  public execute(this: Shape, board: Board) {
    const potentialShape = this.copy();

    if (this.radialSymmetry) {
      return;
    }

    potentialShape.rotate();

    const collisions = potentialShape.collidesWithSomething(
      board.frozenBricks,
      boardCols,
      boardRows,
    );

    if (collisions) {
      return;
    }

    board.activeShape = potentialShape;
  }
}
