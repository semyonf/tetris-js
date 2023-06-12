import Board from '../../board';
import ShapeCommand from '../shape-command';
import Shape from '../shape';

export default class RotateCommand implements ShapeCommand {
  public execute(this: Shape, board: Board) {
    const temp = new Shape(this);

    if (Shape.parameters.types[temp.type].name !== 'O') {
      temp.orientation = temp.orientation === 3 ? 0 : ++temp.orientation;
      temp.applyOrientation();

      for (const brick of temp.bricks) {
        for (const staticBrick of board.staticBricks) {
          if (brick.x === staticBrick.x && brick.y === staticBrick.y) {
            return;
          }
        }

        if (brick.x >= board.width || brick.x <= 0 || brick.y >= board.height) {
          return;
        }
      }
    }

    board.activeShape = temp;
  }
}
