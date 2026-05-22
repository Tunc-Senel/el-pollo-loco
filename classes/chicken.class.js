class Chicken extends MovableObject {
    y = 355;
    width = 75;
    height = 65;
    offset = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }
    isDeadByBottle = false;
    isDeadByStomp = false;

    IMAGES_WALKING = [
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png"
    ]

    DEAD_IMAGE = [
         "assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png"
    ]

    constructor() {
        super().loadImage("assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.DEAD_IMAGE);
        this.x = 800 + (Math.random() * 2500);
        this.speed = 0.15 + Math.random() * 0.25;
        this.animate();
    }

    animate() {
        setInterval( () => {
            this.moveLeft();
        }, 1000 / 60);
        
        setInterval(() => {
            if (this.isDeadByStomp || this.isDeadByBottle) {
                this.playAnimation(this.DEAD_IMAGE)
            }
            else {
                this.playAnimation(this.IMAGES_WALKING);
            }   
        }, 200);
    }
   
}