/**
 * The endboss (giant chicken). Its behavior is driven by a state machine (state field)
 * that the EndbossFight/EndbossCombat classes advance; this class only stores that state,
 * runs its movement and animation loops, and applies damage. Built on MovableObject.
 */
class Endboss extends MovableObject {
    width = 200;
    height = 200;
    groundY = 230;
    energy = 100;
    speed = 3;
    state = 'hidden';
    world = null;
    walkTarget = 0;
    centerTarget = 0;
    alertStart = 0;
    currentImage = 0;
    attackOnCooldown = false;
    hasJumpedToAttack = false;
    attackTargetX = 0;
    attackStarted = false;
    attackLanded = false;
    attackPauseStarted = false;
    offset = {
        top: 70,
        bottom: 25,
        left: 30,
        right: 20
    };
    IMAGES_ALERT = [
        'assets/img/4_enemie_boss_chicken/2_alert/G5.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G6.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G7.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G8.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G9.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G10.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G11.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G12.png'
    ];
    IMAGES_WALKING = [
        'assets/img/4_enemie_boss_chicken/1_walk/G1.png',
        'assets/img/4_enemie_boss_chicken/1_walk/G2.png',
        'assets/img/4_enemie_boss_chicken/1_walk/G3.png',
        'assets/img/4_enemie_boss_chicken/1_walk/G4.png'
    ];
    IMAGES_ATTACK = [
        'assets/img/4_enemie_boss_chicken/3_attack/G13.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G14.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G15.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G16.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G17.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G18.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G19.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G20.png'
    ];
    IMAGES_HURT = [
        'assets/img/4_enemie_boss_chicken/4_hurt/G21.png',
        'assets/img/4_enemie_boss_chicken/4_hurt/G22.png',
        'assets/img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];
    IMAGES_DEAD = [
        'assets/img/4_enemie_boss_chicken/5_dead/G24.png',
        'assets/img/4_enemie_boss_chicken/5_dead/G25.png',
        'assets/img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    /**
     * Preloads all animation sets, places the boss on the ground and starts its loops.
     */
    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.y = this.groundY;
        this.applyGravity();
        this.animate();
    }

    /**
     * Registers the movement loop (60fps) and the state-driven animation loop (200ms).
     */
    animate() {
        this.intervalIds.push(setInterval(() => this.updateMovement(), 1000 / 60));
        this.intervalIds.push(setInterval(() => this.updateStateAnimation(), 200));
    }

    /**
     * Moves the boss while walking in, or nudges it towards the center during the intro jump.
     */
    updateMovement() {
        if (this.state === 'walking_in') {
            this.moveLeft();
        } else if (this.state === 'jumping_to_center' && this.isAboveGround()) {
            if (this.x > this.centerTarget) {
                this.x -= 4;
            }
        }
    }

    /**
     * Plays the animation for the current state; death is a one-shot, everything else loops.
     */
    updateStateAnimation() {
        if (this.state === 'dead') {
            this.playDeathAnimation();
            return;
        }
        const images = this.animationForState();
        if (images) {
            this.playAnimation(images);
        }
    }

    /**
     * Maps the current state to its looping animation set, or null if none applies.
     */
    animationForState() {
        const walkStates = ['walking_in', 'jumping_to_center', 'walking_to_fight_position', 'fighting'];
        const alertStates = ['alert', 'pause_after_intro_jump', 'short_pause_after_intro', 'attack_pause'];
        if (walkStates.includes(this.state)) return this.IMAGES_WALKING;
        if (alertStates.includes(this.state)) return this.IMAGES_ALERT;
        if (this.state === 'attacking') return this.IMAGES_ATTACK;
        if (this.state === 'hurt') return this.IMAGES_HURT;
        return null;
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

    /**
     * Boss jump impulse (stronger than the base jump).
     */
    jump() {
        this.speedY = 22.5;
    }

    /**
     * Applies damage and puts the boss into the hurt state, resetting any running attack.
     * On lethal damage it switches to dead; otherwise it returns to fighting after a second.
     * @param {number} [damage=10] Amount of damage.
     */
    bossHit(damage = 10) {
        this.energy -= damage;
        this.resetAttackState();
        this.state = 'hurt';
        if (this.energy <= 0) {
            this.state = 'dead';
            return;
        }
        setTimeout(() => {
            if (this.state === 'hurt') {
                this.state = 'fighting';
                this.speed = 1.5;
            }
        }, 1000);
    }

    /**
     * Clears all attack-cycle flags and stops movement; used when the boss gets hit.
     */
    resetAttackState() {
        this.attackOnCooldown = false;
        this.hasJumpedToAttack = false;
        this.attackStarted = false;
        this.attackLanded = false;
        this.attackPauseStarted = false;
        this.speed = 0;
    }
}