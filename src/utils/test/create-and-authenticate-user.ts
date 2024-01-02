import request from 'supertest'

import { FastifyInstance } from 'fastify'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

const user = {
  name: 'Test',
  email: 'test@example.com',
}

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  isAdmin = false,
) {
  const createdUser = await prisma.user.create({
    data: {
      ...user,
      password_hash: await hash('password123', 6),
      role: isAdmin ? 'ADMIN' : 'MEMBER',
    },
  })

  const {
    body: { token },
  } = await request(app.server)
    .post('/sessions')
    .send({ ...user, password: 'password123' })

  return { token, user: createdUser }
}
