import Board from '../../board';
import ShapeCommand from '../shape-command';
import Shape from '../shape';

export default class RotateCommand implements ShapeCommand {
  public execute(this: Shape, board: Board) {
    const potentialShape = new Shape(this);

    if (this.radialSymmetry) {
      return;
    }

    potentialShape.rotate();

    const collisions = potentialShape.checkCollisions(
      board.frozenBricks,
      board.width,
      board.height,
    );

    if (Object.values(collisions).some((v) => v)) {
      return;
    }

    board.activeShape = potentialShape;
  }
}
