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
var depth = 3;
var globalScore=0;
var game = new Chess();
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
let positionHistory = {};

var pieceValues = { 
  p: 100, n: 280, b: 320, r: 479, q: 929, k: 60000, k_e: 60000,
  P: -100, N: -280, B: -320, R: -479, Q: -929, K: -60000, K_E: -60000 };
var pieceSquareTable  = {
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
}
var pst_b  = {
  p: pieceSquareTable ['p'].slice().reverse(),
  n: pieceSquareTable ['n'].slice().reverse(),
  b: pieceSquareTable ['b'].slice().reverse(),
  r: pieceSquareTable ['r'].slice().reverse(),
  q: pieceSquareTable ['q'].slice().reverse(),
  k: pieceSquareTable ['k'].slice().reverse(),
};

var pstOpponent = { w: pst_b, b: pieceSquareTable  };
var pstSelf = { w: pieceSquareTable , b: pst_b };


function minimax(game, depth, alpha, beta, isMaximizingPlayer, score, color) {
  positionCount++;

  if (depth === 0 || game.game_over()) {
    return [null, score];
  }


  var children = game.moves({ verbose: true });

  
  if (children.length === 0) {
    return [null,score];
  }

  children.sort(function (a, b) { return 0.5 - Math.random(); });

  var maxValue = -Infinity;
  var minValue = Infinity;
  var bestMove = null;

  for (var i = 0; i < children.length; i++) {
    var currMove = children[i];
    var moveResult = game.move(currMove);

    
    if (moveResult === null) continue;

    var newscore= evaluateBoard(game, moveResult, score, color);
    var [childBestMove, childValue] = minimax(
      game, depth - 1, alpha, beta, !isMaximizingPlayer, newscore, color
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

//fonction d'évaluation
function evaluateBoard(game, move, prevscore, color) {
  if (!move) return prevscore;

<<<<<<< HEAD
  // Simplifie la gestion des pièces capturées
  if ('captured' in move) {
    // Juste utiliser les poids sans PST
    var pieceValue = pieceValues[move.captured];
    if (move.color !== color) {
      prevscore += pieceValue;
    } else {
      prevscore -= pieceValue;
=======
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
      
>>>>>>> a17b4f52d3e1be53accc3be80f6c714edbebe27f
    }
  }

  // Eliminer les détails des promotions et des pièces en mouvement
  return prevscore;
}



function findBestMove(game, depth, currentscore) {
  positionCount = 0;

  var [bestMove] = minimax(
    game,
    depth,
    -Infinity,
    Infinity,
    true,
    currentscore,
    color
  );


  return bestMove; // Retourne le meilleur coup trouvé
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
function onDragStart (source, piece) {
  // Permet de ne pas prendre une pièce une fois que la partie est finie.
  if (game.game_over()) return false
  // seulement pour les blancs
  if (piece.search(/^b/) !== -1) return false
}

function onDrop(source, target) {
  

  // Regarde si le coup est autorisé.
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'  // Promotion en Reine par défaut
  });

  // Si le coup est illégal, annule le coup.
  if (move === null) return 'snapback';

  // Met à jour l'état du jeu.
  updateStatus();

  // Si la partie est terminée, arrête la fonction.
  if (game.game_over()) return;

  // Si c'est au tour de l'IA de jouer.
  if (game.turn() === 'b') {
<<<<<<< HEAD
    console.log("Tour de l'IA");

    // Ajoute un délai avant que l'IA joue son coup
    setTimeout(function() {
      var bestMove = findBestMove(game, depth, globalScore);
      game.move(bestMove);
      board.position(game.fen());
      updateStatus();
      console.log("Le coup de l'IA est joué");
    }, 100); 
=======
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
  
>>>>>>> a17b4f52d3e1be53accc3be80f6c714edbebe27f
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
          whitemin.innerHTML = pad(00);
          whitesec.innerHTML = pad(00);
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
          blackmin.innerHTML = pad(00);
          blacksec.innerHTML = pad(00);
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