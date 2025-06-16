SERVER:

Installer node.js 

Aller sur le dossier backend , ouvrir un terminal et taper cd backend

Taper "npm install --force"

Pour avoir accès à la base de donnès il faut mettre ses identifiants dans le fichier .env , s'inspirer du document exemple.env

Pour lancer le server : taper sur la console "node server " ou bien "npm run start"

Voir les commentaires pour plus d'informations sur un code




ROUTE:
{
    Route POST pour s'incrire:
    "http://localhost:3000/api/auth/signup/"

    Voir le document password.js dans le dossier Middlewares pour savoir quelle type de mot de passe il faut insérer

    Route POST pour se connecter:
    "http://localhost:3000/api/auth/login/"

     Route POST pour se déconnecter:
    "http://localhost:3000/api/auth/logout/"
}


{
  Les routes ci dessous ont besoin catégoriquement d'un token d'authentification qui est génerer par l'utilisateur lorsqu'il se connecte.
  De plus ces routes sont gérer par le middleware d'authentification qui stocke le token dans le cookies du naviguateur internet permettant l'authentification à toutes les autres routes du site à part bien entendu la connexion et l"inscription.
    Pour la route PUT , possibilité d'utiliser Postman en allant dans la catégorie body,raw,JSON pour modifier les informations voulu.
    

    Route GET pour récuperer les informations sur un joueur:
    "http://localhost:3000/api/user/profile"  



    Route PUT pour modifier les informations sur un joueur:
    "http://localhost:3000/api/user/profile"


    Route DELETE pour supprimer les informations d'un joueur:
    "http://localhost:3000/api/user/profile"

}


{
    Route POST pour sauvegarder la partie dans la base de données: 
    "http://localhost:3000/api/user/parties/save"

     Route GET pour récupérer le résultat dans l'historique:
    "http://localhost:3000/api/user/parties/save

}

{
    Route POST pour récupérer les pseudos des joueurs dans la base de données:
    "http://localhost:3000/api/players/search/"
    
    Route POST pour rechercher un joueur dans la base de données:
    "http://localhost:3000/api/players/search:pseudo"

    Route GET pour recupérer le profil d'un joueur dans la base de données:
    "http://localhost:3000/api/players/search:pseudo"

}




