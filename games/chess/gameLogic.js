export const gameStates = {};

export const initializeGameState = () => {
  return {
    squares: [
      'WR', 'WKn', 'WB', 'WK', 'WQ', 'WB', 'WKn', 'WR', 
      'WP', 'WP', 'WP','WP', 'WP', 'WP', 'WP', 'WP',
      
            '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '', 
      
      'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP',
      'BR', 'BKn', 'BB','BK', 'BQ', 'BB', 'BKn', 'BR',
    ],
    currentPlayer: 'white'
  }
}
