const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");


let gridSize = localStorage.getItem("fieldSize");
gridSize = parseInt(gridSize);
if (isNaN(gridSize)) {
    gridSize = 15;
}
let targetLength = localStorage.getItem("targetLength");
targetLength = parseInt(targetLength);
if (isNaN(targetLength)) {
    targetLength = 5;
}

let cellSize = 10;

let grid = loadFromLocalStorage() || createGameField(gridSize);

if (grid.length != gridSize) {
    gridSize = grid.length;
    alert("Размер доски сохранённой игры не совпадает с выбранным значением! Для начала новой игры нажмите Start на домашней странице.");
}

function loadFromLocalStorage() {
    console.log("loadFromLocalStorage")
    const grid = localStorage.getItem("gameField");
    console.log(grid)
    return grid ? JSON.parse(grid) : null;
}
function saveToLocalStorage(grid) {
    localStorage.setItem("gameField", JSON.stringify(grid));
}

function createGameField(size) {
    const gameField = Array.from({ length: size }, () => Array(size).fill("-"));
    return gameField;
}

function getCellAtPosition(x, y) {
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    return { cellX, cellY };
}

function handleClick(event) {
    let gameStatus = endOfGame(grid);
    if (gameStatus.status != "ongoing") {
        canvas.removeEventListener("click", handleClick);
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { cellX, cellY } = getCellAtPosition(x, y);
    console.log(`Нажата ячейка: X=${cellX}, Y=${cellY}`);

    if (grid[cellY][cellX] == "-") {
        grid[cellY][cellX] = "1";
        drawGrid(grid);
        let gameStatus = endOfGame(grid);
        console.log(gameStatus)
        if (gameStatus.status != "ongoing") {
            canvas.removeEventListener("click", handleClick);
            localStorage.setItem("gameField", JSON.stringify(grid));
            setTimeout(() => {
                if (gameStatus.status == "win") {
                    alert(`Вы выиграли!`);
                } else {
                    alert(`Ничья!`);
                }
            }, 100);
            return;
        }

        fetch('/updateGame', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ grid: grid, targetLength: targetLength })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(updatedGrid => {
                grid = updatedGrid;
                drawGrid(grid);
                let gameStatus = endOfGame(grid);
                localStorage.setItem("gameField", JSON.stringify(grid));
                if (gameStatus.status != "ongoing") {
                    canvas.removeEventListener("click", handleClick);
                    setTimeout(() => {
                        if (gameStatus.status == "win") {
                            alert(`Вы проиграли :(`);
                        } else {
                            alert(`Ничья!`);
                        }
                    }, 100);
                    return;
                }

            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

};

function endOfGame(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const maxSteps = rows * cols;

    function checkDirection(x, y, dx, dy, player) {
        let count = 0;
        for (let i = 0; i < targetLength; i++) {
            const newX = x + dx * i;
            const newY = y + dy * i;
            if (newX >= 0 && newX < rows && newY >= 0 && newY < cols && grid[newX][newY] === player) {
                count++;
            } else {
                break;
            }
        }
        return count === targetLength;
    }
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            const player = grid[x][y];
            if (player === "-") {
                continue;
            }

            if (
                checkDirection(x, y, 0, 1, player) ||
                checkDirection(x, y, 1, 0, player) ||
                checkDirection(x, y, 1, 1, player) ||
                checkDirection(x, y, 1, -1, player)
            ) {
                return { status: 'win', player: player };
            }
        }
    }

    const totalSteps = grid.flat().filter(cell => cell !== "-").length;
    if (totalSteps >= maxSteps) {
        return { status: 'draw' };
    }

    return { status: 'ongoing' };
}

function drawGrid(grid) {

    cellSize = canvas.width / (gridSize);
    console.log(cellSize)


    context.clearRect(0, 0, canvas.width, canvas.height);


    for (let i = 1; i <= gridSize - 1; i++) {
        context.moveTo(i * cellSize, 0);
        context.lineTo(i * cellSize, canvas.width);
        context.moveTo(0, i * cellSize);
        context.lineTo(canvas.height, i * cellSize);
    }

    context.stroke();

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const x = j * cellSize + cellSize / 2;
            const y = i * cellSize + cellSize / 2;
            if (grid[i][j] === "1") {
                drawOval(x, y, "white", cellSize);
            } else if (grid[i][j] === "2") {
                drawOval(x, y, "black", cellSize);
            }
        }
    }
}

function drawOval(x, y, color, cellSize) {
    const ovalRadius = cellSize / 4;
    context.beginPath();
    context.arc(x, y, ovalRadius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
}

function setGame() {
    let minSide;
    if (window.innerWidth + 40 > window.innerHeight) {
        minSide = window.innerHeight - 60;
        canvas.width = minSide;
        canvas.height = minSide;

    }
    else {
        minSide = window.innerWidth - 20;
        canvas.width = minSide;
        canvas.height = minSide;
    }

    drawGrid(grid);
    const gameArea = document.getElementById("game-area");
    gameArea.style.width = minSide + "px";
    gameArea.style.height = minSide + "px";

    canvas.addEventListener("click", handleClick);

}
function goHome() {
    window.location.href = '/';
}

window.onload = () => { setGame() };
window.onresize = () => { setGame() };