/**
 * Manages the win/lose end screen overlay. Stores which outcome occurred and, when shown,
 * swaps in the matching image, reveals the overlay and hides the in-game controls. The
 * currentScreen guard makes show() idempotent, so the render loop can call it every frame.
 */
class Endscreen {
    lostGame = false;
    wonGame = false;

    /**
     * The screen currently displayed ("win"/"lose"/null); prevents re-applying the same screen.
     */
    currentScreen = null;

    /**
     * End screen images keyed by outcome.
     */
    IMAGES = {
        win: 'assets/img/You won, you lost/You won A.png',
        lose: 'assets/img/You won, you lost/Game Over.png'
    };

    /**
     * Shows the end screen for the given outcome ("win" or "lose"): sets the image, reveals
     * the overlay and hides the controls. Does nothing if that screen is already showing.
     */
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