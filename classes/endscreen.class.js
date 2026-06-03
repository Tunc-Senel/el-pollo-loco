class Endscreen{
    lostGame = false;
    wonGame = false;
    currentScreen = null;

    IMAGES = {
        win: 'assets/img/You won, you lost/You won A.png',
        lose: 'assets/img/You won, you lost/Game Over.png'
    };

    show(type) {
        if (this.currentScreen === type) {
            return;
        }

        this.currentScreen = type;

        const overlay = document.getElementById("endScreenOverlay");
        const image = document.getElementById("endScreenImage");

        image.src = this.IMAGES[type];
        overlay.classList.remove("d-none");
        document.getElementById("gameControls").classList.add("d-none");
    }

}