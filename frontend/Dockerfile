# Utilise une image de Node.js comme image de base
FROM node:14-alpine

# Définit le répertoire de travail dans l'image Docker
WORKDIR /app

# Copie le package.json et le package-lock.json dans le conteneur Docker
COPY package*.json

# Installe les dépendances du projet
RUN npm install

# Copie le fichier index.js dans le conteneur DockerMy Project 29chessp
COPY index.js .

# Expose le port 8000 pour que le conteneur Docker puisse écouter les connexions entrantes
EXPOSE 8000

# Démarre l'application
CMD ["node", "index.js"]