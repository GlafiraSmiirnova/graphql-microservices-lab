FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install -g create-vite && create-vite . --template react && npm install

COPY . .

CMD ["npm", "run", "dev"]
