class GameObject {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
    }

    move(dx, dy) {
        this.x = this.x + dx;
        this.y = this.y + dy;
    }
}