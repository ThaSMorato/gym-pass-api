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

describe('Metrics CheckIn E2E', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to list the count of check-ins', async () => {
    const { token, user } = await createAndAuthenticateUser(app)

    const createdGym = await prisma.gym.create({
      data: gym,
    })

    await prisma.checkIn.createMany({
      data: [
        {
          gym_id: createdGym.id,
          user_id: user.id,
        },
        {
          gym_id: createdGym.id,
          user_id: user.id,
        },
      ],
    })

    const response = await request(app.server)
      .get('/check-ins/metrics')
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.checkInsCount).toBe(2)
  })
})
