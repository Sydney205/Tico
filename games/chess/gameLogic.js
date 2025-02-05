export const gameStates = {};

export const initializeGameState = () => {
  return {
    squares: ['BR', 'BN', 'BSh', 'BK', 'BQ', 'BSh', '', 'BR', '', 'BP', '', '', 'BP', 'BP', 'BP', 'BP', 'BP', '', '', '', '', '', '', '', '', '', 'WQ', 'BP', '', '', '', '', '', '', '', '', '', 'WSh', 'BN', '', '', '', '', 'WP', '', '', '', '', 'WP', 'WP', 'WP', '', 'WP', 'WP', 'WP', 'WP', 'WR', 'WN', '', 'WK', '', 'WSh', 'WN', 'WR'],
    currentPlayer: 'W'
  }
};


// [
//       'BR', 'BN', 'BSh','BK', 'BQ', 'BSh', 'BN', 'BR',
//       'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP',
      
//       '', '', '', '', '', '', '', '',
//       '', '', '', '', '', '', '', '',
//       '', '', '', '', '', '', '', '',
//       '', '', '', '', '', '', '', '', 
      
//       'WP', 'WP', 'WP','WP', 'WP', 'WP', 'WP', 'WP',
//       'WR', 'WN', 'WSh', 'WK', 'WQ', 'WSh', 'WN', 'WR'
//     ]
