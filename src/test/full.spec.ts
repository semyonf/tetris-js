import Game from '../Game';

import resources from './resources';

describe('Logic', () => {
  it('is ok', (done) => {
    const spy = {
      injection: resources,
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

    const brickSize = 20;
    const boardRows = 22;
    const boardCols = 10;
    const boardWidth = brickSize * boardCols;
    const boardHeight = brickSize * boardRows;

    new Game({
      debug: true,
      spy,
      board: {
        boardWidth,
        boardHeight,
        brickSize,
      },
    });
  }, 10000);
});
