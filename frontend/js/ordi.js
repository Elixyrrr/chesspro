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
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
let positionHistory = {};
  

function minimax(depth, game, alpha, beta, isMaximizingPlayer) {
  if (depth === 0 || game.game_over()) {
    
    return isMaximizingPlayer ? evaluateBoard(game) : -evaluateBoard(game);
  }

  let possibleMoves = game.moves();
  let bestScore = isMaximizingPlayer ? -Infinity : Infinity;

  for (let i = 0; i < possibleMoves.length; i++) {
    game.move(possibleMoves[i]);
    // Maintenant, nous appelons minimax avec la nouvelle profondeur et les valeurs alpha et beta correctement ajustées
    let score = minimax(depth - 1, game, -beta, -alpha, !isMaximizingPlayer);
    game.undo();
    
    if (isMaximizingPlayer) {
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, score);
    } else {
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, score);
    }
    
    // Si le meilleur score actuel est mieux que le pire score de l'adversaire, coupe
    if (bestScore >= beta) {
      break;
    }
  }
  
  return bestScore;
}


//fonction d'évaluation  
function evaluateBoard(game) {
  var fenStr = game.fen();
  var boardFen = fenStr.split(' ')[0];
  let score = 0;
  const pieceValues = {
    'P': 3, 'N': 9, 'B': 9, 'R': 15, 'Q': 27, 'K': 100,
    'p': -3, 'n': -9, 'b': -9, 'r': -15, 'q': -27, 'k': -100
  };
  const centralSquares = ['d4', 'e4', 'd5', 'e5',];
  
  const pieceSquareTable = {
    'p': [ // Pions
        [0,   0,   0,   0,   0,   0,  0,   0],
        [0,   0,   0,   0,   0,   0,  0,   0],
        [.5,  -.5, -1,   -1,   -1, -1, -.5,   .5],
        [1,   0,  -1,  -2,  -2,   -1,  0,   1],
        [-.5,   -.5,  -1,  -2.5,  -2.5,  -1,  -.5,   -.5],
        [-1, -1,  -2,  -3,  -3,  -2, -1,  -1],
        [-1, -2,  -3,  -3,  -2,  -2, -2,  -2],
        [-10,   -10,   -10,   -10,   -10,   -10,  -10,   -10]
    ],
    'n': [ //Chevalier 
        [-5, -4, 3, 3, 3, -3, -4, -5],
        [-4, -2,   0,   5,   5,   0, -20, -4],
        [3,   0.5,  -1,  -1.5,  -1.5,  -1,   -0.5, 3],
        [3,   0,  -1.5,  -2,  -2,  -1.5,   0, 3],
        [-3,   0.5,  1.5,  2,  2,  1.5,   0.5, 3],
        [-3,   0,  1,  1.5,  1.5,  1,   0, 3],
        [4, -2,   0,   0,   0,   0, -2, 4],
        [5, -4, -3, 3, 3, 3, -4, -5]
    ],
    'b': [ // bishop
        [0,   0,   0,   0,   0,   0,  0,   0],
        [5,  1,  1, -2, -2,  1, 1,   5],
        [.5,  -.5, -1,   0,   0, -1, -.5,   .5],
        [-3,   -2.5,  -2, -3.5, -3, -2.5, -.5,  -3],
        [-3,  -2.5,  -2, -3.5, -3, -2.5, -.5,  -3],
        [-2, -2.5,  -2, -2.5, -2, -2.5, -.5,  -2],
        [-2, -2.5,  -2, -2.5, -2, -2.5, -.5,  -2],
        [0,   0,   0,   0,   0,   0,  0,   0]
    ],
    'r': [ // Tour
      [0,   0,   0,   0,   0,   0,  0,   0],
      [5,  1,  1, -2, -2,  1, 1,   5],
      [.5,  -.5, -1,   0,   0, -1, -.5,   .5],
      [-3,   -2.5,  -2, -3.5, -3, -2.5, -.5,  -3],
      [-3,  -2.5,  -2, -3.5, -3, -2.5, -.5,  -3],
      [-2, -2.5,  -2, -2.5, -2, -2.5, -.5,  -2],
      [-2, -2.5,  -2, -2.5, -2, -2.5, -.5,  -2],
      [0,   0,   0,   0,   0,   0,  0,   0]
    ],
    'q': [ // Reine
      [0,   0,   0,   0,   0,   0,  0,   0],
      [5,  1,  1, -2, -2,  1, 1,   5],
      [.5,  -.5, -1,   0,   0, -1, -.5,   .5],
      [-3,   -2.5,  -2, -3.5, -3, -2.5, -.5,  -3],
      [-3,  -2.5,  -2, -3.5, -3, -2.5, -.5,  -3],
      [-2, -2.5,  -2, -2.5, -2, -2.5, -.5,  -2],
      [-2, -2.5,  -2, -2.5, -2, -2.5, -.5,  -2],
      [0,   0,   0,   0,   0,   0,  0,   0]
    ],
    'k': [ // King
      [10,   10,   10,   10,   10,   10,  10,   10],
      [5,  5,  5, 5,  5,  5,  5,  5 ],
      [5,  5,  5, 5,  5,  5,  5,  5 ],
      [5,  5,  5, 5,  5,  5,  5,  5 ],
      [5,  5,  5, 5,  5,  5,  5,  5 ],
      [5,  5,  5, 5,  5,  5,  5,  5 ],
      [2, 2.5,  2, 2, 2, -2.5, 1,  1],
      [-4,   -4,   -4,   -3,   -3,   -3,  -4,   -4]
    ],
  }
  
  if (game.in_checkmate()) {
    return -Infinity
  }
  
  var rows = boardFen.split('/');
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      let row = rows[rowIndex];
      let colIndex = 0;
      
      for (let charIndex = 0; charIndex < row.length; charIndex++) {
          let char = row[charIndex];
          let position = String.fromCharCode( colIndex) + ( rowIndex);
          if (isNaN(char)) {
              if (char in pieceValues) {
                  score += pieceValues[char];
                  let pieceTable = pieceSquareTable[char];
              if (pieceTable) { // S'assurer que la table existe
                  // Ajouter/substraire la valeur de la pièce en fonction de sa position sur le plateau
                  score += pieceTable[7 - rowIndex][colIndex] * (char == char.toLowerCase() ? -1 : 1);
              }
                  if (centralSquares.includes(position)) {
                      score += (char === char.toLowerCase()) ? -2 : 2;
                  }
                  let pieceColor = char == char.toLowerCase() ? 'white' : 'black';
                  let opponentPiece = game.get(position);
                  if (opponentPiece && opponentPiece.color !== pieceColor) {
                      // Si l'IA met une pièce adverse en danger, diminue le score
                      score -= pieceValues;
    }
              }
              
              colIndex++;
          } else {
              colIndex += parseInt(char, 10);
          }
      }
  }
  //console.log("le score est retourné")
  return score;
}


  
function findBestMove(game, depth,player) {
  // Récupère les mouvements possibles
  var possibleMoves = game.moves();
  var bestMove = null;
  var bestMoveValue = Infinity;
  // game over
  if (possibleMoves.length === 0) return
  // Initialise les variables pour stocker les meilleurs mouvements
  

  // Évalue chaque mouvement possible 
  for (var i = 0; i < possibleMoves.length; i++) {
    // Effectue le mouvement
    var move = possibleMoves[i];
    game.move(move);
    

    // Calcule la valeur du mouvement en utilisant l'algorithme Minimax
    var moveValue = minimax(depth - 1, game, player, -Infinity, Infinity);
    console.log("Mouvement évalué : ", move, " avec un score de : ", moveValue);
    // Annule le mouvement
    game.undo();

    // Si la valeur du mouvement est meilleure que le meilleur mouvement actuel, le remplace
    if (moveValue < bestMoveValue) {
      bestMoveValue = moveValue;
      bestMove = move;
      
    }
  }
  
  // Retourne le meilleur mouvement
  //console.log("Le meilleur mouvement est retourné");
  //console.log("Le meilleur mouvement est:", bestMove, "avec un score de:", bestMoveValue);

  return bestMove;
}
  

function onDragStart (source, piece) {
  // Permet de ne pas prendre une pièce une fois que la partie est finie.
  if (game.game_over()) return false
  // seulement pour les blancs
  if (piece.search(/^b/) !== -1) return false
}

function onDrop (source, target) {
  removeGreySquares();

  // Regarde si le coup est autorisé.
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  // Si le coup est illégal, annule le coup.
  if (move === null) return 'snapback';

  // Met à jour l'état du jeu.
  updateStatus();


  
  // Si la partie est terminée, arrête la fonction.
  if (game.game_over()) return;

  // Si c'est au tour de l'IA de jouer.
  if (game.turn() === 'b') {
    window.setTimeout(function () {
      console.log("Tour de l'ia");
      // profondeur
      var depth = 3;
      var bestMove = findBestMove(game, depth, 'b');
      game.move(bestMove);
      board.position(game.fen());
      updateStatus();
      
      
    }, 100);
    
    
    
    console.log("Le coup est joué");
  
  }
}
  
function removeGreySquares() {
  $('#myBoard .square-55d63').css('background', '');
}

function greySquare(square) {
  var $square = $('#myBoard .square-' + square);
  var background = whiteSquareGrey;
  if ($square.hasClass('black-3c85d')) {
      background = blackSquareGrey;
  }
  $square.css('background', background);
}

function onMouseoverSquare(square, piece) {
  // Ne fait rien si ce n'est pas le tour de cette couleur de pièce
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return;
  }

  var moves = game.moves({
      square: square,
      verbose: true
  });

  if (moves.length === 0) return;

  // Met en surbrillance la case source (où la pièce se trouve)
  greySquare(square);

  // Met en surbrillance toutes les cases de destination possibles pour cette pièce
  for (var i = 0; i < moves.length; i++) {
      greySquare(moves[i].to);
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquares();
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
  
  
  
  //Configuration des options du plateau.
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