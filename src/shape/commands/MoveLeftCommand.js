export default class MoveLeftCommand {
  execute(board) {
    // console.log('MoveLeftCommand executed')

    board.checkCollisions(collisions => {
      if (!collisions.left) {
        for (let i = 0; i < 4; ++i) {
          this.bricks[i].x -= brickSize;
        }
      }
    })
  }
}
