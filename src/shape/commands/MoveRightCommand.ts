import Board from '../../Board';
import IShapeCommand from '../IShapeCommand';
import Shape from '../Shape';

export default class MoveRightCommand implements IShapeCommand {
  public execute(this: Shape, board: Board) {
    board.checkCollisions((collisions: any) => {
      if (!collisions.right) {
        for (let i = 0; i < 4; ++i) {
          this.bricks[i].x += board.brickSize;
        }
      }
    });
  }
}
