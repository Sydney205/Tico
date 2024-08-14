const socket = io('http://localhost:3000');
const roomName = window.location.pathname.substring(7);

socket.emit('chess_join', roomName);

// Elements...
const squares = document.getElementsByClassName('squares');

let gameObj = {
  squares: [],
  currentPlayer: 'white'
};
let selectedPiece = {
  id: 0,
  name: ''
};

socket.on('chess_updateGameState', (newGameState) => {
  for (let i = 0; i < newGameState.squares.length; i++) {
    let square = newGameState.squares[i];
    
    if (newGameState.squares[i] !== '') {
      let piece = document.createElement("img");
      piece.setAttribute("src", `../img/chess_pieces/${square}.png`);
      piece.setAttribute("id", `${square}`);
        
      squares[i].appendChild(piece);      
      console.log(`piece appeared on square ${i}`);
    } else {
      squares[i].childNodes[0] = null;
    }
  }

  gameObj = newGameState; // Update the game state
  
  for (let i = 0; i < squares.length; i++) {
    if (gameObj.squares[i] !== '') {
      if (squares[i].childNodes.length > 0) {
        squares[i].childNodes[0].addEventListener('click', () => {
          selectedPiece.id = i;
          selectedPiece.name = squares[i].childNodes[0].id;

          console.log(selectedPiece);
          
          if (selectedPiece.name === 'WP' || selectedPiece.name === 'BP') {
            showPawnMoves(selectedPiece.id, selectedPiece.name, gameObj.squares);
            enableMove(selectedPiece);
            console.log(genPawnMove(selectedPiece.id, selectedPiece.name, gameObj.squares))
          }
        })
      }
    }
  }
});


/**
  Move functions for all the pieces on the board goes here
  
*/
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


/* Make pawn move... */
function enableMove(selectedPiece) {
  let moves = [];
  if (selectedPiece.name === 'WP' || selectedPiece.name === 'BP') {
    moves = genPawnMove(selectedPiece.id, selectedPiece.name, gameObj.squares);
    console.log(moves);
  }

  // let piece = document.getElementById(selectedPiece.name);

  for (let i = 0; i < moves.length; i++) {
    squares[moves[i]].style.cursor = "pointer";
    
    squares[moves[i]].addEventListener('click', () => {  
      gameObj.squares[selectedPiece.id] = '';
      gameObj.squares[moves[i]] = `${selectedPiece.name}`;


      socket.emit('chess_play', { roomName, gameObj });
      console.log(gameObj);
    })
  }
}

/*
  p = position
  c = color
  g = gameState
*/
