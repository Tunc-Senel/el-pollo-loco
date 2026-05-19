class World {
    level = level1;
    character = new Character();
    canvas;
    ctx;

    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.character.drawObject(this.ctx);
        this.level.enemies[0].drawObject(this.ctx);
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }
}