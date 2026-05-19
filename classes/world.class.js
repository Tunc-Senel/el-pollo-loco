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
        this.addObjectsToMap(this.level.backgroundObjects);
        this.character.drawObject(this.ctx);
        this.addObjectsToMap(this.level.enemies);
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    addObjectsToMap(objects) {
        objects.forEach(object =>{
            this.addObjectToMap(object);
        }) 
    }

    addObjectToMap(object) {
        object.drawObject(this.ctx);
    }
    
}