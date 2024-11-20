const gameStates = {};

const initializeGameState = () => {
  return {
    cells: Array(9).fill(null),
    currentPlayer: 'X'
    // isPlayerTurn: true
  };
};

module.exports = { gameStates, initializeGameState };
