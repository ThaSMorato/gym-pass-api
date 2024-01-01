import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCreateGymUseCase } from '@/use-cases/factories/make-create-gym-use-case'

const createGymBodySchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  phone: z.string().nullable(),
  latitude: z.number().refine((value) => Math.abs(value) <= 90),
  longitude: z.number().refine((value) => Math.abs(value) <= 180),
})

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const { body } = request
  const useCase = makeCreateGymUseCase()

  const { description, latitude, longitude, phone, title } =
    createGymBodySchema.parse(body)

  await useCase.execute({ description, latitude, longitude, phone, title })

  return reply.status(201).send()
}
