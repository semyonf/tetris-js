import Brick from './brick';
import Tetris from './tetris';
import Shape, { ShapeFactory } from './shape/shape';
import { boardCols, boardRows } from './constants';
import { ParkMiller } from './park-miller';

export default class Board {
  public frozenBricks: Brick[] = [];
  public activeShape: Shape;
  public readonly colors = {
    normal: 'rgb(69,90,100)',
    turbo: 'rgba(69,90,100,0.12)',
  };

  constructor(
    public readonly game: Tetris,

    random: ParkMiller,
    private shapeFactory = new ShapeFactory(random),
  ) {
    this.activeShape = this.spawnShape();
  }

  public spawnShape() {
    return this.shapeFactory.createShape();
  }

  public isFull() {
    return this.frozenBricks.some((brick) => brick.y < 2);
  }

  public checkForFilledRegions() {
    const rows = this.extractRows();
    let newBricks: Brick[] = [];
    let rowsCleared = 0;

    for (const row of rows) {
      if (row.isFull) {
        row.bricks = [];
        ++rowsCleared;
        this.game.scoreManager.add(rowsCleared);
      } else {
        for (const brick of row.bricks) {
          brick.y += rowsCleared;
        }
      }

      newBricks = newBricks.concat(row.bricks);
    }

    this.frozenBricks = newBricks;
  }

  private extractRows() {
    const rows = [];
    let bricks;
    let bricksChecked = 0;

    for (
      let i = boardRows - 1;
      bricksChecked !== this.frozenBricks.length;
      i -= 1
    ) {
      bricks = this.frozenBricks.filter((brick) => brick.y === i);
      rows.push({ bricks, isFull: bricks.length === boardCols });
      bricksChecked += bricks.length;
    }
    return rows;
  }
}
