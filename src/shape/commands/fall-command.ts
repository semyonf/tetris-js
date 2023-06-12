import Board from '../../board';
import ShapeCommand from '../shape-command';
import Shape from '../shape';

export default class FallCommand implements ShapeCommand {
  public execute(this: Shape, board: Board): void {
    this.bricks.forEach((brick) => {
      brick.y += board.brickSize;
    });
  }
}
