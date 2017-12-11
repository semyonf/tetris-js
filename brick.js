function Brick(x, y) {
    this.x = x;
    this.y = y;
    this.color = 10;
    this.isStuck = false;
    this.fall = function() {
        if (frameCount % 10 === 0) {
            this.y += 20;
        }

        return this;
    };

    this.show = function() {
        noStroke();
        fill(this.color);
        rect(this.x, this.y, 20, 20);
    };

    return this;
}