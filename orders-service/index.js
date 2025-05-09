require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { expressMiddleware } = require('@apollo/server/express4');
const express = require('express');
const cors = require('cors');
const gql = require('graphql-tag');
const mongoose = require('mongoose');
const Order = require('./models/Order');

const app = express();
app.use(cors());
app.use(express.json());

const typeDefs = gql(`#graphql
  enum OrderStatus {
    PENDING
    CONFIRMED
    SHIPPED
  }

  type Order {
    id: ID!
    userId: ID!
    productId: ID!
    quantity: Int!
    status: OrderStatus!
    
    user: User
    product: Product
  }

  input CreateOrderInput {
    userId: ID!
    productId: ID!
    quantity: Int!
    status: OrderStatus!
  }

  input UpdateOrderInput {
    id: ID!
    userId: ID!
    productId: ID!
    quantity: Int!
    status: OrderStatus!
  }
  
  type Query {
    orders: [Order!]!
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrder(input: UpdateOrderInput!): Order
    deleteOrder(id: ID!): Boolean!
  }

  extend type User @key(fields: "id") {
    id: ID! @external
  }
  
  extend type Product @key(fields: "id") {
    id: ID! @external
  }
`);

const resolvers = {
  Query: {
    orders: async () => await Order.find(),
  },
  Mutation: {
    createOrder: async (_, { input }) => {
      const order = new Order(input);
      await order.save();
      return order;
    },
    updateOrder: async (_, { input }) => {
      const { id, ...updates } = input;
      const updated = await Order.findByIdAndUpdate(id, updates, { new: true });
      return updated;
    },
    deleteOrder: async (_, { id }) => {
      const res = await Order.findByIdAndDelete(id);
      return !!res;
    },
  },
  Order: {
    user: (order) => ({ __typename: 'User', id: order.userId }),
    product: (order) => ({ __typename: 'Product', id: order.productId }),
  },
  User: {
    __resolveReference(user) {
      return { id: user.id };
    }
  },
  Product: {
    __resolveReference(product) {
      return { id: product.id };
    }
  },
};

async function startServer() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers })
  });
  await server.start();
  app.use('/graphql', expressMiddleware(server));

  app.listen(4003, () => {
    console.log('Orders service ready at http://localhost:4003/graphql')
  });
}

startServer();