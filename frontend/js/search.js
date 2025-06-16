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









const input = document.getElementById('pseudo-search'); // Récupération de l'élément input par son ID
const select = document.getElementById('result-select'); // Récupération de l'élément select par son ID

input.addEventListener('input', (event) => { // Ajout d'un écouteur d'événement sur l'input pour détecter les changements de valeur
  const search = event.target.value.trim(); // Récupération de la valeur saisie dans l'input et suppression des espaces au début et à la fin

  if (search.length > 0) { // Si la chaîne de recherche contient au moins un caractère
    fetch(`/api/players/search?query=${search}`) // Envoi d'une requête GET vers l'API avec la chaîne de recherche en paramètre
      .then(response => response.json()) // Conversion de la réponse en JSON
      .then(players => {
        select.innerHTML = ''; // Réinitialisation du contenu du select
        players.forEach(player => {
          const option = document.createElement('option'); // Création d'un élément option pour chaque joueur trouvé
          option.text = player.pseudo; // Définition du texte de l'option avec le pseudo du joueur
          select.add(option); // Ajout de l'option au select
        });
      });
  } else { // Si la chaîne de recherche ne contient aucun caractère
    select.innerHTML = ''; // Réinitialisation du contenu du select
  }
});

function rechercher() {
  const selectedPseudo = document.getElementById("result-select").value;
  const data1 ={
    pseudo: selectedPseudo
  }
  fetch("api/players/search/"+selectedPseudo,{
    method: 'POST',
    body: JSON.stringify(data1),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) {
        console.log("Recherche reussie");
        window.location.href = "/search/"+selectedPseudo;
      } else {
        console.log("Erreur lors de la recherche de l'utilisateur "+selectedPseudo);
      }
    })
    .catch(error => {
      console.error(error);
    });
  
}

// Ajoutez un gestionnaire d'événements pour le bouton "Rechercher"
document.getElementById("searchbutton").addEventListener("click", rechercher);