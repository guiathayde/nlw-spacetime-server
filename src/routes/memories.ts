import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { unlink } from 'node:fs';
import { resolve } from 'node:path';

import { prisma } from '../lib/prisma';

const coverTypes = [
  'gif',
  'jpg',
  'jpeg',
  'png',
  'mpg',
  'mp2',
  'mpeg',
  'mpe',
  'mpv',
  'mp4',
] as const;

export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify();
  });

  app.get('/memories', async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return memories.map((memory) => {
      let excerpt = memory.content;
      if (excerpt.length > 115) {
        excerpt = excerpt.substring(0, 115).concat('...');
      }

      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        coverType: memory.coverType,
        excerpt,
        createdAt: memory.createdAt,
      };
    });
  });

  app.get('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    console.log(id);

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send();
    }

    return memory;
  });

  app.post('/memories', async (request) => {
    console.log(JSON.stringify(request.body, null, 2));

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      coverType: z.enum(coverTypes),
      isPublic: z.coerce.boolean().default(false),
    });

    const { content, coverUrl, coverType, isPublic } = bodySchema.parse(
      request.body
    );

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        coverType,
        isPublic,
        userId: request.user.sub,
      },
    });

    return memory;
  });

  app.put('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      coverType: z.enum(coverTypes),
      isPublic: z.coerce.boolean().default(false),
    });

    const { content, coverUrl, coverType, isPublic } = bodySchema.parse(
      request.body
    );

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send();
    }

    const oldMemory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
      select: {
        coverUrl: true,
      },
    });

    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        coverType,
        isPublic,
      },
    });

    const regex = /\/([^/]+)$/;
    const match = oldMemory.coverUrl.match(regex);
    if (match) {
      const fileName = match[1];
      const pathToFile = resolve(__dirname, '..', '..', 'uploads', fileName);
      unlink(pathToFile, (err) => {
        if (err) console.error(err);
      });
    }

    return memory;
  });

  app.delete('/memories/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send();
    }

    await prisma.memory.delete({
      where: {
        id,
      },
    });
  });
}
