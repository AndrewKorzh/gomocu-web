function setGameAreaSize() {
    const minSide = Math.min(window.innerWidth, window.innerHeight) - 20;
    const gameArea = document.getElementById("game-area");
    gameArea.style.width = minSide + "px";
    gameArea.style.height = minSide + "px";
}

function applySettings() {
    const fieldSize = document.getElementById("field-size").value;
    const targetLength = document.getElementById("target-length").value;

    localStorage.setItem('fieldSize', fieldSize);
    localStorage.setItem('targetLength', targetLength);

    fetch('/game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fieldSize: fieldSize, targetLength: targetLength })
    })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then(data => {
            window.location.href = '/game';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

window.onload = setGameAreaSize;
window.onresize = setGameAreaSize;