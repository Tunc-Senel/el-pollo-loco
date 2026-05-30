class World {
    level = level1;
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
    bossTriggered = false;
    bossIntroCameraTargetX = -3800;
    bossFightCameraTargetX = -3100;
    endbossFightTargetX = 3500;
    shakeIntensity = 0;
    shakeDuration = 0;
    shakeStart = 0;
    endScreen = new Endscreen();

    constructor(canvas, keyboard, gameState, audioManager) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.gameState = gameState;
        this.audioManager = audioManager;
        this.draw();
        this.setworld();
        this.checkCollisions();
    }

    setworld() {
        this.character.world = this;
        this.level.endboss.world = this;
    }

    draw() {

        if (!this.endScreen.lostGame && !this.endScreen.wonGame && this.gameState.isGameStarted) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            let shakeX = 0;
            let shakeY = 0;

            if (this.shakeIntensity > 0) {
                let elapsed = Date.now() - this.shakeStart;

                if (elapsed < this.shakeDuration) {
                    let progress = elapsed / this.shakeDuration;
                    let currentIntensity = this.shakeIntensity * (1 - progress);

                    shakeX = (Math.random() - 0.5) * currentIntensity * 2;
                    shakeY = (Math.random() - 0.5) * currentIntensity * 2;
                } else {
                    this.shakeIntensity = 0;
                }
            }

            this.ctx.save();
            this.ctx.translate(shakeX, shakeY);

            this.addBackgroundObjectsToMap(this.level.backgroundObjects);

            this.ctx.translate(this.camera_x, 0);
            this.addObjectsToMap(this.level.clouds);
            this.addObjectsToMap(this.level.coins);
            this.addObjectsToMap(this.level.bottles);
            this.addObjectToMap(this.character);
            this.addObjectsToMap(this.level.enemies);

            if (this.bossTriggered && this.level.endboss.state !== 'camera_to_boss') {
                this.addObjectToMap(this.level.endboss);
            }

            this.addObjectsToMap(this.throwableObjects);
            this.ctx.translate(-this.camera_x, 0);

            this.ctx.restore();

            this.addObjectToMap(this.healthBar);
            this.addObjectToMap(this.coinBar);
            this.addObjectToMap(this.bottleBar);

            if (this.endbossHealthBar.endbossAppeared) {
                this.addObjectToMap(this.endbossHealthBar);
            }
            this.audioManager.playLoopSound("backgroundMusicSound");
            this.audioManager.playLoopSound("chickenBackgroundSound");
        }

        if ((this.endScreen.lostGame || this.endScreen.wonGame) && this.gameState.isGameStarted) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (this.endScreen.lostGame) {
                this.endScreen.show("lose");
            } else if (this.endScreen.wonGame) {
                this.endScreen.show("win");
            }
            this.addObjectToMap(this.endScreen);
            this.audioManager.stopSound("chickenBackgroundSound");
            this.audioManager.stopSound("backgroundMusicSound");
        }

        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    addBackgroundObjectsToMap(objects) {
        objects.forEach((object) => {
            this.addBackgroundObjectToMap(object);
        });
    }

    addBackgroundObjectToMap(object) {
        this.ctx.save();
        this.ctx.translate(this.camera_x * object.parallaxFactor, 0);
        this.addObjectToMap(object);
        this.ctx.restore();
    }

    addObjectsToMap(objects) {
        objects.forEach(object =>{
            this.addObjectToMap(object);
        }) 
    }

    addObjectToMap(object) {
        if(object.otherDirection) {
           this.flipImage(object);
        }
        
        object.drawObject(this.ctx);

        if (object.otherDirection) {
            this.flipImageBack(object)
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
    
    checkCollisions() {
        setInterval(() => {
            this.checkEnemyCollisions();
            this.checkCoinCollisions();
            this.checkBottleCollisions();
            this.checkThrowObjects();
            this.checkBossTrigger();
            this.checkBossIntroProgress();
            this.checkBossAlertProgress();
            this.checkBossFightPositioning();
            this.checkBossAttack();
            this.finishEndbossAttack();
            this.checkEndbossBottleCollisions();
            this.checkEndbossStomp();
            this.checkEndbossCollision();
        }, 1000 / 60);
    }
    

    checkEnemyCollisions() {
        this.level.enemies = this.level.enemies.filter((enemy, index) => {
            if (
                !enemy.isDeadByStomp &&
                !enemy.isDeadByBottle &&
                this.character.isStompingEnemy(enemy) &&
                this.character.speedY < 0
            ) {
                let currenIndex = index;
                this.character.jumpAfterEnemyStomp();
                this.audioManager.playSound("stompSound");
                if (enemy.height > 60) {
                    this.audioManager.playSound("chickenDeadSound");
                } else if (enemy.height <= 60) {
                    this.audioManager.playSound("smallChickenDeadSound");
                }
                enemy.isDeadByStomp = true;
                this.character.firstStandingTime = null;
                setTimeout(() => {
                    this.level.enemies.splice(currenIndex, 1)
                }, 500);
            } else if (
                !enemy.isDeadByStomp &&
                !enemy.isDeadByBottle &&
                this.character.isColliding(enemy)
            ) {
                this.character.hit();
                this.audioManager.playSound("characterHurtSound");
                this.healthBar.setPercentage(this.character.energy);
            }
            return true;
        });
    }

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

    checkBottleCollisions() {
        this.level.bottles = this.level.bottles.filter((bottle) => {
            if (this.character.isOverlappingHorizontally(bottle) && bottle.y > 355 && !this.character.isAboveGround()) {
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

    checkThrowObjects() {   
        if (this.keyboard.F && this.canThrow) {
            this.canThrow = false;
            this.bottleBar.setPercentage(this.bottleBar.percentage -= 20);
            let bottle = new ThrowableObject(this.character.x + 50, this.character.y + 50);
            this.throwableObjects.push(bottle);
            this.character.firstStandingTime = null;
            this.audioManager.playSound("throwBottleSound");
        }

        this.throwableObjects.forEach((bottle) => {
        // 1. Bottle trifft Bodenf
        if (bottle.y >= 350 && !bottle.objectHit) {
            bottle.objectHit = true;
            this.audioManager.playSound("smashBottleSound");
        }

        // 2. Bottle trifft Enemy
        this.level.enemies.forEach((enemy, index) => {
            if (bottle.isColliding(enemy) && !bottle.objectHit) {
                let currenIndex = index;
                bottle.objectHit = true;
                this.audioManager.playSound("smashBottleSound");
                if (enemy.height > 60) {
                    this.audioManager.playSound("chickenDeadSound");
                } else if (enemy.height <= 60) {
                    this.audioManager.playSound("smallChickenDeadSound");
                }
                enemy.isDeadByBottle = true;
                setTimeout(() => {
                    this.level.enemies.splice(currenIndex, 1)
                }, 500);
                }
            });
        });

        this.throwableObjects = this.throwableObjects.filter((bottle) => {
            return !bottle.remove;
        });

        if (!this.keyboard.F) {
            this.canThrow = true;
        }
      
    }

    checkBossTrigger() {
        if (!this.bossTriggered && this.character.x >= 3200) {
            this.bossTriggered = true
            this.character.inputDisabled = true;
            this.character.lockCameraOnBoss = true;
            this.level.levelStartX = 3100;
            this.level.endboss.state = 'camera_to_boss';
        }
    }

    startBossIntro() {
        let visibleRight = -this.camera_x + 720;

        this.level.endboss.x = visibleRight + 100;
        this.level.endboss.walkTarget = visibleRight - this.level.endboss.width - 30;
        this.level.endboss.state = 'walking_in';
        this.level.endboss.speed = 2;
    }

    checkBossIntroProgress() {
        if (this.level.endboss.state === 'camera_to_boss') {
            this.moveCameraToBossIntro();
            return;
        }

        if (
            this.level.endboss.state === 'walking_in' &&
            this.level.endboss.x <= this.level.endboss.walkTarget
        ) {
            this.level.endboss.x = this.level.endboss.walkTarget;
            this.level.endboss.state = 'alert';
            this.level.endboss.alertStart = Date.now();
            this.level.endboss.speed = 0;
        }
    }

        moveCameraToBossIntro() {
        if (this.camera_x > this.bossIntroCameraTargetX) {
            this.camera_x -= 4;
        } else {
            this.camera_x = this.bossIntroCameraTargetX;
            this.startBossIntro();
        }
    }

    checkBossAlertProgress() {
        if (this.level.endboss.state === 'alert' && Date.now() - this.level.endboss.alertStart >= 1500) {
            this.endbossHealthBar.endbossAppeared = true;
            this.level.endboss.centerTarget = -this.camera_x + 260;
            this.level.endboss.state = 'jumping_to_center';
            this.level.endboss.jump();
        }

        if (this.level.endboss.state === 'jumping_to_center' && !this.level.endboss.isAboveGround() && this.level.endboss.speedY <= 0) {
            this.level.endboss.state = 'pause_after_intro_jump';
            this.level.endboss.speed = 0;
            this.level.endboss.otherDirection = false;
            this.triggerEarthquake(800, 20);

            setTimeout(() => {
                if (this.level.endboss.state === 'pause_after_intro_jump') {
                    this.level.endboss.state = 'walking_to_fight_position';
                    this.level.endboss.speed = 2.5;
                }
            }, 800);
        }
    }

    checkBossFightPositioning() {
        if (this.level.endboss.state !== 'walking_to_fight_position') {
            return;
        }

        this.moveCameraToFightArea();
        this.moveEndbossToFightPosition();

        if (
            this.camera_x === this.bossFightCameraTargetX &&
            this.level.endboss.x === this.endbossFightTargetX
        ) {
            this.level.endboss.state = 'short_pause_after_intro';
            this.level.endboss.speed = 0;
            this.level.endboss.otherDirection = false;
            setTimeout(() => {
                this.level.endboss.state = 'fighting';
                this.level.endboss.speed = 1.5;
                this.character.inputDisabled = false;
            }, 1000);
            
        }
    }

    moveCameraToFightArea() {
        if (this.camera_x < this.bossFightCameraTargetX) {
            this.camera_x += 4;
        } else {
            this.camera_x = this.bossFightCameraTargetX;
        }
    }

    moveEndbossToFightPosition() {
        if (this.level.endboss.x > this.endbossFightTargetX) {
            this.level.endboss.moveLeft();
            this.level.endboss.otherDirection = false;
        } else if (this.level.endboss.x < this.endbossFightTargetX) {
            this.level.endboss.moveRight();
            this.level.endboss.otherDirection = true;
        } else {
            this.level.endboss.x = this.endbossFightTargetX;
        }

        if (Math.abs(this.level.endboss.x - this.endbossFightTargetX) < this.level.endboss.speed) {
            this.level.endboss.x = this.endbossFightTargetX;
        }
    }

    checkBossAttack() {
        const endboss = this.level.endboss;

        if (endboss.state !== 'fighting' || endboss.attackOnCooldown) {
            return;
        }

        this.faceEndbossToCharacter();

        const distanceToCharacter = Math.abs(endboss.x - this.character.x);

        if (distanceToCharacter > 220 && !endboss.isAboveGround()) {
            this.moveEndbossTowardsCharacter();
            return;
        }

        if (!endboss.isAboveGround()) {
            this.startEndbossJumpAttack();
        }
    }

    faceEndbossToCharacter() {
        const endboss = this.level.endboss;

        if (endboss.x > this.character.x) {
            endboss.otherDirection = false;
        } else {
            endboss.otherDirection = true;
        }
    }

    moveEndbossTowardsCharacter() {
        const endboss = this.level.endboss;

        endboss.speed = 1.8;

        if (endboss.x > this.character.x + 140) {
            endboss.moveLeft();
            endboss.otherDirection = false;
        } else if (endboss.x + endboss.width < this.character.x - 140) {
            endboss.moveRight();
            endboss.otherDirection = true;
        }
    }

    startEndbossJumpAttack() {
        const endboss = this.level.endboss;

        endboss.attackOnCooldown = true;
        endboss.hasJumpedToAttack = true;
        endboss.attackStarted = true;
        endboss.attackTargetX = this.character.x + this.character.width / 2;
        endboss.state = 'attacking';
        endboss.speed = 0;
        endboss.jump();
    }

    moveEndbossToAttack() {
        const distanceToCharacter = Math.abs(this.level.endboss.x - this.character.x);

        if (this.level.endboss.hasJumpedToAttack) {
            return;
        }

        if (distanceToCharacter > 80 && !this.level.endboss.isAboveGround()) {
            this.level.endboss.speed = 2.5;

            if (this.level.endboss.x > this.character.x) {
                this.level.endboss.moveLeft();
                this.level.endboss.otherDirection = false;
            } else {
                this.level.endboss.moveRight();
                this.level.endboss.otherDirection = true;
            }

            return;
        }

        if (!this.level.endboss.isAboveGround()) {
            this.level.endboss.hasJumpedToAttack = true;
            this.level.endboss.jump();
        }
    }

    finishEndbossAttack() {
        if (
            this.level.endboss.state === 'attacking' &&
            this.level.endboss.hasJumpedToAttack &&
            !this.level.endboss.isAboveGround() &&
            this.level.endboss.speedY <= 0
        ) {
            this.level.endboss.state = 'fighting';

            setTimeout(() => {
                this.level.endboss.attackOnCooldown = false;
                this.level.endboss.hasJumpedToAttack = false;
            }, 2000);
        }
    }

    checkEndbossBottleCollisions() {
        this.throwableObjects.forEach((bottle) => {
            if (this.level.endboss.state !== 'dead' && bottle.isColliding(this.level.endboss) && !bottle.objectHit) {
                this.level.endboss.bossHit();
                bottle.objectHit = true;
                this.endbossHealthBar.setPercentage(this.level.endboss.energy);
                this.audioManager.stopSound("throwBottleSound");
                this.audioManager.playSound("smashBottleSound");
            }
        });
    }

    checkEndbossStomp() {
        if (this.level.endboss.state !== 'dead' &&
            this.level.endboss.state !== 'hidden' &&
            !this.character.hasStompedEndbossInThisJump &&
            this.character.isStompingEnemy(this.level.endboss) &&
            this.character.speedY < 0
        ) {
            this.character.jumpAfterEndbossStomp();
            this.audioManager.playSound("stompSound");
            this.character.hasStompedEndbossInThisJump = true;
            this.level.endboss.bossHit();
            this.endbossHealthBar.setPercentage(this.level.endboss.energy);
            this.character.firstStandingTime = null;
        } 
        if (!this.character.isAboveGround()) {
            this.character.hasStompedEndbossInThisJump = false;
        }
    }

    checkEndbossCollision() {
        if (
            this.level.endboss.state !== 'dead' &&
            this.level.endboss.state !== 'hidden' &&
            !this.character.isHurt() &&
            !this.character.isDead() &&
            this.character.isColliding(this.level.endboss)
        ) {
            this.character.hit();
            this.audioManager.playSound("characterHurtSound");
            this.healthBar.setPercentage(this.character.energy);
        }
    }

    triggerEarthquake(duration, intensity) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeStart = Date.now();
    }

    
        
}