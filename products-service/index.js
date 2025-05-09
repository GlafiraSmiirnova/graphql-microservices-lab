require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { expressMiddleware } = require('@apollo/server/express4');
const express = require('express');
const cors = require('cors');
const gql = require('graphql-tag');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool();

const typeDefs = gql(`#graphql
  type Product @key(fields: "id") {
  id: ID!
  name: String!
  price: Float!
}

  input CreateProductInput {
    name: String!
    price: Float!
  }

  input UpdateProductInput {
    id: ID!
    name: String
    price: Float
  }

  type Query {
    products: [Product!]!
  }

  type Mutation {
    createProduct(input: CreateProductInput!): Product!
    updateProduct(input: UpdateProductInput!): Product
    deleteProduct(id: ID!): Boolean!
  }
`);

const resolvers = {
  Query: {
    products: async () => {
      const res = await pool.query('SELECT * FROM products');
      return res.rows;
    },
  },
  Product: {
    async __resolveReference(product) {
      const res = await pool.query('SELECT * FROM products WHERE id = $1', [product.id]);
      return res.rows[0];
    }
  },
  Mutation: {
    createProduct: async (_, { input }) => {
      const { name, price } = input;
      const res = await pool.query(
        'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *',
        [name, price]
      );
      return res.rows[0];
    },
    updateProduct: async (_, { input }) => {
      const { id, name, price } = input;
      const fields = [];
      const values = [];
      let i = 1;

      if (name) {
        fields.push(`name = $${i++}`);
        values.push(name);
      }
      if (price) {
        fields.push(`price = $${i++}`);
        values.push(price);
      }

      if (!fields.length) throw new Error('Nothing to update');

      values.push(id);
      const res = await pool.query(
        `UPDATE products SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
        values
      );
      return res.rows[0];
    },
    deleteProduct: async (_, { id }) => {
      const res = await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return res.rowCount > 0;
    },
  },
};

async function startServer() {
    const server = new ApolloServer({
        schema: buildSubgraphSchema({ typeDefs, resolvers })
      });
    await server.start();

    await pool.query(`
        CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price FLOAT NOT NULL
        );
    `);

    await pool.query(`
        INSERT INTO products (name, price)
        SELECT 'Coke', 1.99
        WHERE NOT EXISTS (
        SELECT 1 FROM products WHERE name = 'Coke'
        );
    `);

    app.use('/graphql', expressMiddleware(server));

    app.listen(4002, () => {
        console.log('Products service ready at http://localhost:4002/graphql');
    });
}

startServer();
