import request from 'supertest'
import { app } from '@/app'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createAndAuthenticateUser } from '@/utils/test/create-and-authenticate-user'

const params = {
  latitude: -27.0610928,
  longitude: -49.5229501,
}

const gym1 = {
  title: 'JavaScript Gym',
  description: 'Some description',
  phone: '16999999999',
  latitude: -27.2092052,
  longitude: -49.6401091,
}

const gym2 = {
  title: 'HTML Gym',
  description: 'Some description',
  phone: '16999999999',
  latitude: -27.0610928,
  longitude: -49.5229501,
}

describe('Search Gyms E2E', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to search nearby gyms', async () => {
    const { token } = await createAndAuthenticateUser(app, true)

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send(gym1)

    await request(app.server)
      .post('/gyms')
      .set('Authorization', `Bearer ${token}`)
      .send(gym2)

    const response = await request(app.server)
      .get('/gyms/nearby')
      .query(params)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({
      gyms: [
        expect.objectContaining({
          title: gym2.title,
        }),
      ],
    })
  })
})
