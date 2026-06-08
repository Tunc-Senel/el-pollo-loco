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
    shakeIntensity = 0;
    shakeDuration = 0;
    shakeStart = 0;
    endScreen = new Endscreen();
    intervalIds = [];
    gameEnded = false;
    characterDeathStarted = false;
    throwDisabled = false;
    stopped = false;
    
    constructor(canvas, keyboard, gameState, audioManager) {
        this.level = createLevel();
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.gameState = gameState;
        this.audioManager = audioManager;
        this.endbossFight = new EndbossFight(this);
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

            if (this.endbossFight.bossTriggered && this.level.endboss.state !== 'camera_to_boss') {
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
            this.stopIntervalls();
            this.audioManager.stopSound("backgroundMusicSound");
            this.audioManager.stopSound("chickenBackgroundSound");
           
            if (this.endScreen.lostGame) {
                this.endScreen.show("lose");
            } else if (this.endScreen.wonGame) {
                this.endScreen.show("win");
            }
            if (!this.gameEnded) {
                this.endScreen.lostGame ? this.audioManager.playSound("lostGameSound") : this.audioManager.playSound("wonGameSound") ;
            }

            this.gameEnded = true;
            
            }

        let self = this;
        if (!this.stopped) {
            requestAnimationFrame(function () {
                self.draw();
            });
        }
    }

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
        this.intervalIds.push(
            setInterval(() => {
                this.checkEnemyCollisions();
                this.checkCoinCollisions();
                this.checkBottleCollisions();
                this.checkThrowObjects();
                this.endbossFight.checkBossTrigger();
                this.endbossFight.checkBossIntroProgress();
                this.endbossFight.checkBossAlertProgress();
                this.endbossFight.checkBossFightPositioning();
                this.endbossFight.checkBossAttack();
                this.endbossFight.moveEndbossToAttack();
                this.endbossFight.finishEndbossAttack();
                this.endbossFight.checkEndbossAttackPause();
                this.endbossFight.checkEndbossBottleCollisions();
                this.endbossFight.checkEndbossStomp();
                this.endbossFight.checkEndbossCollision();
                this.endbossFight.checkEndbossDeath();
            }, 1000 / 60)
        );
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
                if (enemy.height > 50) {
                    this.audioManager.playSound("chickenDeadSound");
                } else if (enemy.height <= 50) {
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

    checkThrowObjects() {
        if (this.throwDisabled) {
            return;
        }
        if (this.keyboard.F && this.canThrow && this.bottleBar.percentage > 0) {
            this.canThrow = false;
            this.bottleBar.setPercentage(this.bottleBar.percentage -= 20);
            let throwDirection = this.character.otherDirection ? 'left' : 'right';
            let bottle = new ThrowableObject(this.character.x + 50, this.character.y + 50, throwDirection);
            this.throwableObjects.push(bottle);
            this.character.firstStandingTime = null;
            this.audioManager.playSound("throwBottleSound");
        }

        this.throwableObjects.forEach((bottle) => {
        // 1. Bottle trifft Bodenf
        if (bottle.y >= 350 && !bottle.objectHit) {
            bottle.objectHit = true;
            bottle.isFlying = false;
            this.audioManager.playSound("smashBottleSound");
        }

        // 2. Bottle trifft Enemy
        this.level.enemies.forEach((enemy, index) => {
            if (bottle.isColliding(enemy) && !bottle.objectHit) {
                let currenIndex = index;
                bottle.objectHit = true;
                bottle.isFlying = false;
                this.audioManager.playSound("smashBottleSound");
                if (enemy.height > 50) {
                    this.audioManager.playSound("chickenDeadSound");
                } else if (enemy.height <= 50) {
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

    triggerEarthquake(duration, intensity) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeStart = Date.now();
    }

    startIntervalls() {
        if (this.character.standingTimeBeforePause !== null) {
            this.character.firstStandingTime = Date.now() - this.character.standingTimeBeforePause;
        }
        
        this.checkCollisions();

        this.character.startIntervalls();
        this.level.endboss.startIntervalls();

        this.level.enemies.forEach((enemy) => {
            enemy.startIntervalls();
        });

        this.level.clouds.forEach((cloud) => {
            cloud.startIntervalls();
        });

        this.throwableObjects.forEach((object) => {
            object.startIntervalls();
        });
    }

    stopIntervalls() {
        if (Date.now() - this.character.firstStandingTime < 8000) {
            this.character.standingTimeBeforePause = Date.now() - this.character.firstStandingTime;
            this.character.firstStandingTime = Date.now() + 100000000
        } else {
            this.character.standingTimeBeforePause = null
        }
        this.intervalIds.forEach((intervalId) => clearInterval(intervalId));
        this.intervalIds = [];

        this.character.stopIntervalls();
        this.level.endboss.stopIntervalls();

        this.level.enemies.forEach((enemy) => {
            enemy.stopIntervalls();
        });

        this.level.clouds.forEach((cloud) => {
            cloud.stopIntervalls();
        });

        this.throwableObjects.forEach((object) => {
            object.stopIntervalls();
        });
    }
}