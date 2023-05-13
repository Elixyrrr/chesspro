# Choisissez une image de base qui convient à votre application Node.js
FROM node:16-alpine

# Définir le répertoire de travail dans l'image Docker
WORKDIR /app

# Copier les fichiers de l'application dans l'image Docker
COPY package.json package-lock.json ./
COPY server.js ./

# Installer les dépendances de l'application
RUN npm install

# Exposer le port que l'application va utiliser
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]