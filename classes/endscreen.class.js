class Endscreen extends DrawableObject {
    lostGame = false;
    wonGame = false;
    currentScreen = null;

    IMAGES = {
        win: 'assets/img/You won, you lost/You won A.png',
        lose: 'assets/img/You won, you lost/Game Over.png'
    };

    constructor() {
        super();
        this.x = 0;
        this.y = 0;
        this.width = 720;
        this.height = 480;
    }

    show(type) { 
        if (this.currentScreen !== type) {
            this.currentScreen = type;
            this.loadImage(this.IMAGES[type]);
        }
    }

}