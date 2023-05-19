import 'dotenv/config';

import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { resolve } from 'path';

import { authRoutes } from './routes/auth';
import { uploadRoutes } from './routes/upload';
import { memoriesRoutes } from './routes/memories';

const app = fastify();

app.register(multipart);

app.register(require('@fastify/static'), {
  root: resolve(__dirname, '..', 'uploads'),
  prefix: '/uploads',
});

app.register(cors, {
  origin: true,
});

app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'spacetime',
});

app.register(authRoutes);
app.register(uploadRoutes);
app.register(memoriesRoutes);

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => console.log('🚀 Server is running on http://localhost:3333/'));
