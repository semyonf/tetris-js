import Board from '../../board';
import ShapeCommand from '../shape-command';
import Shape from '../shape';
import { boardCols, boardRows } from '../../constants';

export default class MoveRightCommand implements ShapeCommand {
  public execute(this: Shape, board: Board) {
    const potentialShape = this.copy();

    for (const brick of potentialShape.bricks) {
      brick.x++;
    }

    if (
      potentialShape.collidesWithSomething(
        board.frozenBricks,
        boardCols,
        boardRows,
      )
    ) {
      return;
    }

    board.activeShape = potentialShape;
  }
}
