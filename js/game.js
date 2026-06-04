let canvas;
let world;
let keyboard;
let gameState;
let isPaused = false;
let audioManager;

function init() {
    document.querySelector(".start-button").addEventListener("click", () => {
        showLoadingAndStartGame(false);
    });

    document.getElementById("restartButton").addEventListener("click", () => {
        showLoadingAndStartGame(true);
    });

    document.getElementById("pauseButton").addEventListener("click", () => {
        togglePause();
    });
}

function showLoadingAndStartGame(isRestart = false) {
    const loadingScreen = document.getElementById("loadingScreen");
    const loadingText = document.getElementById("loadingText");

    document.getElementById("startScreen").style.display = "none";
    document.getElementById("endScreenOverlay").classList.add("d-none");

    loadingScreen.classList.remove("d-none");
    loadingText.innerText = "Loading... 0%";

    startGame(isRestart);

    let progress = 0;

    const loadingInterval = setInterval(() => {
        progress += 4;
        loadingText.innerText = `Loading... ${progress}%`;

        if (progress >= 100) {
            clearInterval(loadingInterval);

            setTimeout(() => {
                loadingScreen.classList.add("d-none");
            }, 200);
        }
    }, 20);
}

function startGame(isRestart = false) {
    canvas = document.getElementById("canvas");
    keyboard = new Keyboard();
    gameState = new GameState();
    audioManager = new AudioManager();
    world = new World(canvas, keyboard, gameState, audioManager);

    if (isRestart) {
        setTimeout(() => {
            world.character.y = 220;
            world.character.speedY = 0;
        }, 710);
     
    }

    gameState.isGameStarted = true;
    isPaused = false;
}

function restartGame() {
    startGame();
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
