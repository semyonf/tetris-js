export default class ScoreManager {
  private score: number = 0;
  private level: number = 1;
  private thresholds: number[] = [149, 49, 39, 9, 0];

  public getScore() {
    return this.score;
  }

  public getLevel() {
    return this.level;
  }

  public setScore(newScore: number) {
    this.score = newScore;
    this.thresholds.some((threshold: number, index: number) => {
      if (newScore >= threshold) {
        this.level = this.thresholds.length - index;

        return true;
      }

      return false;
    });
  }

  public add(extraScore: number) {
    this.setScore(this.score + extraScore);

    return this.score;
  }
}
