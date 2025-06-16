

// ------------------------------------------------------------------------------------------------------------------------------------//

const {Socket}=require('socket.io');
const express= require('express');
const app= express();
const http= require('http').createServer(app);
const path= require('path');
const port=8000;

const io= require('socket.io')(http);
app.use(express.static(__dirname));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/Pere.html'));
});
app.get('/Partie',function(req, res) {
    res.sendFile(path.join(__dirname + '/html/LienPartie.html'));
});
app.get('/OrdiFacile',function(req, res) {
    res.sendFile(path.join(__dirname + '/html/OrdiFacile.html'));
});
app.get('/OrdiIntermediaire',function(req, res) {
  res.sendFile(path.join(__dirname + '/html/OrdiIntermediaire.html'));
});
app.get('/OrdiDifficile',function(req, res) {
  res.sendFile(path.join(__dirname + '/html/OrdiDifficile.html'));
});
app.get('/Accueil',function(req, res) {
    res.sendFile(path.join(__dirname + '/html/pageAccueil.html'));
});
app.get('/Historique',function(req, res) {
    res.sendFile(path.join(__dirname + '/html/Historique.html'));
});
app.get('/Analyse',function(req, res) {
    res.sendFile(path.join(__dirname + '/html/Analyse.html'));
});

app.get('/Connexion',function(req, res) {
    res.sendFile(path.join(__dirname + '/html/Connexion.html'));
});

app.get('/Inscription',function(req, res) {
    res.sendFile(path.join(__dirname + '/html/inscription.html'));
});

app.get('/Pere',function(req, res) {
    res.sendFile(path.join(__dirname + '/html/Pere.html'));
});

app.get('/game',function(req, res) {
    res.sendFile(path.join(__dirname + '/html/game.html'));
});

app.get('/Historique2',function(req, res) {
    res.sendFile(path.join(__dirname + '/html/Historique2Partie.html'));
});

app.get('/Room', (req, res) => {
    res.sendFile(`${__dirname}/html/room.html`);
  });

  app.get('/choixDifficulte',function(req, res) {
    res.sendFile(path.join(__dirname + '/html/choixDifficulte.html'));
});


// Fonction pour générer un ID de salle aléatoire
function generateRoomId() {
  return Math.random().toString(36).substring(2, 12);
}

const maxClient = 2; // Limite max de clients par salle
const rooms = new Map(); // Map pour stocker les salles

io.on('connection', (socket) => {
  let JoinRoom = false;
  // Si une room est disponible, la rejoint
  if (rooms.size > 0) {
    let FRoomId;
    let FRoomSize = 100;

    for (const [roomId, clients] of rooms.entries()) {
      if (clients.size < maxClient && clients.size < FRoomSize) {
        FRoomId = roomId;
        FRoomSize = clients.size;
      }
    }

    if (FRoomId) {
      const clients = rooms.get(FRoomId);
      // Vérifier si le nombre de clients dans la salle est inférieur à la limite (maxClient)
      if (clients.size < maxClient) {
        socket.join(FRoomId);
        clients.add(socket.id);
        const clientCount = clients.size;
        // Si il y'a 2 clients dans la page, redirige les utilisateurs dans l'autre Partie.
        if (clientCount === maxClient) {
          io.to(FRoomId).emit('redirectClients', '/game');
        }
        JoinRoom = true;
      } else {
        // Si la salle est pleine, ne pas joindre la salle et émettre un événement ou un message d'erreur si nécessaire
        // ...
      }
    }
  }
  // Si aucune salle n'est disponible, créer une nouvelle salle
  if (!JoinRoom) {
    const newRoomId = generateRoomId();
    const clients = new Set();
    clients.add(socket.id);
    rooms.set(newRoomId, clients);
    socket.join(newRoomId);
  }

  // Gérer les événements de déconnexion
  socket.on('disconnect', () => {
    // Retirer le client de la salle lorsqu'il se déconnecte
    for (const [roomId, clients] of rooms.entries()){
      if (clients.has(socket.id)){
        clients.delete(socket.id);
        if (clients.size === 0){
          // Si la salle est vide après la déconnexion, la supprimer
          rooms.delete(roomId);
        }
        break;
      }
    }
  });

  // --------------------- Socket, envoi les messages, et les coups.--------------------------
  socket.on('chat message',(msg)=>{
    console.log('message:' + msg);
    const roomId = getRoomBySocketId(socket.id);
    if (roomId) {
        io.to(roomId).emit('chat message', msg);
    }
});
socket.on('move',(msg) => {
    const roomId = getRoomBySocketId(socket.id);
    if (roomId){
        io.to(roomId).emit('move', msg);
    }
});
});

// Fonction pour obtenir l'ID de la salle à partir du socketID
function getRoomBySocketId(socketId) {
for (const [roomId, clients] of rooms.entries()){
    if (clients.has(socketId)){
        return roomId;
    }
}
return null;
}

http.listen(8000,function(){
    console.log(`server runnig on port ${port} : http://localhost:${port}/`);
})




// io.on('connection',(socket)=>{
//     console.log(`Un utilisateur s\'est connecté. [${socket.id}]`);
//     socket.on('disconnect',()=>{
//       console.log(`Un utilisateur s\'est deconnecté. [${socket.id}]`);
//     }); 

//     socket.on('chat message',(msg)=>{
//         console.log('message:' + msg);
//         io.to('FRoomId').emit('chat message',msg);
//     });
// });


// io.on('connection',function(socket){
//     socket.on('move',function(msg){
//         socket.broadcast.emit('move',msg);
//     });
// });

// function generateRoomId() {
//   return Math.random().toString(36).substring(2, 12);
// }
// const maxClient=2; // Limite max de clients par salle
// const rooms=new Map(); // Map pour stocker les salles

// io.on('connection',(socket)=>{
//   let JoinRoom=false;
//   // Si une room est disponible, la rejoint.
//   if (rooms.size>0){
//     let FRoomId;
//     let FRoomSize=100;

//     for (const [roomId, clients] of rooms.entries()){
//       if (clients.size < maxClient && clients.size<FRoomSize){
//         FRoomId = roomId;
//         FRoomSize = clients.size;
//       }
//     }

//     if (FRoomId){
//       const clients = rooms.get(FRoomId);
//       // Vérifier si le nombre de clients dans la salle est inférieur à la limite (maxClient)
//       if (clients.size<maxClient){
//         socket.join(FRoomId);
//         clients.add(socket.id);
//         const clientCount=clients.size;
//         // Si il y'a 2 clients dans la page, redirige les utilisateurs dans l'autre Partie.
//         if (clientCount===maxClient){
//           io.to(FRoomId).emit('redirectClients', '/game');
//         }
//         JoinRoom = true;
//       } else {
//         // Si la salle est pleine, ne pas joindre la salle et émettre un événement ou un message d'erreur si nécessaire
//         // ...
//       }
//     }
//   }

//   // Si aucune salle n'est disponible, créer une nouvelle salle
//   if (!JoinRoom) {
//     const newRoomId = generateRoomId();
//     const clients = new Set();
//     clients.add(socket.id);
//     rooms.set(newRoomId, clients);
//     socket.join(newRoomId);
//   }

//   // Gérer les événements de déconnexion
//   socket.on('disconnect', () => {
//     // Retirer le client de la salle lorsqu'il se déconnecte
//     for (const [roomId, clients] of rooms.entries()) {
//       if (clients.has(socket.id)) {
//         clients.delete(socket.id);
//         if (clients.size === 0){
//           // Si la salle est vide après la déconnexion, la supprimer
//           rooms.delete(roomId);
//         }
//         break;
//       }
//     }
//   });
// });

