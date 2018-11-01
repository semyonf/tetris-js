import Shape from "../Shape";
import IShapeCommand from "../IShapeCommand";

export default class MoveLeftCommand implements IShapeCommand {
  execute(this: Shape, board) {
    board.checkCollisions(collisions => {
      if (!collisions.left) {
        for (let i = 0; i < 4; ++i) {
          this.bricks[i].x -= board.brickSize;
        }
      }
    })
  }
}
