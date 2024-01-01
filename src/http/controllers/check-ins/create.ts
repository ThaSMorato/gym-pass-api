import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCheckInUseCase } from '@/use-cases/factories/make-check-in-use-case'

const createCheckInsParamsSchema = z.object({
  gymId: z.string().uuid(),
})

const createCheckInBodySchema = z.object({
  latitude: z.number().refine((value) => Math.abs(value) <= 90),
  longitude: z.number().refine((value) => Math.abs(value) <= 180),
})

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const {
    body,
    params,
    user: { sub: userId },
  } = request
  const useCase = makeCheckInUseCase()

  const { gymId } = createCheckInsParamsSchema.parse(params)
  const { latitude, longitude } = createCheckInBodySchema.parse(body)

  await useCase.execute({
    gymId,
    userLatitude: latitude,
    userLongitude: longitude,
    userId,
  })

  return reply.status(201).send()
}
