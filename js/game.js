let canvas;
let world;
let keyboard = new Keyboard();
let gameState = new GameState();
let isPaused = false;

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard, gameState);

    document.querySelector(".start-button").addEventListener("click", () => {
        gameState.isGameStarted = true;
        document.getElementById("startScreen").style.display = "none";
        document.getElementById("gameControls").classList.remove("d-none");
    });

    document.getElementById("pauseButton").addEventListener("click", () => {
        isPaused = !isPaused;

        world.level.enemies.forEach((enemy) => {
            if (isPaused) {
                enemy.stopIntervalls();
            } else {
                enemy.startIntervalls();
            }
        });
    });
}


document.addEventListener("keydown", (event) => {
    if (event.key == "ArrowUp") {
        keyboard.UP = true;
    } 
    if (event.key == "ArrowRight") {
         keyboard.RIGHT = true;
    } 
    if (event.key == "ArrowLeft") {
         keyboard.LEFT = true;
    } 
    if (event.key == " "){
        keyboard.SPACE = true;
    }
    if (event.key == "f"){
        keyboard.F = true;
    }
})

document.addEventListener("keyup", (event) => {
    if (event.key == "ArrowUp") {
        keyboard.UP = false;
    }
    if (event.key == "ArrowRight") {
        keyboard.RIGHT = false;
    }
    if (event.key == "ArrowLeft") {
        keyboard.LEFT = false;
    }
    if (event.key == " ") {
        keyboard.SPACE = false;
    }
    if (event.key == "f"){
        keyboard.F = false;
    }
})

window.onload = init;
