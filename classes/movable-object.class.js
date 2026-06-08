/**
 * Base class for all moving objects (character, enemies, endboss, thrown bottles).
 * Adds horizontal/vertical movement, gravity, jumping, the hurt/knockback reaction
 * and animation playback on top of DrawableObject. Several methods branch on the
 * concrete subclass (via instanceof) because ground level and which objects fall
 * differ per type.
 */
class MovableObject extends DrawableObject {
    /**
     * Index of the next frame for looping animations (playAnimation). 
     */
    currentImage = 0;

    /** 
     * Index of the next frame for one-shot animations like dying (playAnimationOnce). 
     */
    onceAnimationIndex = 0;
    onceAnimationStarted  = false;
    otherDirection = false; 
    speed = 0;

    /** 
     * Vertical speed; positive means rising, decreased over time by gravity. 
     */
    speedY = 0;
    accelaration = 0.9;

    /** 
     * Timestamp of the last hit, used by isHurt to grant brief invulnerability. 
     */
    lastHit = 0;

    /** 
     * IDs of this object's own loops so they can be stopped on pause/restart. 
     */
    intervalIds = [];
    inputDisabled = false;

    /** 
     * When true, gravity is skipped (e.g. while the character is frozen during the boss intro). 
     */
    freezeGravity = false;

    /** 
     * Advances a looping animation by one frame, wrapping around at the end. 
     */
    playAnimation(images) {
        this.currentImage = this.currentImage % images.length;
        let path = images[this.currentImage];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    /** 
     * Plays an animation once and then holds the last frame (used for death animations). 
     */
    playAnimationOnce(images) {
        if (this.onceAnimationIndex < images.length) {
            let path = images[this.onceAnimationIndex];
            this.img = this.imageCache[path];
            this.onceAnimationIndex++;
        } else {
            let path = images[images.length - 1];
            this.img = this.imageCache[path];
        }
    }

    /** 
     * Moves the object right by its current speed. 
     */
    moveRight() {
        this.x += this.speed;
    }
    
    /** 
     * Moves the object left by its current speed. 
     */
    moveLeft() {
        this.x -= this.speed;
    }

    /** 
     * Starts the per-object gravity loop; each tick is handled by applyGravityStep. 
     */
    applyGravity() {
        this.intervalIds.push(
            setInterval(() => {
                this.applyGravityStep();
            }, 1000 / 60)
        );
    }

    /** 
     * One gravity tick: moves the object vertically while airborne, then clamps to the ground. 
     */
    applyGravityStep() {
        if (this.freezeGravity) {
            return;
        }
        if (this.isAboveGround() || this.speedY > 0) {
            this.y -= this.speedY;
            this.speedY -= this.accelaration;
        }
        this.clampToGround();
    }

    /**
     * Stops the fall at the ground level, which differs per type: the character uses a
     * fixed y, the endboss its own groundY. Other types (e.g. bottles) keep falling.
     */
    clampToGround() {
        if (this.y > 275 && this instanceof Character) {
            this.y = 275;
            this.speedY = 0;
        }
        if (this.y > this.groundY && this instanceof Endboss) {
            this.y = this.groundY;
            this.speedY = 0;
        }
    }

    /**
     * Whether the object is currently off the ground. Thrown bottles always fall,
     * the endboss compares against its own groundY, everything else against the fixed floor.
     */
    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } 
        if (this instanceof Endboss) {
            return this.y < this.groundY;
        }
        return this.y < 275;
    }

    /** 
     * Normal jump impulse. 
     */
    jump() {
        this.speedY = 22.5;
    }
    
    /** 
     * Smaller bounce after stomping a normal enemy. 
     */
    jumpAfterEnemyStomp() {
        this.speedY = 17.5;
    }

    /** 
     * Even smaller bounce after stomping the endboss. 
     */
    jumpAfterEndbossStomp() {
        this.speedY = 15;
    }

    /**
     * Applies damage unless the object is still in its invulnerability window. On a
     * non-lethal hit it triggers the hurt knockback; lethal damage clamps energy to 0.
     * @param {number} [damage=5] Amount of damage.
     */
    hit(damage = 5) {
        if (this.isHurt()) {
            return;
        }
        this.firstStandingTime = null;
        this.energy -= damage;
        if (this.energy <= 0) {
            this.energy = 0;
        } else {
            this.characterHurt = true;
            this.lastHit = new Date().getTime();
            this.startHurtKnockback();
        }
    }

    /** 
     * Pushes the object back left for a short moment after a hit, stopping at the level start. 
     */
    startHurtKnockback() {
        const intervalId = setInterval(() => {
            if (this.x > this.world.level.levelStartX) {
                this.x -= 4;
            }
        }, 1000 / 60);
        this.intervalIds.push(intervalId);
        setTimeout(() => {
            clearInterval(intervalId);
            this.characterHurt = false;
        }, 500);
    }

    /** 
     * True for one second after the last hit; grants brief invulnerability. 
     */
    isHurt() {
        let timepassed = new Date().getTime() - this.lastHit;
        timepassed = timepassed / 1000;
        return timepassed < 1;
    }

    /** 
     * True once energy has dropped to zero.
     */
    isDead() {
        return this.energy <= 0;
    }

    /**
     * Restarts this object's loops after a pause. Gravity is only re-applied to types
     * that actually fall, and thrown bottles additionally resume their throw movement.
     */
    startIntervalls() {
        this.animate();
        if (this instanceof Character || this instanceof ThrowableObject || this instanceof Endboss) {
            this.applyGravity();
        }
        if (this instanceof ThrowableObject) {
            this.throw();
        }

    }

    /** 
     * Stops and clears all of this object's loops. 
     */
    stopIntervalls() {
        this.intervalIds.forEach((intervallId) => clearInterval(intervallId));
        this.intervalIds = [];
    }
}