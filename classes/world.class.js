class World {
    level = level1;
    character = new Character();
    canvas;
    ctx;
    keyboard;
    healthBar = new HealthBar();
    coinBar = new CoinBar();
    bottleBar = new BottleBar();
    throwableObjects = [];
    canThrow = true;

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
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.bottles);
        this.addObjectToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
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
        }, 1000 / 60);
    }
    

    checkEnemyCollisions() {
        this.level.enemies = this.level.enemies.filter((enemy) => {
            if (!this.character.hasStompedEnemyInThisJump && this.character.isJumpingOnEnemyHead(enemy)) {
                this.character.jump();
                this.character.hasStompedEnemyInThisJump = true;
                return false;
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
        }

        this.throwableObjects.forEach((bottle) => {
        // 1. Bottle trifft Bodenf
        if (bottle.y >= 340 && !bottle.objectHit) {
            bottle.objectHit = true;
        }

        // 2. Bottle trifft Enemy
        this.level.enemies.forEach((enemy) => {
            if (bottle.isColliding(enemy) && !bottle.objectHit) {
                bottle.objectHit = true;
                enemy.isDead = true;
                }
            });
        });

        this.throwableObjects = this.throwableObjects.filter((bottle) => {
            return !bottle.remove;
        });

        this.level.enemies = this.level.enemies.filter((enemy) => {
            return !enemy.isDead;
        });

        if (!this.keyboard.F) {
            this.canThrow = true;
        }
      
    }
        
}

// if (this.keyboard.F && this.canThrow && this.bottleBar.percentage > 0) {