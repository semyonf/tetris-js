import DropCommand from './shape/commands/DropCommand'
import MoveLeftCommand from './shape/commands/MoveLeftCommand'
import MoveRightCommand from './shape/commands/MoveRightCommand'
import RotateCommand from './shape/commands/RotateCommand'

export default class KeyMap {
  private keymap: object = {}

  constructor(left: string, right: string, rotate: string, drop: string) {
    this.keymap[left] = new MoveLeftCommand()
    this.keymap[right] = new MoveRightCommand()
    this.keymap[rotate] = new RotateCommand()
    this.keymap[drop] = new DropCommand()
  }
}
