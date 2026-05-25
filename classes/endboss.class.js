class Endboss extends MovableObject {
    width = 250;
    height = 400;
    groundY = 55;
    energy = 100;
    speed = 3;
    state = 'hidden';
    world = null;
    walkTarget = 0;
    centerTarget = 0;
    alertStart = 0;
    currentImage = 0;

    offset = {
        top: 70,
        bottom: 25,
        left: 30,
        right: 20
    };

    IMAGES_ALERT = [
        'assets/img/4_enemie_boss_chicken/2_alert/G5.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G6.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G7.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G8.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G9.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G10.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G11.png',
        'assets/img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    IMAGES_WALKING = [
        'assets/img/4_enemie_boss_chicken/1_walk/G1.png',
        'assets/img/4_enemie_boss_chicken/1_walk/G2.png',
        'assets/img/4_enemie_boss_chicken/1_walk/G3.png',
        'assets/img/4_enemie_boss_chicken/1_walk/G4.png'
    ];


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALKING);
        this.y = this.groundY;
        this.applyGravity();
        this.animate();
    }

    animate() {
        setInterval(() => {
            if (this.state === 'walking_in') {
                this.moveLeft();
            } else  if (this.state === 'jumping_to_center' && this.isAboveGround()) {
                if (this.x > this.centerTarget) {
                    this.x -= 4;
            }
    }
        }, 1000 / 60);

        setInterval(() => {
            if (this.state === 'walking_in') {
                this.playAnimation(this.IMAGES_WALKING);
            } else if (this.state === 'alert') {
                this.playAnimation(this.IMAGES_ALERT);
            } else if (this.state === 'jumping_to_center') {
                this.playAnimation(this.IMAGES_WALKING);
            } else if (this.state === 'fighting') {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 200);
    }

    jump() {
        this.speedY = 25;
    }

}
 