class Renderer {
    world;
    ctx;
    shakeIntensity = 0;
    shakeDuration = 0;
    shakeStart = 0;

    constructor(world) {
        this.world = world;
        this.ctx = world.ctx;
    }

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

    renderActiveFrame() {
        this.ctx.clearRect(0, 0, this.world.canvas.width, this.world.canvas.height);
        this.renderScene(this.getShakeOffset());
        this.renderStatusBars();
        this.world.audioManager.playLoopSound("backgroundMusicSound");
        this.world.audioManager.playLoopSound("chickenBackgroundSound");
    }

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

    renderScene(shake) {
        const world = this.world;
        this.ctx.save();
        this.ctx.translate(shake.x, shake.y);
        this.addBackgroundObjectsToMap(world.level.backgroundObjects);
        this.ctx.translate(world.camera_x, 0);
        this.addObjectsToMap(world.level.clouds);
        this.addObjectsToMap(world.level.coins);
        this.addObjectsToMap(world.level.bottles);
        this.addObjectToMap(world.character);
        this.addObjectsToMap(world.level.enemies);
        if (world.endbossFight.bossTriggered && world.level.endboss.state !== 'camera_to_boss') {
            this.addObjectToMap(world.level.endboss);
        }
        this.addObjectsToMap(world.throwableObjects);
        this.ctx.translate(-world.camera_x, 0);
        this.ctx.restore();
    }

    renderStatusBars() {
        const world = this.world;
        this.addObjectToMap(world.healthBar);
        this.addObjectToMap(world.coinBar);
        this.addObjectToMap(world.bottleBar);
        if (world.endbossHealthBar.endbossAppeared) {
            this.addObjectToMap(world.endbossHealthBar);
        }
    }

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

    addBackgroundObjectsToMap(objects) {
        objects.forEach((object) => {
            this.addBackgroundObjectToMap(object);
        });
    }

    addBackgroundObjectToMap(object) {
        this.ctx.save();
        this.ctx.translate(this.world.camera_x * object.parallaxFactor, 0);
        this.addObjectToMap(object);
        this.ctx.restore();
    }

    addObjectsToMap(objects) {
        objects.forEach(object => {
            this.addObjectToMap(object);
        });
    }

    addObjectToMap(object) {
        if (object.otherDirection) {
            this.flipImage(object);
        }

        object.drawObject(this.ctx);

        if (object.otherDirection) {
            this.flipImageBack(object);
        }
    }

    flipImage(object) {
        this.ctx.save();
        this.ctx.translate(object.width, 0);
        this.ctx.scale(-1, 1);
        object.x = object.x * -1;
    }

    flipImageBack(object) {
        object.x = object.x * -1;
        this.ctx.restore();
    }

    triggerEarthquake(duration, intensity) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeStart = Date.now();
    }
}