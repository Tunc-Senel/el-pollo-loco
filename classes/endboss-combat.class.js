/**
 * Combat phase of the endboss fight: once the boss is positioned, this class
 * controls its attack behavior (approach, jump attack, pause) as well as taking
 * damage from bottles and stomps until death. Held by EndbossFight as a component
 * and accesses state via the World reference.
 */
class EndbossCombat {
    world;

    /**
     * Prevents the endboss's death sequence from being triggered more than once. 
     */
    endbossDeathStarted = false;

    /**
     * Stores the World reference used to access character, endboss, audio and UI bars.
     */
    constructor(world) {
        this.world = world;
    }

    /** 
     * Each frame, advances the boss's attack flow and damage checks. 
     */
    update() {
        this.checkBossAttack();
        this.moveEndbossToAttack();
        this.finishEndbossAttack();
        this.checkEndbossAttackPause();
        this.checkEndbossBottleCollisions();
        this.checkEndbossStomp();
        this.checkEndbossCollision();
        this.checkEndbossDeath();
    }

    /**
     * In fighting mode, decides whether the boss walks towards the character or starts
     * a jump attack, depending on distance. Nothing happens during cooldown/jump.
     */
    checkBossAttack() {
        const endboss = this.world.level.endboss;
        if (endboss.state !== 'fighting' || endboss.attackOnCooldown || endboss.isAboveGround()) {
            return;
        }
        this.faceEndbossToCharacter();
        const distanceToCharacter = Math.abs(this.centerOf(endboss) - this.centerOf(this.world.character));
        if (distanceToCharacter > 180) {
            this.moveEndbossTowardsCharacter();
            return;
        }
        this.startEndbossJumpAttack();
    }

    /** 
     * X-axis center of an object; basis for distance and direction calculations. 
     */
    centerOf(object) {
        return object.x + object.width / 2;
    }

    /** 
     * Turns the boss towards the character so attacks and sprite face the right way. 
     */
    faceEndbossToCharacter() {
        const endboss = this.world.level.endboss;

        if (endboss.x > this.world.character.x) {
            endboss.otherDirection = false;
        } else {
            endboss.otherDirection = true;
        }
    }

    /** 
     * Makes the boss walk towards the character until it is close enough for a jump attack. 
     */
    moveEndbossTowardsCharacter() {
        const endboss = this.world.level.endboss;
        const endbossCenter = this.centerOf(endboss);
        const characterCenter = this.centerOf(this.world.character);
        endboss.speed = 5;
        if (endbossCenter > characterCenter + 20) {
            endboss.moveLeft();
            endboss.otherDirection = false;
        } else if (endbossCenter < characterCenter - 20) {
            endboss.moveRight();
            endboss.otherDirection = true;
        }
    }

    /**
     * Starts a jump attack and remembers the target position (character center at the
     * moment of take-off) that the boss aims for while airborne.
     */
    startEndbossJumpAttack() {
        const endboss = this.world.level.endboss;

        endboss.attackOnCooldown = true;
        endboss.hasJumpedToAttack = true;
        endboss.attackStarted = true;
        endboss.attackLanded = false;
        endboss.attackTargetX = this.centerOf(this.world.character);
        endboss.state = 'attacking';
        endboss.speed = 0;
        endboss.jump();
    }

    /** 
     * Steers the boss towards the target position while airborne during an attack jump. 
     */
    moveEndbossToAttack() {
        const endboss = this.world.level.endboss;

        if (!endboss.hasJumpedToAttack) {
            return;
        }

        if (endboss.isAboveGround()) {
            this.moveEndbossInAirToAttackTarget();
        }
    }

    /** 
     * Pushes the boss horizontally towards the target aimed at take-off while in flight. 
     */
    moveEndbossInAirToAttackTarget() {
        const endboss = this.world.level.endboss;
        const endbossCenter = this.centerOf(endboss);
        const characterCenterAtJumpStart = endboss.attackTargetX;

        if (endbossCenter < characterCenterAtJumpStart - 4) {
            endboss.x += 4;
            endboss.otherDirection = true;
        } else if (endbossCenter > characterCenterAtJumpStart + 4) {
            endboss.x -= 4;
            endboss.otherDirection = false;
        }
    }

    /** 
     * Completes the jump attack on landing: triggers an earthquake and enters the attack pause. 
     */
    finishEndbossAttack() {
        const endboss = this.world.level.endboss;
        if (this.hasEndbossLandedAttack()) {
            endboss.attackLanded = true;
            endboss.attackPauseStarted = false;
            endboss.speed = 0;
            endboss.state = 'attack_pause';
            this.world.renderer.triggerEarthquake(800, 18);
            this.world.audioManager.playSound("earthquakeSound");
        }
    }

    /** 
     * Returns true when the boss has just finished its attack jump on the ground. 
     */
    hasEndbossLandedAttack() {
        const endboss = this.world.level.endboss;
        return endboss.state === 'attacking' &&
            endboss.hasJumpedToAttack &&
            !endboss.isAboveGround() &&
            endboss.speedY <= 0 &&
            !endboss.attackLanded;
    }

    /**
     * Holds the boss still briefly after an attack and then puts it back into fighting
     * mode. attackPauseStarted prevents the pause from being started multiple times.
     */
    checkEndbossAttackPause() {
        const endboss = this.world.level.endboss;
        if (endboss.state !== 'attack_pause' || endboss.attackPauseStarted) {
            return;
        }
        endboss.attackPauseStarted = true;
        setTimeout(() => {
            if (endboss.state === 'attack_pause') {
                endboss.state = 'fighting';
                endboss.speed = 5;
                this.resetEndbossAttackFlags(endboss);
            }
        }, 1500);
    }

    /** 
     * Resets all attack flags so the next attack cycle can start cleanly. 
     */
    resetEndbossAttackFlags(endboss) {
        endboss.attackOnCooldown = false;
        endboss.hasJumpedToAttack = false;
        endboss.attackStarted = false;
        endboss.attackLanded = false;
        endboss.attackPauseStarted = false;
    }

    /** 
     * Checks thrown bottle hits on the boss; if it is already dead, triggers the win. 
     */
    checkEndbossBottleCollisions() {
        const endboss = this.world.level.endboss;
        this.world.throwableObjects.forEach((bottle) => {
            if (endboss.state !== 'dead' && bottle.isColliding(endboss) && !bottle.objectHit) {
                this.applyBottleHitOnEndboss(bottle);
            } else if (endboss.state == 'dead') {
                setTimeout(() => {
                    this.world.endScreen.wonGame = true;
                }, 1000);
            }
        });
    }

    /** 
     * Applies a bottle hit: damage, update the bar, matching sounds. 
     */
    applyBottleHitOnEndboss(bottle) {
        const endboss = this.world.level.endboss;
        endboss.bossHit();
        bottle.objectHit = true;
        this.world.endbossHealthBar.setPercentage(endboss.energy);
        this.world.audioManager.stopSound("throwBottleSound");
        this.world.audioManager.playSound("smashBottleSound");
        if (endboss.state !== 'dead') {
            this.world.audioManager.playSound("endbossHurtSound");
        }
    }

    /**
     * Checks whether the character hits the boss from above, applies the hit and triggers
     * the win when the boss is dead. The per-jump flag is reset on landing.
     */
    checkEndbossStomp() {
        const endboss = this.world.level.endboss;
        if (this.isStompingEndboss()) {
            this.applyEndbossStomp();
        } else if (endboss.state == 'dead') {
            setTimeout(() => {
                this.world.endScreen.wonGame = true;
            }, 1500);
        }
        if (!this.world.character.isAboveGround()) {
            this.world.character.hasStompedEndbossInThisJump = false;
        }
    }

    /** 
     * Bundles the conditions for a valid stomp on the boss as a named boolean. 
     */
    isStompingEndboss() {
        const endboss = this.world.level.endboss;
        return endboss.state !== 'dead' &&
            endboss.state !== 'hidden' &&
            !this.world.character.hasStompedEndbossInThisJump &&
            this.world.character.isStompingEnemy(endboss) &&
            this.world.character.speedY < 0;
    }

    /** 
     * Applies a stomp hit: bounce jump, damage to the boss, bar and sounds. 
     */
    applyEndbossStomp() {
        const endboss = this.world.level.endboss;
        this.world.character.jumpAfterEndbossStomp();
        this.world.audioManager.playSound("stompSound");
        this.world.character.hasStompedEndbossInThisJump = true;
        endboss.bossHit();
        endboss.energy -= 10;
        this.world.endbossHealthBar.setPercentage(endboss.energy);
        this.world.character.firstStandingTime = null;
        if (endboss.state !== 'dead') {
            this.world.audioManager.playSound("endbossHurtSound");
        }
    }

    /** 
     * Hurts the character on side contact with the living boss (higher damage). 
     */
    checkEndbossCollision() {
        if (
            this.world.level.endboss.state !== 'dead' &&
            this.world.level.endboss.state !== 'hidden' &&
            !this.world.character.isHurt() &&
            !this.world.character.isDead() &&
            this.world.character.isColliding(this.world.level.endboss)
        ) {
            this.world.damageCharacter(10);
        }
    }

    /** 
     * On the boss's death, triggers the death sound and the delayed win exactly once. 
     */
    checkEndbossDeath() {
        const endboss = this.world.level.endboss;

        if (endboss.state === 'dead' && !this.endbossDeathStarted) {
            this.endbossDeathStarted = true;
            this.world.audioManager.playSound("endbossDieSound");

            setTimeout(() => {
                this.world.endScreen.wonGame = true;
            }, 1500);
        }
    }
}