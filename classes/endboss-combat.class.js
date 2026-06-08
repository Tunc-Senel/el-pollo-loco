class EndbossCombat {
    world;
    endbossDeathStarted = false;

    constructor(world) {
        this.world = world;
    }

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

    centerOf(object) {
        return object.x + object.width / 2;
    }

    faceEndbossToCharacter() {
        const endboss = this.world.level.endboss;

        if (endboss.x > this.world.character.x) {
            endboss.otherDirection = false;
        } else {
            endboss.otherDirection = true;
        }
    }

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

    moveEndbossToAttack() {
        const endboss = this.world.level.endboss;

        if (!endboss.hasJumpedToAttack) {
            return;
        }

        if (endboss.isAboveGround()) {
            this.moveEndbossInAirToAttackTarget();
        }
    }

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

    hasEndbossLandedAttack() {
        const endboss = this.world.level.endboss;
        return endboss.state === 'attacking' &&
            endboss.hasJumpedToAttack &&
            !endboss.isAboveGround() &&
            endboss.speedY <= 0 &&
            !endboss.attackLanded;
    }

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

    resetEndbossAttackFlags(endboss) {
        endboss.attackOnCooldown = false;
        endboss.hasJumpedToAttack = false;
        endboss.attackStarted = false;
        endboss.attackLanded = false;
        endboss.attackPauseStarted = false;
    }

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

    isStompingEndboss() {
        const endboss = this.world.level.endboss;
        return endboss.state !== 'dead' &&
            endboss.state !== 'hidden' &&
            !this.world.character.hasStompedEndbossInThisJump &&
            this.world.character.isStompingEnemy(endboss) &&
            this.world.character.speedY < 0;
    }

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