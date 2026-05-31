class Bottle extends DrawableObject {
    width = 50;
    height = 75;

    offset = {
        top: 5,
        bottom: 5,
        left: 10,
        right: 10
    }
    
    IMAGES = [
        "assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
        "assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png",
        "assets/img/6_salsa_bottle/salsa_bottle.png"
    ]

    constructor(x, y) {
        super().loadImage("assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png");
        this.loadImages(this.IMAGES);
        this.selectCorrectBottle(y);
        this.collectableObjectPlacement(x, y); 
    }

    selectCorrectBottle(y) {
        if (y >= 250) {
            let bottleOnGroundIndex = Math.round(Math.random())
            let path = this.IMAGES[bottleOnGroundIndex];
            this.img = this.imageCache[path];   
        } else {
            let bottleAboveGroundIndex = 2;
            let path = this.IMAGES[bottleAboveGroundIndex];
            this.img = this.imageCache[path];   
        }
        
    }

}