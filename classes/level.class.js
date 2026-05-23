class Level {
    enemies;
    backgroundObjects;
    clouds;
    coins;
    bottles;
    endboss;
    levelStartX = 0;
    levelEndX = 4200;

    constructor(enemies, backgroundObjects, clouds, coins, bottles, endboss) {
       this.enemies = enemies;
       this.backgroundObjects = backgroundObjects;
       this.clouds = clouds;
       this.coins = coins;
       this.bottles = bottles;
       this.endboss = endboss;
    }

}