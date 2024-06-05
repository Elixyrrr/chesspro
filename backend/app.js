const express = require("express");
const morgan=require("morgan");
const bodyParser = require('body-parser');
const app=express();
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json({ limit: '50mb' }));
console.log(bodyParser);
app.use(express.urlencoded({ extended: true }));
const path = require('path');
/*const { CommandoClient, Command } = require('discord.js-commando');
const { Structures } = require('discord.js');

const client = new CommandoClient({
  commandPrefix: '&', // Préfixe personnalisé
  owner: '1003196143909490788', // ID de ton compte Discord
});

client.registry
  .registerDefaultTypes()
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerGroup('custom', 'Commandes personnalisées') // Enregistre un groupe personnalisé
  .registerCommand(
    class extends Command {
      constructor(client) {
        super(client, {
          name: 'game',
          group: 'custom',
          memberName: 'game',
          description: 'Redirection vers un site de jeu.',
        });
      }

      run(message) {
        message.reply('Clique sur https://chessgame-dnw8.onrender.com/room pour lancer une partie');
      }
    }
  );

client.on('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

client.login(process.env.TOKENDISCORD);

client.on('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});*/




// Configuration des variables d'environnements
const dotenv=require('dotenv');
const result = dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes=require('./routes/user');
const saveRoutes= require('./routes/partie');
const playerRoutes= require('./routes/player');


const mongoose=require('mongoose');

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.${process.env.DB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority`) //Connexion à la base de données
  .then(() => {
    console.log('Authentification réussie!');
  })
  .catch((error) => {
    console.log('Authentification échoué');
    console.error(error);
  });


// Implémentation du CORS 
app.use((req, res, next) => {
  //console.log(req);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(morgan("dev"));
mongoose.set('debug', true);

app.use(express.static(path.join(__dirname, '../frontend')));
app.get("/Inscription", (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/inscription.html'));
});
app.get('/', (req, res)  => {
  res.sendFile(path.join(__dirname, '../frontend/html/Pere.html'));
});

app.get('/Partie', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/LienPartie.html'));
});

app.get('/Ordi', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/Ordi.html'));
});

app.get('/Accueil', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/pageAccueil.html'));
});

app.get('/Historique', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/Historique.html'));
});

app.get('/Analyse', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/Analyse.html'));
});

app.get('/Game', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/game.html'));
});

app.get('/Historique2', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/Historique2Partie.html'));
});

app.get('/Pere', (req, res)=> {
  res.sendFile(path.join(__dirname, '../frontend/html/Pere.html'));
});

app.get('/Connexion', (req, res)=> {
  res.sendFile(path.join(__dirname, '../frontend/html/Connexion.html'));
});

app.get('/profil', (req, res)=> {
  res.sendFile(path.join(__dirname, '../frontend/html/profil.html'));
});

app.get('/profil2', (req, res)=> {
  res.sendFile(path.join(__dirname, '../frontend/html/profil2.html'));
});

app.get('/logout', (req, res)=> {
  res.sendFile(path.join(__dirname, '../frontend/html/deconnexion.html'));
});

app.get('/Room', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/room.html'));
});

app.get('/Recherche', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/search.html'));
});

app.get('/choixDifficulte', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/choixDifficulte.html'));
});
app.get('/OrdiFacile', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/OrdiFacile.html'));
});
app.get('/OrdiIntermediaire', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/OrdiIntermediaire.html'));
});
app.get('/OrdiDifficile', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/OrdiDifficile.html'));
});

app.get('/search/:pseudo', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/player.html'));
});
app.get('/Error', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/Error.html'));
});



const { exec } = require('child_process');


app.use(bodyParser.json());

app.post('/best_move', (req, res) => {
    const { fen, depth, color } = req.body;

    const pythonProcess = exec(`python minimax.py "${fen}" ${depth} ${color}`);

    let jsonString = '';
    let stderrString = '';

    pythonProcess.stdout.on('data', (data) => {
        jsonString += data;
    });

    pythonProcess.stderr.on('data', (data) => {
        stderrString += data;
    });

    pythonProcess.on('close', (code) => {
        console.error(`Python process exited with code ${code}`);
        console.error(`stderr: ${stderrString}`);

        if (code !== 0) {
            res.status(500).json({ error: `Python process exited with code ${code}` });
        } else {
            try {
                const result = JSON.parse(jsonString);
                res.status(200).json(result);
            } catch (e) {
                console.error('Error parsing JSON:', e);
                console.error('Received JSON:', jsonString);
                res.status(500).json({ error: 'Failed to parse Python output' });
            }
        }
    });
});







//Route d'authentification
app.use('/api/auth', authRoutes);
//Route User
app.use('/api/user', userRoutes);

app.use('/api/parties', saveRoutes);

app.use('/api/players', playerRoutes);



// exportation de app pour pouvoir y acceder depuis n'importe quel fichier
module.exports=app;
