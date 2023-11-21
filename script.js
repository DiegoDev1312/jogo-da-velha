const allCells = document.querySelectorAll('[data-cell]');
const playerName = document.querySelector('[data-player]');
const xScore = document.querySelector('[data-x-score]');
const circleScore = document.querySelector('[data-circle-score]');
const playAgainButton = document.querySelector('[data-play-again-button]');
const restartGame = document.querySelector('[data-restart-button]');
const body = document.querySelector('body');
const selectedPlayerArea = document.querySelector('[data-selected-player]');
const playerButton = document.querySelectorAll('[data-player-button]');
const versusButton = document.querySelectorAll('[data-versus-button]');
const versusArea = document.querySelector('[data-versus-area]');
const gameArea = document.querySelector('[data-game-area]');

const state = {
    values: {
        initialPlayer: 'X',
        playerXScore: 0,
        playerOScore: 0,
        countGames: 1,
        iaPlayer: false,
    },
};
const winningCodition = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 4, 6],
    [2, 5, 8],
];

// game options

// função para tratar quando for jogar outra partida.
function handlePlayAgain() {
    state.values.initialPlayer = 'X';
    for (const cell of allCells) {
        cell.innerHTML = '';
        cell.style.backgroundColor = 'transparent';
        cell.style.pointerEvents = 'all';
    }
}

function handleRestart() {
    location.reload(location.href);
}

// iniciar o game
function startGame() {
    textByType(`Vez do ➙ ${state.values.initialPlayer}`);
    for (const cell of allCells) {
        cell.addEventListener('click', handleCellClick);
    }
}

// pegar opção do player selecionado
function selectedPlayerOption() {
    versusArea.style.display = 'flex';
    for (const selectedVersus of versusButton) {
        selectedVersus.addEventListener('click', () => {
            if (selectedVersus.attributes['data-versus-button'].value === 'ia') {
                state.values.iaPlayer = true;
                versusArea.style.display = 'none';
                gameArea.style.display = 'flex';
            } else {
                versusArea.style.display = 'none';
                gameArea.style.display = 'flex';
            }
            startGame();
        });
    }
}

// primeira função a ser executada, adicionando eventos no botão de player
function init() {
    for (const selectedPlayer of playerButton) {
        selectedPlayer.addEventListener('click', () => {
            state.values.initialPlayer = selectedPlayer.attributes['data-player-button'].value;
            selectedPlayerArea.classList.add('hide-menu');
            selectedPlayerOption()
        });
    }
}

// game functions
// condição para vitória
function checkCoditionWinner(currentPlayer, board) {
    return winningCodition.some((winning) => {
        return winning.every((index) => {
            return board[index].innerHTML === currentPlayer;
        });
    });
}

// caso saía um vencedor
function handleWinner(playerWinner) {
    const indexCellVictory = winningCodition.findIndex((winning) => {
        return winning.every((value) => allCells[value].innerHTML === playerWinner);
    });
    winningCodition[indexCellVictory].forEach((value) => {
        allCells[value].style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
    });
}

// caso saía empate
function handleDraw() {
    for (const cell of allCells) {
        cell.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    }
}

// condição para checar empate
function checkIsDraw() {
    return [...allCells].every((value) => {
        return value.innerHTML;
    });
}

// mudando texto de acordo com o vencedor
function changeTextScore(playerWinner) {
    if (playerWinner === 'O') {
        state.values.playerOScore++;
        circleScore.textContent = `O: ${state.values.playerOScore}`;
    } else {
        state.values.playerXScore++;
        xScore.textContent = `X: ${state.values.playerXScore}`;
    }
}

// condição para texto ganhador
function renderByWinner() {
    handleWinner(state.values.initialPlayer);
    textByType(`Vitória do: ${state.values.initialPlayer}!`);
    changeTextScore(state.values.initialPlayer);
}

// condição para texto empate
function renderByDrawer() {
    handleDraw();
    textByType(`Deu velha!!!`);
}

// desabilitar todos os cliques nas cédulas
function disableAllClickCells() {
    for (const cell of allCells) {
        cell.style.pointerEvents = 'none';
    }
}

// checando as condições do jogo
function checkCoditionGame(selectedCell, moveIa) {
    selectedCell.style.pointerEvents = 'none';
    const isWinner = checkCoditionWinner(state.values.initialPlayer, allCells);
    const isDraw = checkIsDraw();

    if (isWinner) {
        renderByWinner();
        disableAllClickCells();
    } else if (isDraw) {
        renderByDrawer();
        disableAllClickCells();
    } else {
        state.values.initialPlayer = state.values.initialPlayer === 'X' ? 'O' : 'X';
        textByType(`Vez do ➙ ${state.values.initialPlayer}`);
        if (state.values.iaPlayer && !moveIa) {
            body.style.pointerEvents = 'none';
            setTimeout(() => {
                handlePlayIa();
            }, 500);
        }
    }
}

// tratando evento de clique na célula
function handleCellClick() {
    this.textContent = state.values.initialPlayer === 'X' ? 'X' : 'O';
    this.style.pointerEvents = 'none';
    checkCoditionGame(this);
}

function textByType(text) {
    playerName.textContent = text;
}

// IA Player
// pegando as células 
function getEmptyCells(board) {
    return [...board].filter(cell => cell.innerHTML === '');
}

// pegando melhor posição na célula para jogar
function minimax(board, depth, maximizingPlayer) {
    const emptyCells = getEmptyCells(board);

    if (checkCoditionWinner('X', board)) {
        return -10 + depth;
    } else if (checkCoditionWinner('O', board)) {
        return 10 - depth;
    } else if (emptyCells.length === 0) {
        return 0;
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const cell of emptyCells) {
            cell.innerHTML = 'O';
            maxEval = Math.max(maxEval, minimax(board, depth + 1, false));
            cell.innerHTML = '';
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const cell of emptyCells) {
            cell.innerHTML = 'X';
            minEval = Math.min(minEval, minimax(board, depth + 1, true));
            cell.innerHTML = '';
        }
        return minEval;
    }
}

// procurando melhor movimento
function findBestMove() {
    const emptyCells = getEmptyCells(allCells);
    let bestMove = -Infinity;
    let bestCell;

    for (const cell of emptyCells) {
        cell.innerHTML = 'O';
        const moveValue = minimax(allCells, 0, false);
        cell.innerHTML = '';

        if (moveValue > bestMove) {
            bestMove = moveValue;
            bestCell = cell;
        }
    }

    return bestCell;
}

// função executada quando é a vez da IA
function handlePlayIa(initGame) {
    const bestMoveCell = findBestMove();

    if (bestMoveCell) {
        bestMoveCell.textContent = state.values.initialPlayer === 'X' ? 'X' : 'O';
        textByType(`Vez do ➙ ${state.values.initialPlayer}`);
        checkCoditionGame(bestMoveCell, true);
    }
    body.style.pointerEvents = 'all';
}

// base functions
init();
playAgainButton.addEventListener('click', handlePlayAgain);
restartGame.addEventListener('click', handleRestart);
