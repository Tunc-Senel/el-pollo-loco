/**
 * Small chicken enemy. Behaves like the normal chicken (walks left, dies to stomp or
 * bottle) but is smaller and spawns closer to the start. Its start/stop interval handling
 * differs slightly: it tracks intervalStopped so paused loops are not started twice.
 */
class SmallChicken extends MovableObject {
    y = 370;
    width = 50;
    height = 50;
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
     * Tracks whether the loops are currently stopped, so startIntervalls/animate don't double-start.
     */
    intervalStopped = false;

    /**
     * Walk cycle, looped while the small chicken is alive.
     */
    IMAGES_WALKING = [
        "assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
        "assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
        "assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png"
    ]

    /**
     * Single dead frame, shown once the small chicken is killed.
     */
    IMAGE_DEAD = [
        "assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png"
    ]

    /**
     * Preloads sprites, randomizes start position and speed, and starts the loops.
     */
    constructor() {
        super().loadImage("assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
        this.loadImages(this.IMAGE_DEAD);
        this.loadImages(this.IMAGES_WALKING);
        this.x = 500 + (Math.random() * 1500);
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
            this.playAnimation(this.IMAGE_DEAD);
        } else {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    /**
     * Resumes the loops after a pause; the guard prevents starting them while still running.
     */
    startIntervalls() {
        if (!this.intervalStopped) {
            return;
        }

        this.intervalStopped = false;
        this.animate();
    }

    /**
     * Stops and clears the loops and marks them as stopped.
     */
    stopIntervalls() {
        this.intervalIds.forEach((intervallId) => clearInterval(intervallId));
        this.intervalIds = [];
        this.intervalStopped = true;
    }
   
}