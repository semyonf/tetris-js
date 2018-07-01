export default function Joystick(keyMap) {
  const keyStates = Object.seal(
    Object.assign({
      Escape: false,
      Enter: false,
      anyKey: false
    }, keyMap)
  );

  Object.keys(keyStates).forEach(keyState => keyState = false);

  const callbacks = {}, keyQueue = [];

  function keyEvents(e) {
    const isDown = (e.type === 'keydown'), keyCode = e.code;
    keyStates.anyKey = isDown;

    if (isDown && callbacks.anyKey !== undefined) {
      callbacks.anyKey(keyCode);
    }

    if (keyStates[keyCode] !== undefined) {
      e.preventDefault();
      keyStates[keyCode] = isDown;

      if (isDown) {
        if (keyCode in keyMap) {
          keyQueue.push(keyCode);
        }

        if (callbacks[keyCode] !== undefined) {
          callbacks[keyCode]();
        }
      }
    }
  }

  /**
   * Public interface
   */
  return {
    keys: keyStates,
    keyQueue,
    start() {
      addEventListener('keyup', keyEvents);
      addEventListener('keydown', keyEvents);
    },
    stop() {
      removeEventListener('keyup', keyEvents);
      removeEventListener('keydown', keyEvents);
    },
    setCallback(key, callback) {
      callbacks[key] = callback;
    }
  };
}