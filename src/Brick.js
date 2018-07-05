export default function Brick(x, y, rgb, brickSize) {
  this.x = x;
  this.y = y;
  this.rgb = rgb;
  this.draw = (context) => {
    context.fillStyle = this.rgb;
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x + brickSize - 1, this.y);
    context.lineTo(this.x, this.y + brickSize - 1);
    context.closePath();
    context.fill();

    context.fillStyle = modifyRgb(this.rgb, 0.9);
    context.beginPath();
    context.moveTo(this.x + brickSize - 1, this.y);
    context.lineTo(this.x, this.y + brickSize - 1);
    context.lineTo(this.x, this.y + brickSize - 1);
    context.lineTo(this.x + brickSize - 1, this.y + brickSize - 1);
    context.closePath();
    context.fill();
  };
}

/**
 * A function to darken or lighten rgb color strings
 * @param {string} color
 * @param {number} factor
 * @returns {string}
 */
function modifyRgb(color, factor) {
  const
    regexp = /rgb\((\d+),(\d+),(\d+)\)/g,
    matches = regexp.exec(color);

  let
    colors = [
      matches[1],
      matches[2],
      matches[3]
    ];

  colors.forEach(function (color, index, colors) {
    colors[index] = Math.floor(color * factor);
  });

  return `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`;
}
