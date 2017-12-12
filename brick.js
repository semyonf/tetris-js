function Brick(x, y) {
    this.x = x;
    this.y = y;
    this.color = 10;
    this.show = function() {
        noStroke();
        fill(this.color);
        rect(this.x, this.y, gridSize, gridSize);
    };

    return this;
}