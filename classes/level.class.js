/**
 * Container for everything that makes up a level: the enemy list, parallax background
 * layers, clouds, coins, bottles and the endboss, plus the horizontal bounds the
 * character and camera are clamped to. Populated by the level factory (createLevel).
 */
class Level {
    enemies;
    backgroundObjects;
    clouds;
    coins;
    bottles;
    endboss;
    levelStartX = -700;
    levelEndX = 3750;

    /**
     * Stores the level's enemies, background layers, clouds, coins, bottles and endboss.
     * @param {MovableObject[]} enemies The level's enemies.
     * @param {BackgroundObject[]} backgroundObjects The parallax background layers.
     * @param {Cloud[]} clouds The decorative clouds.
     * @param {Coin[]} coins The collectable coins.
     * @param {Bottle[]} bottles The collectable bottles.
     * @param {Endboss} endboss The level's endboss.
     */
    constructor(enemies, backgroundObjects, clouds, coins, bottles, endboss) {
       this.enemies = enemies;
       this.backgroundObjects = backgroundObjects;
       this.clouds = clouds;
       this.coins = coins;
       this.bottles = bottles;
       this.endboss = endboss;
    }
}