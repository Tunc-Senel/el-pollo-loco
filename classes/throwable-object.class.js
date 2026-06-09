/**
 * A thrown salsa bottle. Spawned by the character, it flies in the throw direction
 * under gravity while rotating, and switches to a splash animation on impact before
 * marking itself for removal. The reduced acceleration makes it arc rather than drop.
 */
class ThrowableObject extends MovableObject {
    accelaration = 0.5;

    /** 
     * Set on the first hit (ground or enemy); switches the sprite to the splash animation.
     */
    objectHit = false;

    /**
     *  Set once the splash animation has finished, so the world can clean the bottle up.
     */
    remove = false;

    /**
     * Frame index of the one-shot splash animation. 
     */
    splashAnimationIndex = 0;

    /** 
     * true while the bottle is still in flight (used to resume throw movement after a pause).
     */
    isFlying = false;

    /** 
     * "left" or "right"; the direction the bottle travels. 
     */
    throwDirection = false;

    /** 
     * Rotation frames cycled while the bottle is in flight.
     */
    IMAGES_ROTATION = [
        "assets/img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
        "assets/img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png"
    ]

    /** 
     * Splash frames played once on impact, in order; the last frame triggers removal.
     */
    IMAGES_SPLASH = [
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
        "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png"
    ]

    /**
     * Places the bottle at the spawn position, preloads its sprites and immediately
     * starts the throw. otherDirection carries the travel direction ("left"/"right").
     * @param {number} x Horizontal spawn position.
     * @param {number} y Vertical spawn position.
     * @param {string} otherDirection Travel direction ("left" or "right").
     */
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

    /** 
     * Launches the bottle: gives it upward speed and starts gravity, movement and animation.
     */
    throw() {
        this.speedY = 10;
        this.isFlying = true;
        this.applyGravity();
        this.startThrowMovement();
        this.startBottleAnimation();
    }

    /** 
     * Runs the sprite animation: rotation while flying, splash once it has hit something.
     */
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

    /** 
     * Moves the bottle horizontally each tick in its throw direction.
     */
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

    /** 
     * Advances the splash animation once per call and flags the bottle for removal at the end.
     */
    playSplashAnimation() {
        let path = this.IMAGES_SPLASH[this.splashAnimationIndex];
        this.img = this.imageCache[path];

        this.splashAnimationIndex++;

        if (this.splashAnimationIndex >= this.IMAGES_SPLASH.length) {
            this.remove = true;
        }
    }

    /**
     * Restarts the bottle's loops after a pause. Throw movement only resumes if the
     * bottle was still in flight and had not hit anything yet.
     */
    startIntervalls() {
        this.applyGravity();

        if (this.isFlying && !this.objectHit) {
            this.startThrowMovement();
        }

        this.startBottleAnimation();
    }

}