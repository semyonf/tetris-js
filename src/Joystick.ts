import KeyMap from './KeyMap'

export default class Joystick {
  public keys: any
  public keyQueue: any[]
  private readonly callbacks: any

  constructor(public keyMap: KeyMap) {

    this.keys = Object.seal(
      Object.assign({
        Escape: false,
        Enter: false,
        anyKey: false,
      }, keyMap),
    )
    Object.keys(this.keys).forEach((keyState) => this.keys[keyState] = false)
    this.callbacks = {anyKey: undefined}
    this.keyQueue = []
  }

  public start() {
    addEventListener('keyup', this.keyEvents)
    addEventListener('keydown', this.keyEvents)
  }

  public stop() {
    removeEventListener('keyup', this.keyEvents)
    removeEventListener('keydown', this.keyEvents)
  }

  public setCallback(key, callback) {
    this.callbacks[key] = callback
  }

  public keyEvents(e) {
    const isDown = (e.type === 'keydown')
    const keyCode = e.code
    this.keys.anyKey = isDown

    if (isDown && this.callbacks.anyKey !== undefined) {
      this.callbacks.anyKey(keyCode)
    }

    if (this.keys[keyCode] !== undefined) {
      e.preventDefault()
      this.keys[keyCode] = isDown

      if (isDown) {
        if (keyCode in this.keyMap) {
          this.keyQueue.push(keyCode)
        }

        if (this.callbacks[keyCode] !== undefined) {
          this.callbacks[keyCode]()
        }
      }
    }
  }
}
