function showError(message) {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = ''; // Supprime le contenu précédent de la div
    const alertMessage = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        ${message}
      </div>
    `;
    alertContainer.innerHTML = alertMessage;
    setTimeout(() => {
      alertContainer.innerHTML = ''; // Supprime l'alerte après 5 secondes
    }, 5000);
}


const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
  event.preventDefault(); // Empêche le comportement par défaut du formulaire
  const pseudo = document.getElementById('pseudo').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      pseudo: pseudo,
      email: email,
      password: password
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      window.location.href = '/accueil'; // Redirection vers la page d'accueil
    } else {
      response.json().then(data => {
        showError(`Authentification échouée ! : ${data.error}`);
      }).catch(error => console.error(error));
    }
  })
  .catch(error => console.error(error));
})