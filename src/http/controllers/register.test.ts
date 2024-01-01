import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const user = {
  name: 'Test',
  email: 'test@example.com',
  password: 'password123',
}

describe('Register E2E', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to register', async () => {
    const response = await request(app.server).post('/users').send(user)

    expect(response.statusCode).toEqual(201)
  })
})
