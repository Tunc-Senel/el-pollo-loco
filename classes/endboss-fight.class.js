/**
 * Controls the endboss fight as a whole: holds its state (triggered?, camera targets)
 * and choreographs the intro sequence (make the boss appear, walk in, jump to the
 * center, move into fighting position). The actual combat phase is extracted into
 * EndbossCombat and driven from here. Accesses the World via a reference.
 */
class EndbossFight {
    world;

    /**
     * true once the character reaches the boss zone; triggers the intro sequence.
     */
    bossTriggered = false;

    /**
     * Camera target position for the approach to the boss during the intro.
     */
    bossIntroCameraTargetX = -3800;

    /**
     * Camera target position for the actual fighting area.
     */
    bossFightCameraTargetX = -3100;

    /**
     * X position at which the boss takes up its fighting stance.
     */
    endbossFightTargetX = 3500;

    /**
     * Encapsulates the combat phase (attacks, damage, death); also accesses the World.
     */
    combat;

    /**
     * Stores the World reference and creates the combat component up front, so the
     * combat phase is ready as soon as the intro hands over to fighting.
     */
    constructor(world) {
        this.world = world;
        this.combat = new EndbossCombat(world);
    }

    /**
     * Each frame, first advances the intro choreography, then the combat phase.
     */
    update() {
        this.runBossIntro();
        this.combat.update();
    }

    /**
     * Bundles the individual steps of the intro sequence from trigger to fighting position.
     */
    runBossIntro() {
        this.checkBossTrigger();
        this.checkBossIntroProgress();
        this.checkBossAlertProgress();
        this.checkBossFightPositioning();
    }

    /**
     * Triggers the boss fight as soon as the character reaches the boss zone: freezes
     * the character's input/gravity and starts the camera pan to the boss. Gravity is
     * released again after a short delay.
     */
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

    /**
     * Positions the boss at the right edge of the screen and makes it walk into view.
     */
    startBossIntro() {
        let visibleRight = -this.world.camera_x + 720;

        this.world.level.endboss.x = visibleRight + 100;
        this.world.level.endboss.walkTarget = visibleRight - this.world.level.endboss.width - 30;
        this.world.level.endboss.state = 'walking_in';
        this.world.level.endboss.speed = 2;
    }

    /**
     * Advances the intro: first the camera pan to the boss, then the walk-in up to the
     * target point, where the boss switches into the alert state.
     */
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

    /** 
     * Pans the camera to the boss and, once the target is reached, starts the walk-in. 
     */
    moveCameraToBossIntro() {
        if (this.world.camera_x > this.bossIntroCameraTargetX) {
            this.world.camera_x -= 4;
        } else {
            this.world.camera_x = this.bossIntroCameraTargetX;
            this.startBossIntro();
        }
    }

    /**
     * Bundles the two phases of the center jump: take-off from the alert state and landing.
     */
    checkBossAlertProgress() {
        this.startBossCenterJump();
        this.landBossInCenter();
    }

    /**
     * After a short alert phase, makes the boss jump to the center and reveals its health bar.
     */
    startBossCenterJump() {
        const endboss = this.world.level.endboss;
        if (endboss.state === 'alert' && Date.now() - endboss.alertStart >= 1500) {
            this.world.endbossHealthBar.endbossAppeared = true;
            endboss.centerTarget = -this.world.camera_x + 260;
            endboss.state = 'jumping_to_center';
            endboss.jump();
        }
    }

    /**
     * Catches the landing of the center jump: triggers an earthquake and, after a short
     * pause, leads into the walk to the fighting position.
     */
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

    /**
     * Moves camera and boss into the fighting position and hands over to the start of
     * the actual fight once both have reached their target.
     */
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

    /**
     * Ends the intro: after a short pause the boss switches into fighting mode and the
     * character's controls are released again.
     */
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

    /** 
     * Pans the camera into the fighting area.
     */
    moveCameraToFightArea() {
        if (this.world.camera_x < this.bossFightCameraTargetX) {
            this.world.camera_x += 4;
        } else {
            this.world.camera_x = this.bossFightCameraTargetX;
        }
    }

    /**
     * Moves the boss towards its fighting position and snaps it in place once the
     * remaining distance is smaller than one movement step (prevents overshooting).
     */
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