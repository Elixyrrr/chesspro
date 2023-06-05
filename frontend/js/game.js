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

// Fonction socket.io permettant d'avoir un chat en Ligne.
const socket = io();
var whiteplayerId = "";
var blackplayerId = "";
var whiteplayer = "";
var blackplayer = "";
var whitemin;
var whitesec;
var blackmin;
var blacksec;
$(function(){
  $("form").submit(function(e){
    e.preventDefault();
    const msg = $("#msg").val();
    const pseudo = socket.pseudo;
    socket.emit("chat message", msg, pseudo); // Envoyer le pseudo avec le message
    $("#msg").val("");
    return false;
  });

  socket.on('chat message', function(msg, pseudo){ // Récupérer le pseudo avec le message
    $("#messages").append($("<p>").text(pseudo + ": " + msg));
    const messages = document.querySelector('#messages');
    messages.scrollTop = messages.scrollHeight;
  });
});
// Ecouter l'événement 'assignColors' envoyé par le serveur

socket.on('assignColors', ({ white, black }) => {
  // Mettre à jour les éléments HTML correspondants avec les pseudos
  
  if (assignedColor === 'white') {
    document.getElementById('nomjoueur1').textContent = white;
    document.getElementById('nomjoueur2').textContent = black;
    
  }
  if (assignedColor === 'black') {
    document.getElementById('nomjoueur1').textContent = black;
    document.getElementById('nomjoueur2').textContent = white;

  }
  whiteplayer = white;
  blackplayer = black;
});


// Écouteur d'événement pour la mise à jour des minuteurs reçue du serveur
socket.on('updateTimer', ({ white, black }) => {
  if (assignedColor === 'white') {
    black.minutes = document.getElementById('blackminutes');
    black.seconds = document.getElementById('blackseconds');
    white.minutes = document.getElementById('minutes');
    white.seconds = document.getElementById('seconds');
  }
  if (assignedColor === 'black') {
    white.minutes = document.getElementById('blackminutes');
    white.seconds = document.getElementById('blackseconds');
    black.minutes = document.getElementById('minutes');
    black.seconds = document.getElementById('seconds');
  }
  whitemin = white.minutes;
  whitesec = white.seconds;
  blackmin = black.minutes;
  blacksec = black.seconds;
});



socket.on('assignId', ({ white, black }) => {
  whiteplayerId = white;
  blackplayerId = black;
  console.log('White player id:', whiteplayerId);
  console.log('Black player id:', blackplayerId);
});
// -------------- Importation de la librairie Chessboard.js -------------------------------//
// initialisation des variables.
var whiteSquareGrey='#a9a9a9'
var blackSquareGrey='#696969'
var board=null
var game=new Chess()
var $status=$('#status')
var $fen=$('#fen')
var $pgn=$('#pgn')

let OrientationBord = false;
// Événement pour attribuer la couleur blanche au premier utilisateur qui se connecte
socket.on('assignColor', function(color){
  // Met à jour la couleur des pièces du joueur côté client
  board.orientation(color);
  OrientationBord=true;
});

function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square=$('#myBoard .square-' + square)

  var background=whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background=blackSquareGrey
  }
  $square.css('background', background)
}

function onDragStart (source, piece){
  // Permet de ne pas prendre une pièce une fois que la partie est finie.
  if (game.game_over()) return false
  // Ou quand ce n'est pas a la couleur de jouer.
    if ((game.turn() === 'w' && assignedColor !== 'white') ||(game.turn() === 'b' && assignedColor !== 'black')){

    return false
  }
}

  // if (game.game_over() || game.turn() !== currentColor) return false;
  let assignedColor = null;

  socket.on('assignColor', (color) => {
    console.log('Assigned color:', color);
    assignedColor = color; // Stockage de la valeur dans une variable
  });

  function onDrop(source, target) {
    removeGreySquares();
    
    /* Demander à l'utilisateur la pièce de promotion souhaitée (par défaut, la reine 'q')
    var promotionPiece = prompt("Choisissez la pièce de promotion (q, r, n, b) :");
    if (!promotionPiece) {
      promotionPiece = 'q'; // Par défaut, si aucun choix n'est saisi
    }*/
    
    var move = game.move({
      from: source,
      to: target,
      promotion: "q"
    });
    
    if (move === null) {
      return 'snapback';
    }
    
    updateStatus();
    
    // Envoyer le coup joué avec la pièce de promotion à la salle spécifique
    socket.emit('move', { move: move, room: 'roomid' });
  }
function onMouseoverSquare (square, piece) {
  // Donne les coups possibles
  var moves=game.moves({
    square: square,
    verbose: true
  })

  // Retourne si il n'y a pas de coup possible
  if (moves.length === 0) return

  // Fonction qui permet d'afficher les coups possibles en Gris
  greySquare(square)
  for (var i=0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }
}
//Quand la souris n'est plus sur la case enleve les coups possibles.
function onMouseoutSquare (square, piece) {
  removeGreySquares()
}


function onSnapEnd () {
  board.position(game.fen());
  socket.emit('update_board', {fen: game.fen(), room: 'roomid'});
}
var partieabandonne=false;
function abandonnerPartie() {
  let status = '';
  let result1 = '';
  let result2 = '';
  let joueur1 = whiteplayer;
  let joueur2 = blackplayer;
  let socketid1 = whiteplayerId;
  let socketid2 = blackplayerId;
  
  if (assignedColor === "white") {
    status = 'Les blancs ont abandonné la partie.';
    $('#status').html(status);
    alert('Les blancs ont abandonné la partie.');
    if (joueur1 === whiteplayer) {
      result1 = 'Gagnant';
      result2 = 'Perdant';
    } else {
      result1 = 'Perdant';
      result2 = 'Gagnant';
    }
  } else {
    status = 'Les noirs ont abandonné la partie.';
    $('#status').html(status);
    alert('Les noirs ont abandonné la partie.');
    if (joueur2 === blackplayer) {
      result1 = 'Perdant';
      result2 = 'Gagnant';
    } else {
      result1 = 'Gagnant';
      result2 = 'Perdant';
    }
  }
  
  // Envoi des données de la partie abandonnée au serveur
  const data1 = {
    nomjoueur1: joueur1,
    nomjoueur2: joueur2,
    resultat: result1, // Utiliser result1 pour le joueur qui abandonne
    date: new Date(),
    pgn: $pgn.text(),
    userId: socketid1 // Envoi du socket.id du joueur 1
  };
  
  const data2 = {
    nomjoueur1: joueur2,
    nomjoueur2: joueur1,
    resultat: result2, // Utiliser result2 pour l'adversaire
    date: new Date(),
    pgn: $pgn.text(),
    userId: socketid2 // Envoi du socket.id du joueur 2
  };
  
  fetch('/api/parties/save', {
    method: 'POST',
    body: JSON.stringify(data1),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    if (response.ok) {
      console.log('Partie abandonnée enregistrée avec succès pour le joueur 1');
    } else {
      console.log('Erreur lors de l\'enregistrement de la partie abandonnée pour le joueur 1');
    }
  }).catch(error => {
    console.error(error);
  });
  
  fetch('/api/parties/save', {
    method: 'POST',
    body: JSON.stringify(data2),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    if (response.ok) {
      console.log('Partie abandonnée enregistrée avec succès pour le joueur 2');
    } else {
      console.log('Erreur lors de l\'enregistrement de la partie abandonnée pour le joueur 2');
    }
  }).catch(error => {
    console.error(error);
  });
  $status.html(status);
  game.game_over = true;
}
/*// Écouteur d'événement pour le départ du joueur
window.addEventListener('beforeunload', function(event) {
  // Appeler la fonction abandonnerPartie ici
  abandonnerPartie();

  // Personnaliser le message d'alerte qui s'affiche au joueur
  var confirmationMessage = 'Êtes-vous sûr de vouloir quitter la partie ?';

  // La valeur de retour spécifique à l'événement est requise pour certains navigateurs
  event.returnValue = confirmationMessage;
  return confirmationMessage;
});*/

function echecEtMat() {
  let result1 = '';
  let result2 = '';
  let joueur1 = $("#nomjoueur1").text();
  let joueur2 = $("#nomjoueur2").text();
  let socketid1 = whiteplayerId;
  let socketid2 = blackplayerId;

  if (game.in_checkmate()) {
    if (game.turn()=="b") {
      if (joueur1 === whiteplayer) {
        result1 = 'Perdant';
        result2 = 'Gagnant';
      } 
    } else {
      if (joueur2 === blackplayer) {
        result1 = 'Gagnant';
        result2 = 'Perdant';
      }
    }
    // Envoi des données de la partie terminée au serveur pour le joueur qui perd
    const data1 = {
      nomjoueur1: joueur1,
      nomjoueur2: joueur2,
      resultat: result1,
      date: new Date(),
      pgn: $pgn.text(),
      userId: socketid1
    };
    const data2 = {
      nomjoueur1: joueur2,
      nomjoueur2: joueur1,
      resultat: result2,
      date: new Date(),
      pgn: $pgn.text(),
      userId: socketid2
    };

    fetch('/api/parties/save', {
      method: 'POST',
      body: JSON.stringify(data1),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          console.log('Partie terminée enregistrée avec succès pour le joueur 1');
        } else {
          console.log('Erreur lors de l\'enregistrement de la partie terminée pour le joueur 1');
        }
      })
      .catch(error => {
        console.error(error);
      });

    fetch('/api/parties/save', {
      method: 'POST',
      body: JSON.stringify(data2),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          console.log('Partie terminée enregistrée avec succès pour le joueur 2');
        } else {
          console.log('Erreur lors de l\'enregistrement de la partie terminée pour le joueur 2');
        }
      })
      .catch(error => {
        console.error(error);
      });
  }
}

let partieNulleEnregistree = false; // Variable pour vérifier si la partie nulle a déjà été enregistrée

function partieNulle() {
  if (partieNulleEnregistree) {
    return; // Sortir de la fonction si la partie nulle a déjà été enregistrée
  }

  let joueur1 = $("#nomjoueur1").text();
  let joueur2 = $("#nomjoueur2").text();
  let socketid1 = whiteplayerId;
  let socketid2 = blackplayerId;
  let result;
  if (game.in_draw()) {
    if (assignedColor === "white") {
      if (joueur1 === whiteplayer) {
        result = 'Egalité';
        result = 'Egalité';
      } else {
        result = 'Egalité';
        result = 'Egalité';
      }
    } else {
      if (joueur2 === blackplayer) {
        result = 'Egalité';
        result = 'Egalité';
      }
    }

  // Envoi des données de la partie nulle au serveur pour les deux joueurs
  const data1 = {
    nomjoueur1: joueur1,
    nomjoueur2: joueur2,
    resultat: result,
    date: new Date(),
    pgn: $pgn.text(),
    userId: socketid1
  };

  const data2 = {
    nomjoueur1: joueur2,
    nomjoueur2: joueur1,
    resultat: result,
    date: new Date(),
    pgn: $pgn.text(),
    userId: socketid2
  };

  fetch('/api/parties/save', {
    method: 'POST',
    body: JSON.stringify(data1),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) {
        console.log('Partie terminée enregistrée avec succès pour le joueur 1');
      } else {
        console.log('Erreur lors de l\'enregistrement de la partie terminée pour le joueur 1');
      }
    })
    .catch(error => {
      console.error(error);
    });

  fetch('/api/parties/save', {
    method: 'POST',
    body: JSON.stringify(data2),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) {
        console.log('Partie terminée enregistrée avec succès pour le joueur 2');
      } else {
        console.log('Erreur lors de l\'enregistrement de la partie terminée pour le joueur 2');
      }
    })
    .catch(error => {
      console.error(error);
    });

}
}

// //retorune la position de l'echiquier.
//Update le Status,

// Update le Status



function updateStatus() {
  $pgn.html(game.pgn());
  let status = '';
  let moveColor = 'Blanc';
  if (game.turn() === 'b') {
    moveColor = 'Noir';
  }

  // Vérifie s'il y a échec et mat
  if (game.in_checkmate()) {
    let winner = moveColor === 'Blanc' ? 'Noir' : 'Blanc';
    echecEtMat();
    status = 'Fin de partie, ' + winner + ' a gagné.';
  }  else if (game.in_draw()) { // Vérifie s'il y a égalité
    if (!partieNulleEnregistree) {
      partieNulle();
      partieNulleEnregistree = true; // Marquer la partie nulle comme enregistrée
    }
    status = 'Fin de partie, égalité.';
  } else { // La partie est en cours
    status = moveColor + ' de jouer';

    // Vérifie s'il y a échec
    if (game.in_check()) {
      status += ', ' + moveColor + ' est en échec';
    }
  }

  $('#status').html(status);
  $status.html(status);
  $fen.html(game.fen());
  listePP(game);

  
}

// Renvoie au serveur la position des pièces grace au FEN.

socket.on('move', function (data){
  var resultat=game.move(data.move);
  if (resultat === null) return;
  board.position(game.fen());
  updateStatus();
});

socket.on('update_board', function(data){
  board.position(data.fen);
});

//Configuration des options du plateau.
var config={
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare
}
board=Chessboard('myBoard', config)


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


  // Fonction qui permet de decrementer le temps total des blancs.
  function updateTimer() {
    let result1 = '';
    let result2 = '';
    let joueur1 = $("#nomjoueur1").text();
    let joueur2 = $("#nomjoueur2").text();
    let socketid1 = whiteplayerId;
    let socketid2 = blackplayerId;
  
    if (whitetot >=0 && game.game_over() === false) {
      whitetot--;
      const minutes=Math.floor((whitetot/ 60));
      const seconds=whitetot - (minutes * 60);
      // Change l'affichage du minuteur
      whitemin.innerHTML=pad(minutes);
      whitesec.innerHTML=pad(seconds);
          //si le temps est écoulé.
    if(whitetot==-1){
        alert("Temps écoulé");
        whitemin.innerHTML=pad(00);
        whitesec.innerHTML=pad(00);
        if (joueur2 === whiteplayer) {
          result1 = 'Gagnant';
          result2 = 'Perdant';
        } else {
          result1 = 'Perdant';
          result2 = 'Gagnant';
        const data1 = {
          nomjoueur1: joueur1,
          nomjoueur2: joueur2,
          resultat: result2,
          date: new Date(),
          pgn: ($pgn.text()),
          userId: socketid1// Envoi du socket.id du joueur 1
        };
        const data2 = {
          nomjoueur1: joueur2,
          nomjoueur2: joueur1,
          resultat: result1,
          date: new Date(),
          pgn: ($pgn.text()),
          userId: socketid2 // Envoi du socket.id du joueur 2
        };
        fetch('/api/parties/save', {
          method: 'POST',
          body: JSON.stringify(data1),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          if (response.ok) {
            console.log('Partie abandonnée enregistrée avec succès pour le joueur 1');
          } else {
            console.log('Erreur lors de l\'enregistrement de la partie abandonnée pour le joueur 1');
          }
        }).catch(error => {
          console.error(error);
        });
        fetch('/api/parties/save', {
          method: 'POST',
          body: JSON.stringify(data2),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => {
          if (response.ok) {
            console.log('Partie abandonnée enregistrée avec succès pour le joueur 1');
          } else {
            console.log('Erreur lors de l\'enregistrement de la partie abandonnée pour le joueur 1');
          }
        }).catch(error => {
          console.error(error);
        });
      }
    }
    return whitetot;
  }
}
    // Fonction qui permet de decrementer le temps total des Noirs.

    function blackupdateTimer() {
        let result1 = '';
        let result2 = '';
        let joueur1 = $("#nomjoueur1").text();
        let joueur2 = $("#nomjoueur2").text();
        let socketid1 = whiteplayerId;
        let socketid2 = blackplayerId;
        
        if (blacktot >= 0 && game.game_over() === false) {
          blacktot--;
          const bminutes = Math.floor((blacktot/ 60));
          const bseconds = blacktot - (bminutes * 60);
              // Change l'affichage du minuteur
  
          blackmin.innerHTML = pad(bminutes);
          blacksec.innerHTML = pad(bseconds);
      
          // Si le temps est écoulé
          if (blacktot === -1) {
            alert("Temps écoulé");
            blackmin.innerHTML = '00';
            blacksec.innerHTML = '00';
            
            if (joueur1 === blackplayer) {
              result1 = 'Gagnant';
              result2 = 'Perdant';
            } else {
              result1 = 'Perdant';
              result2 = 'Gagnant';
            }
            
            const data1 = {
              nomjoueur1: joueur1,
              nomjoueur2: joueur2,
              resultat: result1,
              date: new Date(),
              pgn: ($pgn.text()),
              userId: socketid1 // Envoi du socket.id du joueur 1
            };
            
            const data2 = {
              nomjoueur1: joueur2,
              nomjoueur2: joueur1,
              resultat: result2,
              date: new Date(),
              pgn: ($pgn.text()),
              userId: socketid2 // Envoi du socket.id du joueur 2
            };
          fetch('/api/parties/save', {
            method: 'POST',
            body: JSON.stringify(data1),
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(response => {
            if (response.ok) {
              console.log('Partie abandonnée enregistrée avec succès pour le joueur 1');
            } else {
              console.log('Erreur lors de l\'enregistrement de la partie abandonnée pour le joueur 1');
            }
          }).catch(error => {
            console.error(error);
          });
          fetch('/api/parties/save', {
            method: 'POST',
            body: JSON.stringify(data2),
            headers: {
              'Content-Type': 'application/json'
            }
          }).then(response => {
            if (response.ok) {
              console.log('Partie abandonnée enregistrée avec succès pour le joueur 1');
            } else {
              console.log('Erreur lors de l\'enregistrement de la partie abandonnée pour le joueur 1');
            }
          }).catch(error => {
            console.error(error);
          });
        }
      }
      return blacktot;
    }
  function listePP(game){
    const piecesP={
      'w': { 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0 },
      'b': { 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0 }
    }
  
    const history=game.history({ verbose: true })
  
    for (const move of history) {
      if (move.captured) {
        const piece=move.captured
        const color=move.color === 'w' ? 'b' : 'w'
        piecesP[color][piece]++;
      }
    }

    //BLANC
    const wp=piecesP['w']['p']
    document.getElementById('wP').innerHTML=wp
    const wn=piecesP['w']['n']
    document.getElementById('wN').innerHTML=wn
    const wb=piecesP['w']['b']
    document.getElementById('wB').innerHTML=wb  
    const wr=piecesP['w']['r']
    document.getElementById('wR').innerHTML=wr
    const wq=piecesP['w']['q']
    document.getElementById('wQ').innerHTML=wq
    //NOIR

    const bp=piecesP['b']['p']
    document.getElementById('bP').innerHTML=bp
    const bn=piecesP['b']['n']
    document.getElementById('bN').innerHTML=bn
    const bb=piecesP['b']['b']
    document.getElementById('bB').innerHTML=bb
    const br=piecesP['b']['r']
    document.getElementById('bR').innerHTML=br
    const bq=piecesP['b']['q']
    document.getElementById('bQ').innerHTML=bq

    return piecesP;
  }


  
  /*$('#flip').on('click', board.flip)*/
  $('#abandonner').on('click',abandonnerPartie)