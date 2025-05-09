require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloGateway } = require('@apollo/gateway');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

async function startGateway() {
    const gateway = new ApolloGateway({
        serviceList: [
            { name: 'users', url: process.env.USERS_SERVICE_URL },
            { name: 'products', url: process.env.PRODUCTS_SERVICE_URL },
            { name: 'orders', url: process.env.ORDERS_SERVICE_URL },
          ],
      });

  const server = new ApolloServer({
    gateway,
    csrfPrevention: false,
    introspection: true,
  });

  await server.start();
  app.use('/graphql', expressMiddleware(server));

  app.listen(4000, () => {
    console.log('Gateway running at http://localhost:4000/graphql');
  });
}

startGateway();
