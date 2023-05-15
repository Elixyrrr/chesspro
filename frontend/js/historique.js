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