const gameCells = document.querySelectorAll('.gamecell');
const resetButton = document.querySelector('main button');

// Function to create a player object
const Player = (name, symbol) => ({ getSymbol: () => symbol, getName: () => name });

// Initialize players with default names
const player1 = Player('Player X', 'X');
const player2 = Player('Player O', 'O');

// Game Initialization
gameInitialization(player1, player2);

function gameInitialization(player1, player2) {
    const gameBoard = (() => {
        let gameBoardArray = Array(9).fill(null);

        const addToArray = (symbol, position) => gameBoardArray[position] = symbol;
        const clearArray = () => gameBoardArray.fill(null);
        const getRows = () => [gameBoardArray.slice(0, 3), gameBoardArray.slice(3, 6), gameBoardArray.slice(6)];
        const getColumns = () => [0, 1, 2].map(i => [gameBoardArray[i], gameBoardArray[i+3], gameBoardArray[i+6]]);
        const getDiagonals = () => [[gameBoardArray[0], gameBoardArray[4], gameBoardArray[8]], [gameBoardArray[2], gameBoardArray[4], gameBoardArray[6]]];
        
        const checkWinner = () => {
            const lines = [...getRows(), ...getColumns(), ...getDiagonals()];
            for (let line of lines) {
                if (line.every(cell => cell && cell === line[0])) return { winnerSymbol: line[0], hasSomeoneWon: true };
            }
            return { tie: gameBoardArray.every(Boolean), hasSomeoneWon: false };
        };

        return { addToArray, clearArray, checkWinner };
    })();
    
    const displayController = (() => {
        const playerTurnTitle = document.querySelector('main p');
        const winnerDialog = document.querySelector('.result-dialog');
        const winnerDialogMessage = winnerDialog.querySelector('h1');

        winnerDialog.addEventListener('click', (e) => e.target === winnerDialog && winnerDialog.close());

        return {
            addPlayerSymbol: (target, symbol) => target.textContent = symbol,
            changePlayerTurnTitle: (message) => playerTurnTitle.textContent = message,
            showResultDialog: (message) => { winnerDialogMessage.textContent = message; winnerDialog.showModal(); },
            cleanGameboard: () => gameCells.forEach(cell => cell.textContent = '')
        };
    })();
    
    const game = ((firstPlayer, secondPlayer) => {
        let currentPlayer = firstPlayer, gameEnded = false;

        displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);

        const makeMove = (cell, player) => {
            if (cell.textContent) return true;
            displayController.addPlayerSymbol(cell, player.getSymbol());
            gameBoard.addToArray(player.getSymbol(), cell.dataset.position);
        };

        const processResult = () => {
            const { hasSomeoneWon, winnerSymbol, tie } = gameBoard.checkWinner();
            if (hasSomeoneWon) {
                displayController.showResultDialog(`${winnerSymbol === player1.getSymbol() ? player1.getName() : player2.getName()} Wins!`);
                return true;
            }
            if (tie) {
                displayController.showResultDialog(`It's a Tie`);
                return true;
            }
        };

        const changeTurn = () => {
            currentPlayer = currentPlayer === firstPlayer ? secondPlayer : firstPlayer;
            displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);
        };

        const doPlayerTurn = (e) => {
            if (gameEnded || makeMove(e.target, currentPlayer)) return;
            gameEnded = processResult();
            if (!gameEnded) changeTurn();
        };

        const cleanGame = () => {
            displayController.cleanGameboard();
            gameBoard.clearArray();
            gameEnded = false;
            displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);
        };

        return { doPlayerTurn, cleanGame };
    })(player1, player2);
    
    resetButton.addEventListener('click', game.cleanGame);
    gameCells.forEach(cell => cell.addEventListener('click', game.doPlayerTurn));
}
