import Board from '../../board';
import ShapeCommand from '../shape-command';
import Shape from '../shape';
import { boardCols, boardRows } from '../../constants';

export default class FallCommand implements ShapeCommand {
  public execute(this: Shape, board: Board): void {
    const potentialShape = this.copy();

    for (const brick of potentialShape.bricks) {
      brick.y++;
    }

    if (
      potentialShape.collidesWithSomething(
        board.frozenBricks,
        boardCols,
        boardRows,
      )
    ) {
      this.isFrozen = true;
      // TODO: demeter's law
      board.game.handleFrozen();
    } else {
      board.activeShape = potentialShape;
    }
  }
}
