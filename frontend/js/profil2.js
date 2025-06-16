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


const updateProfileForm = document.getElementById('update-profile-form');
        
updateProfileForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const pseudo = document.getElementById('pseudo').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;

  // Vérification que les mots de passe correspondent
  if (password && password !== passwordConfirm) {
    alert('Les mots de passe ne correspondent pas.');
    return;
  }
  fetch('/api/user/profile', {
    method: 'PUT',
    headers: {
        'Cookie': 'token=' + tokenCookie,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        pseudo,
        email,
        password
    })
})
.then(response => {
    if (response.ok) {
        alert('Vos modifications ont été enregistrées.');
        window.location.href = '/profil';
    } else if (response.status === 401) {
        alert('Vous devez être connecté pour effectuer cette action.');
        window.location.href = '/connexion';
    } else {
        response.json().then(data => {
            if (data && data.message) {
                alert(`Une erreur est survenue : ${data.message}`);
            } else {
                alert('Une erreur est survenue. Veuillez réessayer plus tard.');
            }
        }).catch(error => {
            console.error(error);
            alert('Une erreur est survenue. Veuillez réessayer plus tard.');
        });
    }
})
.catch(error => {
    console.error(error);
    alert('Une erreur est survenue. Veuillez réessayer plus tard.');
});
})


var tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));
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
  document.getElementById('username').textContent = data.pseudo;
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