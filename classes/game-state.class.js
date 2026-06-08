/**
 * Tiny holder for global game state shared across the app. Currently just tracks whether
 * the game has started, which the controls and render loop check before reacting to input.
 */
class GameState {
    isGameStarted = false;
}