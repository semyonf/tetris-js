export default class Brick {
  /**
   * Smallest building block of any Shape
   * @param {number} x
   * @param {number} y
   * @param {string} rgb
   * @param {number} size
   */
  constructor(x, y, rgb, size) {
    this.x = x;
    this.y = y;
    this.rgb = rgb;
    this.size = size;
  }

  draw(context) {
    context.fillStyle = this.rgb;
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x + this.size - 1, this.y);
    context.lineTo(this.x, this.y + this.size - 1);
    context.closePath();
    context.fill();

    context.fillStyle = modifyRgb(this.rgb, 0.9);
    context.beginPath();
    context.moveTo(this.x + this.size - 1, this.y);
    context.lineTo(this.x, this.y + this.size - 1);
    context.lineTo(this.x, this.y + this.size - 1);
    context.lineTo(this.x + this.size - 1, this.y + this.size - 1);
    context.closePath();
    context.fill();
  }
}

/**
 * A function to darken or lighten rgb color strings
 * @param {string} color
 * @param {number} factor
 * @returns {string}
 */
export function modifyRgb(color, factor) {
  const regexp = /rgb\((\d+) ?, ?(\d+) ?, ?(\d+)\)/g;
  const matches = regexp.exec(color);

  let
    colors = [
      matches[1],
      matches[2],
      matches[3]
    ];

  colors.forEach(function (color, index, colors) {
    colors[index] = Math.floor(color * factor);
  });

  return `rgb(${colors[0]},${colors[1]},${colors[2]})`;
}
