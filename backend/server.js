const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const io = require('socket.io')(server);
const jwt = require('jsonwebtoken');
app.set('port', process.env.PORT || 3000);
server.listen(process.env.PORT || 3000);
const User=require('./Modele/user');



const maxClient = 2; // Limite max de clients par salle
const rooms = new Map(); // Map pour stocker les salles
const socketToPseudoMap = new Map();
const timers = new Map(); // Map pour stocker les timers des joueurs


// Fonction pour générer un pseudo aléatoire
function generateRandomPseudo() {
  const adjectives = ['Happy', 'Sad', 'Funny', 'Angry', 'Crazy', 'Brave', 'Shy', 'Lucky', 'Clever', 'Jolly'];
  const animals = ['Cat', 'Dog', 'Lion', 'Elephant', 'Giraffe', 'Tiger', 'Monkey', 'Kangaroo', 'Horse', 'Cow'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adjective}${animal}${Math.floor(Math.random() * 100)}`;
}

function generateRandomId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


// Fonction pour générer un ID de salle aléatoire
function generateRoomId() {
  return Math.random().toString(36).substring(2, 12);
}


// Middleware d'authentification pour les sockets
io.use(async (socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;

  if (cookieHeader) {
    const token = cookieHeader.split("=")[1];
    console.log(token);

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_KEY_TOKEN);
        const user = await User.findById(decoded.userId);

        if (user) {
          socket.id = decoded.userId;
          socket.pseudo = user.pseudo;
          console.log(socket.id);
          socketToPseudoMap.set(socket.id, socket.pseudo); // Ajout du pseudo du joueur
          next();
          return;
        }
      } catch (err) {
        // Si le token est invalide, on passe à l'étape suivante sans appeler next avec une erreur
      }
    } else {
      const sessionToken = jwt.sign({ userId: generateRandomId() }, process.env.JWT_KEY_TOKEN);
      socket.token = sessionToken;
    }
  }

  // Si le cookie d'authentification n'existe pas ou que le token est invalide, on continue sans authentification
  socket.id = generateRandomId(); // Générer un ID aléatoire pour l'invité
  socket.pseudo = generateRandomPseudo(); // Attribuer un pseudo par défaut
  console.log(socket.id);
  socketToPseudoMap.set(socket.id, socket.pseudo); // Ajout du pseudo du joueur
  next();
});
let blackTimer = { minutes: 10, seconds: 0 };
let whiteTimer = { minutes: 10, seconds: 0 };
io.on('connection', (socket) => {
  const pseudo = socket.pseudo;
  const userId = socket.id;
  

  let JoinRoom = false;

  // Si une salle est disponible, la rejoindre
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

        // Attribuer la couleur au premier client qui rejoint la salle
        if (clientCount === 1) {
          assignedColor = 'white';
          const pseudo1 = socket.pseudo;
          const userId1 = socket.id;
          socket.emit('assignColor', assignedColor, pseudo1); // Envoyer la couleur attribuée et le pseudo au client
          socket.emit('assignId', assignedColor, userId1);
          socket.emit('updateTimer', assignedColor, whiteTimer);
        } else if (clientCount === 2) {
          // Événement pour mettre à jour le statut
          assignedColor = 'black';
          const pseudo2 = socket.pseudo;
          const userId2 = socket.id;
          socket.emit('assignColor', assignedColor, pseudo2); // Envoyer la couleur attribuée et le pseudo au client
          socket.emit('assignId', assignedColor, userId2);
          socket.emit('updateTimer', assignedColor, blackTimer);

          // Envoyer les pseudos des joueurs au client
          const pseudo1 = io.sockets.sockets.get(clients.values().next().value).pseudo;
          const userId1 = io.sockets.sockets.get(clients.values().next().value).id;
          io.to(FRoomId).emit('assignColors', { white: pseudo2, black: pseudo1 }); // Échanger les pseudos pour les couleurs
          io.to(FRoomId).emit('assignId', { white: userId2, black: userId1 });
          io.to(FRoomId).emit('updateTimer', { white: blackTimer, black: whiteTimer});
          io.to(FRoomId).emit('redirectClients', '/game');
          
        }

        JoinRoom = true;
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
    assignedColor = 'white'; // Attribuer la couleur blanche au premier utilisateur

    socket.emit('assignColor', assignedColor, pseudo);
    // Envoyer la couleur attribuée au client
    
    console.log(pseudo, userId, assignedColor);
  }// Envoyer les pseudos des joueurs à tous les clients connectés à la salle



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


  // --------------------- Socket, envoi les messages, et les coups.-------------------------
  socket.on('chat message', (msg, pseudo) => {
    console.log('message: ' + socket.pseudo, msg);
    const roomId = getRoomBySocketId(socket.id);
    if (roomId) {
      io.to(roomId).emit('chat message', msg,socket.pseudo);
    }
  });
  socket.on('move',(data) => {
    const roomId = getRoomBySocketId(socket.id);
        io.to(roomId).emit('move', data);
    // }
  // }
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

