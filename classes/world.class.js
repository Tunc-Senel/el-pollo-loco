/**
 * Central game world: holds all game objects, drives the render loop and the
 * collision checks, and connects character, enemies and the endboss fight with
 * input (keyboard) and audio. Created once when the game starts.
 */
class World {
    level
    character = new Character();
    canvas;
    gameState;
    audioManager;
    ctx;
    keyboard;
    camera_x;
    healthBar = new HealthBar();
    coinBar = new CoinBar();
    bottleBar = new BottleBar();
    throwableObjects = [];
    canThrow = true;
    endbossHealthBar = new EndbossHealthBar();
    endbossFight;
    renderer;
    endScreen = new Endscreen();
    intervalIds = [];
    gameEnded = false;
    characterDeathStarted = false;
    throwDisabled = false;
    stopped = false;

    /**
     * Builds the level, links input/audio and immediately starts the render loop
     * and collision checks. endbossFight and renderer are created before draw(),
     * since the render loop needs both to draw the boss and the scene.
     * @param {HTMLCanvasElement} canvas The canvas to render into.
     * @param {Keyboard} keyboard Shared keyboard input state.
     * @param {GameState} gameState Shared game state (e.g. whether the game started).
     * @param {AudioManager} audioManager The shared audio controller.
     */
    constructor(canvas, keyboard, gameState, audioManager) {
        this.level = createLevel();
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.gameState = gameState;
        this.audioManager = audioManager;
        this.endbossFight = new EndbossFight(this);
        this.renderer = new Renderer(this);
        this.draw();
        this.setworld();
        this.checkCollisions();
    }

    /**
     * Gives the character and endboss a back-reference to this World so they can
     * access camera, audio and enemies on their own.
     */
    setworld() {
        this.character.world = this;
        this.level.endboss.world = this;
    }

    /**
     * Kicks off the render loop; the actual drawing is handled by the renderer.
     */
    draw() {
        this.renderer.draw();
    }

    /**
     * Keeps the camera tracking the character but clamps it to the level bounds so
     * it does not scroll past the level start/end. Stays in World, since camera_x
     * is used both by the character's movement and by the renderer.
     */
    updateCamera() {
        const leftCameraLimit = -this.level.levelStartX;
        const rightCameraLimit = -this.level.levelEndX;

        this.camera_x = -this.character.x + 100;

        if (this.camera_x > leftCameraLimit) {
            this.camera_x = leftCameraLimit;
        }

        if (this.camera_x < rightCameraLimit) {
            this.camera_x = rightCameraLimit;
        }
    }

    /**
     * Starts the central game logic loop (~60 fps): checks all of the character's
     * collisions and advances the endboss fight.
     */
    checkCollisions() {
        this.intervalIds.push(
            setInterval(() => {
                this.checkEnemyCollisions();
                this.checkCoinCollisions();
                this.checkBottleCollisions();
                this.checkThrowObjects();
                this.endbossFight.update();
            }, 1000 / 60)
        );
    }

    /**
     * Checks encounters with enemies each frame: jumping on one from above kills it,
     * side contact hurts the character. Enemies already dead are skipped.
     */
    checkEnemyCollisions() {
        this.level.enemies.forEach((enemy, index) => {
            if (enemy.isDeadByStomp || enemy.isDeadByBottle) {
                return;
            }
            if (this.character.isStompingEnemy(enemy) && this.character.speedY < 0) {
                this.handleEnemyStomp(enemy, index);
            } else if (this.character.isColliding(enemy)) {
                this.damageCharacter();
            }
        });
    }

    /**
     * Handles stomping an enemy: bounce jump, sound, marking it as dead. Removal is
     * delayed so the death animation stays visible.
     * @param {MovableObject} enemy The stomped enemy.
     * @param {number} index The enemy's index in the enemies array.
     */
    handleEnemyStomp(enemy, index) {
        this.character.jumpAfterEnemyStomp();
        this.audioManager.playSound("stompSound");
        this.playEnemyDeadSound(enemy);
        enemy.isDeadByStomp = true;
        this.character.firstStandingTime = null;
        setTimeout(() => {
            this.level.enemies.splice(index, 1);
        }, 500);
    }

    /**
     * Damages the character, updates the health bar and, on a lethal hit, triggers
     * the death sequence with a delayed game over exactly once. Shared by enemy and
     * endboss contact (hence the variable damage amount).
     * @param {number} [damage=10] Amount of damage.
     */
    damageCharacter(damage = 10) {
        this.character.hit(damage);
        this.healthBar.setPercentage(this.character.energy);
        if (this.character.energy > 0) {
            this.audioManager.playSound("characterHurtSound");
        } else if (this.character.energy <= 0 && !this.characterDeathStarted) {
            this.characterDeathStarted = true;
            this.audioManager.playSound("characterDieSound");
            setTimeout(() => {
                this.endScreen.lostGame = true;
            }, 1000);
        }
    }

    /**
     * Collects touched coins (fills the coin bar) and removes them from the level.
     */
    checkCoinCollisions() {
        this.level.coins = this.level.coins.filter((coin) => {
            if (this.character.isColliding(coin)) {
                this.coinBar.setPercentage(this.coinBar.percentage + 20);
                this.audioManager.playSound("collectCoinSound");
                return false;
            }
            return true;
        });
    }

    /**
     * Collects bottles and removes them. Bottles lying on the ground are picked up
     * already on horizontal overlap, higher placed ones only on actual collision.
     */
    checkBottleCollisions() {
        this.level.bottles = this.level.bottles.filter((bottle) => {
            if (this.character.isOverlappingHorizontally(bottle) && bottle.y > 355 && !this.character.isAboveGround()) {
                this.bottleBar.setPercentage(this.bottleBar.percentage + 20);
                this.audioManager.playSound("collectBottleSound");
                return false;
            }
            if (this.character.isColliding(bottle)) {
                this.bottleBar.setPercentage(this.bottleBar.percentage + 20);
                this.audioManager.playSound("collectBottleSound");
                return false;
            }
                return true;
        });
    }

    /**
     * Drives throwing each frame: spawns a bottle on key press, updates flying
     * bottles, clears shattered ones and re-enables throwing once F is released.
     * Nothing happens during the boss intro (throwDisabled).
     */
    checkThrowObjects() {
        if (this.throwDisabled) {
            return;
        }
        this.spawnBottleIfRequested();
        this.updateThrownBottles();
        this.throwableObjects = this.throwableObjects.filter((bottle) => !bottle.remove);
        if (!this.keyboard.F) {
            this.canThrow = true;
        }
    }

    /**
     * Spawns a new thrown bottle if F is pressed, a throw is allowed and there is
     * stock left. Throw direction follows the character's facing direction.
     */
    spawnBottleIfRequested() {
        if (!this.keyboard.F || !this.canThrow || this.bottleBar.percentage <= 0) {
            return;
        }
        this.canThrow = false;
        this.bottleBar.setPercentage(this.bottleBar.percentage -= 20);
        let throwDirection = this.character.otherDirection ? 'left' : 'right';
        let bottle = new ThrowableObject(this.character.x + 50, this.character.y + 50, throwDirection);
        this.throwableObjects.push(bottle);
        this.character.firstStandingTime = null;
        this.audioManager.playSound("throwBottleSound");
    }

    /**
     * Checks each flying bottle for ground and enemy hits.
     */
    updateThrownBottles() {
        this.throwableObjects.forEach((bottle) => {
            this.handleBottleGroundHit(bottle);
            this.handleBottleEnemyHits(bottle);
        });
    }

    /**
     * Lets a bottle shatter on the ground (triggers the splash animation).
     * @param {ThrowableObject} bottle The bottle to check against the ground.
     */
    handleBottleGroundHit(bottle) {
        if (bottle.y >= 350 && !bottle.objectHit) {
            bottle.objectHit = true;
            bottle.isFlying = false;
            this.audioManager.playSound("smashBottleSound");
        }
    }

    /** 
     * Checks a bottle for hits on enemies and kills the hit enemy on contact.
     * @param {ThrowableObject} bottle The bottle to check against the enemies.
     */
    handleBottleEnemyHits(bottle) {
        this.level.enemies.forEach((enemy, index) => {
            if (bottle.isColliding(enemy) && !bottle.objectHit) {
                bottle.objectHit = true;
                bottle.isFlying = false;
                this.audioManager.playSound("smashBottleSound");
                this.killEnemyByBottle(enemy, index);
            }
        });
    }

    /**
     * Marks an enemy as killed by a bottle; delayed removal for the death animation.
     * @param {MovableObject} enemy The enemy hit by the bottle.
     * @param {number} index The enemy's index in the enemies array.
     */
    killEnemyByBottle(enemy, index) {
        this.playEnemyDeadSound(enemy);
        enemy.isDeadByBottle = true;
        setTimeout(() => {
            this.level.enemies.splice(index, 1);
        }, 500);
    }

    /**
     * Plays the death sound matching the enemy size (large vs. small chicken).
     * @param {MovableObject} enemy The enemy whose death sound is played.
     */
    playEnemyDeadSound(enemy) {
        if (enemy.height > 50) {
            this.audioManager.playSound("chickenDeadSound");
        } else {
            this.audioManager.playSound("smallChickenDeadSound");
        }
    }

    /**
     * Resumes the game after a pause: restores the character's idle timer and starts
     * both the World loop and all sub-object loops.
     */
    startIntervalls() {
        if (this.character.standingTimeBeforePause !== null) {
            this.character.firstStandingTime = Date.now() - this.character.standingTimeBeforePause;
        }
        this.checkCollisions();
        this.forEachSubObject((object) => object.startIntervalls());
    }

    /**
     * Pauses/ends the game: saves the idle timer, stops the World loops and all
     * sub-object loops so nothing keeps running in the background.
     */
    stopIntervalls() {
        this.preservePauseStandingTime();
        this.intervalIds.forEach((intervalId) => clearInterval(intervalId));
        this.intervalIds = [];
        this.forEachSubObject((object) => object.stopIntervalls());
    }

    /**
     * Remembers how long the character had already been standing still before the
     * pause, so the idle/sleep animation continues correctly after resuming. The value
     * set far into the future prevents the animation from triggering during the pause.
     */
    preservePauseStandingTime() {
        if (Date.now() - this.character.firstStandingTime < 8000) {
            this.character.standingTimeBeforePause = Date.now() - this.character.firstStandingTime;
            this.character.firstStandingTime = Date.now() + 100000000;
        } else {
            this.character.standingTimeBeforePause = null;
        }
    }

    /**
     * Applies an action to all objects with their own loops (character, endboss,
     * enemies, clouds, throwable objects). Bundles the shared start/stop pattern.
     * @param {(object: Object) => void} action Action applied to each sub-object.
     */
    forEachSubObject(action) {
        action(this.character);
        action(this.level.endboss);
        this.level.enemies.forEach(action);
        this.level.clouds.forEach(action);
        this.throwableObjects.forEach(action);
    }
}