/**
 * https://www.npmjs.com/package/park-miller
 * with an updated MINSTD value as suggested by Park, Miller and Stockmeyer
 */
const MINSTD = 48271;
const MAX_INT32 = 2147483647;

export class ParkMiller {
  private seed: number;

  constructor(_seed: number) {
    this.seed = Math.round(_seed) % MAX_INT32;

    if (this.seed <= 0) {
      this.seed += MAX_INT32 - 1;
    }
  }

  integer() {
    this.seed *= MINSTD;
    this.seed %= MAX_INT32;

    return this.seed;
  }

  nextInt(min: number, max: number) {
    return Math.round(this.nextFloat(min, max));
  }

  float() {
    return (this.integer() - 1) / (MAX_INT32 - 1);
  }

  nextFloat(min: number, max: number) {
    return min + (max - min) * this.float();
  }
}
