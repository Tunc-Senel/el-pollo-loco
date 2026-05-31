class Character extends MovableObject {
    characterHurt = false;
    firstStandingTime = null;
    hasStompedEnemyInThisJump = false;
    hasStompedEndbossInThisJump = false;
    inputDisabled = false;
    lockCameraOnBoss = false;
    x = 150;
    y = 275;
    width = 100;
    height = 150;
    speed = 7.5;
    world;
    offset = {
        top: 40,
        bottom: 20,
        left: 20,
        right: 30
    }

    IMAGES_STANDING = [
        "assets/img/2_character_pepe/1_idle/idle/I-1.png",
        "assets/img/2_character_pepe/1_idle/idle/I-2.png",
        "assets/img/2_character_pepe/1_idle/idle/I-3.png",
        "assets/img/2_character_pepe/1_idle/idle/I-4.png",
        "assets/img/2_character_pepe/1_idle/idle/I-5.png",
        "assets/img/2_character_pepe/1_idle/idle/I-6.png",
        "assets/img/2_character_pepe/1_idle/idle/I-7.png",
        "assets/img/2_character_pepe/1_idle/idle/I-8.png",
        "assets/img/2_character_pepe/1_idle/idle/I-9.png",
        "assets/img/2_character_pepe/1_idle/idle/I-10.png"
    ]

    IMAGES_LONG_STANDING = [
        "assets/img/2_character_pepe/1_idle/long_idle/I-11.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-12.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-13.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-14.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-15.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-16.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-17.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-18.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-19.png",
        "assets/img/2_character_pepe/1_idle/long_idle/I-20.png",
    ]

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

    IMAGES_HURT = [
        "assets/img/2_character_pepe/4_hurt/H-41.png",
        "assets/img/2_character_pepe/4_hurt/H-42.png",
        "assets/img/2_character_pepe/4_hurt/H-43.png"
    ]

    IMAGES_DEAD = [
        "assets/img/2_character_pepe/5_dead/D-51.png",
        "assets/img/2_character_pepe/5_dead/D-52.png",
        "assets/img/2_character_pepe/5_dead/D-53.png",
        "assets/img/2_character_pepe/5_dead/D-54.png",
        "assets/img/2_character_pepe/5_dead/D-55.png",
        "assets/img/2_character_pepe/5_dead/D-56.png",
        "assets/img/2_character_pepe/5_dead/D-57.png"
    ]

    constructor() {
        super().loadImage("assets/img/2_character_pepe/1_idle/idle/I-1.png");
        this.loadImages(this.IMAGES_STANDING);
        this.loadImages(this.IMAGES_LONG_STANDING);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.animate();
        this.applyGravity();
    }

    animate() {
        this.otherDirection = false;

        setInterval(() => {
                if (this.inputDisabled) {
                    return;
                }
                if (this.firstStandingTime === null) {
                    this.firstStandingTime = Date.now();
                }
                if (Date.now() - this.firstStandingTime < 8000) {
                    this.playAnimation(this.IMAGES_STANDING)
                    this.world.audioManager.stopSound("snoringSound");
                } else if (Date.now() - this.firstStandingTime >= 8000) {
                    this.playAnimation(this.IMAGES_LONG_STANDING)
                    this.world.audioManager.playLoopSound("snoringSound"); 
                }
         }, 500);

         setInterval(() => {
            if (this.inputDisabled) {
                return;
            }
            if (this.world.keyboard.RIGHT && !this.characterHurt) {
                this.otherDirection = false;
                if (this.x < this.world.level.levelEndX) {
                    this.moveRight();
                    this.world.audioManager.playLoopSound("characterWalkingSound");
                }
                this.firstStandingTime = null;
            }
            if (this.world.keyboard.LEFT && !this.characterHurt) {
                this.otherDirection = true;
                if (this.x > this.world.level.levelStartX) {
                    this.moveLeft();
                    this.world.audioManager.playLoopSound("characterWalkingSound"); 
                }
                this.firstStandingTime = null;
            }
            if ((!this.world.keyboard.RIGHT && !this.world.keyboard.LEFT) || this.characterHurt || this.isAboveGround()) {
                this.world.audioManager.stopSound("characterWalkingSound");
            }
            if ((this.world.keyboard.UP || this.world.keyboard.SPACE) && !this.isAboveGround() && !this.characterHurt) {
                this.jump();
                this.firstStandingTime = null;
                this.world.audioManager.playSound("jumpSound");
            }
            if (!this.lockCameraOnBoss) {
                this.world.camera_x = -this.x + 100;
            }
            
        }, 1000 / 60);

        setInterval(() => {
            if (this.inputDisabled) {
                return;
            }
            else if ((this.world.keyboard.RIGHT || this.world.keyboard.LEFT) && !this.isAboveGround() && !this.characterHurt) {
                this.playAnimation(this.IMAGES_WALKING);
            } else if (this.isAboveGround() && !this.characterHurt) {
                this.playAnimation(this.IMAGES_JUMPING);
            } else if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
            } else if (this.isDead()) {
                this.playAnimation(this.IMAGES_DEAD);
            }
        }, 75);
    }

}