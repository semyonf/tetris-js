import Board, { Collisions } from '../../board';
import ShapeCommand from '../shape-command';
import Shape from '../shape';

export default class MoveRightCommand implements ShapeCommand {
  public execute(this: Shape, board: Board) {
    board.checkCollisions((collisions: Collisions) => {
      if (!collisions.right) {
        for (let i = 0; i < 4; ++i) {
          this.bricks[i].x += board.brickSize;
        }
      }
    });
  }
}
