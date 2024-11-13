function setGameAreaSize() {
    const minSide = Math.min(window.innerWidth, window.innerHeight) - 20;
    const gameArea = document.getElementById("game-area");
    gameArea.style.width = minSide + "px";
    gameArea.style.height = minSide + "px";
}

function startGame() {
    localStorage.clear();
    window.location.href = '/settings';
}

function continueGame() {
    const gameField = localStorage.getItem("gameField");
    const fieldSize = Number(localStorage.getItem("fieldSize"));
    const targetLength = Number(localStorage.getItem("targetLength"));

    if (gameField !== null && !isNaN(fieldSize) && !isNaN(targetLength)) {
        window.location.href = '/game';
    }
    else {
        alert(`Нет сохранённой игры...`);
        localStorage.clear();
        window.location.href = '/settings';
    }
}

window.onload = setGameAreaSize;
window.onresize = setGameAreaSize;