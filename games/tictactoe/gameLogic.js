export const gameStates = {};

export const initializeGameState = () => {
  return {
    cells: Array(9).fill(null),
    currentPlayer: 'X'
    // isPlayerTurn: true
  };
};

