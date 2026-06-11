/**
 * The playable character (Pepe). Handles keyboard-driven movement and jumping,
 * the idle/long-idle (sleep) timing, and selects the matching animation for each
 * state (walk, jump, hurt, dead). Built on MovableObject for gravity and hit handling.
 */
class Character extends MovableObject {
    characterHurt = false;

    /**
     * Timestamp when standing still began; null while moving. Drives the idle/sleep switch.
     */
    firstStandingTime = null;

    /**
     * Stored idle duration across a pause, so the sleep timer resumes correctly.
     */
    standingTimeBeforePause = null;
    hasStompedEnemyInThisJump = false;
    hasStompedEndbossInThisJump = false;

    /**
     * When true, the character no longer drives the camera (the boss fight does).
     */
    lockCameraOnBoss = false;
    energy = 100;
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

    /**
     * Short idle loop, shown while standing for under 8 seconds.
     */
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

    /**
     * Sleep loop, shown after standing still for 8 seconds or more.
     */
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

    /**
     * Walk cycle, played while moving on the ground.
     */
    IMAGES_WALKING = [
        "assets/img/2_character_pepe/2_walk/W-21.png",
        "assets/img/2_character_pepe/2_walk/W-22.png",
        "assets/img/2_character_pepe/2_walk/W-23.png",
        "assets/img/2_character_pepe/2_walk/W-24.png",
        "assets/img/2_character_pepe/2_walk/W-25.png",
        "assets/img/2_character_pepe/2_walk/W-26.png"
    ]

    /**
     * Take-off frames, shown in the first moments after leaving the ground.
     */
    IMAGES_JUMPING_START = [
        "assets/img/2_character_pepe/3_jump/J-31.png",
        "assets/img/2_character_pepe/3_jump/J-32.png",
        "assets/img/2_character_pepe/3_jump/J-33.png"
    ]

    /**
     * Rising frames, shown while the character still moves upward (speedY > 0).
     */
    IMAGES_JUMPING_UP = [
        "assets/img/2_character_pepe/3_jump/J-34.png",
        "assets/img/2_character_pepe/3_jump/J-35.png"
    ]

    /**
     * Falling frames, shown while the character descends (speedY < 0).
     */
    IMAGES_JUMPING_DOWN = [
        "assets/img/2_character_pepe/3_jump/J-36.png",
        "assets/img/2_character_pepe/3_jump/J-37.png"
    ]

    /**
     * Landing frames, shown just before touching the ground again.
     */
    IMAGES_JUMPING_LANDING = [
        "assets/img/2_character_pepe/3_jump/J-38.png",
        "assets/img/2_character_pepe/3_jump/J-39.png"
    ]

    /**
     * Hurt frames, played briefly after taking damage.
     */
    IMAGES_HURT = [
        "assets/img/2_character_pepe/4_hurt/H-41.png",
        "assets/img/2_character_pepe/4_hurt/H-42.png",
        "assets/img/2_character_pepe/4_hurt/H-43.png"
    ]

    /**
     * Death frames, played once when energy reaches zero.
     */
    IMAGES_DEAD = [
        "assets/img/2_character_pepe/5_dead/D-51.png",
        "assets/img/2_character_pepe/5_dead/D-52.png",
        "assets/img/2_character_pepe/5_dead/D-53.png",
        "assets/img/2_character_pepe/5_dead/D-54.png",
        "assets/img/2_character_pepe/5_dead/D-55.png",
        "assets/img/2_character_pepe/5_dead/D-56.png"
    ]

    /**
     * Preloads all animation sets and starts the animation loops and gravity.
     */
    constructor() {
        super().loadImage("assets/img/2_character_pepe/1_idle/idle/I-1.png");
        this.loadImages(this.IMAGES_STANDING);
        this.loadImages(this.IMAGES_LONG_STANDING);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING_START);
        this.loadImages(this.IMAGES_JUMPING_UP);
        this.loadImages(this.IMAGES_JUMPING_DOWN);
        this.loadImages(this.IMAGES_JUMPING_LANDING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.animate();
        this.applyGravity();
    }

    /**
     * Registers the three game loops: idle/sleep timing (500ms), movement input
     * (60fps) and animation selection (75ms). Kept thin; each tick has its own method.
     */
    animate() {
        this.intervalIds.push(setInterval(() => this.updateIdleAnimation(), 180));
        this.intervalIds.push(setInterval(() => this.handleMovementInput(), 1000 / 60));
        this.intervalIds.push(setInterval(() => this.updateActionAnimation(), 75));
    }

    /**
     * Switches between the idle and the sleep loop based on how long the character stood still.
     */
    updateIdleAnimation() {
        if (this.inputDisabled || this.isDead() || this.isMovingOrAirborne()) {
            return;
        }
        if (this.firstStandingTime === null) {
            this.firstStandingTime = Date.now();
        }
        if (Date.now() - this.firstStandingTime < 8000) {
            this.playAnimation(this.IMAGES_STANDING);
            this.world.audioManager.stopSound("snoringSound");
        } else {
            this.playAnimation(this.IMAGES_LONG_STANDING);
            this.world.audioManager.playLoopSound("snoringSound");
        }
    }

    /**
     * True while a move key is held or the character is airborne; used to suppress the
     * idle animation so it never interrupts the walk or jump cycle.
     */
    isMovingOrAirborne() {
        const moving = this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
        return moving || this.isAboveGround() || this.characterHurt;
    }

    /**
     * Per frame: processes horizontal and jump input and keeps the camera following.
     */
    handleMovementInput() {
        if (this.inputDisabled) {
            return;
        }
        this.handleHorizontalInput();
        this.handleJumpInput();
        if (!this.lockCameraOnBoss) {
            this.world.updateCamera();
        }
    }

    /**
     * Moves left/right while the key is held, or stops the walking sound when idle/hurt/airborne.
     */
    handleHorizontalInput() {
        if (this.world.keyboard.RIGHT && !this.characterHurt) {
            this.moveCharacter("right");
        }
        if (this.world.keyboard.LEFT && !this.characterHurt) {
            this.moveCharacter("left");
        }
        if ((!this.world.keyboard.RIGHT && !this.world.keyboard.LEFT) || this.characterHurt || this.isAboveGround()) {
            this.world.audioManager.stopSound("characterWalkingSound");
        }
    }

    /**
     * Moves the character one step in the given direction, unless blocked by a level edge.
     * @param {string} direction Direction to move ("left" or "right").
     */
    moveCharacter(direction) {
        const atRightEdge = this.x >= this.world.level.levelEndX;
        const atLeftEdge = this.x <= this.world.level.levelStartX;
        this.otherDirection = direction === "left";
        if (direction === "right" && !atRightEdge) {
            this.moveRight();
            this.world.audioManager.playLoopSound("characterWalkingSound");
        } else if (direction === "left" && !atLeftEdge) {
            this.moveLeft();
            this.world.audioManager.playLoopSound("characterWalkingSound");
        }
        this.firstStandingTime = null;
    }

    /**
     * Triggers a jump when up/space is pressed while grounded and not hurt.
     */
    handleJumpInput() {
        if ((this.world.keyboard.UP || this.world.keyboard.SPACE) && !this.isAboveGround() && !this.characterHurt) {
            this.jump();
            this.firstStandingTime = null;
            this.world.audioManager.playSound("jumpSound");
        }
    }

    /**
     * Picks the sprite for the current state, in priority order: dead, frozen, walk, jump, hurt.
     */
    updateActionAnimation() {
        if (this.isDead()) {
            this.playDeathAnimation();
        } else if (this.inputDisabled) {
            this.playAnimationOnce(this.IMAGES_STANDING);
        } else if ((this.world.keyboard.RIGHT || this.world.keyboard.LEFT) && !this.isAboveGround() && !this.characterHurt) {
            this.playAnimation(this.IMAGES_WALKING);
        } else if (this.isAboveGround() && !this.characterHurt) {
            this.playJumpAnimation();
        } else if (this.isHurt()) {
            this.playAnimation(this.IMAGES_HURT);
        }
    }

    /**
     * Selects the jump frame set from the actual flight phase (take-off, rising, falling,
     * landing) using speedY and height, so the animation follows the real arc and never
     * loops the whole jump sequence mid-air.
     */
    playJumpAnimation() {
        if (this.speedY > 19) {
            this.playAnimationHold(this.IMAGES_JUMPING_START);
        } else if (this.speedY > 0) {
            this.playAnimationHold(this.IMAGES_JUMPING_UP);
        } else if (this.y > 240) {
            this.playAnimationHold(this.IMAGES_JUMPING_LANDING);
        } else {
            this.playAnimationHold(this.IMAGES_JUMPING_DOWN);
        }
    }

    /**
     * Plays the death animation once, initializing the one-shot index on first call.
     */
    playDeathAnimation() {
        if (!this.onceAnimationStarted) {
            this.onceAnimationIndex = 0;
            this.onceAnimationStarted = true;
        }
        this.playAnimationOnce(this.IMAGES_DEAD);
    }
}