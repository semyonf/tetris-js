export default function SeededRandom(seed) {
  this._seed = (seed % 2147483647);

  this.nextInt = function () {
    return this._seed = this._seed * 16807 % 2147483647;
  };

  /**
   * Random integer generator
   * @param {number} max - not included
   * @param {number} [min] - included
   * @returns {number}
   */
  this.nextInRange = function (max, min) {
    min = (min === undefined) ? 0 : min;
    --max;

    return Math.floor(min + this.nextFloat() * (max + 1 - min));
  };

  this.nextFloat = function () {
    return (this.nextInt() - 1) / 2147483646;
  };

  if (this._seed <= 0) {
    this._seed += 2147483646;
  }
}