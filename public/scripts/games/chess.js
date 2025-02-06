// Establish a connection to the server using Socket.IO
const socket = io('http://localhost:2050');

// Extract the room name from the URL path
const roomName = window.location.pathname.substring(7);

// Notify the server that a player has joined a chess game
socket.emit('chess_join', roomName);

// Get references to the chessboard and squares
const board = document.getElementById("board");
const squares = document.getElementsByClassName('squares');

// Track whether the kings are in check
let whiteKingCheck = false;
let blackKingCheck = false;

// Track the player's turn and game state
let player_turn = true;
let foo = true; // Used to toggle board rotation
let atkPiece = null; // Stores the attacking piece

let enPassantPossible = -1;  // Store the square for possible en passant capture
let whiteHasCastled = false;
let blackHasCastled = false;

let whiteKingMoved = false;
let blackKingMoved = false;

let whiteRookMoved = false;
let blackRookMoved = false;

// Object to store the game state
let gameObj = {
  squares: [],
  currentPlayer: 'W' // 'W' for White, 'B' for Black
}

// Stores the currently selected piece
let selectedPiece = {
  id: -1, // Default to an invalid index
  name: ''
}

// Stores previous moves to allow undoing or styling changes
let previousMoves = [];

// Function to clear previous moves' highlights and event listeners
function clearPreviousMoves() {
  for (let i = 0; i < squares.length; i++) {
    squares[i].style.backgroundColor = '';
    squares[i].style.border = '';
    squares[i].style.cursor = '';
  }

  for (let i = 0; i < previousMoves.length; i++) {
    const newSquare = squares[previousMoves[i]].cloneNode(true);
    squares[previousMoves[i]].parentNode.replaceChild(newSquare, squares[previousMoves[i]]);
  }
}

// Function to clear previous moves' highlights and event listeners
// function clearPreviousMoves() {
//   for (let i = 0; i < squares.length; i++) {
//     squares[i].style.backgroundColor = '';
//     squares[i].style.border = '';
//     squares[i].style.cursor = '';
    
//     if (squares[i].childNodes[0]) {
//       const piece = squares[i].childNodes[0];
//       piece.removeEventListener('click', handlePieceClick);
//     }
//   }
// }


// Function to disable board interactions when it's not the player's turn
function boardToggler(isDisabled) {
  if (isDisabled) {
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].childNodes[0]) {
        const newSquare = squares[i].cloneNode(true);
        squares[i].parentNode.replaceChild(newSquare, squares[i]);
        squares[i].childNodes[0].style.cursor = "default";
      }
    }
  }
}

// Listen for an event to rotate the board when it's the opponent's turn
socket.on('chess_rotate', () => {
  if (foo) {
    board.style.transform = "rotate(180deg)";
    
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].childNodes[0]) {
        squares[i].childNodes[0].style.transform = "rotate(-180deg)";
      }
    }
  } else {
    board.style.transform = "rotate(360deg)";
    
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].childNodes[0]) {
        squares[i].childNodes[0].style.transform = "rotate(360deg)";
      }
    }
  }

  foo = !foo; // Toggle rotation flag
});

// Redirect the user to an 'occupied' page if the game room is already full
socket.on('chess_occupied', () => {
  navigate('/occupied');
});

// Update the game state when receiving new data from the server
socket.on('chess_updateGameState', (newGameState) => {
  for (let i = 0; i < newGameState.squares.length; i++) {
    let square = newGameState.squares[i];

    // Remove existing pieces from the square
    while (squares[i].firstChild) {
      squares[i].removeChild(squares[i].firstChild);
    }

    // Add new piece if one exists on this square
    if (square !== '') {
      let piece = document.createElement("img");
      piece.setAttribute("src", `../img/chess_pieces/${square}.png`);
      piece.setAttribute("id", `${square}`);
      squares[i].appendChild(piece);
    } else {
      squares[i].childNodes[0] = null;
    }
  }

  // Update the local game state object
  gameObj = newGameState;

  // Enable interaction with the pieces of the current player
  for (let i = 0; i < squares.length; i++) {
    if (gameObj.squares[i] !== '') {
      if (squares[i].childNodes.length > 0 && squares[i].childNodes[0].id.includes(gameObj.currentPlayer)) {
        squares[i].childNodes[0].style.cursor = "pointer";
        
        squares[i].childNodes[0].addEventListener('click', () => {
          selectedPiece.id = i;
          selectedPiece.name = squares[i].childNodes[0].id;
          console.log(selectedPiece);

          // If the player is in check, disable non-king pieces
          if ((gameObj.currentPlayer === "W" && whiteKingCheck) || (gameObj.currentPlayer === "B" && blackKingCheck)) {
            if (!selectedPiece.name.includes("K")) {
              return; // Prevent non-king piece from being selected
            }
          }
          
          // Clear highlights of previous moves
          clearPreviousMoves();
          
          // Display valid moves for the selected piece
          showPieceMoves(selectedPiece.id, selectedPiece.name, gameObj.squares);
          enableMove(selectedPiece);
        });
      }
    }
  }

  // Toggle player turn
  player_turn = !player_turn;

  // Disable board interactions if it's not the player's turn
  if (!player_turn) {
    boardToggler(true);
  }

  // Rotate board based on the current state
  if (!foo) {
    board.style.transform = "rotate(180deg)";
    
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].childNodes[0]) {
        squares[i].childNodes[0].style.transform = "rotate(-180deg)";
      }
    }
  } else {
    board.style.transform = "rotate(360deg)";
    
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].childNodes[0]) {
        squares[i].childNodes[0].style.transform = "rotate(360deg)";
      }
    }
  }

  // Check for check or checkmate conditions
  check();
  checkMate();
});

// Function to check if a king is in check
function check() {
  whiteKingCheck = false;
  blackKingCheck = false;
  let whiteKingPos, blackKingPos;

  // Find the positions of the kings
  for (let i = 0; i < gameObj.squares.length; i++) {
    if (gameObj.squares[i] === "WK") {
      whiteKingPos = i;
    } else if (gameObj.squares[i] === "BK") {
      blackKingPos = i;
    }
  }

  // Check if the white king is under attack
  if (checkSquare("W", gameObj.squares).includes(whiteKingPos)) {
    squares[whiteKingPos].style.backgroundColor = "rgb(255 100 100)";
    whiteKingCheck = true;
  }

  // Check if the black king is under attack
  if (checkSquare("B", gameObj.squares).includes(blackKingPos)) {
    squares[blackKingPos].style.backgroundColor = "rgb(255 100 100)";
    blackKingCheck = true;
  }

  // Reset king's square color if they are not in check
  if (!whiteKingCheck) {
    squares[whiteKingPos].style.backgroundColor = 
      squares[whiteKingPos].className.includes('whiteSquare') ? 'whitesmoke' : 'rgb(109 100 229)';
  }
  if (!blackKingCheck) {
    squares[blackKingPos].style.backgroundColor = 
      squares[blackKingPos].className.includes('whiteSquare') ? 'whitesmoke' : 'rgb(109 100 229)';
  }
  
  // Disable all non-king pieces if the king is in check
  if (whiteKingCheck) {
    disableNonKingPieces("W");
  }
  if (blackKingCheck) {
    disableNonKingPieces("B");
  }
}

// Function to disable all non-king pieces, including knights
function disableNonKingPieces(color) {
  let kingPos = findKingPosition(color, gameObj.squares);
  let blockingMoves = getBlockingMoves(color, kingPos) || []; // Ensure it's an array

  for (let i = 0; i < squares.length; i++) {
    if (squares[i].childNodes[0]) {
      const piece = squares[i].childNodes[0].id;

      // Allow the king to move
      if (piece.includes("K") && piece.includes(color)) {
        continue;
      }

      let pieceMoves = [];

      // Generate possible moves based on piece type
      if (piece.includes("P")) {
        pieceMoves = genPawnMoves(i, piece, gameObj.squares) || [];
      } else if (piece.includes("N")) {
        pieceMoves = genKnightMoves(i, gameObj.squares) || [];
      } else if (piece.includes("B")) {
        pieceMoves = genBishopMoves(i, gameObj.squares) || [];
      } else if (piece.includes("R")) {
        pieceMoves = genRookMoves(i, gameObj.squares) || [];
      } else if (piece.includes("Q")) {
        pieceMoves = genQueenMoves(i, gameObj.squares) || [];
      }

      // Ensure pieceMoves is an array before calling .some()
      let canBlockCheck = pieceMoves.length > 0 && pieceMoves.some(move => blockingMoves.includes(move));

      if (!canBlockCheck) {
        squares[i].childNodes[0].style.cursor = "default";
        squares[i].childNodes[0].removeEventListener('click', handlePieceClick);
      }
    }
  }
}





// Modified handle piece click to ensure only kings can be selected
function handlePieceClick(event) {
  selectedPiece.id = event.target.parentNode.id;
  selectedPiece.name = event.target.id;
  console.log(selectedPiece);
  
  // Clear highlights of previous moves
  clearPreviousMoves();
  
  // Display valid moves for the selected piece
  showPieceMoves(selectedPiece.id, selectedPiece.name, gameObj.squares);
  enableMove(selectedPiece);
}


// Function to check for checkmate
function checkMate() {
  let whiteKingPos = -1;
  let blackKingPos = -1;

  // Find the king positions
  for (let i = 0; i < gameObj.squares.length; i++) {
    if (gameObj.squares[i] === "WK") {
      whiteKingPos = i;
    } else if (gameObj.squares[i] === "BK") {
      blackKingPos = i;
    }
  }

  // Checkmate for White King
  if (whiteKingCheck) {
    let kingMoves = genKingMoves(whiteKingPos, "WK", gameObj.squares);
    let blockMoves = getBlockingMoves("W", whiteKingPos);
    
    // Ensure king moves remove check
    kingMoves = kingMoves.filter(move => 
      !checkSquare("W", simulateMove(whiteKingPos, move, "WK")).includes(move)
    );

    // if (kingMoves.length === 0 && blockMoves.length === 0) {
    if (kingMoves.length === 0) {
      alert("Checkmate! Black wins.");
    }
  }

  // Checkmate for Black King
  if (blackKingCheck) {
    let kingMoves = genKingMoves(blackKingPos, "BK", gameObj.squares);
    let blockMoves = getBlockingMoves("B", blackKingPos);

    // Ensure king moves remove check
    kingMoves = kingMoves.filter(move => 
      !checkSquare("B", simulateMove(blackKingPos, move, "BK")).includes(move)
    );

    // if (kingMoves.length === 0 && blockMoves.length === 0) {
    if (kingMoves.length === 0) {
      alert("Checkmate! White wins.");
    }
  }
}

// Function to simulate a move and return the new board state
function simulateMove(from, to, piece) {
  let newBoard = [...gameObj.squares];
  newBoard[to] = piece;
  newBoard[from] = "";
  return newBoard;
}

function checkSquare(c, g) {
  let check_moves = [];
  
  // Loop through all squares to check for pieces
  for (let i = 0; i < squares.length; i++) {
    if (squares[i].childNodes[0]) {
      let dr = squares[i].childNodes[0].id;
      
      // Identify the piece type and generate its moves if it's an opponent's piece
      if (!dr.includes(c) && dr.endsWith("P")) {
        check_moves.push(...genPawnMoves(i, dr, g));
      } else if (!dr.includes(c) && dr.endsWith("h")) {
        check_moves.push(...genBishopMoves(i, g));
      } else if (!dr.includes(c) && dr.endsWith("N")) {
        check_moves.push(...genKnightMoves(i, g));
      } else if (!dr.includes(c) && dr.endsWith("R")) {
        check_moves.push(...genRookMoves(i, g));
      } else if (!dr.includes(c) && dr.endsWith("Q")) {
        check_moves.push(...genQueenMoves(i, g));
      } else if (!dr.includes(c) && dr.endsWith("K")) {
        check_moves.push(...genKingMoves(i, dr, g, false));
      }
    }
  }

  return check_moves;
}

// Function to check if en passant is possible
function checkEnPassant(piece, from, to, gameState) {
  if (piece.endsWith('P') && gameState[from] === "" && Math.abs(to - from) === 1 && enPassantPossible !== -1) {
    const targetSquare = squares[enPassantPossible];
    if (targetSquare && targetSquare.childNodes[0] && targetSquare.childNodes[0].id.endsWith("P")) {
      // En Passant capture move
      enPassantPossible = -1; // Reset en passant
      return to + (piece.includes("W") ? 8 : -8);  // Capture the pawn diagonally
    }
  }
  return to; // No en passant capture
}

/**
 * Determines if the king's target move qualifies as a valid castling move.
 * Returns the target square if valid; otherwise, returns the target unchanged.
 *
 */
function checkCastling(piece, from, to, gameState) {
  if (piece.endsWith('K')) {
    const isWhite = piece === 'WK';
    const row = isWhite ? 7 : 0;
    const kingStart = isWhite ? 60 : 4;
    const rookStartKingSide = isWhite ? 63 : 7;
    const rookStartQueenSide = isWhite ? 56 : 0;

    // Ensure the king and rook have not moved
    if ((isWhite && whiteHasCastled) || (!isWhite && blackHasCastled)) {
      return to;
    }

    // Castling to the king side
    if (to === kingStart + 2) {
      if (gameState[kingStart + 1] === '' && gameState[kingStart + 2] === '' && !isInCheck(from, gameState)) {
        // Ensure the squares the king passes through are not under attack
        const newGameState = simulateMove(kingStart, kingStart + 2, piece);
        if (!isInCheck(kingStart + 1, gameState) && !isInCheck(kingStart + 2, newGameState)) {
          return to;
        }
      }
    }

    // Castling to the queen side
    if (to === kingStart - 2) {
      if (gameState[kingStart - 1] === '' && gameState[kingStart - 2] === '' && gameState[kingStart - 3] === '' && !isInCheck(from, gameState)) {
        // Ensure the squares the king passes through are not under attack
        const newGameState = simulateMove(kingStart, kingStart - 2, piece);
        if (!isInCheck(kingStart - 1, gameState) && !isInCheck(kingStart - 2, newGameState)) {
          return to;
        }
      }
    }
  }
  return to;  // Not a castling move
}






// Example: Enhanced genKingMoves that uses checkCastling
function genKingMoves(p, c, g, e = true) {
  let moves = [];
  const row = Math.floor(p / 8);
  const col = p % 8;

  // Possible king moves in all 8 directions
  const directions = [
    [-1, -1],   [-1, 0],    [-1, 1],
    [0, -1],/*King's moves*/[0, 1],
    [1, -1],    [1, 0],      [1, 1]
  ];

  // Check each direction for valid moves
  directions.forEach(([dr, dc]) => {
    const newRow = row + dr;
    const newCol = col + dc;
    // const newPos = newRow * 8 + newCol;

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const newPos = newRow * 8 + newCol;
      if (g[newPos] === "" || g[newPos][0] !== g[p][0]) {
        moves.push(newPos);
      }
    }
  });
  
  // Filter out moves that put the king in check
  if (e) {
    const attacks = checkSquare(c[0], g);
    moves = moves.filter(move => !attacks.includes(move));
  } else {
    const castlingMove = checkCastling(c, p, p + 2, g); // Check for castling to the right
    if (castlingMove !== p) moves.push(castlingMove);

    const castlingMoveLeft = checkCastling(c, p, p - 2, g); // Check for castling to the left
    if (castlingMoveLeft !== p) moves.push(castlingMoveLeft);
  }
  
  return moves;
}


  // 2302603958
  // UBA
  // Obafemi oluwa pelumi


// Generate possible moves for a pawn
function genPawnMoves(p, c, g) {
  let moves = [];
  const d = c.includes('W') ? -1 : 1; // Direction for white (-1) and black (1)

  const move = p + (d * 8);
  const doubleMove = move + (d * 8);
  const captureRight = p + (d * 7);
  const captureLeft = p + (d * 9);
  
  // Regular move forward
  if (move >= 0 && move < 64 && g[move] === '') {
    moves.push(move);

    // Double move from starting position
    if ((c.includes('W') && p >= 48 || c.includes('B') && p <= 15) && g[doubleMove] === '') {
      moves.push(doubleMove);
    }
  }

  // En passant move (if applicable)
  const enPassantTarget = enPassantPossible;
  if (enPassantTarget !== -1 && Math.abs(p - enPassantTarget) === 8) {
    const targetSquare = squares[enPassantTarget];
    if (targetSquare && targetSquare.childNodes[0] && targetSquare.childNodes[0].id.endsWith("P")) {
      // Add en passant move (diagonally forward)
      moves.push(enPassantTarget + (piece.includes("W") ? 8 : -8));
    }
  }

  // Capture moves
  if (g[captureRight] !== '' && Math.abs((p % 8) - (captureRight % 8)) === 1 && !g[captureRight].includes(c[0])) {
    moves.push(captureRight);
  }

  if (g[captureLeft] !== '' && Math.abs((p % 8) - (captureLeft % 8)) === 1 && !g[captureLeft].includes(c[0])) {
    moves.push(captureLeft);
  }
  
  return moves;
}

// Generate all possible moves for a bishop
function genBishopMoves(p, g) {
  let moves = [];
  const directions = [
    [-1, -1], [-1, 1], [1, -1], [1, 1]   // Diagonal directions
  ];

  for (const [dr, dc] of directions) {
    let row = Math.floor(p / 8);
    let col = p % 8;
    while (true) {
      row += dr;
      col += dc;
      if (row < 0 || row >= 8 || col < 0 || col >= 8) break;

      const newPos = row * 8 + col;
      if (g[newPos] === '') {
        moves.push(newPos);
      } else {
        if (g[newPos][0] !== g[p][0]) moves.push(newPos);
        break;
      }
    }
  }

  return moves;
}

// Generate all possible moves for a rook
function genRookMoves(p, g) {
  let moves = [];
  const directions = [
    [-1, 0], [0, -1], [0, 1], [1, 0] // Straight line directions
  ];

  for (const [dr, dc] of directions) {
    let row = Math.floor(p / 8);
    let col = p % 8;
    while (true) {
      row += dr;
      col += dc;
      if (row < 0 || row >= 8 || col < 0 || col >= 8) break;

      const newPos = row * 8 + col;
      if (g[newPos] === '') {
        moves.push(newPos);
      } else {
        if (g[newPos][0] !== g[p][0]) moves.push(newPos);
        break;
      }
    }
  }
  
  return moves;
}

// Generate all possible moves for a queen (combines rook and bishop moves)
function genQueenMoves(p, g) {
  let moves = [];
  const directions = [
    [-1, -1], [-1, 1], [-1, 0], [1, 0], [0, -1], [0, 1], [1, -1], [1, 1] 
  ];

  for (const [dr, dc] of directions) {
    let row = Math.floor(p / 8);
    let col = p % 8;
    while (true) {
      row += dr;
      col += dc;
      if (row < 0 || row >= 8 || col < 0 || col >= 8) break;
      const newPos = row * 8 + col;
      if (g[newPos] === '') {
        moves.push(newPos);
      } else {
        if (g[newPos][0] !== g[p][0]) moves.push(newPos);
        break;
      }
    }
  }
  
  return moves;
}

// Generate all possible moves for a knight 
function genKnightMoves(p, g) {
  let moves = [];
  const row = Math.floor(p / 8); // Determine the row index of the piece
  const col = p % 8; // Determine the column index of the piece

  // Define all possible knight moves as row and column offsets
  const directions = [
    [-2, -1], [-1, -2], [1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    
    // Ensure the new position is within board bounds
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const newPos = newRow * 8 + newCol;
      
      // Check if the target square is empty or occupied by an opponent's piece
      if (g[newPos] === '' || g[newPos][0] !== g[p][0]) {
        moves.push(newPos);
      }
    }
  }

  return moves; // Return valid knight moves
}

function showPieceMoves(p, c, g) {
  let p_moves = [];
  
  // Determine piece type and generate its possible moves
  if (c === 'WP' || c === 'BP') {
    p_moves = genPawnMoves(p, c, g);
  } else if (c === 'WK' || c === 'BK') {
    p_moves = genKingMoves(p, c, g);
  } else if (c === 'WQ' || c === 'BQ') {
    p_moves = genQueenMoves(p, g);
  } else if (c === 'WN' || c === 'BN') {
    p_moves = genKnightMoves(p, g);
  } else if (c === 'WR' || c === 'BR') {
    p_moves = genRookMoves(p, g);
  } else if (c === 'WSh' || c === 'BSh') {
    p_moves = genBishopMoves(p, g);
  } else {
    console.log('Piece type not recognized:', c);
    return;
  }
  
  // Highlight the selected piece's square
  squares[p].style.backgroundColor = 'rgb(255 200 100)'; 
  
  // Highlight possible move squares
  for (const move of p_moves) {
    const targetSquare = squares[move];
    if (targetSquare.className.includes('whiteSquare')) {
      targetSquare.style.border = '15px solid whitesmoke';
    } else {
      targetSquare.style.border = '15px solid rgb(22 100 74)';
    }
    
    // Highlight enemy piece squares differently
    if (g[move] !== '' && g[move][0] !== c[0]) {
      targetSquare.style.border = 'none';
      targetSquare.style.backgroundColor = 'rgb(255 100 100)';
    } else {
      targetSquare.style.backgroundColor = 'rgb(40 255 255)';
    }
  }

  check(); // Check for game conditions after move display
}

// Helper: Find the king's position for a given color from a board state.
function findKingPosition(color, boardState) {
  const kingId = color === "W" ? "WK" : "BK";
  for (let i = 0; i < boardState.length; i++) {
    if (boardState[i] === kingId) {
      return i;
    }
  }
  return -1; // not found (should not happen)
}


function enableMove(selectedPiece) {
  let moves = [];

  // Generate moves based on piece type.
  if (selectedPiece.name === 'WP' || selectedPiece.name === 'BP') {
    moves = genPawnMoves(selectedPiece.id, selectedPiece.name, gameObj.squares);
  } else if (selectedPiece.name === 'WK' || selectedPiece.name === 'BK') {
    moves = genKingMoves(selectedPiece.id, selectedPiece.name, gameObj.squares);
  } else if (selectedPiece.name === 'WQ' || selectedPiece.name === 'BQ') {
    moves = genQueenMoves(selectedPiece.id, gameObj.squares);
  } else if (selectedPiece.name === 'WN' || selectedPiece.name === 'BN') {
    moves = genKnightMoves(selectedPiece.id, gameObj.squares);
  } else if (selectedPiece.name === 'WR' || selectedPiece.name === 'BR') {
    moves = genRookMoves(selectedPiece.id, gameObj.squares);
  } else if (selectedPiece.name === 'WSh' || selectedPiece.name === 'BSh') {
    moves = genBishopMoves(selectedPiece.id, gameObj.squares);
  } else {
    console.log('Piece type not recognized');
    return;
  }

  let currentPlayer = gameObj.currentPlayer;
  let isKingChecked = (currentPlayer === 'W' && whiteKingCheck) || (currentPlayer === 'B' && blackKingCheck);

  if (isKingChecked) {
    let kingPos = findKingPosition(currentPlayer, gameObj.squares);
    let attackers = checkSquare(currentPlayer, gameObj.squares);
    let blockingMoves = getBlockingMoves(currentPlayer, kingPos);

    // If the selected piece is the king, allow only moves that take it out of check.
    if (selectedPiece.name.includes("K")) {
      moves = moves.filter(move => {
        let newState = simulateMove(selectedPiece.id, move, selectedPiece.name);
        let newKingPos = findKingPosition(currentPlayer, newState);
        let newAttackers = checkSquare(currentPlayer, newState);
        return !newAttackers.includes(newKingPos);
      });
    } else {
      // Allow only moves that block the check or capture the attacking piece.
      moves = moves.filter(move => blockingMoves.includes(move));
    }
  }

  if (moves.length === 0) {
    return; // No valid moves to escape check.
  }

  // Enable moves by adding event listeners to valid move squares.
  for (const move of moves) {
    squares[move].style.cursor = "pointer";

    squares[move].addEventListener('click', () => {
      // Update castling flags if the king is performing castling.
      if (selectedPiece.name === "WK" && (move === 62 || move === 58)) {
        whiteHasCastled = true;
      }
      if (selectedPiece.name === "BK" && (move === 6 || move === 2)) {
        blackHasCastled = true;
      }

      // Perform the move.
      gameObj.squares[selectedPiece.id] = '';
      gameObj.squares[move] = `${selectedPiece.name}`;

      if (selectedPiece.name === "WK") {
        whiteKingMoved = true;
      }
      if (selectedPiece.name === "BK") {
        blackKingMoved = true;
      }

      // Switch turns.
      gameObj.currentPlayer = (currentPlayer === 'W') ? 'B' : 'W';

      // Emit the game state update to the server.
      socket.emit('chess_play', { room: roomName, gameState: gameObj });

      clearPreviousMoves();
      console.log(gameObj);
    });
  }

  previousMoves = moves;
}






window.addEventListener("beforeunload", function (event) {
  // Prevent the default behavior (reloading)
  event.preventDefault();

  // This will show a confirmation dialog (not all browsers display the custom message)
  event.returnValue = "Are you sure you want to reload the page?";
});

// Disable reload via keyboard shortcuts (F5, Ctrl+R, etc.)
window.addEventListener('keydown', function (e) {
  if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
    e.preventDefault();
    alert("Reloading the page is disabled to prevent interrupting the game.");
  }
});






/**
 * Finds all moves by non-king pieces of a given color that, when simulated,
 * result in the king no longer being in check. These moves either block the check
 * or capture the attacking piece.
 *
 * @param {string} color - "W" for white or "B" for black.
 * @param {number} kingPos - The current board index of the king.
 * @returns {Array} - An array of objects, each with properties:
 *                    { piecePosition: number, move: number, piece: string }
 */
function getBlockingMoves(color, kingPos) {
  let blockingMoves = [];
  
  // Loop over all board squares.
  for (let pos = 0; pos < gameObj.squares.length; pos++) {
    let piece = gameObj.squares[pos];
    
    // Process only squares that contain a piece of the given color,
    // and skip the king.
    if (piece !== "" && piece[0] === color && !piece.endsWith("K")) {
      
      // Determine possible moves for this piece based on its type.
      let possibleMoves = [];
      
      // Assuming your notation:
      // "P" for Pawn, "Q" for Queen, "R" for Rook, "B" or "Sh" for Bishop,
      // "N" for Knight (or "Kn" as in your earlier code).
      if (piece.endsWith("P")) {
        possibleMoves = genPawnMoves(pos, piece, gameObj.squares);
      } else if (piece.endsWith("Q")) {
        possibleMoves = genQueenMoves(pos, gameObj.squares);
      } else if (piece.endsWith("R")) {
        possibleMoves = genRookMoves(pos, gameObj.squares);
      } else if (piece.endsWith("B") || piece.endsWith("Sh")) {
        possibleMoves = genBishopMoves(pos, gameObj.squares);
      } else if (piece.includes("N")) { // covers "WN", "BN", "WKn", etc.
        possibleMoves = genKnightMoves(pos, gameObj.squares);
      }
      
      // For each possible move, simulate it and check if it resolves the check.
      for (let move of possibleMoves) {
        // Simulate the move for the piece.
        let newState = simulateMove(pos, move, piece);
        
        // Find the new king position after the move.
        // (In most cases, the king's position remains unchanged since this piece isn't the king.)
        let newKingPos = findKingPosition(color, newState);
        
        // Get the list of squares attacked by the opponent.
        let attackers = checkSquare(color, newState);
        
        // If the king is no longer attacked, then this move resolves the check.
        if (!attackers.includes(newKingPos)) {
          blockingMoves.push({
            piecePosition: pos,
            move: move,
            piece: piece
          });
        }
      }
    }
  }
  
  return blockingMoves;
}

