class ThrowableObject extends MovableObject {
    accelaration = 0.5;
    objectHit = false;
    remove = false;
    splashAnimationIndex = 0;
    isFlying = false;
    throwDirection = false;

    IMAGES_ROTATION = [
        "assets/img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png"
    ]

    IMAGES_SPLASH = [
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png"
    ]

    constructor(x, y, otherDirection) {
        super().loadImage("assets/img/6_salsa_bottle/salsa_bottle.png");
        this.loadImages(this.IMAGES_ROTATION);
        this.loadImages(this.IMAGES_SPLASH);
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 60;
        this.throwDirection = otherDirection;
        this.throw();
    }

    throw() {
        this.speedY = 10;
        this.isFlying = true;
        this.applyGravity();
        this.startThrowMovement();
        this.startBottleAnimation();
    }

    startBottleAnimation() {
        this.intervalIds.push(
            setInterval(() => {
                if (this.objectHit) {
                    this.playSplashAnimation();
                } else {
                    this.playAnimation(this.IMAGES_ROTATION);
                }
            }, 75)
        );
    }

    startThrowMovement() {
        this.intervalIds.push(
            setInterval(() => {
                if (this.throwDirection == "right") {
                    this.x += 8.5;
                } else if (this.throwDirection == "left") {
                    this.x -= 8.5;
                }
            }, 25)
        );
    }

    playSplashAnimation() {
        let path = this.IMAGES_SPLASH[this.splashAnimationIndex];
        this.img = this.imageCache[path];

        this.splashAnimationIndex++;

        if (this.splashAnimationIndex >= this.IMAGES_SPLASH.length) {
            this.remove = true;
        }
    }

    startIntervalls() {
        this.applyGravity();

        if (this.isFlying && !this.objectHit) {
            this.startThrowMovement();
        }

        this.startBottleAnimation();
    }

}