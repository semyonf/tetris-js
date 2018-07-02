import SeededRandom from "./SeededRandom";

export default function Recorder(joystick, game) {
  const tape = [];
  let lastFrame = Infinity;

  const start = () => {
    joystick.setCallback('anyKey', (key) => {
      tape.push({ key, frame: game.getFrameCount() });
    });

    joystick.setCallback('Escape', () => {
      joystick.stop();
      lastFrame = game.getFrameCount();
      stop();
      tape.pop();
      play();
      game.setRandom(new SeededRandom(game.getRandomSeed()));
      // random = new SeededRandom(randomSeed);
      game.setRandomSeed(+(new Date()));
      // randomSeed = +(new Date());
      game.restart();
    });
  };

  const stop = () => {
    joystick.setCallback('anyKey', undefined);
    joystick.setCallback('Escape', undefined);
  };

  const play = () => {
    game.onProceed = () => {
      if (game.getFrameCount() !== lastFrame) {
        game.drawReplay();

        if (tape.length && game.getFrameCount() === tape[0].frame) {
          joystick.keyQueue.push(tape.shift().key);
        }
      } else {
        game.onProceed = undefined;
        game.setRandom(new SeededRandom(game.getRandomSeed()));
        // random = new SeededRandom(randomSeed);
        joystick.start();
        start();
        game.restart();
      }
    };
  };

  /**
   * Public
   */
  return {
    tape,
    lastFrame,
    start,
    stop,
    play
  };
}
