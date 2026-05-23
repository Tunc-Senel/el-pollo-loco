class Endboss extends MovableObject {
    width = 250;
    height = 400;
    groundY = 55;
    energy = 100;
    world = null;
    currentImage = 0;

    offset = {
        top: 70,
        bottom: 25,
        left: 30,
        right: 20
    };

    IMAGES_WALKING = [
        'assets/img/4_enemie_boss_chicken/1_walk/G1.png',
        'assets/img/4_enemie_boss_chicken/1_walk/G2.png',
        'assets/img/4_enemie_boss_chicken/1_walk/G3.png',
        'assets/img/4_enemie_boss_chicken/1_walk/G4.png'
    ];


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.x = 4000;
        this.y = this.groundY;
    }

}
 