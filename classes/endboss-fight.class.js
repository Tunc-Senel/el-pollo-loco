class EndbossFight {
    world;
    bossTriggered = false;
    bossIntroCameraTargetX = -3800;
    bossFightCameraTargetX = -3100;
    endbossFightTargetX = 3500;
    combat;

    constructor(world) {
        this.world = world;
        this.combat = new EndbossCombat(world);
    }

    update() {
        this.runBossIntro();
        this.combat.update();
    }

    runBossIntro() {
        this.checkBossTrigger();
        this.checkBossIntroProgress();
        this.checkBossAlertProgress();
        this.checkBossFightPositioning();
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
            this.world.renderer.triggerEarthquake(800, 20);
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
}