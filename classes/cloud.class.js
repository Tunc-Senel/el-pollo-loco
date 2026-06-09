/**
 * A decorative cloud that drifts slowly left across the sky. Purely cosmetic; it has no
 * collisions. The random start offset spreads multiple clouds apart. Built on MovableObject.
 */
class Cloud extends MovableObject {
    y = 50;
    width = 500;
    height = 150;
    speed = 0.25;

    /**
     * Loads the cloud image, offsets its start position randomly and starts drifting.
     * @param {number} xPosition Base horizontal position the cloud is randomly offset from.
     */
    constructor(xPosition) {
        super().loadImage("assets/img/5_background/layers/4_clouds/1.png")
        this.x = xPosition + (Math.random() * 500);
        this.animate();
    }

    /**
     * Continuously moves the cloud left to create the drifting effect.
     */
    animate() {
        this.intervalIds.push(
            setInterval(() => {
                this.moveLeft();    
            }, 50)
        );
    }
}