class World {
    level = level1;
    character = new Character();
    canvas;
    ctx;
    keyboard;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setworld();
    }

    setworld() {
        this.character.world = this;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectToMap(this.character);
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