class Character extends MovableObject {
    x = 200;
    y = 200;
    img;
    width = 150;
    height = 250;
    speed = 10;
    world;

     IMAGES_WALKING = [
        "assets/img/2_character_pepe/2_walk/W-21.png",
        "assets/img/2_character_pepe/2_walk/W-22.png",
        "assets/img/2_character_pepe/2_walk/W-23.png",
        "assets/img/2_character_pepe/2_walk/W-24.png",
        "assets/img/2_character_pepe/2_walk/W-25.png",
        "assets/img/2_character_pepe/2_walk/W-26.png"
    ]

    constructor() {
        super().loadImage("assets/img/2_character_pepe/1_idle/idle/I-1.png");
        this.loadImages(this.IMAGES_WALKING);
        this.animate();
    }

    animate() {
        setInterval(() => {
            if (this.world.keyboard.RIGHT) {
                this.playAnimation(this.IMAGES_WALKING);
                this.moveRight();
            }        
        }, 50);
    }

}