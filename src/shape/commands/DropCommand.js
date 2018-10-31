export default class DropCommand {
  execute(board) {
    // console.log('DropCommand executed')
    board.game.turboMode = true
  }
}
