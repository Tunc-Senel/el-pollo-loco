class World {
    level = level1;
    character = new Character();
    canvas;
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
    shakeIntensity = 0;
    shakeDuration = 0;
    shakeStart = 0;
    endScreen = new Endscreen();

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.draw();
        this.setworld();
        this.checkCollisions();
    }

    setworld() {
        this.character.world = this;
        this.level.endboss.world = this;
    }

    draw() {
        if (!this.endScreen.lostGame && !this.endScreen.wonGame) {
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

            this.ctx.translate(this.camera_x, 0);
            this.addObjectsToMap(this.level.backgroundObjects);
            this.addObjectsToMap(this.level.clouds);
            this.addObjectsToMap(this.level.coins);
            this.addObjectsToMap(this.level.bottles);
            this.addObjectToMap(this.character);
            this.addObjectsToMap(this.level.enemies);

            if (this.bossTriggered) {
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
        }

        if (this.endScreen.lostGame || this.endScreen.wonGame) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (this.endScreen.lostGame) {
                this.endScreen.show("lose");
            } else if (this.endScreen.wonGame) {
                this.endScreen.show("win");
            }

            this.addObjectToMap(this.endScreen);
        }

        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
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
            this.checkBossAttack();
            this.checkEndbossBottleCollisions();
            this.checkEndbossStomp();
            this.checkEndbossCollision();
        }, 1000 / 60);
    }
    

    checkEnemyCollisions() {
        this.level.enemies = this.level.enemies.filter((enemy, index) => {
            if (!this.character.hasStompedEnemyInThisJump && this.character.isJumpingOnEnemyHead(enemy) && this.character.speedY < 0) {
                let currenIndex = index;
                this.character.jump();
                enemy.isDeadByStomp = true;
                this.character.hasStompedEnemyInThisJump = true;
                this.character.firstStandingTime = null;
                setTimeout(() => {
                    this.level.enemies.splice(currenIndex, 1)
                }, 500);
            } else if (this.character.isColliding(enemy)) {
                this.character.hit();
                this.healthBar.setPercentage(this.character.energy);
            }
            return true;
        });
        if (this.character.canStompEnemyAgain()) {
            this.character.hasStompedEnemyInThisJump = false;
        }
    }

    checkCoinCollisions() {
        this.level.coins = this.level.coins.filter((coin) => {
            if (this.character.isColliding(coin)) {
                this.coinBar.setPercentage(this.coinBar.percentage + 20)
                return false;
            }
            return true;
        });
    }

    checkBottleCollisions() {
        this.level.bottles = this.level.bottles.filter((bottle) => {
            if (this.character.isColliding(bottle)) {
                this.bottleBar.setPercentage(this.bottleBar.percentage + 20)
                return false;
            }
                return true;
        });
    }

    checkThrowObjects() {   
        if (this.keyboard.F && this.canThrow) {
            this.canThrow = false;
            this.bottleBar.setPercentage(this.bottleBar.percentage -= 20);
            let bottle = new ThrowableObject(this.character.x + 100, this.character.y + 100);
            this.throwableObjects.push(bottle);
            this.character.firstStandingTime = null;
        }

        this.throwableObjects.forEach((bottle) => {
        // 1. Bottle trifft Bodenf
        if (bottle.y >= 340 && !bottle.objectHit) {
            bottle.objectHit = true;
        }

        // 2. Bottle trifft Enemy
        this.level.enemies.forEach((enemy, index) => {
            if (bottle.isColliding(enemy) && !bottle.objectHit) {
                let currenIndex = index;
                bottle.objectHit = true;
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
            this.bossTriggered = true;
            this.startBossIntro();
            this.character.lockCameraOnBoss = true;
            this.level.levelStartX = 3100;
        }
    }

    startBossIntro() {
        let visibleRight = -this.camera_x + 720;
        this.character.inputDisabled = true;

        this.level.endboss.x = visibleRight + 100;
        this.level.endboss.walkTarget = visibleRight - this.level.endboss.width - 30;
        this.level.endboss.state = 'walking_in';
        this.level.endboss.speed = 4;
    }

    checkBossIntroProgress() {
        if (this.level.endboss.state === 'walking_in' && this.level.endboss.x <= this.level.endboss.walkTarget) {
            this.level.endboss.x = this.level.endboss.walkTarget;
            this.level.endboss.state = 'alert';
            this.level.endboss.alertStart = Date.now();
            this.level.endboss.speed = 0;
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
            this.level.endboss.state = 'fighting';
            this.level.endboss.speed = 1.5;
            this.character.inputDisabled = false;
            this.triggerEarthquake(800, 20);
        }
    }

    checkBossAttack() {
        let distanceToCharacter = Math.abs(this.level.endboss.x - this.character.x);

        if (
            this.level.endboss.state === 'fighting' &&
            distanceToCharacter < 100 &&
            !this.level.endboss.attackOnCooldown
        ) {
            this.level.endboss.attackOnCooldown = true;
            this.level.endboss.state = 'attacking';

            setTimeout(() => {
                if (this.level.endboss.state === 'attacking') {
                    this.level.endboss.state = 'fighting';
                }
            }, 1000);

            setTimeout(() => {
                this.level.endboss.attackOnCooldown = false;
            }, 3000);
        }
    }

    checkEndbossBottleCollisions() {
        this.throwableObjects.forEach((bottle) => {
            if (this.level.endboss.state !== 'dead' && bottle.isColliding(this.level.endboss) && !bottle.objectHit) {
                this.level.endboss.bossHit();
                bottle.objectHit = true;
                this.endbossHealthBar.setPercentage(this.level.endboss.energy);
            }
        });
    }

    checkEndbossStomp() {
        if (this.level.endboss.state !== 'dead' &&
            this.level.endboss.state !== 'hidden' &&
            !this.character.hasStompedEndbossInThisJump &&
            this.character.isJumpingOnEnemyHead(this.level.endboss) &&
            this.character.speedY < 0
        ) {
            this.character.jumpAfterEndbossStomp();
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
            this.healthBar.setPercentage(this.character.energy);
        }
    }

    triggerEarthquake(duration, intensity) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeStart = Date.now();
    }
        
}