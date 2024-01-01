import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeSearchGymsUseCase } from '@/use-cases/factories/make-search-gyms-use-case'

const searchGymBodySchema = z.object({
  query: z.string(),
  page: z.coerce.number().min(1).default(1),
})

export async function search(request: FastifyRequest, reply: FastifyReply) {
  const { query: q } = request
  const useCase = makeSearchGymsUseCase()

  const { query, page } = searchGymBodySchema.parse(q)

  const { gyms } = await useCase.execute({ page, query })

  return reply.status(200).send({ gyms })
}
