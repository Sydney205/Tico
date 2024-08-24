const socket = io('http://localhost:2050');
const roomName = window.location.pathname.substring(7);

socket.emit('chess_join', roomName);

const board = document.getElementById("board");
const squares = document.getElementsByClassName('squares');

let player_turn = true;
let foo = true;

let gameObj = {
  squares: [],
  currentPlayer: 'W'
}

let selectedPiece = {
  id: -1,
  name: ''
}

let previousMoves = [];

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

socket.on('chess_rotate', () => {
  if (foo) {
    board.style.transform = "rotate(180deg)";
    
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].childNodes[0]) {
        squares[i].childNodes[0].style.transform = "rotate(-180deg)"
      }
    }
  } else {
    board.style.transform = "rotate(360deg)";
    
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].childNodes[0]) {
        squares[i].childNodes[0].style.transform = "rotate(360deg)"
      }
    }
  }


  foo = !foo;
})

socket.on('chess_occupied', () => {
  navigate('/occupied');
})

socket.on('chess_updateGameState', (newGameState) => {
  for (let i = 0; i < newGameState.squares.length; i++) {
    let square = newGameState.squares[i];

    while (squares[i].firstChild) {
      squares[i].removeChild(squares[i].firstChild);
    }

    if (square !== '') {
      let piece = document.createElement("img");
      piece.setAttribute("src", `../img/chess_pieces/${square}.png`);
      piece.setAttribute("id", `${square}`);

      squares[i].appendChild(piece);
    } else {
      squares[i].childNodes[0] = null;
    }
  }

  gameObj = newGameState;

  for (let i = 0; i < squares.length; i++) {
    if (gameObj.squares[i] !== '') {
      if (squares[i].childNodes.length > 0 && squares[i].childNodes[0].id.includes(gameObj.currentPlayer)) {
        squares[i].childNodes[0].style.cursor = "pointer";
        
        squares[i].childNodes[0].addEventListener('click', () => {
          
          selectedPiece.id = i;
          selectedPiece.name = squares[i].childNodes[0].id;

          console.log(selectedPiece);

        
          clearPreviousMoves();

          
          showPieceMoves(selectedPiece.id, selectedPiece.name, gameObj.squares);
          enableMove(selectedPiece);
        });
      }
    }
  }

  player_turn = !player_turn;

  if (!player_turn) {
    boardToggler(true);
  }

  if (!foo) {
    board.style.transform = "rotate(180deg)";
    
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].childNodes[0]) {
        squares[i].childNodes[0].style.transform = "rotate(-180deg)"
      }
    }
  } else {
    board.style.transform = "rotate(360deg)";
    
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].childNodes[0]) {
        squares[i].childNodes[0].style.transform = "rotate(360deg)"
      }
    }
  }
})

function check(c, g) {
  let check_moves = [];
  for (let i = 0; i < squares.length; i++) {
    if (squares[i].childNodes[0]) {
      let dr = squares[i].childNodes[0].id;
      
      if (!dr.includes(c) && dr.endsWith("P")) {
        check_moves.push(...genPawnMoves(i, dr, g));
      } else if (!dr.includes(c) && dr.endsWith("h")) {
        check_moves.push(...genBishopMoves(i, g));
      } else if (!dr.includes(c) && dr.endsWith("n")) {
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



function genKingMoves(p, c, g, e = true) {
  let moves = [];
  const row = Math.floor(p / 8);
  const col = p % 8;

  const directions = [
    [-1, -1],   [-1, 0],    [-1, 1],
    [0, -1],/*King's moves*/[0, 1],
    [1, -1],    [1, 0],      [1, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const newPos = newRow * 8 + newCol;
      if (g[newPos] === '' || g[newPos][0] !== g[p][0]) {
        moves.push(newPos);
      }
    }
  }

  if (e) {
    const attacks = check(c[0], g);
    moves = moves.filter(move => !attacks.includes(move));
  }
  
  return moves;
}


function genPawnMoves(p, c, g) {
  let moves = [];
  const d = c.includes('W') ? -1 : 1;

  const rowNum = Math.abs(p % 8);
  const move = p + (d * 8);
  const doubleMove = move + (d * 8)
  const captureRight = p + (d * 7);
  const captureLeft = p + (d * 9);
  
  if (move >= 0 && move < 64 && g[move] === '') {
    moves.push(move);

    if (c.includes('W')) {
      if ((g[doubleMove] === '') && p >= 48) {
        moves.push(doubleMove);
      }
    }

    if (c.includes('B')) {
      if ((g[doubleMove] === '') && p <= 15) {
        moves.push(doubleMove);
      }
    }
  }


  if (g[captureRight] !== '' && (Math.abs((p % 8) - (captureLeft % 8)) === 1) && !g[captureRight].includes(c[0])) {
    
    moves.push(captureRight);
  }


  if (g[captureLeft] !== '' && (Math.abs((p % 8) - (captureLeft % 8)) === 1) && !g[captureLeft].includes(c[0])) {
    
    moves.push(captureLeft);
  }
  
  return moves;
}

function genBishopMoves(p, g) {
  let moves = [];
  const directions = [
    [-1, -1],      [-1, 1], 
      /*Bishop's moves*/
    [1, -1],       [1, 1]   
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
      } else if (g[newPos][0] !== g[p][0]) {
        moves.push(newPos);
        break;
      } else {
        break;
      }
    }
  }

  return moves;
}

function genRookMoves(p, g) {
  let moves = [];
  const directions = [
    [-1, 0],
    [0, -1],
    [0, 1],
    [1, 0]
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
      } else if (g[newPos][0] !== g[p][0]) {
        moves.push(newPos);
        break;
      } else {
        break;
      }
    }
  }

  return moves;
}

function genQueenMoves(p, g) {
  let moves = [];
  const directions = [
    [-1, -1],                    [-1, 1],    
    
                    [-1, 0], 
            
        [1, 0],/*Queen's moves*/[0, -1], 
      
                    [0, 1], 
            
     [1, -1],                    [1, 1] 
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
        if (g[newPos][0] !== g[p][0]) {
          moves.push(newPos);
        }
        break;
      }
    }
  }
  
  return moves;
}

function genKnightMoves(p, g) {
  let moves = [];
  const row = Math.floor(p / 8);
  const col = p % 8;

  const directions = [
      [-2, -1],  [-1, -2], 
    [1, -2],         [2, -1],
      /*Knight's moves*/
    [2, 1],         [1, 2], 
       [-1, 2],  [-2, 1]
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const newPos = newRow * 8 + newCol;
      if (g[newPos] === '' || g[newPos][0] !== g[p][0]) {
        moves.push(newPos);
      }
    }
  }

  return moves;
}



function showPieceMoves(p, c, g) {
  let p_moves = [];
  
  if (c === 'WP' || c === 'BP') {
    p_moves = genPawnMoves(p, c, g);
  } else if (c === 'WK' || c === 'BK') {
    p_moves = genKingMoves(p, c, g);
  } else if (c === 'WQ' || c === 'BQ') {
    p_moves = genQueenMoves(p, g);
  } else if (c === 'WKn' || c === 'BKn') {
    p_moves = genKnightMoves(p, g);
  } else if (c === 'WR' || c === 'BR') {
    p_moves = genRookMoves(p, g);
  } else if (c === 'WSh' || c === 'BSh') {
    p_moves = genBishopMoves(p, g);
  } else {
    console.log('Piece type not recognized:', c);
    return;
  }
  
  squares[p].style.backgroundColor = 'rgb(255 200 100)'; 
  
  for (const move of p_moves) {
    const targetSquare = squares[move];
    if (targetSquare.className.includes('whiteSquare')) {
      targetSquare.style.border = '15px solid whitesmoke';
    } else {
      targetSquare.style.border = '15px solid rgb(22 100 74)';
    }
    
    if (g[move] !== '' && g[move][0] !== c[0]) {
      targetSquare.style.border = 'none';
      targetSquare.style.backgroundColor = 'rgb(255 100 100)';
    } else {
      targetSquare.style.backgroundColor = 'rgb(40 255 255)';
    }
  }
}

function enableMove(selectedPiece) {
  let moves = [];
  
  if (selectedPiece.name === 'WP' || selectedPiece.name === 'BP') {
    moves = genPawnMoves(selectedPiece.id, selectedPiece.name, gameObj.squares);
  } else if (selectedPiece.name === 'WK' || selectedPiece.name === 'BK') {
    moves = genKingMoves(selectedPiece.id, selectedPiece.name, gameObj.squares);
  } else if (selectedPiece.name === 'WQ' || selectedPiece.name === 'BQ') {
    moves = genQueenMoves(selectedPiece.id, gameObj.squares);
  } else if (selectedPiece.name === 'WKn' || selectedPiece.name === 'BKn') {
    moves = genKnightMoves(selectedPiece.id, gameObj.squares);
  } else if (selectedPiece.name === 'WR' || selectedPiece.name === 'BR') {
    moves = genRookMoves(selectedPiece.id, gameObj.squares);
  } else if (selectedPiece.name === 'WSh' || selectedPiece.name === 'BSh') {
    moves = genBishopMoves(selectedPiece.id, gameObj.squares);
  } else {
    console.log('Piece type not recognized');
  }

  for (const move of moves) {
    squares[move].style.cursor = "pointer";
    
    squares[move].addEventListener('click', () => {      
      gameObj.squares[selectedPiece.id] = '';
      gameObj.squares[move] = `${selectedPiece.name}`;  

      if (gameObj.currentPlayer === 'W') {
        gameObj.currentPlayer = 'B'
      } else {
        gameObj.currentPlayer = 'W'
      }

      socket.emit('chess_play', { room: roomName, gameState: gameObj });

      clearPreviousMoves();
    
      console.log(gameObj);
    });
  }

  previousMoves = moves; // Store previous moves for clearance
}

