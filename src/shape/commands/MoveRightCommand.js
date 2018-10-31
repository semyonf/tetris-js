export default class MoveRightCommand {
  execute(board) {
    console.log('MoveRightCommand executed')

    board.checkCollisions(collisions => {
      if (!collisions.right) {
        for (let i = 0; i < 4; ++i) {
          this.bricks[i].x += brickSize;
        }
      }
    })
  }
}
