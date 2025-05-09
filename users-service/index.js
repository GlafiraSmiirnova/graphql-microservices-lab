require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { expressMiddleware } = require('@apollo/server/express4');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const gql = require('graphql-tag');


const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool(); 

const typeDefs = gql(`#graphql
    type User @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
    }
  
    input CreateUserInput {
      name: String!
      email: String!
    }
  
    input UpdateUserInput {
      id: ID!
      name: String
      email: String
    }
  
    type Query {
      users: [User!]!
    }
  
    type Mutation {
      createUser(input: CreateUserInput!): User!
      updateUser(input: UpdateUserInput!): User
      deleteUser(id: ID!): Boolean!
    }
  `);


const resolvers = {
  Query: {
    users: async () => {
      const result = await pool.query('SELECT * FROM users');
      return result.rows;
    },
  },
  User: {
    async __resolveReference(user) {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
      return res.rows[0];
    }
  },
  Mutation: {
    createUser: async (_, { input }) => {
      const { name, email } = input;
      const result = await pool.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );
      return result.rows[0];
    },
    updateUser: async (_, { input }) => {
        const { id, name, email } = input;
      
        const fields = [];
        const values = [];
        let i = 1;
      
        if (name) {
          fields.push(`name = $${i++}`);
          values.push(name);
        }
        if (email) {
          fields.push(`email = $${i++}`);
          values.push(email);
        }
      
        if (fields.length === 0) {
          throw new Error("Nothing to update");
        }
      
        values.push(id); 
      
        const query = `
          UPDATE users
          SET ${fields.join(', ')}
          WHERE id = $${i}
          RETURNING *
        `;
      
        const result = await pool.query(query, values);
        return result.rows[0];
      },
      
      deleteUser: async (_, { id }) => {
        const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        return result.rowCount > 0;
      }
  },
};

async function startServer() {
    const server = new ApolloServer({
        schema: buildSubgraphSchema({ typeDefs, resolvers })
      });
    await server.start();

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
        );
    `);

    await pool.query(`
        INSERT INTO users (name, email)
        SELECT 'Alice', 'alice@gmail.com'
        WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'alice@gmail.com'
        );
    `);

    app.use('/graphql', expressMiddleware(server));

    app.listen(4001, () => {
        console.log('Users service ready at http://localhost:4001/graphql');
    });
}

startServer();
