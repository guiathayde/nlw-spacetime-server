import fastify from 'fastify';
import cors from '@fastify/cors';

import { memoriesRoutes } from './routes/memories';

const app = fastify();

app.register(cors, {
  origin: ['http://localhost:3000', 'https://spacetime.guiathayde.dev'],
});

app.register(memoriesRoutes);

app
  .listen({
    port: 3333,
  })
  .then(() => console.log('🚀 Server is running on http://localhost:3333/'));
