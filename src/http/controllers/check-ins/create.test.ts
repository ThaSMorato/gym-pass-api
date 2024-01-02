import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'
import { prisma } from '@/lib/prisma'

const gym = {
  title: 'JavaScript Gym',
  description: 'Some description',
  phone: '16999999999',
  latitude: -27.0610928,
  longitude: -49.5229501,
}

describe('Create CheckIn E2E', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a check-in', async () => {
    const { token } = await createAndAuthenticateUser(app)

    const createdGym = await prisma.gym.create({
      data: gym,
    })

    const response = await request(app.server)
      .post(`/gyms/${createdGym.id}/check-ins`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: gym.latitude,
        longitude: gym.longitude,
      })

    expect(response.statusCode).toEqual(201)
  })
})
