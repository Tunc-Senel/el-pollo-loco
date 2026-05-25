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
    bossTriggered = false;

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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        this.addObjectToMap(this.healthBar);
        this.addObjectToMap(this.coinBar);
        this.addObjectToMap(this.bottleBar);
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
            this.character.inputDisabled = false;
        }
    }

    checkBossAlertProgress() {
        if (this.level.endboss.state === 'alert' && Date.now() - this.level.endboss.alertStart >= 1500) {
            this.level.endboss.centerTarget = -this.camera_x + 260;
            this.level.endboss.state = 'jumping_to_center';
            this.level.endboss.jump();
        }

        if (this.level.endboss.state === 'jumping_to_center' && !this.level.endboss.isAboveGround() && this.level.endboss.speedY <= 0) {
            this.level.endboss.state = 'fighting';
        }
    }

    checkBossAttack() {
        let distanceToCharacter = Math.abs(this.level.endboss.x - this.character.x);

        if (this.level.endboss.state === 'fighting' && distanceToCharacter < 350) {
            this.level.endboss.state = 'attacking';

            setTimeout(() => {
                if (this.level.endboss.state === 'attacking') {
                    this.level.endboss.state = 'fighting';
                }
            }, 1000);
        }
    }
        
}