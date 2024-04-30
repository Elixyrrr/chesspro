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


const tokenCookie = document.cookie.split(';').find(cookie => cookie.startsWith('token='));
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


/*--------------------------------------------------------------------------------------------------------------------------------------*/
          
var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'
var board = null
var game = new Chess();
var depth=3;
var globalSum = 0;
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
// Supposons que cela soit quelque part au début de votre logique de jeu
let positionHistory = {};


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

// Supposons que cela soit après un coup valide dans votre jeu
/*function afterMove(game) {
    let fen = game.fen().split(' ')[0]; // Prend seulement la partie position de la chaîne FEN
    positionHistory[fen] = (positionHistory[fen] || 0) + 1; // Incrémente le compteur pour cette position
    // Mettre à jour l'affichage, etc.
}*/
var weights = { p: 100, n: 280, b: 320, r: 479, q: 929, k: 60000, k_e: 60000 };
var pst_w = {
  p: [
    [100, 100, 100, 100, 105, 100, 100, 100],
    [78, 83, 86, 73, 102, 82, 85, 90],
    [7, 29, 21, 44, 40, 31, 44, 7],
    [-17, 16, -2, 15, 14, 0, 15, -13],
    [-26, 3, 10, 9, 6, 1, 0, -23],
    [-22, 9, 5, -11, -10, -2, 3, -19],
    [-31, 8, -7, -37, -36, -14, 3, -31],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-66, -53, -75, -75, -10, -55, -58, -70],
    [-3, -6, 100, -36, 4, 62, -4, -14],
    [10, 67, 1, 74, 73, 27, 62, -2],
    [24, 24, 45, 37, 33, 41, 25, 17],
    [-1, 5, 31, 21, 22, 35, 2, 0],
    [-18, 10, 13, 22, 18, 15, 11, -14],
    [-23, -15, 2, 0, 2, 0, -23, -20],
    [-74, -23, -26, -24, -19, -35, -22, -69],
  ],
  b: [
    [-59, -78, -82, -76, -23, -107, -37, -50],
    [-11, 20, 35, -42, -39, 31, 2, -22],
    [-9, 39, -32, 41, 52, -10, 28, -14],
    [25, 17, 20, 34, 26, 25, 15, 10],
    [13, 10, 17, 23, 17, 16, 0, 7],
    [14, 25, 24, 15, 8, 25, 20, 15],
    [19, 20, 11, 6, 7, 6, 20, 16],
    [-7, 2, -15, -12, -14, -15, -10, -10],
  ],
  r: [
    [35, 29, 33, 4, 37, 33, 56, 50],
    [55, 29, 56, 67, 55, 62, 34, 60],
    [19, 35, 28, 33, 45, 27, 25, 15],
    [0, 5, 16, 13, 18, -4, -9, -6],
    [-28, -35, -16, -21, -13, -29, -46, -30],
    [-42, -28, -42, -25, -25, -35, -26, -46],
    [-53, -38, -31, -26, -29, -43, -44, -53],
    [-30, -24, -18, 5, -2, -18, -31, -32],
  ],
  q: [
    [6, 1, -8, -104, 69, 24, 88, 26],
    [14, 32, 60, -10, 20, 76, 57, 24],
    [-2, 43, 32, 60, 72, 63, 43, 2],
    [1, -16, 22, 17, 25, 20, -13, -6],
    [-14, -15, -2, -5, -1, -10, -20, -22],
    [-30, -6, -13, -11, -16, -11, -16, -27],
    [-36, -18, 0, -19, -15, -15, -21, -38],
    [-39, -30, -31, -13, -31, -36, -34, -42],
  ],
  k: [
    [4, 54, 47, -99, -99, 60, 83, -62],
    [-32, 10, 55, 56, 56, 55, 10, 3],
    [-62, 12, -57, 44, -67, 28, 37, -31],
    [-55, 50, 11, -4, -19, 13, 0, -49],
    [-55, -43, -52, -28, -51, -47, -8, -50],
    [-47, -42, -43, -79, -64, -32, -29, -32],
    [-4, 3, -14, -50, -57, -18, 13, 4],
    [17, 30, -3, -14, 6, -1, 40, 18],
  ],

  // Endgame King Table
  k_e: [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50],
  ],
};
var pst_b = {
  p: pst_w['p'].slice().reverse(),
  n: pst_w['n'].slice().reverse(),
  b: pst_w['b'].slice().reverse(),
  r: pst_w['r'].slice().reverse(),
  q: pst_w['q'].slice().reverse(),
  k: pst_w['k'].slice().reverse(),
  k_e: pst_w['k_e'].slice().reverse(),
};

var pstOpponent = { w: pst_b, b: pst_w };
var pstSelf = { w: pst_w, b: pst_b };

  

function minimax(game, depth, alpha, beta, isMaximizingPlayer, sum, color) {
  positionCount++;

  if (depth === 0 || game.game_over()) {
    // Use a dedicated function to evaluate the terminal game state
    return [null, evaluateTerminalState(game, sum, color)];
  }

  var children = game.moves({ verbose: true });

  // If there are no legal moves left (game over situation), handle it
  if (children.length === 0) {
    return [null, evaluateTerminalState(game, sum, color)];
  }

  children.sort(function (a, b) { return 0.5 - Math.random(); });

  var maxValue = Number.NEGATIVE_INFINITY;
  var minValue = Number.POSITIVE_INFINITY;
  var bestMove = null;

  for (var i = 0; i < children.length; i++) {
    var currMove = children[i];
    var moveResult = game.move(currMove);

    // If the move is illegal, skip it
    if (moveResult === null) continue;

    var newSum = evaluateBoard(game, moveResult, sum, color);
    var [childBestMove, childValue] = minimax(
      game, depth - 1, alpha, beta, !isMaximizingPlayer, newSum, color
    );

    game.undo(); // Undo the move to restore state

    if (isMaximizingPlayer) {
      if (childValue > maxValue) {
        maxValue = childValue;
        bestMove = moveResult;
      }
      alpha = Math.max(alpha, childValue);
    } else {
      if (childValue < minValue) {
        minValue = childValue;
        bestMove = moveResult;
      }
      beta = Math.min(beta, childValue);
    }

    if (beta <= alpha) {
      break;
    }
  }

  return isMaximizingPlayer ? [bestMove, maxValue] : [bestMove, minValue];
}

function evaluateTerminalState(game, sum, color) {
  if (game.in_checkmate()) {
    // If the current player is in checkmate, that's bad for them
    return color === 'b' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  } else if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition() || game.insufficient_material()) {
    return 0; // Neutral evaluation for a draw
  }
  return sum; // If the game is not over, return the current evaluation sum
}


function evaluateBoard(game, move, prevSum, color) {
  if (!move) return prevSum;
  // Checkmate cases
  if (game.in_checkmate()) {
    // Good if the opponent is in checkmate
    return move.color === color ? 1e10 : -1e10;
  }

  // Draw cases
  if (game.in_draw() || game.in_threefold_repetition() || game.in_stalemate()) {
    return 0; // Neutral evaluation for draws
  }

  // Check cases
  if (game.in_check()) {
    // Increase or decrease sum based on who is in check
    prevSum += move.color === color ? 50 : -50;
  }

  var from = [
    8 - parseInt(move.from[1]), // Row
    move.from.charCodeAt(0) - 'a'.charCodeAt(0) // Column
  ];
  var to = [
    8 - parseInt(move.to[1]),
    move.to.charCodeAt(0) - 'a'.charCodeAt(0),
  ];

  // Adjust for piece captures
  if ('captured' in move) {
    // Update sum based on captured pieces and their position scores
    if (move.color === color) {
      prevSum += weights[move.captured] + pstOpponent[move.color][move.captured][to[0]][to[1]];
    } else {
      prevSum -= weights[move.captured] + pstSelf[move.color][move.captured][to[0]][to[1]];
    }
  }

  // Handle promotions
  if (move.flags.includes('p')) {
    // Assume promotion to queen for simplicity
    move.promotion = 'q';

    if (move.color === color) {
      prevSum += weights[move.promotion] + pstSelf[move.color][move.promotion][to[0]][to[1]];
      prevSum -= weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
    } else {
      prevSum += weights[move.piece] + pstSelf[move.color][move.piece][from[0]][from[1]];
      prevSum -= weights[move.promotion] + pstSelf[move.color][move.promotion][to[0]][to[1]];
    }
  } else {
    // Adjust the sum based on the movement of pieces
    if (move.color !== color) {
      prevSum += pstSelf[move.color][move.piece][from[0]][from[1]];
      prevSum -= pstSelf[move.color][move.piece][to[0]][to[1]];
    } else {
      prevSum -= pstSelf[move.color][move.piece][from[0]][from[1]];
      prevSum += pstSelf[move.color][move.piece][to[0]][to[1]];
    }
  }

  return prevSum;
}

function getBestMove(game, color, currSum) {
  positionCount = 0;

  

  var [bestMove, bestMoveValue] = minimax(
    game,
    depth,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    true,
    currSum,
    color
  );




  return [bestMove, bestMoveValue];
}



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
function onDragStart(source, piece) {
  // Prevent moving pieces if the game is over
  if (game.game_over()) return false;
  
  // Only allow moving white pieces (AI plays black)
  if (piece.search(/^b/) !== -1) return false;
}


function onDrop(source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // Assuming promotion to a queen for simplicity
  });

  if (move === null) return 'snapback'; // Illegal move

  updateStatus();

  if (game.turn() === 'b') {
    // It's black's turn; trigger AI to make a move
    window.setTimeout(function () {
      makeBestMove('b');
    }, 250); // Add a delay to simulate thinking time
  }
}

function makeBestMove(color) {
  if (color === 'b' && game.turn() === 'b') {
    var [bestMove, bestMoveValue] = getBestMove(game, 'b', globalSum);
    if (bestMove) {
      game.move(bestMove);
      board.position(game.fen());
      updateStatus();
    } else {
      console.log("No best move found for black!");
    }
  }
}


  
  function onMouseoverSquare (square, piece) {
    // Donne les coups possibles
    var moves = game.move({
      square: square,
      verbose: true
    })
  
    // Retourne si il n'y a pas de coup possible
    if (moves.length === 0) return
  
    // Fonction qui permet d'afficher les coups possibles en Gris
    greySquare(square)
    for (var i = 0; i < moves.length; i++) {
      greySquare(moves[i].to)
    }
  }
  //Quand la souris n'est plus sur la case enleve les coups possibles.
  function onMouseoutSquare (square, piece) {
    removeGreySquares()
  }
  //retorune la position de l'echiquier.
  function onSnapEnd () {
    board.position(game.fen())
  // Envoie le message au serveur que le plateau a été modifié.
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

  function abandonnerPartie() {
    if(game.game_over() === false){
      var status = ''
      alert("Vous avez abandonné la partie.");
      var status = "Les blancs ont abandonné la partie."
      game.game_over = true;
      $status.html(status) }
    else return;
  }
  
  
  
  
  
  //Création de la Pendule.
  var color='';
  function ColorTimer(){
    var color='Blanc'
    if(game.turn()==='b'){
      var color='Noir'
    }
    if(color=='Blanc'){
      updateTimer();
    }
    else{
      blackupdateTimer();
    }
  }
  
  //pour ne pas avoir un overflow
  function pad(chiffre) {
        if (chiffre < 10) {
          return '0' + chiffre;
        }
        return chiffre;
      }
  
  //grace a la methode de SetInterval d'appeler la fonction ColorTimer toute les secondes.
  setInterval(ColorTimer,1000)
  // initialisation des variables
  
    let blacktot=600; //10 min 
    let whitetot =600;
    
    const blackmin = document.getElementById('blackminutes');
    const blacksec = document.getElementById('blackseconds');
    const whitemin = document.getElementById('minutes');
    const whitesec = document.getElementById('seconds');
  
    // Fonction qui permet de decrementer le temps total des blancs.
    function updateTimer() {
      if (whitetot >=0 && game.game_over() === false) {
        whitetot--;
        const minutes = Math.floor((whitetot/ 60));
        const seconds = whitetot - (minutes * 60);
        // Change l'affichage du minuteur
        whitemin.innerHTML = pad(minutes);
        whitesec.innerHTML = pad(seconds);
            //si le temps est écoulé.
      if(whitetot==-1){
          alert("Temps écoulé");
          whitemin.innerHTML = pad(0x0);
          whitesec.innerHTML = pad(0x0);
        }
      }
      return whitetot;
    }
      // Fonction qui permet de decrementer le temps total des Noirs.
  
      function blackupdateTimer() {
      if (blacktot >=0 && game.game_over() === false) {
        blacktot--;
        const bminutes = Math.floor((blacktot/ 60));
        const bseconds = blacktot - (bminutes * 60);
              // Change l'affichage du minuteur
  
        blackmin.innerHTML = pad(bminutes);
        blacksec.innerHTML = pad(bseconds);
        //si le temps est écoulé.
      if(blacktot==-1){
          alert("Temps écoulé");
          blackmin.innerHTML = pad(0x0);
          blacksec.innerHTML = pad(0x0);
        }
      }
      return blacktot;
    }
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
  
    $('#flip').on('click', board.flip)
    $('#abandonner').on('click',abandonnerPartie)




  

/*const standardPieceValues = {
  'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000,
  'p': -100, 'n': -320, 'b': -330, 'r': -500, 'q': -900, 'k': -20000
};
const centralSquares = ['d4', 'e4', 'd5', 'e5',];
const standardPST = {
  'p': [ // Pawns
  [100, 100, 100, 100, 105, 100, 100, 100],
  [78, 83, 86, 73, 102, 82, 85, 90],
  [7, 29, 21, 44, 40, 31, 44, 7],
  [-17, 16, -2, 15, 14, 0, 15, -13],
  [-26, 3, 10, 9, 6, 1, 0, -23],
  [-22, 9, 5, -11, -10, -2, 3, -19],
  [-31, 8, -7, -37, -36, -14, 3, -31],
  [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  'n': [ // Knights
  [-66, -53, -75, -75, -10, -55, -58, -70],
  [-3, -6, 100, -36, 4, 62, -4, -14],
  [10, 67, 1, 74, 73, 27, 62, -2],
  [24, 24, 45, 37, 33, 41, 25, 17],
  [-1, 5, 31, 21, 22, 35, 2, 0],
  [-18, 10, 13, 22, 18, 15, 11, -14],
  [-23, -15, 2, 0, 2, 0, -23, -20],
  [-74, -23, -26, -24, -19, -35, -22, -69],
  ],
  'b': [ // Pawns
  [-59, -78, -82, -76, -23, -107, -37, -50],
  [-11, 20, 35, -42, -39, 31, 2, -22],
  [-9, 39, -32, 41, 52, -10, 28, -14],
  [25, 17, 20, 34, 26, 25, 15, 10],
  [13, 10, 17, 23, 17, 16, 0, 7],
  [14, 25, 24, 15, 8, 25, 20, 15],
  [19, 20, 11, 6, 7, 6, 20, 16],
  [-7, 2, -15, -12, -14, -15, -10, -10],
  ],
  'r': [ // Knights
  [35, 29, 33, 4, 37, 33, 56, 50],
  [55, 29, 56, 67, 55, 62, 34, 60],
  [19, 35, 28, 33, 45, 27, 25, 15],
  [0, 5, 16, 13, 18, -4, -9, -6],
  [-28, -35, -16, -21, -13, -29, -46, -30],
  [-42, -28, -42, -25, -25, -35, -26, -46],
  [-53, -38, -31, -26, -29, -43, -44, -53],
  [-30, -24, -18, 5, -2, -18, -31, -32],
  ],
  'q': [ // Knights
  [6, 1, -8, -104, 69, 24, 88, 26],
  [14, 32, 60, -10, 20, 76, 57, 24],
  [-2, 43, 32, 60, 72, 63, 43, 2],
  [1, -16, 22, 17, 25, 20, -13, -6],
  [-14, -15, -2, -5, -1, -10, -20, -22],
  [-30, -6, -13, -11, -16, -11, -16, -27],
  [-36, -18, 0, -19, -15, -15, -21, -38],
  [-39, -30, -31, -13, -31, -36, -34, -42],
  ],
  'k': [ // Knights
  [4, 54, 47, -99, -99, 60, 83, -62],
  [-32, 10, 55, 56, 56, 55, 10, 3],
  [-62, 12, -57, 44, -67, 28, 37, -31],
  [-55, 50, 11, -4, -19, 13, 0, -49],
  [-55, -43, -52, -28, -51, -47, -8, -50],
  [-47, -42, -43, -79, -64, -32, -29, -32],
  [-4, 3, -14, -50, -57, -18, 13, 4],
  [17, 30, -3, -14, 6, -1, 40, 18],
  ],
  'k_e':[
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50],
  ],
};

const middlegamePST = {
  'p': [ // Pawns
    [80, 80, 80, 80, 85, 80, 80, 80],
    [78, 83, 86, 73, 102, 82, 85, 90],
    [7, 29, 21, 44, 50, 31, 44, 7],
    [-10, 16, 5, 25, 24, 10, 15, -5],
    [-20, 0, 10, 15, 15, 5, 0, -20],
    [-22, 9, 5, -5, -5, 5, 3, -19],
    [-20, 5, -5, -30, -30, -10, 5, -20],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'n': [ // Knights
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [5, 10, 15, 20, 20, 15, 10, 5],
    [0, 5, 20, 25, 25, 20, 5, 0],
    [-5, 10, 15, 20, 20, 15, 10, -5],
    [-10, 0, 10, 15, 15, 10, 0, -10],
    [-20, -10, 0, 5, 5, 0, -10, -20],
    [-30, -20, -10, -5, -5, -10, -20, -30]
  ],
  'b': [ // Bishops
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 0, 10, 15, 15, 10, 0, -10],
    [-5, 5, 5, 15, 15, 5, 5, -5],
    [0, 10, 10, 10, 10, 10, 10, 0],
    [10, 15, 15, 15, 15, 15, 15, 10],
    [-10, 5, 0, 0, 0, 0, 5, -10]
  ],
  'r': [ // Rooks
    [0, 5, 5, 5, 5, 5, 5, 0],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [0, 0, 0, 5, 5, 0, 0, 0]
  ],
  'q': [ // Queens
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, 0],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20]
  ],
  'k': [ // Kings
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -30, -40, -40, -40, -40, -30, -30],
    [-30, -30, -40, -40, -40, -40, -30, -30],
    [-30, -30, -40, -40, -40, -40, -30, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20]
  ],
  'k_e': [ // Adjusted king table for endgame
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50]
  ]
};

const endgamePieceValues = {
  'P': 120, 'N': 300, 'B': 310, 'R': 500, 'Q': 900, 'K': 25000,
  'p': -120, 'n': -300, 'b': -310, 'r': -500, 'q': -900, 'k': -25000
};

const middlegamePieceValues = {
  'P': 100,   // Pions
  'N': 340,   // Cavaliers : légèrement augmenté pour refléter leur mobilité et efficacité tactique
  'B': 350,   // Fous : augmentés pour promouvoir leur rôle dans les diagonales ouvertes
  'R': 525,   // Tours : très efficaces dans les colonnes ouvertes
  'Q': 950,   // Dame : augmentée pour sa capacité à influencer de vastes zones du plateau
  'K': 20000, // Roi : reste extrêmement élevé pour éviter les risques inutiles

  'p': -100,  // Les valeurs négatives correspondent aux pièces noires pour l'IA qui joue les noirs
  'n': -340,  // Cavaliers noirs
  'b': -350,  // Fous noirs
  'r': -525,  // Tours noires
  'q': -950,  // Dame noire
  'k': -20000 // Roi noir
};

function getGamePhase(game) {
  const totalPieces = game.fen().split(" ")[0].replace(/[1-8]/g, '').length;
  if (totalPieces > 30) return 'opening';
  else if (totalPieces > 16) return 'middlegame';
  else return 'endgame';
}

function evaluateBoard(game) {
  const phase = getGamePhase(game);
  let pieceValues, pst;

  // Choisir les valeurs de pièces et les tables de position en fonction de la phase
  switch(phase) {
    case 'middlegame':
      pieceValues = middlegamePieceValues;
      pst = middlegamePST;
      break;
    case 'endgame':
      pieceValues = endgamePieceValues;
      pst = endgamePST;
      break;
    default: // 'opening' et tout autre cas non spécifié
      pieceValues = standardPieceValues;
      pst = standardPST;
      break;
  }

  let score = 0;

  // Vérifier les conditions de fin de jeu
  if (game.in_checkmate()) {
    return game.turn() === 'b' ? Infinity : -Infinity;
  } else if (game.in_draw() || game.in_stalemate()) {
    return 0;
  }

  // Analyser la position sur le plateau
  const boardFen = game.fen().split(' ')[0];
  var rows = boardFen.split('/');
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    let row = rows[rowIndex];
    let colIndex = 0;

    for (let charIndex = 0; charIndex < row.length; charIndex++) {
      let char = row[charIndex];
      if (isNaN(char)) {
        if (char in pieceValues) {
          let pieceScore = pieceValues[char];
          let pieceTable = pst[char.toLowerCase()];
          let tableScore = 0;
          if (pieceTable) {
            let adjustedRow = (char === char.toLowerCase()) ? rowIndex : 7 - rowIndex;
            tableScore = pieceTable[adjustedRow][colIndex];
          }
          score += char === char.toLowerCase() ? -(pieceScore + tableScore) : pieceScore + tableScore;
        }
        colIndex++;
      } else {
        colIndex += parseInt(char, 10);
      }
    }
  }

  // Inverse le score pour les noirs
  return score;
}*/