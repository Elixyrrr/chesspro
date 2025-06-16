const logoutButton = document.getElementById('deconnexion');
logoutButton.addEventListener('click', (event) => {
  event.preventDefault();
  fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })
  .then(response => {
    if (response.ok) {
      window.location.href = '/';
    } else {
      console.error('Erreur lors de la déconnexion');
    }
  })
  .catch(error => console.error(error));
});
document.addEventListener('DOMContentLoaded', () => {
const deleteButton = document.getElementById('delete');
deleteButton.textContent = 'Supprimer mon compte';
deleteButton.style.backgroundColor = 'black';
deleteButton.style.color = 'white';

deleteButton.addEventListener('click', (event) => {
  event.preventDefault();
  fetch('/api/user/profile', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })
  .then(response => {
    if (response.ok) {
      window.location.href = '/';
    } else {
      console.error('Erreur lors de la suppression du profil');
    }
  })
  .catch(error => console.error(error));
});
});


const editButton = document.getElementById('edit');
editButton.addEventListener('click', (event) => {
  event.preventDefault();
  window.location.href = '/profil2'; // remplacer avec le lien de la page de modification du profil
});


let tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));
  if (!tokenCookie) {
    console.log('Token manquant');
    // Redirection vers la page de connexion
    window.location.href = '/Connexion';
  }
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
    document.getElementById('pseudo').textContent = data.pseudo;
    document.getElementById('username').textContent = data.pseudo;
    document.getElementById('email').textContent = data.email;
    document.getElementById('partiejoué').textContent = data.partiejoué;
    document.getElementById('partiegagné').textContent = data.partiegagné;
    document.getElementById('partieperdu').textContent = data.partieperdu;
  })
  .catch(error => console.error(error));

if (tokenCookie) {
    // Afficher le bouton "Profil" et le bouton "Déconnexion" et le bouton "Historique" et le "Username"
    document.getElementById('profil').style.display = 'block';
    document.getElementById('deconnexion').style.display = 'block';
    document.getElementById('connexion').style.display = 'none';
    document.getElementById('history').style.display = 'block';
    document.getElementById('username').style.display = 'block';
} else {
    // Afficher le bouton "Connexion" et masquer le bouton "Profil" et le bouton "Déconnexion et le bouton "Historique" et le "Username"
    document.getElementById('connexion').style.display = 'block';
    document.getElementById('profil').style.display = 'none';
    document.getElementById('deconnexion').style.display = 'none';
    document.getElementById('history').style.display = 'none';
    document.getElementById('username').style.display = 'none';
}