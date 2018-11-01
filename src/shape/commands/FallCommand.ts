import Shape from "../Shape";
import IShapeCommand from "../IShapeCommand";

export default class FallCommand implements IShapeCommand {
  execute(this: Shape, board) {
    this.bricks.forEach(function (brick) {
      brick.y += board.brickSize;
    });
  }
}
