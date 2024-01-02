import request from 'supertest'

import { FastifyInstance } from 'fastify'

const user = {
  name: 'Test',
  email: 'test@example.com',
  password: 'password123',
}

export async function createAndAuthenticateUser(app: FastifyInstance) {
  await request(app.server).post('/users').send(user)

  const {
    body: { token },
  } = await request(app.server).post('/sessions').send(user)

  return { token, user }
}
