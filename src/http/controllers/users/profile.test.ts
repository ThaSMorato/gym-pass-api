import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const user = {
  name: 'Test',
  email: 'test@example.com',
  password: 'password123',
}

describe('Profile E2E', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get user profile', async () => {
    await request(app.server).post('/users').send(user)

    const {
      body: { token },
    } = await request(app.server).post('/sessions').send(user)

    const response = await request(app.server)
      .get('/me')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({
      user: expect.objectContaining({
        name: user.name,
        email: user.email,
      }),
    })
  })
})
