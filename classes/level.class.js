class Level {
    enemies;
    backgroundObjects;
    clouds;
    coins;
    bottles;
    endboss;
    levelStartX = 0;
    levelEndX = 3750;

    constructor(enemies, backgroundObjects, clouds, coins, bottles, endboss) {
       this.enemies = enemies;
       this.backgroundObjects = backgroundObjects;
       this.clouds = clouds;
       this.coins = coins;
       this.bottles = bottles;
       this.endboss = endboss;
    }

}