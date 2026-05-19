class Character extends MovableObject {
    x = 150;
    y = 170;
    width = 100;
    height = 260;
    speed = 7.5;
    world;

     IMAGES_WALKING = [
        "assets/img/2_character_pepe/2_walk/W-21.png",
        "assets/img/2_character_pepe/2_walk/W-22.png",
        "assets/img/2_character_pepe/2_walk/W-23.png",
        "assets/img/2_character_pepe/2_walk/W-24.png",
        "assets/img/2_character_pepe/2_walk/W-25.png",
        "assets/img/2_character_pepe/2_walk/W-26.png"
    ]

    IMAGES_JUMPING = [
        "assets/img/2_character_pepe/3_jump/J-31.png",
        "assets/img/2_character_pepe/3_jump/J-32.png",
        "assets/img/2_character_pepe/3_jump/J-33.png",
        "assets/img/2_character_pepe/3_jump/J-34.png",
        "assets/img/2_character_pepe/3_jump/J-35.png",
        "assets/img/2_character_pepe/3_jump/J-36.png",
        "assets/img/2_character_pepe/3_jump/J-37.png",
        "assets/img/2_character_pepe/3_jump/J-38.png",
        "assets/img/2_character_pepe/3_jump/J-39.png",
    ]

    constructor() {
        super().loadImage("assets/img/2_character_pepe/1_idle/idle/I-1.png");
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING)
        this.animate();
        this.applyGravity();
    }

    animate() {
        this.otherDirection = false;

         setInterval(() => {
            if (this.world.keyboard.RIGHT) {
                this.moveRight();
                this.otherDirection = false;
            }
            if (this.world.keyboard.LEFT) {
                this.moveLeft();
                this.otherDirection = true;
            }
            if ((this.world.keyboard.UP || this.world.keyboard.SPACE) && !this.isAboveGround()) {
                this.jump();
                this.firstStandingTime = null;
            }
        }, 1000 / 60);

        setInterval(() => {
            if ((this.world.keyboard.RIGHT || this.world.keyboard.LEFT) && !this.isAboveGround()) {
                this.playAnimation(this.IMAGES_WALKING);
            } else if (this.isAboveGround())
                this.playAnimation(this.IMAGES_JUMPING);
        }, 75);
    }

}