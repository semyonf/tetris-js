import Shape from "../Shape";
import IShapeCommand from "../IShapeCommand";

export default class MoveRightCommand implements IShapeCommand {
  execute(this: Shape, board) {
    board.checkCollisions(collisions => {
      if (!collisions.right) {
        for (let i = 0; i < 4; ++i) {
          this.bricks[i].x += board.brickSize;
        }
      }
    })
  }
}
