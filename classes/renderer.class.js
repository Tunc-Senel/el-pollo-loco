/**
 * Handles all drawing of the game world onto the canvas: render loop, depth
 * ordering of objects, HUD bars, end screen and the screen shake. Accesses the
 * World's current state via a reference and deliberately does not modify it
 * (game logic stays in World/EndbossFight).
 */
class Renderer {
    world;
    ctx;
    shakeIntensity = 0;
    shakeDuration = 0;
    shakeStart = 0;

    /**
     * Stores the World reference and caches its canvas context for drawing.
     * @param {World} world The game world to render.
     */
    constructor(world) {
        this.world = world;
        this.ctx = world.ctx;
    }

    /**
     * Main render loop: draws either the running game or the end screen and
     * re-invokes itself via requestAnimationFrame until stopped is set.
     */
    draw() {
        const world = this.world;
        if (!world.endScreen.lostGame && !world.endScreen.wonGame && world.gameState.isGameStarted) {
            this.renderActiveFrame();
        }
        if ((world.endScreen.lostGame || world.endScreen.wonGame) && world.gameState.isGameStarted) {
            this.handleEndScreen();
        }
        let self = this;
        if (!world.stopped) {
            requestAnimationFrame(function () {
                self.draw();
            });
        }
    }

    /** 
     * Draws a complete frame of the running game including HUD and background sounds.
     */
    renderActiveFrame() {
        this.ctx.clearRect(0, 0, this.world.canvas.width, this.world.canvas.height);
        this.renderScene(this.getShakeOffset());
        this.renderStatusBars();
        this.world.audioManager.playLoopSound("backgroundMusicSound");
        this.world.audioManager.playLoopSound("chickenBackgroundSound");
    }

    /**
     * Returns the current screen-shake offset for this frame. The intensity decreases
     * linearly over the duration; once it elapses the effect is reset.
     * @returns {{x: number, y: number}} Pixel offset for the canvas.
     */
    getShakeOffset() {
        if (this.shakeIntensity <= 0) {
            return { x: 0, y: 0 };
        }
        let elapsed = Date.now() - this.shakeStart;
        if (elapsed >= this.shakeDuration) {
            this.shakeIntensity = 0;
            return { x: 0, y: 0 };
        }
        let currentIntensity = this.shakeIntensity * (1 - elapsed / this.shakeDuration);
        return {
            x: (Math.random() - 0.5) * currentIntensity * 2,
            y: (Math.random() - 0.5) * currentIntensity * 2
        };
    }

    /**
     * Draws all world objects in a fixed depth order. The background is only offset
     * by the shake, everything else additionally by camera_x; the boss appears only
     * after its trigger and not during the camera pan towards it.
     * @param {{x: number, y: number}} shake Offset from getShakeOffset().
     */
    renderScene(shake) {
        const world = this.world;
        const camX = Math.round(world.camera_x);
        this.ctx.save();
        this.ctx.translate(Math.round(shake.x), Math.round(shake.y));
        this.addBackgroundObjectsToMap(world.level.backgroundObjects);
        this.ctx.translate(camX, 0);
        this.addObjectsToMap(world.level.clouds);
        this.addObjectsToMap(world.level.coins);
        this.addObjectsToMap(world.level.bottles);
        this.addObjectToMap(world.character);
        this.addObjectsToMap(world.level.enemies);
        if (world.endbossFight.bossTriggered && world.level.endboss.state !== 'camera_to_boss') {
            this.addObjectToMap(world.level.endboss);
        }
        this.addObjectsToMap(world.throwableObjects);
        this.ctx.restore();
    }

    /**
     * Draws the fixed HUD bars; the endboss bar only once the boss has appeared.
     */
    renderStatusBars() {
        const world = this.world;
        this.addObjectToMap(world.healthBar);
        this.addObjectToMap(world.coinBar);
        this.addObjectToMap(world.bottleBar);
        if (world.endbossHealthBar.endbossAppeared) {
            this.addObjectToMap(world.endbossHealthBar);
        }
    }

    /**
     * Ends the game: stops all loops, switches to the win or lose image and plays
     * the matching end sound exactly once.
     */
    handleEndScreen() {
        const world = this.world;
        this.ctx.clearRect(0, 0, world.canvas.width, world.canvas.height);
        world.stopIntervalls();
        world.audioManager.stopSound("backgroundMusicSound");
        world.audioManager.stopSound("chickenBackgroundSound");
        world.endScreen.show(world.endScreen.lostGame ? "lose" : "win");
        if (!world.gameEnded) {
            world.audioManager.playSound(world.endScreen.lostGame ? "lostGameSound" : "wonGameSound");
        }
        world.gameEnded = true;
    }

    /**
     * Draws all background layers individually, since each has its own parallax offset.
     * @param {BackgroundObject[]} objects The background layers to draw.
     */
    addBackgroundObjectsToMap(objects) {
        objects.forEach((object) => {
            this.addBackgroundObjectToMap(object);
        });
    }

    /**
     * Draws a background layer with its own parallax factor so that more distant
     * layers scroll along more slowly than the foreground.
     * @param {BackgroundObject} object The background layer to draw.
     */
    addBackgroundObjectToMap(object) {
        this.ctx.save();
        this.ctx.translate(Math.round(this.world.camera_x * object.parallaxFactor), 0);
        this.addObjectToMap(object);
        this.ctx.restore();
    }

    /**
     * Draws a list of similar objects.
     * @param {DrawableObject[]} objects The objects to draw.
     */
    addObjectsToMap(objects) {
        objects.forEach(object => {
            this.addObjectToMap(object);
        });
    }

    /**
     * Draws a single object and mirrors it horizontally when needed, so figures are
     * shown facing their direction of travel.
     * @param {DrawableObject} object The object to draw.
     */
    addObjectToMap(object) {
        if (object.otherDirection) {
            this.flipImage(object);
        }

        object.drawObject(this.ctx);

        if (object.otherDirection) {
            this.flipImageBack(object);
        }
    }

    /**
     * Mirrors the canvas for an object facing left. object.x is negated so the
     * mirrored coordinate is correct; flipImageBack undoes this.
     * @param {DrawableObject} object The object being mirrored.
     */
    flipImage(object) {
        this.ctx.save();
        this.ctx.translate(object.width, 0);
        this.ctx.scale(-1, 1);
        object.x = object.x * -1;
    }

    /**
     * Reverts the mirroring from flipImage and restores object.x.
     * @param {DrawableObject} object The object whose mirroring is reverted.
     */
    flipImageBack(object) {
        object.x = object.x * -1;
        this.ctx.restore();
    }

    /**
     * Starts a screen shake. Used mainly by the endboss fight for impact and landing
     * earthquakes; getShakeOffset evaluates the values in the render loop.
     * @param {number} duration How long the shake lasts, in milliseconds.
     * @param {number} intensity The starting shake strength in pixels.
     */
    triggerEarthquake(duration, intensity) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeStart = Date.now();
    }
}