class Cloud extends MovableObject {
    y = 50;
    width = 500;
    height = 150;
    speed = 0.25;

    constructor(xPosition) {
        super().loadImage("../assets/img/5_background/layers/4_clouds/1.png")
        this.x = xPosition + (Math.random() * 500);
        this.animate();
    }

    animate() {
        setInterval(() => {
            this.moveLeft();    
        }, 50);
    }

}
