import Game from '../src/Game'

import resources from './resources.json'

describe('Logic', () => {
  it('is ok', done => {
    const spy = {
      injection: resources,
      drawBoard: () => {},
      drawReplay: () => {},
      drawBrick: () => {},
      drawScore: (score: number) => {
        if (score === 7) {
          done()
        }
      }
    }

    const brickSize = 20
    const boardRows = 22
    const boardCols = 10
    const boardWidth = brickSize * boardCols
    const boardHeight = brickSize * boardRows

    const game = new Game({
      debug: true,
      spy,
      board: {
        boardWidth, boardHeight, brickSize
      }
    })
  }, 10000)
})
