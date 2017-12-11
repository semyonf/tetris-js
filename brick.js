function Brick(x, y) {
    this.x = x;
    this.y = y;
    this.color = 10;
    this.isStuck = false;
    // TODO: It's the shape that is falling, not the brick
    this.fall = function() {
        if (frameCount % 10 === 0) {
            this.y += gridSize;
        }

        return this;
    };

    this.show = function() {
        noStroke();
        fill(this.color);
        rect(this.x, this.y, gridSize, gridSize);
    };

    return this;
}