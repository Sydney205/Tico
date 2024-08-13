const socket = io('http://localhost:3000');
const roomName = window.location.pathname.substring(2);

socket.emit('chess_join', roomName);

// Elements...
const squares = document.getElementsByClassName('squares');

let gameObj = [];
let selectedPiece = '';

socket.on('chess_updateGameState', (newGameState) => {
  
  for (let i = 0; i < newGameState.squares.length; i++) {
    let square = newGameState.squares[i];
    
    if (newGameState.squares[i] != '') {
      let piece = document.createElement("img");
      piece.setAttribute("src", `../img/chess_pieces/${square}.png`);
      piece.setAttribute("id", `${square}`);
      
      squares[i].appendChild(piece);      
      console.log(`piece appeared on square ${i}`);
      
      // console.log(squares[2].childNodes[0].id) // for getting moves
    }
  }

  gameObj = newGameState.squares;
});


for (let i = 0; i < squares.length; i++) {
  squares[i].addEventListener('click', () => {
    let position = i;
    let piece = squares[i].childNodes[0].id;
    selectedPiece = piece;

    console.log(position, piece);
    
    if (piece === 'WP' || piece === 'BP') {
      showPawnMoves(position, piece, gameObj);
    }
  })
  
  // if (squares[i].onFocus) {
  //   console.log('false');
  // }
}



function genPawnMove(p, c, g) {
  let moves = [];

  if (c === 'WP' || c === 'BP') {
  
    if (p >= 8 && c == 'WP') {  
      if (p <= 15) {
        for (let i=0;i<2;i++) {
          let move = p + 8;
          
          if (g[move] === '') {
            moves.push(move);
            p = move;
          }
        }
        return moves;
      }
      
      let move = p + 8;
      if (g[move] === '') {
        moves.push(move);
      }
    }
    
    if (p <= 55 && c == 'BP') {
      if (p >= 48) {
        for (let i=0;i<2;i++) {
          let move = p - 8;
          
          if (g[move] === '') {
            moves.push(move);
            p = move;
          }
        }
        return moves;
      }
      
      let move = p - 8;
      if (g[move] === '') {
        moves.push(move);
      }
    }
    
  } else {
    console.log('wrong piece');
  }

  return moves;
}

function showPawnMoves(p, c, g) {
  const p_moves = genPawnMove(p, c, g);

  squares[p].style.backgroundColor = 'rgb(255 200 100)';
  
  for (let i=0;i<p_moves.length;i++) {
    squares[p_moves[i]].style.backgroundColor = 'rgb(40 255 255)';
    
    if (squares[p_moves[i]].className.includes("whiteSquare")) {
      squares[p_moves[i]].style.border = '15px solid whitesmoke';
      console.log('white');
    } else {
      squares[p_moves[i]].style.border = '15px solid rgb(22 100 74)';
      console.log('green');
    }
  }
}

function clearPawnMoves(p, c, g) {}

function makeMove(selectedPiece, c) {
  let moves = [];
  if (c === 'WP' || c === 'BP') {
    moves = showPawnMoves(position, piece, gameObj);
  }

  let piece = document.getElementById(c);
  // piece.setAttribute("src", `../img/chess_pieces/${squares[position].}.png`);
  // piece.setAttribute("id", `${squares[position].}`);

  for (let i = 0; i < moves.length; i++) {
    squares[moves[i]].addEventListener('click', () => {
      gameObj[position] = '';
      squares[position].childNodes[0].id = '';
      squares[position].childNodes = [];
      
      squares[moves[i]].appendChild(c)

      console.log(gameObj);
    })
  }
}


/*
  p = position
  c = color
  g = gameState
*/
