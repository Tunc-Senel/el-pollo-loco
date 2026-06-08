/**
 * Standard chicken enemy. Walks left across the level until killed by a stomp or a
 * thrown bottle, then shows its dead frame. Built on MovableObject. Each chicken gets
 * a random start position and speed so the group spreads out and moves at varied paces.
 */
class Chicken extends MovableObject {
    y = 365;
    width = 55;
    height = 55;
    offset = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }

    isDeadByBottle = false;
    isDeadByStomp = false;
    intervalIds = [];

    /**
     * Guards animate() so loops are not started again while the chicken is paused.
     */
    intervalStopped = false;

    /**
     * Walk cycle, looped while the chicken is alive.
     */
    IMAGES_WALKING = [
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png"
    ]

    /**
     * Single dead frame, shown once the chicken is killed.
     */
    DEAD_IMAGE = [
        "assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png"
    ]

    /**
     * Preloads sprites, randomizes start position and speed, and starts the loops.
     */
    constructor() {
        super().loadImage("assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.DEAD_IMAGE);
        this.x = 800 + (Math.random() * 2500);
        this.speed = 0.15 + Math.random() * 0.25;
        this.animate();
    }

    /**
     * Starts the movement loop (60fps) and the animation loop (200ms), unless paused.
     */
    animate() {
        if (!this.intervalStopped) {
            this.intervalIds.push(setInterval(() => this.moveLeft(), 1000 / 60));
            this.intervalIds.push(setInterval(() => this.updateWalkAnimation(), 200));
        }
    }

    /**
     * Shows the dead frame when killed, otherwise the walk cycle.
     */
    updateWalkAnimation() {
        if (this.isDeadByStomp || this.isDeadByBottle) {
            this.playAnimation(this.DEAD_IMAGE);
        } else {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    /**
     * Resumes the chicken's loops after a pause.
     */
    startIntervalls() {
        this.animate();
    }

    /**
     * Stops and clears the chicken's loops.
     */
    stopIntervalls() {
        this.intervalIds.forEach((intervallId) => clearInterval(intervallId));
        this.intervalIds = [];
    }
   
}