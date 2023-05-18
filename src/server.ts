import 'dotenv/config';

import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { authRoutes } from './routes/auth';
import { memoriesRoutes } from './routes/memories';

const app = fastify();

app.register(cors, {
  origin: ['http://localhost:3000', 'https://spacetime.guiathayde.dev'],
});

app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'spacetime',
});

app.register(authRoutes);
app.register(memoriesRoutes);

app
  .listen({
    port: 3333,
  })
  .then(() => console.log('🚀 Server is running on http://localhost:3333/'));
