const logoutButton = document.getElementById('deconnexion');
logoutButton.addEventListener('click', (event) => {
  event.preventDefault(); // Empêche le bouton de déclencher une action par défaut (comme l'envoi d'un formulaire)
  fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({}) // Vous pouvez ajouter des données dans le corps de la requête si nécessaire
  })
  .then(response => {
    if (response.ok) {
      // Rediriger l'utilisateur vers la page d'accueil ou une autre page de votre choix
      window.location.href = '/'; 
    } else {
      console.error('Erreur lors de la déconnexion');
    }
  })
  .catch(error => console.error(error));
});
 

const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));
fetch('/api/user/profile', {
  method: 'GET',
  headers: {
    'Cookie': 'token=' + tokenCookie,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Réponse du serveur');
  if (response.ok) {
    return response.json();
  } else {
    console.error("Vous n'êtes pas authentifié");
  }
})
.then(data => {
  console.log('Données récupérées');
  console.log(data);
  // mise à jour de l'affichage avec les informations récupérées
  document.getElementById('username').textContent = data.pseudo;
})
.catch(error => console.error(error));


if (tokenCookie) {
  // Afficher le bouton "Profil" et le bouton "Déconnexion"
  document.getElementById('profil').style.display = 'block';
  document.getElementById('deconnexion').style.display = 'block';
  document.getElementById('connexion').style.display = 'none';
  document.getElementById('history').style.display = 'block';
  document.getElementById('username').style.display = 'block';
} else {
  // Afficher le bouton "Connexion" et masquer le bouton "Profil" et le bouton "Déconnexion"
  document.getElementById('connexion').style.display = 'block';
  document.getElementById('profil').style.display = 'none';
  document.getElementById('deconnexion').style.display = 'none';
  document.getElementById('history').style.display = 'none';
  document.getElementById('username').style.display = 'none';
}


/*---------------------------------------------------------------------------------------------------------------------------------------*/


var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'

function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square = $('#myBoard .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }
  $square.css('background', background)
}

function onDragStart (source, piece) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false
  // or if it's not that side's turn
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  removeGreySquares()

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' //il faut modifier pour avoir tous les choix possibles.

  })

  // illegal move
  if (move === null) return 'snapback'
}

function onMouseoverSquare (square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  })

  // exit if there are no moves available for this square
  if (moves.length === 0) return

  // highlight the square they moused over
  greySquare(square)

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }
}

function onMouseoutSquare (square, piece) {
  removeGreySquares()
}

var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}


//Update le Status,
function updateStatus() {
    var status = ''
    var moveColor = 'Blanc'
    if (game.turn() === 'b') {
      moveColor = 'Noir'
    }
    // Regarde si c'est Echec et mat.
    if (game.in_checkmate()) {
      status = 'Fin de Partie, ' + moveColor + ' Est en Echec et Mat.'
      alert("CHECKMATE");
      
    }
    // REgarde si c'est Egalité.
    else if (game.in_draw()){
      status = 'Fin de Partie,Egalité'
    }
    // Si la partie est toujours en jeu.
    else {
      status = moveColor + ' de jouer'
      // Si il y'a echec.
      if (game.in_check()){
        status += ', ' + moveColor + ' Est en Echec'
      }
  
    }
    //Met a jour le Status, le FEN et PGN et appelle la fonction listePP qui permet de mettre a jour les pièces capturés.
    $status.html(status)
    $fen.html(game.fen())
    $pgn.html(game.pgn())
    listePP(game)
  }
  

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare
}
board = Chessboard('myBoard', config)


updateStatus()
var game = new Chess();
    var pgn = '';
    var historique = [];
    $('#load').on('click', function() {
      var pgnText = $('#pgn').val();
      game.load_pgn(pgnText);
      board.position(game.fen());
      pgn = pgnText;
      historique = [];
    });


    $('#start').on('click', function() {
      game.load('');
      board.start();
      pgn = '';
      historique = [];
    });


    $('#prev').on('click', function() {
      var move = game.undo();
      if (move !== null) {
        historique.push(move);
        board.position(game.fen());
      }
    });



    $('#next').on('click', function() {
      if (game.history().length == 0) {
        game.load_pgn(pgn);
        board.position(game.fen());
        historique = [];
      }

      if (historique.length > 1) {
        var move = historique.pop();
        game.move(move);
        board.position(game.fen());
      } else {

        var moves = game.history({verbose: true});
        for (var i = 0; i < moves.length; i++) {
          var move = moves[i];
          game.move(move);
          board.position(game.fen());
        }
      }
    });
    

  function listePP(game){
    const piecesP = {
      'w': { 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0 },
      'b': { 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0 }
    }
  
    const history = game.history({ verbose: true })
  
    for (const move of history) {
      if (move.captured) {
        const piece = move.captured
        const color = move.color === 'w' ? 'b' : 'w'
        piecesP[color][piece]++;
      }
    }

    //BLANC
    const wp = piecesP['w']['p']
    document.getElementById('wP').innerHTML = wp
    const wn = piecesP['w']['n']
    document.getElementById('wN').innerHTML = wn
    const wb = piecesP['w']['b']
    document.getElementById('wB').innerHTML = wb  
    const wr = piecesP['w']['r']
    document.getElementById('wR').innerHTML = wr
    const wq = piecesP['w']['q']
    document.getElementById('wQ').innerHTML = wq
    //NOIR

    const bp = piecesP['b']['p']
    document.getElementById('bP').innerHTML = bp
    const bn = piecesP['b']['n']
    document.getElementById('bN').innerHTML = bn
    const bb = piecesP['b']['b']
    document.getElementById('bB').innerHTML = bb
    const br = piecesP['b']['r']
    document.getElementById('bR').innerHTML = br
    const bq = piecesP['b']['q']
    document.getElementById('bQ').innerHTML = bq

    return piecesP;
  }
// permet de retourner le plateau
  $('#flip').on('click', board.flip)
