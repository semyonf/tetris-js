import Shape from "../Shape";

export default class MoveRightCommand {
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
