class MovableObject {
    x;
    y;
    width;
    height;
    img;

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }
}