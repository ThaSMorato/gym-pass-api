import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeFetchNearbyGymsUseCase } from '@/use-cases/factories/make-fetch-nearby-gyms-use-case'

const nearbyGymsBodySchema = z.object({
  latitude: z.number().refine((value) => Math.abs(value) <= 90),
  longitude: z.number().refine((value) => Math.abs(value) <= 180),
})

export async function nearby(request: FastifyRequest, reply: FastifyReply) {
  const { query: q } = request
  const useCase = makeFetchNearbyGymsUseCase()

  const { latitude, longitude } = nearbyGymsBodySchema.parse(q)

  const { gyms } = await useCase.execute({
    userLatitude: latitude,
    userLongitude: longitude,
  })

  return reply.status(200).send({ gyms })
}
