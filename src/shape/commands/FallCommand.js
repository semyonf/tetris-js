export default class FallCommand {
  execute(board) {
    console.log('FallCommand executed')

    this.bricks.forEach(function (brick) {
      brick.y += brickSize;
    });
  }
}
