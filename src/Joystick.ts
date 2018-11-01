import KeyMap from './KeyMap'
import IShapeCommand from './shape/IShapeCommand'

export default class Joystick {
  public keysStates: { [key: string]: boolean } = {
    Escape: false,
    Enter: false,
    anyKey: false,
  }
  public keyMaps: { [key: string]: IShapeCommand } = {}
  public keyQueue: any[] = []

  private readonly callbacks: any = {anyKey: undefined}

  constructor(keyMaps: KeyMap[]) {
    for (const keyMap of keyMaps) {
      Object.assign(this.keyMaps, keyMap.get())
    }

    Object.assign(this.keysStates, this.keyMaps)
    Object.keys(this.keysStates).forEach(
      (keyState) => this.keysStates[keyState] = false,
    )
  }

  // todo: find a way around this crutch
  private boundOnKeyPressed = this.onKeyPressed.bind(this)

  public connect() {
    addEventListener('keyup', this.boundOnKeyPressed)
    addEventListener('keydown', this.boundOnKeyPressed)
  }

  public disconnect() {
    removeEventListener('keyup', this.boundOnKeyPressed)
    removeEventListener('keydown', this.boundOnKeyPressed)
  }

  public setCallback(key: string, callback: Function) {
    this.callbacks[key] = callback
  }

  private onKeyPressed(e: KeyboardEvent) {
    const isDown = (e.type === 'keydown')
    const keyCode = e.code
    this.keysStates.anyKey = isDown

    if (isDown && this.callbacks.anyKey !== undefined) {
      this.callbacks.anyKey(keyCode)
    }

    if (this.keysStates[keyCode] !== undefined) {
      e.preventDefault()

      this.keysStates[keyCode] = isDown

      if (isDown) {
        if (keyCode in this.keysStates) {
          this.keyQueue.push(keyCode)
        }

        if (this.callbacks[keyCode] !== undefined) {
          this.callbacks[keyCode]()
        }
      }
    }
  }
}
