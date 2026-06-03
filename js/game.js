let canvas;
let world;
let keyboard;
let gameState;
let isPaused = false;
let audioManager;

function init() {
    document.querySelector(".start-button").addEventListener("click", () => {
        startGame();
    });

    document.getElementById("restartButton").addEventListener("click", () => {
        restartGame();
    });

    document.getElementById("pauseButton").addEventListener("click", () => {
        togglePause();
    });
}

function startGame() {
    canvas = document.getElementById("canvas");
    keyboard = new Keyboard();
    gameState = new GameState();
    audioManager = new AudioManager();
    world = new World(canvas, keyboard, gameState, audioManager);

    gameState.isGameStarted = true;
    isPaused = false;

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("endScreenOverlay").classList.add("d-none");
    document.getElementById("gameControls").classList.remove("d-none");
}

function restartGame() {
    location.reload();
}

function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        world.stopIntervalls();
    } else {
        world.startIntervalls();
    }
}


document.addEventListener("keydown", (event) => {
    if (!keyboard) return;

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
    if (!keyboard) return;
    
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
