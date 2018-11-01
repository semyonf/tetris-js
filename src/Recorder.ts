export default function Recorder(joystick, game) {
  const tape = []
  let lastFrame = Infinity

  const start = () => {
    joystick.setCallback('anyKey', (key) => {
      tape.push({ key, frame: game.frameCount })
    })

    joystick.setCallback('Escape', () => {
      joystick.stop()
      lastFrame = game.frameCount
      stop()
      tape.pop()
      play()
      game.restart()
      game.setRandomSeed(+(new Date()))
    })
  }

  const stop = () => {
    joystick.setCallback('anyKey', undefined)
    joystick.setCallback('Escape', undefined)
  }

  const play = () => {
    game.onProceed = () => {
      if (game.frameCount !== lastFrame) {
        game.drawReplay()

        if (tape.length && game.frameCount === tape[0].frame) {
          joystick.keyQueue.push(tape.shift().key)
        }
      } else {
        game.onProceed = undefined
        joystick.start()
        start()
        game.restart()
      }
    }
  }

  /**
   * Public
   */
  return {
    tape,
    lastFrame,
    start,
    stop,
    play,
  }
}
