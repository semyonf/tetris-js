import Shape from "../Shape";

export default class FallCommand {
  execute(this: Shape, board) {
    this.bricks.forEach(function (brick) {
      brick.y += board.brickSize;
    });
  }
}
