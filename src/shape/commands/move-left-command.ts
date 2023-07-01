import Board from '../../board';
import ShapeCommand from '../shape-command';
import Shape from '../shape';

export default class MoveLeftCommand implements ShapeCommand {
  public execute(this: Shape, board: Board) {
    const potentialShape = this.copy();

    for (const brick of potentialShape.bricks) {
      brick.x -= board.brickSize;
    }

    if (
      potentialShape.collidesWithSomething(
        board.frozenBricks,
        board.width,
        board.height,
      )
    ) {
      return;
    }

    board.activeShape = potentialShape;
  }
}
