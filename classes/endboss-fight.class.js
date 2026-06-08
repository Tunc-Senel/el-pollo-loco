class EndbossFight {
    world;
    bossTriggered = false;
    bossIntroCameraTargetX = -3800;
    bossFightCameraTargetX = -3100;
    endbossFightTargetX = 3500;
    endbossDeathStarted = false;

    constructor(world) {
        this.world = world;
    }

    update() {
        this.runBossSequence();
        this.checkBossDamage();
    }

    runBossSequence() {
        this.checkBossTrigger();
        this.checkBossIntroProgress();
        this.checkBossAlertProgress();
        this.checkBossFightPositioning();
        this.checkBossAttack();
        this.moveEndbossToAttack();
        this.finishEndbossAttack();
        this.checkEndbossAttackPause();
    }

    checkBossDamage() {
        this.checkEndbossBottleCollisions();
        this.checkEndbossStomp();
        this.checkEndbossCollision();
        this.checkEndbossDeath();
    }

    checkBossTrigger() {
        if (!this.bossTriggered && this.world.character.x >= 3200) {
            this.bossTriggered = true
            this.world.character.inputDisabled = true;
            this.world.throwDisabled = true;
            this.world.character.freezeGravity = true;
            this.world.character.lockCameraOnBoss = true;
            this.world.level.levelStartX = 3100;
            this.world.level.endboss.state = 'camera_to_boss';

            setTimeout(() => {
                this.world.character.speedY = 0;
                this.world.character.freezeGravity = false;
            }, 2000);
        }
    }

    startBossIntro() {
        let visibleRight = -this.world.camera_x + 720;

        this.world.level.endboss.x = visibleRight + 100;
        this.world.level.endboss.walkTarget = visibleRight - this.world.level.endboss.width - 30;
        this.world.level.endboss.state = 'walking_in';
        this.world.level.endboss.speed = 2;
    }

    checkBossIntroProgress() {
        if (this.world.level.endboss.state === 'camera_to_boss') {
            this.moveCameraToBossIntro();
            return;
        }

        if (
            this.world.level.endboss.state === 'walking_in' &&
            this.world.level.endboss.x <= this.world.level.endboss.walkTarget
        ) {
            this.world.level.endboss.x = this.world.level.endboss.walkTarget;
            this.world.level.endboss.state = 'alert';
            this.world.level.endboss.alertStart = Date.now();
            this.world.level.endboss.speed = 0;
            this.world.audioManager.playSound("endbossAlertSound");
        }
    }

        moveCameraToBossIntro() {
        if (this.world.camera_x > this.bossIntroCameraTargetX) {
            this.world.camera_x -= 4;
        } else {
            this.world.camera_x = this.bossIntroCameraTargetX;
            this.startBossIntro();
        }
    }

    checkBossAlertProgress() {
        this.startBossCenterJump();
        this.landBossInCenter();
    }

    startBossCenterJump() {
        const endboss = this.world.level.endboss;
        if (endboss.state === 'alert' && Date.now() - endboss.alertStart >= 1500) {
            this.world.endbossHealthBar.endbossAppeared = true;
            endboss.centerTarget = -this.world.camera_x + 260;
            endboss.state = 'jumping_to_center';
            endboss.jump();
        }
    }

    landBossInCenter() {
        const endboss = this.world.level.endboss;
        if (endboss.state === 'jumping_to_center' && !endboss.isAboveGround() && endboss.speedY <= 0) {
            endboss.state = 'pause_after_intro_jump';
            endboss.speed = 0;
            endboss.otherDirection = false;
            this.world.triggerEarthquake(800, 20);
            this.world.audioManager.playSound("earthquakeSound");
            setTimeout(() => {
                if (endboss.state === 'pause_after_intro_jump') {
                    endboss.state = 'walking_to_fight_position';
                    endboss.speed = 5;
                }
            }, 800);
        }
    }

    checkBossFightPositioning() {
        const endboss = this.world.level.endboss;
        if (endboss.state !== 'walking_to_fight_position') {
            return;
        }
        this.moveCameraToFightArea();
        this.moveEndbossToFightPosition();
        if (this.world.camera_x === this.bossFightCameraTargetX && endboss.x === this.endbossFightTargetX) {
            this.startBossFightAfterPositioning();
        }
    }

    startBossFightAfterPositioning() {
        const endboss = this.world.level.endboss;
        endboss.state = 'short_pause_after_intro';
        endboss.speed = 0;
        endboss.otherDirection = false;
        this.world.audioManager.playSound("endbossAlertSound");
        setTimeout(() => {
            endboss.state = 'fighting';
            endboss.speed = 5;
            this.world.character.inputDisabled = false;
            this.world.throwDisabled = false;
        }, 1000);
    }

    moveCameraToFightArea() {
        if (this.world.camera_x < this.bossFightCameraTargetX) {
            this.world.camera_x += 4;
        } else {
            this.world.camera_x = this.bossFightCameraTargetX;
        }
    }

    moveEndbossToFightPosition() {
        if (this.world.level.endboss.x > this.endbossFightTargetX) {
            this.world.level.endboss.moveLeft();
            this.world.level.endboss.otherDirection = false;
        } else if (this.world.level.endboss.x < this.endbossFightTargetX) {
            this.world.level.endboss.moveRight();
            this.world.level.endboss.otherDirection = true;
        } else {
            this.world.level.endboss.x = this.endbossFightTargetX;
        }

        if (Math.abs(this.world.level.endboss.x - this.endbossFightTargetX) < this.world.level.endboss.speed) {
            this.world.level.endboss.x = this.endbossFightTargetX;
        }
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
            this.world.triggerEarthquake(800, 18);
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