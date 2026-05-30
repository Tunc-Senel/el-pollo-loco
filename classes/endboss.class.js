class Endboss extends MovableObject {
    width = 200;
    height = 200;
    groundY = 230;
    energy = 100;
    speed = 3;
    state = 'hidden';
    world = null;
    walkTarget = 0;
    centerTarget = 0;
    alertStart = 0;
    currentImage = 0;
    attackOnCooldown = false;
    hasJumpedToAttack = false;

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

    IMAGES_ATTACK = [
        'assets/img/4_enemie_boss_chicken/3_attack/G13.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G14.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G15.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G16.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G17.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G18.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G19.png',
        'assets/img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    IMAGES_HURT = [
        'assets/img/4_enemie_boss_chicken/4_hurt/G21.png',
        'assets/img/4_enemie_boss_chicken/4_hurt/G22.png',
        'assets/img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    IMAGES_DEAD = [
        'assets/img/4_enemie_boss_chicken/5_dead/G24.png',
        'assets/img/4_enemie_boss_chicken/5_dead/G25.png',
        'assets/img/4_enemie_boss_chicken/5_dead/G26.png'
    ];


    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
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
            } else if (this.state === 'walking_to_fight_position') {
                this.playAnimation(this.IMAGES_WALKING);
            } else if (this.state === 'fighting') {
                this.playAnimation(this.IMAGES_WALKING);
            } else if (this.state === 'attacking') {
                this.playAnimation(this.IMAGES_ATTACK);
            } else if (this.state === 'hurt') {
                this.playAnimation(this.IMAGES_HURT);
            } else if (this.state === 'dead') {
                this.playAnimation(this.IMAGES_DEAD);
            }
        }, 200);
    }

    jump() {
        this.speedY = 25;
    }

    bossHit() {
        this.energy -= 20;
        this.state = 'hurt';

        if (this.energy <= 0) {
            this.state = 'dead';
            this.world.endScreen.wonGame = true;
            return;
        }

        setTimeout(() => {
            if (this.state === 'hurt') {
                this.state = 'fighting';
            }
        }, 500);
    }

}
 