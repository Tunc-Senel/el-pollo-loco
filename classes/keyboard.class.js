/**
 * Tracks which control keys are currently held. The input handlers in game.js set these
 * flags on keydown/keyup (and the touch buttons toggle them too), and the character reads
 * them each frame to decide how to move.
 */
class Keyboard {
    UP = false;
    RIGHT = false;
    LEFT = false;
    SPACE = false;
    F = false;
}