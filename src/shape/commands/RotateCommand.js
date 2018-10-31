import Shape from "../Shape";

export default class RotateCommand {
  execute(board) {
    // console.log('RotateCommand executed')

    const temp = new Shape(board.activeShape)

    if (Shape.prototype.parameters.types[temp.type].name !== 'O') {
      temp.orientaion = (temp.orientaion === 3) ? 0 : ++temp.orientaion;
      temp.applyOrientation();

      for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < board.staticBricks.length; ++j) {
          if (
            temp.bricks[i].x === board.staticBricks[j].x &&
            temp.bricks[i].y === board.staticBricks[j].y
          ) {
            return;
          }
        }

        if (
          temp.bricks[i].x >= board.width ||
          temp.bricks[i].x <= 0 ||
          temp.bricks[i].y >= board.height
        ) {
          return;
        }
      }
    }

    board.activeShape = temp
  }
}






