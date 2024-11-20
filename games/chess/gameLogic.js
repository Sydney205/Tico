const gameStates = {};

const initializeGameState = () => {
  return {
    squares: [
      'BR', 'BKn', 'BSh','BK', 'BQ', 'BSh', 'BKn', 'BR',
      'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP',
      
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '', '', 
      
      'WP', 'WP', 'WP','WP', 'WP', 'WP', 'WP', 'WP',
      'WR', 'WKn', 'WSh', 'WK', 'WQ', 'WSh', 'WKn', 'WR'
    ],
    currentPlayer: 'W'
  }
};

module.exports = { gameStates, initializeGameState };
