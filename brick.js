function Brick(x, y, rgb) {
    this.x = x;
    this.y = y;
    this.rgb = rgb;
    this.show = function() {
        noStroke();
        fill(this.rgb);
        rect(this.x, this.y, gridSize, gridSize);
    };

    return this;
}