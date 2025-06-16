let tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));
  if (tokenCookie) {
    console.log('Token présent');
    // Redirection vers la page de connexion
    window.location.href = '/Accueil';
  }