import Board from '../../board';
import ShapeCommand from '../shape-command';
import Shape from '../shape';

export default class FallCommand implements ShapeCommand {
  public execute(this: Shape, board: Board): void {
    const potentialShape = this.copy();

    for (const brick of potentialShape.bricks) {
      brick.y += board.brickSize;
    }

    if (
      potentialShape.collidesWithSomething(
        board.frozenBricks,
        board.width,
        board.height,
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
