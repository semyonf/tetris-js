import Board, { Collisions } from '../../board';
import ShapeCommand from '../shape-command';
import Shape from '../shape';

export default class MoveLeftCommand implements ShapeCommand {
  public execute(this: Shape, board: Board) {
    board.checkCollisions((collisions: Collisions) => {
      if (!collisions.left) {
        for (let i = 0; i < 4; ++i) {
          this.bricks[i].x -= board.brickSize;
        }
      }
    });
  }
}
