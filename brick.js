function Brick(x, y, rgb) {
    this.x = x;
    this.y = y;
    this.rgb = rgb;
    this.show = function() {
        c.fillStyle = this.rgb;
        c.fillRect(this.x, this.y, brickSize, brickSize);
    };

    return this;
}