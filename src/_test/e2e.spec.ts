import Game from '../game';

import { savedGame } from './savedGameData';
import VirtualRenderer from '../rendering/virtual-renderer';

describe('Logic', () => {
  it('is ok', (done) => {
    const spy = {
      injection: savedGame,
      drawBoard: (): (() => void) => {
        return undefined;
      },
      drawReplay: (): (() => void) => {
        return undefined;
      },
      drawBrick: (): (() => void) => {
        return undefined;
      },
      drawScore: (score: number) => {
        if (score === 7) {
          done();
        }
      },
    };

    const renderer = new VirtualRenderer(spy);

    new Game({}, renderer);
  }, 10000);
});
